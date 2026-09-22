"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  RAMAI_REPUTATION_ADDRESS,
  contractsConfigured,
  ramaiReputationAbi,
} from "@/lib/contracts";

export function ReputationBadge() {
  const { address } = useAccount();

  const { data } = useReadContract({
    address: RAMAI_REPUTATION_ADDRESS,
    abi: ramaiReputationAbi,
    functionName: "reputationOf",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: contractsConfigured && Boolean(address) },
  });

  if (!contractsConfigured || !address) return null;
  const count = data ? Number(data as bigint) : 0;

  return (
    <span
      title={`${count} verified check-ins`}
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
    >
      ★ {count}
    </span>
  );
}
