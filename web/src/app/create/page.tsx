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
  const { authenticated, login, getAccessToken } = usePrivy();
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
      const token = await getAccessToken();
      const saveRes = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

      if (!saveRes.ok) {
        const d = await saveRes.json().catch(() => ({}));
        throw new Error(
          `Event is on-chain (#${eventId}) but saving details failed: ${d.error ?? saveRes.status}`
        );
      }

      router.push(`/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Host an event</h1>
      <p className="mt-2 text-sm text-muted">
        Details stay off-chain. Only the commitment rules go on-chain.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 p-6 sm:p-8">
        {/* AI drafter */}
        <div className="rounded-xl border border-accent/25 bg-accent-soft p-4">
          <div className="flex items-center gap-2">
            <span className="dot dot-on" />
            <span className="text-sm font-semibold" style={{ color: "var(--accent-press)" }}>
              Draft with AI
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Describe your event in one sentence — Ramai writes the rest.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Casual 5-a-side football in Yogyakarta for beginners, Saturday evening"
              className="input"
            />
            <button
              type="button"
              onClick={handleDraft}
              disabled={drafting}
              className="btn btn-primary btn-md whitespace-nowrap"
            >
              {drafting ? "Drafting…" : "Draft with AI"}
            </button>
          </div>
        </div>

        {/* Basics */}
        <Group title="The basics">
          <Field label="Title">
            <input required value={form.title} onChange={set("title")} className="input" placeholder="Casual 5-a-side football" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={set("description")} className="input min-h-28 resize-y" placeholder="Relaxed game for beginners…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <input value={form.category} onChange={set("category")} className="input" placeholder="sports" />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={set("location")} className="input" placeholder="Yogyakarta" />
            </Field>
          </div>
        </Group>

        {/* Schedule */}
        <Group title="Schedule">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time">
              <input required type="datetime-local" value={form.startTime} onChange={set("startTime")} className="input [color-scheme:light]" />
            </Field>
            <Field label="Check-in deadline" hint="RSVP and check-in close at this time.">
              <input required type="datetime-local" value={form.checkInDeadline} onChange={set("checkInDeadline")} className="input [color-scheme:light]" />
            </Field>
          </div>
        </Group>

        {/* Commitment */}
        <Group title="Commitment">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="RSVP stake" hint="tBNB · refunded on check-in. 0 = free.">
              <input value={form.stake} onChange={set("stake")} className="input" inputMode="decimal" />
            </Field>
            <Field label="Capacity" hint="0 = unlimited.">
              <input value={form.capacity} onChange={set("capacity")} className="input" inputMode="numeric" />
            </Field>
          </div>
        </Group>

        {error && (
          <p className="mt-6 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm" style={{ color: "#d64545" }}>
            {error}
          </p>
        )}
        {status && <p className="mt-6 text-sm text-accent">{status}</p>}

        <button type="submit" disabled={busy} className="btn btn-primary btn-lg mt-8 w-full">
          {authenticated ? (busy ? "Creating…" : "Create event") : "Sign in to create"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          You&rsquo;ll approve one transaction to publish this on-chain.
        </p>
      </form>
    </main>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-line pt-6">
      <h2 className="mono mb-4 text-xs tracking-wide text-muted">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
