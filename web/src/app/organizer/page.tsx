"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { isAddress } from "viem";
import type { EventRow } from "@/lib/supabase";
import {
  RAMAI_EVENTS_ADDRESS,
  contractsConfigured,
  ramaiEventsAbi,
} from "@/lib/contracts";
import { formatBNB } from "@/lib/format";

export default function OrganizerPage() {
  const { authenticated, login } = usePrivy();
  const { address } = useAccount();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/events?organizer=${address}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Organizer</h1>
      <p className="mt-1 text-sm text-muted">Check in attendees and settle no-shows.</p>

      {!authenticated ? (
        <button onClick={login} className="btn btn-primary btn-md mt-6">
          Sign in
        </button>
      ) : loading ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-display font-bold">No events yet</p>
          <Link href="/create" className="mt-2 inline-block text-sm font-semibold text-accent">
            Host your first event
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {events.map((ev) => (
            <OrganizerEventCard key={ev.onchain_id} ev={ev} />
          ))}
        </div>
      )}
    </main>
  );
}

function OrganizerEventCard({ ev }: { ev: EventRow }) {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [attendee, setAttendee] = useState("");
  const [noShows, setNoShows] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (fn: () => Promise<`0x${string}`>, pending: string) => {
      setError("");
      setStatus(pending);
      setBusy(true);
      try {
        const hash = await fn();
        await publicClient?.waitForTransactionReceipt({ hash });
        setStatus("Done ✓");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transaction failed.");
        setStatus("");
      } finally {
        setBusy(false);
      }
    },
    [publicClient]
  );

  const checkIn = () => {
    if (!isAddress(attendee)) return setError("Enter a valid attendee address.");
    run(
      () =>
        writeContractAsync({
          address: RAMAI_EVENTS_ADDRESS,
          abi: ramaiEventsAbi,
          functionName: "checkIn",
          args: [BigInt(ev.onchain_id), attendee as `0x${string}`],
        }),
      "Confirm check-in…"
    );
  };

  const settle = () => {
    const list = noShows
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0 || !list.every((a) => isAddress(a)))
      return setError("Enter one or more valid addresses.");
    run(
      () =>
        writeContractAsync({
          address: RAMAI_EVENTS_ADDRESS,
          abi: ramaiEventsAbi,
          functionName: "settleNoShows",
          args: [BigInt(ev.onchain_id), list as `0x${string}`[]],
        }),
      "Confirm settle…"
    );
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <Link href={`/events/${ev.onchain_id}`} className="font-display font-bold hover:text-accent">
          {ev.title}
        </Link>
        <span className="text-xs text-muted">
          {ev.stake_amount_wei && ev.stake_amount_wei !== "0"
            ? `${formatBNB(ev.stake_amount_wei)} tBNB`
            : "Free"}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={attendee}
          onChange={(e) => setAttendee(e.target.value)}
          placeholder="Attendee address 0x…"
          className="input flex-1 font-mono text-xs"
        />
        <button onClick={checkIn} disabled={busy} className="btn btn-primary btn-md">
          Check in
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={noShows}
          onChange={(e) => setNoShows(e.target.value)}
          placeholder="No-show addresses (comma separated)"
          className="input flex-1 font-mono text-xs"
        />
        <button onClick={settle} disabled={busy} className="btn btn-ghost btn-md">
          Settle no-shows
        </button>
      </div>

      {status && <p className="mt-2 text-sm text-accent">{status}</p>}
      {error && <p className="mt-2 break-words text-sm" style={{ color: "#d64545" }}>{error}</p>}
    </div>
  );
}
