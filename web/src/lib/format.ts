import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
  formatEther,
} from "viem";

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

// Contract custom errors (RamaiEvents.sol) → what the user should understand.
const REVERT_MESSAGES: Record<string, string> = {
  InvalidTimeWindow: "Start time must be before the check-in deadline, and the deadline must be in the future.",
  EventNotActive: "This event is no longer accepting RSVPs.",
  RegistrationClosed: "RSVP is closed — the deadline has passed.",
  WrongStakeValue: "The stake sent doesn't match this event's stake.",
  AlreadyJoined: "You're already on the guest list.",
  NotJoined: "This wallet hasn't RSVP'd to the event.",
  CapacityFull: "This event is full.",
  NotOrganizer: "Only the event's organizer can do this.",
  AlreadyCheckedIn: "This attendee is already checked in.",
  NotCheckedIn: "You can claim your stake after the organizer checks you in.",
  AlreadySettled: "This stake has already been settled.",
  DeadlineNotPassed: "No-shows can only be settled after the check-in deadline.",
  CheckInClosed: "Check-in is closed — the deadline has passed.",
  TransferFailed: "The transfer failed. Please try again.",
};

/** Turns a wallet/contract error into one short, human sentence. */
export function txErrorMessage(err: unknown, fallback = "Transaction failed."): string {
  if (err instanceof BaseError) {
    if (err.walk((e) => e instanceof UserRejectedRequestError)) {
      return "Transaction cancelled — nothing was sent.";
    }
    const reverted = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;
      if (name && REVERT_MESSAGES[name]) return REVERT_MESSAGES[name];
    }
    if (err.walk((e) => e instanceof InsufficientFundsError)) {
      return "Not enough tBNB in your wallet for the stake and network fee.";
    }
    return err.shortMessage || fallback;
  }
  if (err instanceof Error) {
    if (/user rejected|user denied|rejected the request/i.test(err.message)) {
      return "Transaction cancelled — nothing was sent.";
    }
    return err.message.split("\n")[0].slice(0, 200) || fallback;
  }
  return fallback;
}
