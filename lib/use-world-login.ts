"use client";

import { useCallback, useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useAuth } from "@/lib/auth-context";

/**
 * Unified login hook.
 *
 * When the app runs inside World App (MiniKit available), this:
 *   1. Calls MiniKit.walletAuth() to get the user's actual World wallet address (SIWE).
 *   2. Verifies the SIWE signature on our backend.
 *   3. Stores that real wallet address as the login identity.
 *
 * When MiniKit is not available (regular browser), the caller should fall
 * back to the IDKit web flow which produces a derived World address from
 * the nullifier_hash. This hook only handles the MiniKit branch.
 */
export function useWorldLogin() {
  const { login: setAuth } = useAuth();
  const [isMiniKitReady, setIsMiniKitReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MiniKit hydrates after mount; expose a ready flag so the UI can choose
  // which CTA to render (wallet-auth vs. IDKit web flow).
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      const installed =
        typeof MiniKit?.isInstalled === "function" && MiniKit.isInstalled();
      setIsMiniKitReady(Boolean(installed));
    };
    check();
    const t = setTimeout(check, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const loginWithWorldWallet = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // 1. Fetch a single-use nonce from our backend (also stored in cookie).
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("Failed to fetch nonce");
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      // 2. Trigger SIWE inside World App.
      const result = await MiniKit.walletAuth({
        nonce,
        statement: "Sign in to Trustera with your World wallet",
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      });

      if (result.executedWith === "fallback") {
        throw new Error("Wallet auth fallback — please use World ID instead.");
      }

      // 3. Verify SIWE on the backend.
      const verifyRes = await fetch("/api/auth/siwe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ payload: result.data, nonce }),
      });
      const verifyJson = await verifyRes.json();

      if (!verifyRes.ok || !verifyJson.isValid) {
        throw new Error(verifyJson.error || "SIWE verification failed");
      }

      // 4. Persist the real World wallet address as the user's identity.
      // We synthesize a nullifier-shaped placeholder from the address since
      // MiniKit wallet auth doesn't include a World ID proof on its own —
      // World ID can still be requested separately when an action requires
      // proof-of-personhood.
      const address: string = verifyJson.address;
      setAuth(address.toLowerCase(), "device", address);

      return address as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  return {
    isMiniKitReady,
    loginWithWorldWallet,
    loading,
    error,
  };
}
