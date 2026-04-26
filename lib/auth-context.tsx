"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { VerificationLevel } from "./worldid";
import { deriveWorldAddress } from "./world-address";

interface User {
  nullifier_hash: string;
  verification_level: VerificationLevel;
  wallet_address?: string;
  verified_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (nullifierHash: string, verificationLevel: VerificationLevel, walletAddress?: string) => void;
  logout: () => void;
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "trustera_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setWalletAddress(parsed.walletAddress);
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, walletAddress }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user, walletAddress]);

  const login = useCallback(
    (
      nullifierHash: string,
      verificationLevel: VerificationLevel,
      wallet?: string
    ) => {
      // Derive a deterministic World address from the nullifier_hash. This
      // gives every verified human a stable 0x... identity inside the app
      // without needing to connect MetaMask. If a real wallet address was
      // supplied (e.g. from MiniKit / wallet auth), prefer that instead.
      let resolvedAddress = wallet;
      if (!resolvedAddress && nullifierHash) {
        try {
          resolvedAddress = deriveWorldAddress(nullifierHash);
        } catch (err) {
          console.error("[v0] Failed to derive world address:", err);
        }
      }

      const newUser: User = {
        nullifier_hash: nullifierHash,
        verification_level: verificationLevel,
        wallet_address: resolvedAddress,
        verified_at: new Date().toISOString(),
      };
      setUser(newUser);
      if (resolvedAddress) {
        setWalletAddress(resolvedAddress);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setWalletAddress(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        walletAddress,
        setWalletAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
