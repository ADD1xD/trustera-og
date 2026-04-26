// World ID Configuration
export const WORLD_APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || "";
export const WORLD_RP_ID = process.env.NEXT_PUBLIC_WORLD_RP_ID || "";
// Action ID must match an action created in your Developer Portal
// https://developer.worldcoin.org
export const WORLD_ACTION = process.env.NEXT_PUBLIC_WORLD_ACTION || "login";

// Verification levels
export type VerificationLevel = "orb" | "device";

export const worldIdConfig = {
  app_id: WORLD_APP_ID as `app_${string}`,
  action: WORLD_ACTION,
  signal: "", // Optional signal for additional context
};

// Helper to format wallet address
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Generate a unique nonce for RP signatures
export function generateNonce(): string {
  return crypto.randomUUID();
}
