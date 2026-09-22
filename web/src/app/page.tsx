"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const appConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);
  const address = user?.wallet?.address;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-16 dark:from-zinc-950 dark:via-black dark:to-black">
      <main className="w-full max-w-xl">
        <div className="mb-8 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            R
          </span>
          <span className="text-xl font-semibold tracking-tight">Ramai</span>
        </div>

        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Events that actually fill up —{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            and actually show up.
          </span>
        </h1>

        <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          AI matches events with the right people. An on-chain RSVP stake turns
          &ldquo;maybe&rdquo; into a real commitment. Every attendance becomes
          reputation you own — on BNB Smart Chain.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {!ready ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : authenticated ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-zinc-500">Signed in</p>
                <p className="mt-1 break-all font-mono text-sm">
                  {address ?? "Provisioning your wallet…"}
                </p>
              </div>
              <button
                onClick={logout}
                className="h-11 rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={login}
                disabled={!appConfigured}
                className="h-12 rounded-full bg-indigo-600 px-6 text-base font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue with email
              </button>
              <p className="text-center text-xs text-zinc-500">
                No wallet, seed phrase, or crypto knowledge needed.
              </p>
            </div>
          )}
        </div>

        {!appConfigured && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            Set <code className="font-mono">NEXT_PUBLIC_PRIVY_APP_ID</code> in{" "}
            <code className="font-mono">web/.env.local</code> to enable login.
            Create an app at dashboard.privy.io.
          </p>
        )}
      </main>
    </div>
  );
}
