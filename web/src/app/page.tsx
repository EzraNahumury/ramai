"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { NetworkHero } from "@/components/NetworkHero";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const appConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  return (
    <>
      <AnnouncementBanner />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <NetworkHero />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:py-32">
          <p className="mono fade-up mb-6 text-xs tracking-wide text-muted">
            for communities on BNB Smart Chain
          </p>
          <h1 className="fade-up text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl" style={{ animationDelay: "0.05s" }}>
            Fill the room with the right people.
          </h1>
          <p className="fade-up mt-7 max-w-xl text-lg leading-8 text-muted" style={{ animationDelay: "0.12s" }}>
            AI matches every event to who it&rsquo;s actually for. An on-chain RSVP
            stake turns &ldquo;maybe&rdquo; into &ldquo;I&rsquo;ll be there.&rdquo;
            Showing up becomes reputation you own.
          </p>
          <div className="fade-up mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.2s" }}>
            {ready && !authenticated ? (
              <button onClick={login} disabled={!appConfigured} className="btn btn-primary btn-lg">
                Continue with email
              </button>
            ) : (
              <Link href="/events" className="btn btn-primary btn-lg">
                Discover events
              </Link>
            )}
            <Link href="/create" className="btn btn-outline btn-lg">
              Host an event
            </Link>
          </div>
          {!appConfigured && (
            <p className="mt-4 text-sm text-muted">
              Set <code className="mono text-ink">NEXT_PUBLIC_PRIVY_APP_ID</code> to enable sign-in.
            </p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          <Step
            k="01"
            title="Describe it, AI drafts it"
            body="One sentence becomes a full event — and Ramai surfaces it to the people it's for, with the reason it fits."
          />
          <Step
            k="02"
            title="RSVP that means it"
            body="A small refundable stake replaces the empty tap. Show up, get it back. Skip, and it doesn't come back."
          />
          <Step
            k="03"
            title="Showing up counts"
            body="Check-in is verified on-chain and becomes portable reputation — trusted by every organizer on Ramai."
          />
        </div>
      </section>
    </>
  );
}

function Step({ k, title, body }: { k: string; title: string; body: string }) {
  return (
    <div className="bg-surface p-7">
      <span className="mono text-xs text-accent">{k}</span>
      <h2 className="mt-3 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
