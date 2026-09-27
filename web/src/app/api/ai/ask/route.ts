import { NextResponse } from "next/server";
import { aiConfigured, askAboutEvent, type ChatMessage } from "@/lib/ai";
import { getEvent } from "@/lib/store";

export async function POST(req: Request) {
  if (!aiConfigured) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 503 }
    );
  }

  let body: { eventId?: number | string; question?: string; history?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  if (!question) return NextResponse.json({ error: "question required" }, { status: 400 });
  if (body.eventId === undefined) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  try {
    const ev = await getEvent(Number(body.eventId));
    if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const context = {
      title: ev.title,
      description: ev.description,
      category: ev.category,
      location: ev.location,
      start_time: ev.start_time,
      rsvp_closes: ev.checkin_deadline,
      stake_tBNB: ev.stake_amount_wei
        ? Number(BigInt(ev.stake_amount_wei)) / 1e18
        : 0,
      tags: ev.tags ?? [],
      note: "RSVP stake is refundable on check-in; forfeited if you don't show up. Attendance is verified on-chain and builds reputation.",
    };

    const answer = await askAboutEvent(context, question, body.history ?? []);
    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 502 }
    );
  }
}
