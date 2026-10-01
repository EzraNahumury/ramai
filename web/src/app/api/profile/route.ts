import { NextResponse } from "next/server";
import type { ProfileRow } from "@/lib/supabase";
import { getProfile, upsertProfile } from "@/lib/store";
import { requireWallet, authErrorResponse } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });
  try {
    await requireWallet(req, wallet);
    const profile = await getProfile(wallet);
    return NextResponse.json({ profile, configured: true });
  } catch (err) {
    const authRes = authErrorResponse(err);
    if (authRes) return authRes;
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

  try {
    await requireWallet(req, body.wallet);
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Auth failed" }, { status: 401 });
  }

  const row: ProfileRow = {
    wallet: body.wallet,
    display_name: typeof body.display_name === "string" ? body.display_name.slice(0, 60) : null,
    interests: Array.isArray(body.interests)
      ? body.interests
          .filter((s): s is string => typeof s === "string")
          .map((s) => s.trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 20)
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
