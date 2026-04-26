"use client";

import { ReactNode, useState } from "react";
import {
  IDKitRequestWidget,
  orbLegacy,
  type RpContext,
  type IDKitResult,
} from "@worldcoin/idkit";
import { BrutalButton } from "./BrutalButton";
import { BrutalCard } from "./BrutalCard";
import { useAuth } from "@/lib/auth-context";
import { useWorldLogin } from "@/lib/use-world-login";
import { WORLD_APP_ID, WORLD_RP_ID, WORLD_ACTION } from "@/lib/worldid";

interface WalletGateProps {
  children: ReactNode;
  title?: string;
  description?: string;
  /** @deprecated kept for backward compatibility - World ID is the only auth */
  requireWallet?: boolean;
}

export function WalletGate({
  children,
  title = "VERIFICATION REQUIRED",
  description = "VERIFY WITH WORLD ID TO ACCESS THIS FEATURE",
}: WalletGateProps) {
  const { isAuthenticated, login } = useAuth();
  const {
    isMiniKitReady,
    loginWithWorldWallet,
    loading: walletLoading,
  } = useWorldLogin();
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [loading, setLoading] = useState(false);

  // Unified login: prefer World wallet (MiniKit) when running inside the
  // World App so the user signs in with their actual on-chain address;
  // otherwise fall back to the IDKit web flow with derived address.
  const handleLoginClick = async () => {
    if (isMiniKitReady) {
      try {
        await loginWithWorldWallet();
        return;
      } catch (err) {
        console.error("[v0] MiniKit walletAuth failed, falling back:", err);
      }
    }
    await startVerification();
  };

  const startVerification = async () => {
    if (!WORLD_APP_ID || !WORLD_RP_ID) {
      alert("World ID is not configured.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/rp-signature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: WORLD_ACTION }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get RP signature");
      }

      const rpSig = await res.json();

      setRpContext({
        rp_id: (rpSig.rp_id || WORLD_RP_ID) as `rp_${string}`,
        nonce: rpSig.nonce,
        created_at: rpSig.created_at,
        expires_at: rpSig.expires_at,
        // Backend returns the signed payload as `signature`; fall back to `sig`
        // for backward compatibility with older API responses.
        signature: rpSig.signature ?? rpSig.sig,
      });
      setOpen(true);
    } catch (error) {
      console.error("[v0] Verification init failed:", error);
      alert(
        `Failed to start World ID verification: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Backend verification failed");
    }
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
    const level =
      firstResponse?.identifier === "orb" ? "orb" : "device";
    login(nullifier, level);
    setOpen(false);
    setRpContext(null);
  };

  // If authenticated via World ID, allow access
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated - show World ID verification
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <BrutalCard
        variant="default"
        padding="lg"
        className="max-w-md text-center"
      >
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-brutal-black flex items-center justify-center border-4 border-brutal-black">
            <svg
              className="w-10 h-10 text-brutal-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-2xl font-black uppercase mb-2">{title}</h2>
          <p className="font-bold text-sm uppercase text-gray-600">
            {description}
          </p>
        </div>
        {WORLD_APP_ID && WORLD_RP_ID ? (
          <BrutalButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleLoginClick}
            disabled={loading || walletLoading}
          >
            {walletLoading
              ? "SIGNING..."
              : loading
              ? "LOADING..."
              : isMiniKitReady
              ? "SIGN IN WITH WORLD"
              : "VERIFY WITH WORLD ID"}
          </BrutalButton>
        ) : (
          <BrutalButton variant="primary" size="lg" fullWidth disabled>
            WORLD ID NOT CONFIGURED
          </BrutalButton>
        )}
        <p className="mt-4 text-xs font-bold uppercase text-gray-500">
          POWERED BY WORLD ID &bull; WORLDCHAIN
        </p>
      </BrutalCard>

      {rpContext && (
        <IDKitRequestWidget
          open={open}
          onOpenChange={setOpen}
          app_id={WORLD_APP_ID as `app_${string}`}
          action={WORLD_ACTION}
          rp_context={rpContext}
          allow_legacy_proofs={true}
          preset={orbLegacy({ signal: "" })}
          handleVerify={handleVerify}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
