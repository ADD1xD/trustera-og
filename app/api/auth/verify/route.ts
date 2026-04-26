import { NextResponse } from "next/server";
import type { IDKitResult } from "@worldcoin/idkit";
import { deriveWorldAddress } from "@/lib/world-address";

export async function POST(request: Request): Promise<Response> {
  try {
    const { rp_id, idkitResponse } = (await request.json()) as {
      rp_id: string;
      idkitResponse: IDKitResult;
    };

    if (!rp_id) {
      return NextResponse.json(
        { error: "rp_id is required" },
        { status: 400 }
      );
    }

    console.log("[v0] Forwarding proof to World ID:", { rp_id });

    const response = await fetch(
      `https://developer.world.org/api/v4/verify/${rp_id}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(idkitResponse),
      }
    );

    const responseText = await response.text();
    let responseData: Record<string, unknown>;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      console.error("[v0] World ID verification failed:", responseData);

      // Return the actual World ID error to client so user can see what's wrong
      return NextResponse.json(
        {
          error: "Verification failed",
          worldIdError: responseData,
          hint:
            (responseData as { code?: string }).code === "invalid_action"
              ? "The action is not registered in your World ID Developer Portal. Create it under the Legacy Actions section for your app."
              : undefined,
        },
        { status: 400 }
      );
    }

    // Extract nullifier from the response
    const firstResponse = idkitResponse.responses?.[0] as
      | {
          nullifier?: string;
          session_nullifier?: string[];
        }
      | undefined;
    const nullifier =
      firstResponse?.nullifier || firstResponse?.session_nullifier?.[0];

    const worldAddress = nullifier ? deriveWorldAddress(nullifier) : null;

    return NextResponse.json({
      success: true,
      nullifier,
      worldAddress,
    });
  } catch (error) {
    console.error("[v0] Verification error:", error);
    return NextResponse.json(
      {
        error: "Verification failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
