import { createPublicClient, http, type Address } from "viem";
import { bscTestnet } from "viem/chains";
import { RAMAI_EVENTS_ADDRESS, ramaiEventsAbi } from "./contracts";

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(
    process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
      "https://data-seed-prebsc-1-s1.bnbchain.org:8545"
  ),
});

export type OnchainEventInfo = {
  organizer: Address;
  stakeAmount: bigint;
  startTime: bigint;
  checkInDeadline: bigint;
};

/** Server-side read of the source of truth for an event's commitment rules. */
export async function readOnchainEvent(eventId: number): Promise<OnchainEventInfo> {
  const ev = (await client.readContract({
    address: RAMAI_EVENTS_ADDRESS,
    abi: ramaiEventsAbi,
    functionName: "getEventInfo",
    args: [BigInt(eventId)],
  })) as OnchainEventInfo;
  return ev;
}
