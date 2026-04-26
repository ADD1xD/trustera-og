import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import type { MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js/commands";

type RequestBody = {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
};

// Verify the SIWE payload returned by MiniKit.walletAuth(). On success we
// return the user's actual World wallet address so the frontend can persist
// it as the user's login identity.
export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as RequestBody;

    const cookieStore = await cookies();
    const expectedNonce = cookieStore.get("siwe")?.value;

    if (!expectedNonce || nonce !== expectedNonce) {
      return NextResponse.json(
        { isValid: false, error: "Invalid or missing nonce" },
        { status: 400 }
      );
    }

    const verification = await verifySiweMessage(payload, nonce);

    if (!verification.isValid) {
      return NextResponse.json(
        { isValid: false, error: "SIWE signature invalid" },
        { status: 400 }
      );
    }

    // Burn the nonce so it can't be replayed.
    cookieStore.delete("siwe");

    return NextResponse.json({
      isValid: true,
      address: verification.siweMessageData.address,
    });
  } catch (err) {
    return NextResponse.json(
      {
        isValid: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
