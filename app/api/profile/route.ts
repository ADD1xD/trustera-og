import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// GET /api/profile?nullifier_hash=xxx
export async function GET(req: NextRequest) {
  const nullifierHash = req.nextUrl.searchParams.get("nullifier_hash");
  if (!nullifierHash)
    return NextResponse.json({ error: "Missing nullifier_hash" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("nullifier_hash", nullifierHash)
    .maybeSingle();

  if (error) {
    console.error("[v0] profile GET error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data ?? null });
}

// POST /api/profile — upsert full profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nullifier_hash,
      name,
      username,
      bio,
      avatar_url,
      x_username,
      github_username,
      portfolio_url,
      skills,
    } = body;

    if (!nullifier_hash)
      return NextResponse.json({ error: "Missing nullifier_hash" }, { status: 400 });
    if (!name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!username?.trim())
      return NextResponse.json({ error: "Username is required" }, { status: 400 });

    const hasSocial =
      x_username?.trim() || github_username?.trim() || portfolio_url?.trim();
    if (!hasSocial)
      return NextResponse.json(
        { error: "Provide at least one of: X username, GitHub username, or portfolio URL" },
        { status: 400 }
      );

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!cleanUsername)
      return NextResponse.json({ error: "Invalid username — use letters, numbers, underscores" }, { status: 400 });

    const admin = getSupabaseAdmin();

    // Username uniqueness check
    const { data: taken } = await admin
      .from("profiles")
      .select("nullifier_hash")
      .eq("username", cleanUsername)
      .neq("nullifier_hash", nullifier_hash)
      .maybeSingle();

    if (taken)
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });

    const { data, error } = await admin
      .from("profiles")
      .upsert(
        {
          nullifier_hash,
          name: name.trim(),
          username: cleanUsername,
          bio: bio?.trim() ?? null,
          avatar_url: avatar_url ?? "",
          x_username: x_username?.trim() ?? null,
          github_username: github_username?.trim() ?? null,
          portfolio_url: portfolio_url?.trim() ?? null,
          skills: Array.isArray(skills) ? skills : [],
        },
        { onConflict: "nullifier_hash" }
      )
      .select()
      .single();

    if (error) {
      console.error("[v0] profile upsert error:", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("[v0] profile POST exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
