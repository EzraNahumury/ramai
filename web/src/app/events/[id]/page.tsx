"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import type { EventRow } from "@/lib/supabase";
import {
  RAMAI_EVENTS_ADDRESS,
  contractsConfigured,
  ramaiEventsAbi,
} from "@/lib/contracts";
import { formatBNB, formatDateTime, shortAddr } from "@/lib/format";
import { AttendanceDots } from "@/components/AttendanceDots";

type OnchainEvent = {
  organizer: string;
  stakeAmount: bigint;
  startTime: bigint;
  checkInDeadline: bigint;
  capacity: number;
  joinedCount: number;
  active: boolean;
  forfeitTo: string;
};

type OnchainRSVP = {
  joined: boolean;
  checkedIn: boolean;
  settled: boolean;
  staked: bigint;
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = BigInt(params.id);
  const { authenticated, login } = usePrivy();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [meta, setMeta] = useState<EventRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((r) => r.json())
      .then((d) => setMeta(d.event ?? null))
      .catch(() => setMeta(null));
  }, [params.id]);

  const { data: evData, refetch: refetchEvent } = useReadContract({
    address: RAMAI_EVENTS_ADDRESS,
    abi: ramaiEventsAbi,
    functionName: "getEventInfo",
    args: [eventId],
    query: { enabled: contractsConfigured },
  });

  const { data: rsvpData, refetch: refetchRsvp } = useReadContract({
    address: RAMAI_EVENTS_ADDRESS,
    abi: ramaiEventsAbi,
    functionName: "getRSVP",
    args: [eventId, address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: contractsConfigured && Boolean(address) },
  });

  const ev = evData as OnchainEvent | undefined;
  const rsvp = rsvpData as OnchainRSVP | undefined;

  async function runTx(fn: () => Promise<`0x${string}`>, pending: string, done: string) {
    setError("");
    if (!authenticated) return login();
    try {
      setBusy(true);
      setStatus(pending);
      const hash = await fn();
      setStatus("Confirming on-chain…");
      await publicClient?.waitForTransactionReceipt({ hash });
      await Promise.all([refetchEvent(), refetchRsvp()]);
      setStatus(done);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  const join = () =>
    runTx(
      () =>
        writeContractAsync({
          address: RAMAI_EVENTS_ADDRESS,
          abi: ramaiEventsAbi,
          functionName: "joinEvent",
          args: [eventId],
          value: ev?.stakeAmount ?? 0n,
        }),
      "Reserving your spot…",
      "You're in. See you there."
    );

  const cancel = () =>
    runTx(
      () =>
        writeContractAsync({
          address: RAMAI_EVENTS_ADDRESS,
          abi: ramaiEventsAbi,
          functionName: "cancelRSVP",
          args: [eventId],
        }),
      "Cancelling…",
      "RSVP cancelled, stake returned."
    );

  const claim = () =>
    runTx(
      () =>
        writeContractAsync({
          address: RAMAI_EVENTS_ADDRESS,
          abi: ramaiEventsAbi,
          functionName: "claimRefund",
          args: [eventId],
        }),
      "Returning your stake…",
      "Stake back in your wallet."
    );

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      {meta?.category && <span className="chip">{meta.category}</span>}
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {meta?.title ?? `Event #${params.id}`}
      </h1>
      {meta?.description && (
        <p className="mt-4 whitespace-pre-line leading-7 text-muted">{meta.description}</p>
      )}

      <div className="card mt-6 p-5">
        <div className="grid grid-cols-2 gap-5 text-sm">
          <Info label="Location" value={meta?.location ?? "—"} />
          <Info label="Starts" value={formatDateTime(ev?.startTime)} />
          <Info label="RSVP closes" value={formatDateTime(ev?.checkInDeadline)} />
          <Info
            label="Stake"
            value={ev && ev.stakeAmount > 0n ? `${formatBNB(ev.stakeAmount)} tBNB` : "Free"}
          />
          <Info label="Host" value={shortAddr(ev?.organizer)} />
          <div>
            <dt className="text-xs text-muted">Guest list</dt>
            <dd className="mt-1.5">
              <AttendanceDots joined={ev?.joinedCount ?? 0} capacity={ev?.capacity ?? 0} />
            </dd>
          </div>
        </div>
      </div>

      <div className="card mt-5 p-5">
        {!contractsConfigured ? (
          <p className="text-sm text-accent">
            Contracts not connected. Deploy and set NEXT_PUBLIC_RAMAI_EVENTS_ADDRESS.
          </p>
        ) : rsvp?.checkedIn ? (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <span className="dot dot-on" style={{ background: "var(--success)" }} />
              Attendance verified · reputation earned
            </p>
            {!rsvp.settled && ev && ev.stakeAmount > 0n && (
              <button onClick={claim} disabled={busy} className="btn btn-primary btn-lg w-full">
                Get your stake back
              </button>
            )}
            {rsvp.settled && <p className="text-sm text-muted">Stake returned. ★ reputation +1.</p>}
          </div>
        ) : rsvp?.joined ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-accent">You&apos;re on the guest list.</p>
            <button onClick={cancel} disabled={busy} className="btn btn-ghost btn-md w-full">
              Cancel RSVP · refund stake
            </button>
          </div>
        ) : (
          <button onClick={join} disabled={busy} className="btn btn-primary btn-lg w-full">
            {authenticated
              ? ev && ev.stakeAmount > 0n
                ? `RSVP · stake ${formatBNB(ev.stakeAmount)} tBNB`
                : "RSVP"
              : "Sign in to RSVP"}
          </button>
        )}

        {status && <p className="mt-3 text-sm text-accent">{status}</p>}
        {error && <p className="mt-3 break-words text-sm" style={{ color: "#d64545" }}>{error}</p>}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
