"use client";

import { useState } from "react";
import Link from "next/link";

export function AnnouncementBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="border-b border-line bg-surface-2">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <p className="mono truncate text-xs text-muted">
          Refundable RSVP stakes cut no-shows.{" "}
          <Link href="/events" className="text-ink underline underline-offset-2">
            See how it works
          </Link>
        </p>
        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="mono shrink-0 text-xs text-muted hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
