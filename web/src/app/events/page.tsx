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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {personalized ? "Picked for you" : "Discover events"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {personalized
              ? "Ranked by your interests — with the reason each one fits."
              : "Find something that fits — and commit for real."}
          </p>
        </div>
        <Link href="/create" className="btn btn-primary btn-md">
          Create event
        </Link>
      </div>

      {!personalized && configured && !loading && (
        <div className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
          Add your interests for matches picked and explained for you —{" "}
          <Link href="/profile" className="font-semibold text-accent">
            set interests
          </Link>
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-surface-2" />
          ))}
        </div>
      ) : !configured ? (
        <Empty
          title="Backend not connected"
          body="Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to web/.env.local, then run supabase/schema.sql."
        />
      ) : events.length === 0 ? (
        <Empty title="No events yet" body="Be the first — host one.">
          <Link href="/create" className="btn btn-primary btn-md mt-4">
            Create event
          </Link>
        </Empty>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <Link
              key={ev.onchain_id}
              href={`/events/${ev.onchain_id}`}
              className="card flex flex-col p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                {ev.category ? <span className="chip">{ev.category}</span> : <span />}
                {personalized && ev.score > 0 && (
                  <span className="text-xs font-semibold text-success">● match</span>
                )}
              </div>
              <h2 className="mt-3 line-clamp-2 font-display text-lg font-bold">{ev.title}</h2>
              {ev.location && <p className="mt-1 text-sm text-muted">{ev.location}</p>}
              {ev.reason && (
                <p className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-muted">
                  {ev.reason}
                </p>
              )}
              <p className="mt-4 text-sm font-medium">
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

function Empty({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line p-12 text-center">
      <div className="mb-4 flex gap-1.5" aria-hidden>
        <span className="dot dot-on" />
        <span className="dot dot-off" />
        <span className="dot dot-off" />
      </div>
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {children}
    </div>
  );
}
