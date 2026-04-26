"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { BrutalButton } from "./BrutalButton";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  address?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
}

export function Navbar({
  address,
  onConnect,
  onDisconnect,
  isConnected = false,
}: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/bounties", label: "Bounties" },
    { href: "/create", label: "Create" },
    { href: "/profile", label: "Profile" },
  ];

  const isActive = (href: string) => pathname === href;

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="sticky top-3 sm:top-4 z-50 px-3 sm:px-4 md:px-6">
        <nav className="mx-auto max-w-6xl glass-strong glass-shadow-soft rounded-full">
          <div className="flex items-center justify-between h-14 px-3 sm:px-4 md:px-6">
            {/* LOGO */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="text-base sm:text-lg font-semibold tracking-tight text-white">
                Truster<span className="text-accent">a</span>
              </span>
            </Link>

            {/* NAV LINKS - DESKTOP ONLY */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`
                      relative px-4 py-1.5 text-sm font-medium rounded-full
                      transition-colors duration-300 ease-glass
                      ${
                        isActive(link.href)
                          ? "text-white bg-white/10"
                          : "text-white/60 hover:text-white"
                      }
                    `}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE - WALLET, MOBILE MENU */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isConnected && address ? (
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={onDisconnect}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden sm:flex w-9 h-9 items-center justify-center text-white/70 rounded-full glass hover:text-white hover:bg-white/10 transition-colors"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 2L12 12M12 2L2 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.button>
                </div>
              ) : (
                <div className="hidden sm:block">
                  <BrutalButton variant="primary" size="sm" onClick={onConnect}>
                    Connect
                  </BrutalButton>
                </div>
              )}

              {/* MOBILE MENU TOGGLE */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-full glass hover:bg-white/10 transition-colors text-white"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                  <motion.path
                    animate={menuOpen ? { d: "M2 2 L16 12" } : { d: "M2 2 L16 2" }}
                    transition={{ duration: 0.25 }}
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <motion.path
                    animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    d="M2 7 L16 7"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <motion.path
                    animate={menuOpen ? { d: "M2 12 L16 2" } : { d: "M2 12 L16 12" }}
                    transition={{ duration: 0.25 }}
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </nav>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md md:hidden"
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-20 left-3 right-3 z-50 glass-strong glass-shadow rounded-3xl p-3 md:hidden"
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span
                      className={`
                        flex items-center px-4 min-h-[48px] rounded-2xl text-base font-medium
                        transition-colors duration-200
                        ${
                          isActive(link.href)
                            ? "text-white bg-white/10"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        }
                      `}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}

                <div className="h-px bg-white/10 my-2" />

                {isConnected && address ? (
                  <>
                    <div className="flex items-center gap-2 px-4 min-h-[44px] text-white/70 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                      <span className="font-mono">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDisconnect?.();
                      }}
                      className="flex items-center px-4 min-h-[48px] rounded-2xl text-base font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="px-1 pt-1">
                    <BrutalButton
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        setMenuOpen(false);
                        onConnect?.();
                      }}
                    >
                      Connect
                    </BrutalButton>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
