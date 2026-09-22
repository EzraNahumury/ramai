"use client";

/** The "room filling up" motif: filled dots = people on the guest list. */
export function AttendanceDots({
  joined,
  capacity,
}: {
  joined: number;
  capacity: number;
}) {
  const MAX = 12;

  if (capacity > 0) {
    const total = Math.min(capacity, MAX);
    const on = Math.round((Math.min(joined, capacity) / capacity) * total);
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`dot ${i < on ? "dot-on" : "dot-off"}`} />
          ))}
        </div>
        <span className="text-xs text-muted">
          {joined}/{capacity}
        </span>
      </div>
    );
  }

  // Unlimited capacity — show up to 6 filled dots + count.
  const shown = Math.min(joined, 6);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.max(shown, 1) }).map((_, i) => (
          <span key={i} className="dot dot-on" />
        ))}
      </div>
      <span className="text-xs text-muted">
        {joined} going
      </span>
    </div>
  );
}
