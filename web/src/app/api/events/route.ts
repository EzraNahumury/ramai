import { NextResponse } from "next/server";
import { getSupabase, supabaseConfigured, type EventRow } from "@/lib/supabase";

export async function GET(req: Request) {
  if (!supabaseConfigured) {
    return NextResponse.json({ events: [], configured: false });
  }
  const { searchParams } = new URL(req.url);
  const organizer = searchParams.get("organizer");

  const supabase = getSupabase();
  let query = supabase.from("events").select("*").order("created_at", { ascending: false });
  if (organizer) query = query.ilike("organizer", organizer);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data ?? [], configured: true });
}

export async function POST(req: Request) {
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }
  let body: Partial<EventRow>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.onchain_id === undefined || !body.organizer || !body.title) {
    return NextResponse.json(
      { error: "onchain_id, organizer and title are required" },
      { status: 400 }
    );
  }

  const row: EventRow = {
    onchain_id: Number(body.onchain_id),
    organizer: body.organizer,
    title: body.title,
    description: body.description ?? null,
    category: body.category ?? null,
    location: body.location ?? null,
    start_time: body.start_time ?? null,
    checkin_deadline: body.checkin_deadline ?? null,
    stake_amount_wei: body.stake_amount_wei ?? null,
    tx_hash: body.tx_hash ?? null,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };

  const supabase = getSupabase();
  const { data, error } = await supabase.from("events").upsert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}
