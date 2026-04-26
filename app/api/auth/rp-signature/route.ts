import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit-core/signing";

export async function POST(request: Request): Promise<Response> {
  try {
    const { action } = await request.json();

    const signingKey = process.env.WORLD_SIGNING_KEY;
    if (!signingKey) {
      return NextResponse.json(
        { error: "WORLD_SIGNING_KEY not configured" },
        { status: 500 }
      );
    }

    const rpId = process.env.NEXT_PUBLIC_WORLD_RP_ID;
    if (!rpId) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_WORLD_RP_ID not configured" },
        { status: 500 }
      );
    }

    const { sig, nonce, createdAt, expiresAt } = signRequest({
      signingKeyHex: signingKey,
      action,
    });

    // Match the RpContext shape that @worldcoin/idkit expects:
    // { rp_id, nonce, created_at, expires_at, signature }
    return NextResponse.json({
      rp_id: rpId,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
      signature: sig,
    });
  } catch (error) {
    console.error("RP signature error:", error);
    return NextResponse.json(
      { error: "Failed to generate RP signature" },
      { status: 500 }
    );
  }
}
