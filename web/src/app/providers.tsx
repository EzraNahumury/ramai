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
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-zinc-400">
        Loading…
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
          accentColor: "#6d5efc",
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
