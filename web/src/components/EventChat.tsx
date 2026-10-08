"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What is this event about?",
  "Do I need any experience?",
  "How does the stake work?",
];

export function EventChat({ eventId }: { eventId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const history = messages;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, question: q, history }),
      });
      const data = await res.json();
      const answer = res.ok ? data.answer : data.error ?? "Something went wrong.";
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — try again." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight));
    }
  }

  return (
    <div className="card fade-up mt-5 p-5" style={{ animationDelay: "0.24s" }}>
      <div className="flex items-center gap-2">
        <span className="dot dot-on" />
        <h2 className="font-display text-lg font-bold">Ask about this event</h2>
      </div>
      <p className="mt-1 text-sm text-muted">AI answers from the event details.</p>

      {messages.length > 0 && (
        <div ref={listRef} className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "self-end rounded-2xl rounded-br-sm bg-accent px-3 py-2 text-sm text-white"
                  : "self-start rounded-2xl rounded-bl-sm bg-surface-2 px-3 py-2 text-sm"
              }
            >
              {m.content}
            </div>
          ))}
          {busy && <div className="self-start text-sm text-muted">Thinking…</div>}
        </div>
      )}

      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this event…"
          className="input flex-1"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary btn-md">
          Ask
        </button>
      </form>
    </div>
  );
}
