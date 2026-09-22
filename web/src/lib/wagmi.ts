import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { bscTestnet } from "viem/chains";

export const wagmiConfig = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(
      process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
        "https://data-seed-prebsc-1-s1.bnbchain.org:8545"
    ),
  },
});
