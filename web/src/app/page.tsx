"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const appConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-accent">Ramai · on BNB Smart Chain</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Events that fill up —
          <br />
          and actually show up.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
          AI finds the people an event is actually for. A small stake turns
          &ldquo;maybe&rdquo; into a real yes. Every time you show up, it becomes
          reputation you carry — no seed phrase, no gas, no crypto headache.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {ready && !authenticated ? (
            <button onClick={login} disabled={!appConfigured} className="btn btn-primary btn-lg">
              Continue with email
            </button>
          ) : (
            <Link href="/events" className="btn btn-primary btn-lg">
              Discover events
            </Link>
          )}
          <Link href="/create" className="btn btn-ghost btn-lg">
            Host an event
          </Link>
        </div>

        {!appConfigured && (
          <p className="mt-4 text-sm text-muted">
            Set <code className="font-mono text-ink">NEXT_PUBLIC_PRIVY_APP_ID</code> in{" "}
            <code className="font-mono text-ink">web/.env.local</code> to enable sign-in.
          </p>
        )}
      </div>

      {/* How it works — grounded in the real flow, no numbered chrome */}
      <div className="mt-20 grid gap-4 sm:grid-cols-3">
        <Step
          title="Describe it, AI drafts it"
          body="Type one sentence. Ramai writes the event and finds who it's for — and tells them why it fits."
        />
        <Step
          title="RSVP that means it"
          body="A small refundable stake replaces the empty tap. Show up, get it back. Skip, and it doesn't come back."
        />
        <Step
          title="Showing up counts"
          body="Check-in is verified on-chain and becomes portable reputation — trusted by every organizer on Ramai."
        />
      </div>
    </main>
  );
}

function Step({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-1.5" aria-hidden>
        <span className="dot dot-on" />
        <span className="dot dot-on" />
        <span className="dot dot-off" />
      </div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
