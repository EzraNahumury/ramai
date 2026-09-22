import RamaiEventsAbi from "@/abi/RamaiEvents.json";
import RamaiReputationAbi from "@/abi/RamaiReputation.json";

export const ramaiEventsAbi = RamaiEventsAbi;
export const ramaiReputationAbi = RamaiReputationAbi;

export const RAMAI_EVENTS_ADDRESS = (process.env.NEXT_PUBLIC_RAMAI_EVENTS_ADDRESS ??
  "") as `0x${string}`;
export const RAMAI_REPUTATION_ADDRESS = (process.env
  .NEXT_PUBLIC_RAMAI_REPUTATION_ADDRESS ?? "") as `0x${string}`;

export const contractsConfigured =
  RAMAI_EVENTS_ADDRESS.length === 42 && RAMAI_REPUTATION_ADDRESS.length === 42;
