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

  async function runTx(fn: () => Promise<`0x${string}`>, pending: string) {
    setError("");
    if (!authenticated) return login();
    try {
      setBusy(true);
      setStatus(pending);
      const hash = await fn();
      setStatus("Waiting for confirmation…");
      await publicClient?.waitForTransactionReceipt({ hash });
      await Promise.all([refetchEvent(), refetchRsvp()]);
      setStatus("Done ✓");
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
      "Confirm to RSVP…"
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
      "Confirm to cancel…"
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
      "Confirm to claim your stake…"
    );

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        {meta?.title ?? `Event #${params.id}`}
      </h1>
      {meta?.category && <p className="mt-1 text-sm text-indigo-600">{meta.category}</p>}
      {meta?.description && (
        <p className="mt-4 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {meta.description}
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 p-5 text-sm dark:border-zinc-800">
        <Info label="Location" value={meta?.location ?? "—"} />
        <Info label="Starts" value={formatDateTime(ev?.startTime)} />
        <Info label="Check-in deadline" value={formatDateTime(ev?.checkInDeadline)} />
        <Info
          label="Stake"
          value={ev && ev.stakeAmount > 0n ? `${formatBNB(ev.stakeAmount)} tBNB` : "Free"}
        />
        <Info label="Organizer" value={shortAddr(ev?.organizer)} />
        <Info
          label="Joined"
          value={ev ? `${ev.joinedCount}${ev.capacity ? ` / ${ev.capacity}` : ""}` : "—"}
        />
      </dl>

      <div className="mt-6 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        {!contractsConfigured ? (
          <p className="text-sm text-amber-600">
            Contract address not set. Deploy and set NEXT_PUBLIC_RAMAI_EVENTS_ADDRESS.
          </p>
        ) : rsvp?.checkedIn ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-green-600">Attendance verified ✓</p>
            {!rsvp.settled && ev && ev.stakeAmount > 0n && (
              <button onClick={claim} disabled={busy} className={primaryBtn}>
                Claim your stake back
              </button>
            )}
            {rsvp.settled && <p className="text-sm text-zinc-500">Stake returned. Reputation +1.</p>}
          </div>
        ) : rsvp?.joined ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-indigo-600">You&apos;re on the guest list.</p>
            <button onClick={cancel} disabled={busy} className={secondaryBtn}>
              Cancel RSVP (refund stake)
            </button>
          </div>
        ) : (
          <button onClick={join} disabled={busy} className={primaryBtn}>
            {authenticated
              ? ev && ev.stakeAmount > 0n
                ? `RSVP · stake ${formatBNB(ev.stakeAmount)} tBNB`
                : "RSVP"
              : "Sign in to RSVP"}
          </button>
        )}

        {status && <p className="mt-3 text-sm text-indigo-600">{status}</p>}
        {error && <p className="mt-3 break-words text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}

const primaryBtn =
  "h-12 w-full rounded-full bg-indigo-600 px-6 text-base font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50";
const secondaryBtn =
  "h-11 w-full rounded-full border border-zinc-300 px-6 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
