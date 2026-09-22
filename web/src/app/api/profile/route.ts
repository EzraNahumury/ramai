import { NextResponse } from "next/server";
import { getSupabase, supabaseConfigured, type ProfileRow } from "@/lib/supabase";

export async function GET(req: Request) {
  if (!supabaseConfigured) return NextResponse.json({ profile: null, configured: false });
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("wallet", wallet)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data, configured: true });
}

export async function POST(req: Request) {
  if (!supabaseConfigured)
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

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

  const supabase = getSupabase();
  const { data, error } = await supabase.from("profiles").upsert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
