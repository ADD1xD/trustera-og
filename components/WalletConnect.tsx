"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { formatAddress } from "@/lib/worldid";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletConnectProps {
  className?: string;
}

export function WalletConnect({ className }: WalletConnectProps) {
  const { walletAddress, setWalletAddress, isAuthenticated } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    setHasMetaMask(typeof window !== "undefined" && !!window.ethereum);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const acc = accounts as string[];
      if (acc.length === 0) {
        setWalletAddress(null);
      } else {
        setWalletAddress(acc[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [setWalletAddress]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (walletAddress) {
    return (
      <div className={`flex items-center gap-2 ${className || ""}`}>
        <span className="font-mono text-sm bg-muted px-3 py-2 border-2 border-foreground">
          {formatAddress(walletAddress)}
        </span>
        <button
          onClick={disconnectWallet}
          className="brutal-btn-sm bg-muted text-muted-foreground"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className={`brutal-btn bg-secondary text-secondary-foreground ${className || ""}`}
    >
      {isConnecting ? "Connecting..." : hasMetaMask ? "Connect Wallet" : "Install MetaMask"}
    </button>
  );
}
