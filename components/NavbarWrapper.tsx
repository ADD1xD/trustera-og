"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, User, LogOut, CheckCircle2 } from "lucide-react";
import {
  IDKitRequestWidget,
  orbLegacy,
  type RpContext,
  type IDKitResult,
} from "@worldcoin/idkit";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useWorldLogin } from "@/lib/use-world-login";
import { WORLD_APP_ID, WORLD_RP_ID, WORLD_ACTION } from "@/lib/worldid";
import { BrutalButton } from "./BrutalButton";

const bottomNavLinks = [
  { href: "/",        label: "Home",     Icon: Home    },
  { href: "/bounties", label: "Bounties", Icon: Trophy  },
  { href: "/profile",  label: "Profile",  Icon: User    },
];

export function NavbarWrapper() {
  const pathname = usePathname();
  const { isAuthenticated, login, logout } = useAuth();
  const {
    isMiniKitReady,
    loginWithWorldWallet,
    loading: walletLoading,
  } = useWorldLogin();
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [loading, setLoading] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLoginClick = async () => {
    if (isMiniKitReady) {
      try {
        await loginWithWorldWallet();
        return;
      } catch (err) {
        console.error("[navbar] MiniKit walletAuth failed, falling back:", err);
      }
    }
    await startVerification();
  };

  const startVerification = async () => {
    if (!WORLD_APP_ID || !WORLD_RP_ID) {
      alert("World ID is not configured. Please check environment variables.");
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
        signature: rpSig.signature ?? rpSig.sig,
      });
      setOpen(true);
    } catch (error) {
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
      body: JSON.stringify({ rp_id: WORLD_RP_ID, idkitResponse: result }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const hint = err.hint ? `\n\n${err.hint}` : "";
      const worldIdMsg = err.worldIdError?.detail || err.worldIdError?.code || "";
      throw new Error(
        `${err.error || "Backend verification failed"}${
          worldIdMsg ? `: ${worldIdMsg}` : ""
        }${hint}`
      );
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
    const level = firstResponse?.identifier === "orb" ? "orb" : "device";
    login(nullifier, level);
    setOpen(false);
    setRpContext(null);
  };

  return (
    <>
      {/* ── TOP BAR ── logo left, auth right, no nav links ── */}
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--glass-border-strong)] bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">
              TRUSTER<span className="text-[var(--accent)]">A</span>
            </span>
          </Link>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Verified badge */}
                <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-[var(--accent)] text-xs font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED
                </span>
                {/* Logout */}
                <motion.button
                  onClick={logout}
                  whileTap={{ scale: 0.88 }}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--glass-border-strong)] bg-white text-[var(--text-secondary)] hover:text-[var(--soft-pink)] hover:border-[var(--soft-pink)] transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            ) : WORLD_APP_ID && WORLD_RP_ID ? (
              <BrutalButton
                variant="primary"
                size="sm"
                onClick={handleLoginClick}
                disabled={loading || walletLoading}
              >
                {walletLoading
                  ? "SIGNING..."
                  : loading
                  ? "LOADING..."
                  : isMiniKitReady
                  ? "SIGN IN"
                  : "VERIFY"}
              </BrutalButton>
            ) : (
              <BrutalButton variant="primary" size="sm" disabled>
                NOT CONFIGURED
              </BrutalButton>
            )}
          </div>
        </div>
      </header>

      {/* ── BOTTOM NAV — fixed, all screen sizes ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--glass-border-strong)] bg-white/90 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
          {bottomNavLinks.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 group"
                aria-label={label}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200
                    ${active
                      ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                      : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] group-hover:bg-[var(--bg-elev-2)]"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      active ? "stroke-[2.5px]" : "stroke-[1.75px]"
                    }`}
                  />
                  {/* Active dot indicator */}
                  {active && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]"
                    />
                  )}
                </motion.div>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                    active
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* IDKit widget — mounted outside the nav so it doesn't affect layout */}
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
    </>
  );
}
