"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import type { EventRow } from "@/lib/supabase";
import { formatBNB } from "@/lib/format";

type MatchRow = EventRow & { score: number; reason: string | null };

export default function EventsPage() {
  const { address } = useAccount();
  const { authenticated, getAccessToken } = usePrivy();
  const [events, setEvents] = useState<MatchRow[]>([]);
  const [configured, setConfigured] = useState(true);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      // Personalized matches need proof of wallet ownership; fall back to the plain list.
      const token = address && authenticated ? await getAccessToken() : null;
      const res = token
        ? await fetch(`/api/match?wallet=${address}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await fetch("/api/match");
      return res.json();
    };
    load()
      .then((d) => {
        setEvents(d.matches ?? []);
        setConfigured(d.configured !== false);
        setPersonalized(Boolean(d.personalized));
      })
      .catch(() => setConfigured(false))
      .finally(() => setLoading(false));
  }, [address, authenticated, getAccessToken]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
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
              className="card group flex flex-col p-5 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(20,22,28,0.06)]"
            >
              <div className="flex items-center justify-between gap-2">
                {ev.category ? <span className="chip">{ev.category}</span> : <span />}
                {personalized && ev.score > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                    <span className="dot" style={{ background: "var(--success)", width: 5, height: 5 }} />
                    match
                  </span>
                )}
              </div>
              <h2 className="mt-3 line-clamp-2 font-display text-xl font-semibold leading-snug">{ev.title}</h2>
              {ev.location && <p className="mt-1 text-sm text-muted">{ev.location}</p>}
              {ev.reason && (
                <p className="mt-3 border-l-2 border-accent pl-3 text-sm italic leading-relaxed text-muted">
                  {ev.reason}
                </p>
              )}
              <p className="mt-auto pt-4 text-sm font-medium">
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
