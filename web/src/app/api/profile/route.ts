import { NextResponse } from "next/server";
import type { ProfileRow } from "@/lib/supabase";
import { getProfile, upsertProfile } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });
  try {
    const profile = await getProfile(wallet);
    return NextResponse.json({ profile, configured: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let body: Partial<ProfileRow>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  const row: ProfileRow = {
    wallet: body.wallet,
    display_name: body.display_name ?? null,
    interests: Array.isArray(body.interests)
      ? body.interests.map((s) => s.trim()).filter(Boolean)
      : [],
  };

  try {
    const profile = await upsertProfile(row);
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save profile" },
      { status: 500 }
    );
  }
}
