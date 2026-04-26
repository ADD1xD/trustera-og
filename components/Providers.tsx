"use client";

import { ReactNode } from "react";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { AuthProvider } from "@/lib/auth-context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MiniKitProvider>
      <AuthProvider>{children}</AuthProvider>
    </MiniKitProvider>
  );
}
