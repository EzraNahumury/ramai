import { NextResponse } from "next/server";
import type { EventRow } from "@/lib/supabase";
import { listEvents, upsertEvent } from "@/lib/store";
import { authenticate, authErrorResponse } from "@/lib/auth";
import { readOnchainEvent, type OnchainEventInfo } from "@/lib/chain";
import { contractsConfigured } from "@/lib/contracts";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : null);

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
  let wallets: string[];
  try {
    wallets = await authenticate(req);
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Auth failed" }, { status: 401 });
  }

  let body: Partial<EventRow>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.onchain_id === undefined || !body.title) {
    return NextResponse.json({ error: "onchain_id and title are required" }, { status: 400 });
  }

  const onchainId = Number(body.onchain_id);
  if (!Number.isSafeInteger(onchainId) || onchainId < 0) {
    return NextResponse.json({ error: "Invalid onchain_id" }, { status: 400 });
  }
  if (!contractsConfigured) {
    return NextResponse.json({ error: "Contracts not configured" }, { status: 503 });
  }

  // The chain is the source of truth: only the on-chain organizer may attach
  // metadata, and commitment fields come from the contract, not the request.
  let chainEv: OnchainEventInfo;
  try {
    chainEv = await readOnchainEvent(onchainId);
  } catch {
    return NextResponse.json({ error: "Could not read event from chain" }, { status: 502 });
  }
  if (!wallets.includes(chainEv.organizer.toLowerCase())) {
    return NextResponse.json(
      { error: "Only the on-chain organizer can save this event" },
      { status: 403 }
    );
  }

  const row: EventRow = {
    onchain_id: onchainId,
    organizer: chainEv.organizer,
    title: String(body.title).slice(0, 200),
    description: clip(body.description, 4000),
    category: clip(body.category, 50),
    location: clip(body.location, 200),
    start_time: new Date(Number(chainEv.startTime) * 1000).toISOString(),
    checkin_deadline: new Date(Number(chainEv.checkInDeadline) * 1000).toISOString(),
    stake_amount_wei: chainEv.stakeAmount.toString(),
    tx_hash: clip(body.tx_hash, 100),
    tags: Array.isArray(body.tags)
      ? body.tags
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 10)
      : [],
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
