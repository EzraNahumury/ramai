import { formatEther } from "viem";

export function shortAddr(addr?: string | null): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatBNB(wei?: bigint | string | null): string {
  if (wei === undefined || wei === null) return "0";
  try {
    return formatEther(typeof wei === "string" ? BigInt(wei) : wei);
  } catch {
    return "0";
  }
}

/** datetime-local string (local time) -> unix seconds. */
export function toUnixSeconds(local: string): number {
  return Math.floor(new Date(local).getTime() / 1000);
}

/** unix seconds (bigint/number) -> readable local string. */
export function formatDateTime(unix?: bigint | number | null): string {
  if (unix === undefined || unix === null) return "—";
  const n = typeof unix === "bigint" ? Number(unix) : unix;
  if (!n) return "—";
  return new Date(n * 1000).toLocaleString();
}
