"use client";

import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bscTestnet } from "viem/chains";
import { wagmiConfig } from "@/lib/wagmi";
import { Nav } from "@/components/Nav";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

  // Privy is a client-only SDK and refuses to initialize without a live app id
  // (e.g. during `next build` prerender). Mount-gate so the provider tree only
  // renders in the browser; server output is a neutral shell, avoiding both the
  // build-time crash and hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  // Privy refuses to initialize without a live app id, which would crash the
  // whole app. Show an actionable setup screen instead.
  if (!appId) {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-1 flex-col justify-center px-6">
        <div className="mb-4 flex gap-1.5" aria-hidden>
          <span className="dot dot-on" />
          <span className="dot dot-on" />
          <span className="dot dot-off" />
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Almost there</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Ramai signs people in with email. Create a free app at{" "}
          <a href="https://dashboard.privy.io" className="font-semibold text-accent">
            dashboard.privy.io
          </a>
          , then add its App ID to{" "}
          <code className="font-mono text-ink">web/.env.local</code>:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 text-xs">
          NEXT_PUBLIC_PRIVY_APP_ID=your-app-id
        </pre>
        <p className="mt-3 text-xs text-muted">Restart the dev server after saving.</p>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        defaultChain: bscTestnet,
        supportedChains: [bscTestnet],
        loginMethods: ["email"],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          showWalletUIs: true,
        },
        appearance: {
          theme: "light",
          accentColor: "#ff5a24",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <Nav />
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
