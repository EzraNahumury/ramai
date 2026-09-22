"use client";

import { usePrivy } from "@privy-io/react-auth";
import { shortAddr } from "@/lib/format";

export function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const appConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  if (!ready) {
    return <span className="text-sm text-zinc-400">…</span>;
  }

  if (authenticated) {
    return (
      <button
        onClick={logout}
        title="Sign out"
        className="rounded-full border border-zinc-300 px-3 py-1.5 font-mono text-xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        {shortAddr(user?.wallet?.address) || "Signed in"} · sign out
      </button>
    );
  }

  return (
    <button
      onClick={login}
      disabled={!appConfigured}
      className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
    >
      Sign in
    </button>
  );
}
