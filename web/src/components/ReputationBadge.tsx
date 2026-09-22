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
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: "var(--gold)", background: "color-mix(in srgb, var(--gold) 14%, transparent)" }}
    >
      <span aria-hidden>★</span>
      {count}
    </span>
  );
}
