import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Generate a fresh SIWE nonce for MiniKit wallet auth.
// The nonce is also stored in an httpOnly cookie so that we can verify it
// on the /api/auth/siwe route — the client can't forge or replay it.
export async function GET() {
  // Alphanumeric, >= 8 chars (MiniKit requirement). 32 hex chars = 16 random bytes.
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const cookieStore = await cookies();
  cookieStore.set("siwe", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return NextResponse.json({ nonce });
}
