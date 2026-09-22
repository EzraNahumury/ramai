import { NextResponse } from "next/server";
import { aiConfigured, draftEvent } from "@/lib/ai";

export async function POST(req: Request) {
  if (!aiConfigured) {
    return NextResponse.json(
      { error: "AI not configured — set OPENAI_API_KEY (or AI_BASE_URL for Ollama)" },
      { status: 503 }
    );
  }

  let body: { intent?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const intent = (body.intent ?? "").trim();
  if (intent.length < 4) {
    return NextResponse.json({ error: "Describe your event in a sentence." }, { status: 400 });
  }

  try {
    const draft = await draftEvent(intent);
    return NextResponse.json({ draft });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 502 }
    );
  }
}
