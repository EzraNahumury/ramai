"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

export default function ProfilePage() {
  const { authenticated, login } = usePrivy();
  const { address } = useAccount();
  const [interests, setInterests] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/profile?wallet=${address}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setInterests((d.profile.interests ?? []).join(", "));
          setName(d.profile.display_name ?? "");
        }
      })
      .catch(() => {});
  }, [address]);

  async function save() {
    if (!address) return;
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          display_name: name,
          interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to save");
      setStatus("Saved ✓ — your discovery is now personalized.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Your interests</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Tell us what you like — AI uses this to find events that actually fit.
      </p>

      {!authenticated ? (
        <button onClick={login} className="mt-6 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white">
          Sign in
        </button>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Interests (comma separated)</span>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="futsal, board games, live music, tech meetup"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <button
            onClick={save}
            disabled={busy}
            className="h-11 rounded-full bg-indigo-600 px-6 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
          {status && <p className="text-sm text-indigo-600">{status}</p>}
        </div>
      )}
    </main>
  );
}
