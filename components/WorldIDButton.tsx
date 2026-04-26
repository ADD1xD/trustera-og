"use client";

import { useState } from "react";
import {
  IDKitRequestWidget,
  orbLegacy,
  type RpContext,
  type IDKitResult,
} from "@worldcoin/idkit";
import { useAuth } from "@/lib/auth-context";
import { WORLD_APP_ID, WORLD_RP_ID, WORLD_ACTION } from "@/lib/worldid";

interface WorldIDButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function WorldIDButton({ onSuccess, className }: WorldIDButtonProps) {
  const { login, isAuthenticated, logout, user, walletAddress } = useAuth();
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [loading, setLoading] = useState(false);

  const startVerification = async () => {
    if (!WORLD_APP_ID || !WORLD_RP_ID) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/rp-signature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: WORLD_ACTION }),
      });
      if (!res.ok) throw new Error("Failed to get RP signature");
      const rpSig = await res.json();

      setRpContext({
        rp_id: WORLD_RP_ID as `rp_${string}`,
        nonce: rpSig.nonce,
        created_at: rpSig.created_at,
        expires_at: rpSig.expires_at,
        signature: rpSig.sig,
      });
      setOpen(true);
    } catch (error) {
      console.error("[v0] Verification init failed:", error);
      alert("Failed to start verification");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (result: IDKitResult) => {
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        rp_id: WORLD_RP_ID,
        idkitResponse: result,
      }),
    });
    if (!response.ok) throw new Error("Verification failed");
  };

  const handleSuccess = (result: IDKitResult) => {
    const firstResponse = result.responses?.[0] as {
      nullifier?: string;
      session_nullifier?: string[];
      identifier?: string;
    } | undefined;
    const nullifier =
      firstResponse?.nullifier ||
      firstResponse?.session_nullifier?.[0] ||
      "";
    const level = firstResponse?.identifier === "orb" ? "orb" : "device";
    login(nullifier, level);
    setOpen(false);
    setRpContext(null);
    onSuccess?.();
  };

  if (isAuthenticated && user) {
    return (
      <button
        onClick={logout}
        className={`brutal-btn bg-destructive text-destructive-foreground ${
          className || ""
        }`}
      >
        Logout
      </button>
    );
  }

  if (!WORLD_APP_ID || !WORLD_RP_ID) {
    return (
      <button
        disabled
        className={`brutal-btn bg-muted text-muted-foreground cursor-not-allowed ${
          className || ""
        }`}
      >
        World ID Not Configured
      </button>
    );
  }

  return (
    <>
      <button
        onClick={startVerification}
        disabled={loading}
        className={`brutal-btn bg-primary text-primary-foreground ${
          className || ""
        }`}
      >
        {loading ? "Loading..." : "Verify with World ID"}
      </button>

      {rpContext && (
        <IDKitRequestWidget
          open={open}
          onOpenChange={setOpen}
          app_id={WORLD_APP_ID as `app_${string}`}
          action={WORLD_ACTION}
          rp_context={rpContext}
          allow_legacy_proofs={true}
          preset={orbLegacy({ signal: walletAddress || "" })}
          handleVerify={handleVerify}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
