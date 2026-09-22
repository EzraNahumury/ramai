"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { decodeEventLog, parseEther, zeroAddress } from "viem";
import {
  RAMAI_EVENTS_ADDRESS,
  contractsConfigured,
  ramaiEventsAbi,
} from "@/lib/contracts";
import { toUnixSeconds } from "@/lib/format";

export default function CreateEventPage() {
  const router = useRouter();
  const { authenticated, login } = usePrivy();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startTime: "",
    checkInDeadline: "",
    stake: "0.01",
    capacity: "0",
  });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [intent, setIntent] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleDraft() {
    setError("");
    if (intent.trim().length < 4) {
      setError("Describe your event in a sentence first.");
      return;
    }
    try {
      setDrafting(true);
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI request failed");
      const d = data.draft;
      setForm((f) => ({
        ...f,
        title: d.title || f.title,
        description: d.description || f.description,
        category: d.category || f.category,
        location: d.location || f.location,
      }));
      if (Array.isArray(d.audience_tags)) setTags(d.audience_tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setDrafting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!authenticated) return login();
    if (!contractsConfigured) {
      setError("Contract address not set. Deploy contracts and set NEXT_PUBLIC_RAMAI_EVENTS_ADDRESS.");
      return;
    }
    if (!publicClient || !address) {
      setError("Wallet not ready.");
      return;
    }

    const startUnix = toUnixSeconds(form.startTime);
    const deadlineUnix = toUnixSeconds(form.checkInDeadline);
    if (!startUnix || !deadlineUnix || startUnix >= deadlineUnix) {
      setError("Start time must be before the check-in deadline.");
      return;
    }

    try {
      setBusy(true);
      setStatus("Confirm the transaction to create your event…");
      const hash = await writeContractAsync({
        address: RAMAI_EVENTS_ADDRESS,
        abi: ramaiEventsAbi,
        functionName: "createEvent",
        args: [
          parseEther(form.stake || "0"),
          BigInt(startUnix),
          BigInt(deadlineUnix),
          Number(form.capacity || "0"),
          zeroAddress,
        ],
      });

      setStatus("Waiting for confirmation on BNB Smart Chain…");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Find the EventCreated log to get the on-chain event id.
      let eventId: bigint | undefined;
      for (const log of receipt.logs) {
        try {
          const parsed = decodeEventLog({
            abi: ramaiEventsAbi,
            data: log.data,
            topics: log.topics,
          });
          if (parsed.eventName === "EventCreated") {
            eventId = (parsed.args as unknown as { eventId: bigint }).eventId;
            break;
          }
        } catch {
          // not our event, skip
        }
      }
      if (eventId === undefined) throw new Error("Could not read event id from receipt.");

      setStatus("Saving event details…");
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onchain_id: Number(eventId),
          organizer: address,
          title: form.title,
          description: form.description,
          category: form.category,
          location: form.location,
          start_time: new Date(startUnix * 1000).toISOString(),
          checkin_deadline: new Date(deadlineUnix * 1000).toISOString(),
          stake_amount_wei: parseEther(form.stake || "0").toString(),
          tx_hash: hash,
          tags,
        }),
      });

      router.push(`/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Create an event</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Details are stored off-chain; the commitment rules go on-chain.
      </p>

      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
        <label className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
          ✨ Describe it in one sentence — AI drafts the rest
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Casual 5-a-side football in Yogyakarta for beginners, Saturday evening"
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleDraft}
            disabled={drafting}
            className="whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {drafting ? "Drafting…" : "Draft with AI"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Title">
          <input required value={form.title} onChange={set("title")} className={inputCls} placeholder="Casual 5-a-side football" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={set("description")} className={`${inputCls} min-h-24`} placeholder="Relaxed game for beginners…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input value={form.category} onChange={set("category")} className={inputCls} placeholder="sports" />
          </Field>
          <Field label="Location">
            <input value={form.location} onChange={set("location")} className={inputCls} placeholder="Yogyakarta" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start time">
            <input required type="datetime-local" value={form.startTime} onChange={set("startTime")} className={inputCls} />
          </Field>
          <Field label="Check-in deadline">
            <input required type="datetime-local" value={form.checkInDeadline} onChange={set("checkInDeadline")} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="RSVP stake (tBNB, 0 = free)">
            <input value={form.stake} onChange={set("stake")} className={inputCls} inputMode="decimal" />
          </Field>
          <Field label="Capacity (0 = unlimited)">
            <input value={form.capacity} onChange={set("capacity")} className={inputCls} inputMode="numeric" />
          </Field>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        {status && <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{status}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 h-12 rounded-full bg-indigo-600 px-6 text-base font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {authenticated ? (busy ? "Creating…" : "Create event") : "Sign in to create"}
        </button>
      </form>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
