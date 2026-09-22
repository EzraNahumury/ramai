"use client";

import { usePrivy } from "@privy-io/react-auth";
import { shortAddr } from "@/lib/format";

export function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const appConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  if (!ready) {
    return <span className="text-sm text-muted">…</span>;
  }

  if (authenticated) {
    return (
      <button
        onClick={logout}
        title="Sign out"
        className="btn btn-ghost btn-sm font-mono"
      >
        {shortAddr(user?.wallet?.address) || "Account"}
      </button>
    );
  }

  return (
    <button onClick={login} disabled={!appConfigured} className="btn btn-primary btn-sm">
      Sign in
    </button>
  );
}
