import { NextResponse } from "next/server";
import type { EventRow } from "@/lib/supabase";
import { listEvents, upsertEvent } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const organizer = searchParams.get("organizer");
  try {
    const events = await listEvents(organizer ?? undefined);
    return NextResponse.json({ events, configured: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

  try {
    const event = await upsertEvent(row);
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save event" },
      { status: 500 }
    );
  }
}
