"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import type { EventRow } from "@/lib/supabase";
import { formatBNB } from "@/lib/format";

type MatchRow = EventRow & { score: number; reason: string | null };

export default function EventsPage() {
  const { address } = useAccount();
  const [events, setEvents] = useState<MatchRow[]>([]);
  const [configured, setConfigured] = useState(true);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = address ? `/api/match?wallet=${address}` : "/api/match";
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.matches ?? []);
        setConfigured(d.configured !== false);
        setPersonalized(Boolean(d.personalized));
      })
      .catch(() => setConfigured(false))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {personalized ? "Picked for you" : "Discover events"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {personalized
              ? "Ranked by your interests — with the reason each one fits."
              : "Find something that fits — and commit for real."}
          </p>
        </div>
        <Link
          href="/create"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Create event
        </Link>
      </div>

      {!personalized && configured && !loading && (
        <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
          Set your interests to get personalized, explained matches →{" "}
          <Link href="/profile" className="font-medium underline">
            edit interests
          </Link>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-zinc-500">Loading…</p>
      ) : !configured ? (
        <Empty
          title="Backend not configured"
          body="Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in web/.env.local, then run supabase/schema.sql."
        />
      ) : events.length === 0 ? (
        <Empty title="No events yet" body="Be the first — create an event." />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <Link
              key={ev.onchain_id}
              href={`/events/${ev.onchain_id}`}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                {ev.category && (
                  <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {ev.category}
                  </span>
                )}
                {personalized && ev.score > 0 && (
                  <span className="text-xs font-medium text-green-600">● match</span>
                )}
              </div>
              <h2 className="mt-2 line-clamp-2 text-lg font-semibold">{ev.title}</h2>
              {ev.location && <p className="mt-1 text-sm text-zinc-500">{ev.location}</p>}
              {ev.reason && (
                <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm italic text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  “{ev.reason}”
                </p>
              )}
              <p className="mt-3 text-sm">
                {ev.stake_amount_wei && ev.stake_amount_wei !== "0"
                  ? `${formatBNB(ev.stake_amount_wei)} tBNB stake`
                  : "Free RSVP"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{body}</p>
    </div>
  );
}
