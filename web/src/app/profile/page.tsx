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
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Your interests</h1>
      <p className="mt-1 text-sm text-muted">
        Tell Ramai what you&apos;re into — it uses this to find events that actually fit.
      </p>

      {!authenticated ? (
        <button onClick={login} className="btn btn-primary btn-md mt-6">
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
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Interests (comma separated)</span>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="futsal, board games, live music, tech meetup"
              className="input"
            />
          </label>
          <button onClick={save} disabled={busy} className="btn btn-primary btn-md">
            {busy ? "Saving…" : "Save interests"}
          </button>
          {status && <p className="text-sm text-accent">{status}</p>}
        </div>
      )}
    </main>
  );
}
