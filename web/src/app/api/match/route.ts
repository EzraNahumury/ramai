import { NextResponse } from "next/server";
import type { EventRow } from "@/lib/supabase";
import { getProfile, listEvents } from "@/lib/store";
import { aiConfigured, explainMatches } from "@/lib/ai";

const TOP_N = 6;

/** Deterministic relevance score: exact tag overlap weighted highest, then
 *  substring hits across category/title/description. LLM only explains. */
function scoreEvent(interests: string[], ev: EventRow): number {
  const norm = interests.map((i) => i.toLowerCase().trim()).filter(Boolean);
  if (norm.length === 0) return 0;
  const tags = (ev.tags ?? []).map((t) => t.toLowerCase());
  const hay = [ev.category, ev.title, ev.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const it of norm) {
    if (tags.includes(it)) score += 3;
    else if (hay.includes(it)) score += 2;
  }
  return score;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  try {
    let interests: string[] = [];
    if (wallet) {
      const profile = await getProfile(wallet);
      interests = profile?.interests ?? [];
    }

    const rows = await listEvents();

    // No interests → plain recency list, no scoring/reasons.
    if (interests.length === 0) {
      return NextResponse.json({
        matches: rows.map((ev) => ({ ...ev, score: 0, reason: null })),
        interests,
        personalized: false,
        configured: true,
      });
    }

    const ranked = rows
      .map((ev) => ({ ev, score: scoreEvent(interests, ev) }))
      .sort((a, b) => b.score - a.score);

    const top = ranked.slice(0, TOP_N).filter((r) => r.score > 0);

    let reasons: Record<number, string> = {};
    if (aiConfigured && top.length > 0) {
      try {
        const list = top.map((r) => ({
          id: r.ev.onchain_id,
          title: r.ev.title,
          category: r.ev.category ?? undefined,
          tags: r.ev.tags ?? [],
        }));
        const res = await explainMatches(interests, list);
        reasons = Object.fromEntries(res.map((x) => [Number(x.id), x.reason]));
      } catch {
        reasons = {};
      }
    }

    const matches = ranked.map(({ ev, score }) => ({
      ...ev,
      score,
      reason: reasons[ev.onchain_id] ?? null,
    }));

    return NextResponse.json({ matches, interests, personalized: true, configured: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Match failed" },
      { status: 500 }
    );
  }
}
