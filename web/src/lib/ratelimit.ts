import { NextResponse } from "next/server";

/**
 * Fixed-window in-memory rate limiter, keyed per client + bucket.
 * Good enough for a single server instance; on serverless/multi-instance
 * deployments each instance keeps its own counters, so swap for a shared
 * store (e.g. Redis/Upstash) if you need a hard global limit.
 */
type Entry = { count: number; resetAt: number };
const hits = new Map<string, Entry>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Returns a 429 response if the caller exceeded `limit` per `windowMs`, else null. */
export function rateLimit(
  req: Request,
  bucket: string,
  limit: number,
  windowMs = 60_000
): NextResponse | null {
  const now = Date.now();

  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }

  const key = `${bucket}:${clientIp(req)}`;
  const e = hits.get(key);
  if (!e || e.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  e.count += 1;
  if (e.count > limit) {
    const retry = Math.max(1, Math.ceil((e.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests — slow down." },
      { status: 429, headers: { "Retry-After": String(retry) } }
    );
  }
  return null;
}
