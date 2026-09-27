import fs from "fs/promises";
import path from "path";
import {
  supabaseConfigured,
  getSupabase,
  type EventRow,
  type ProfileRow,
} from "./supabase";

/**
 * Metadata store with two backends:
 *  - Supabase, when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set;
 *  - otherwise a local JSON file (zero external accounts, great for local demo).
 * The store is always ready, so the app has no "backend not configured" state.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

type LocalDB = { events: EventRow[]; profiles: ProfileRow[] };

async function readLocal(): Promise<LocalDB> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDB>;
    return { events: parsed.events ?? [], profiles: parsed.profiles ?? [] };
  } catch {
    return { events: [], profiles: [] };
  }
}

async function writeLocal(db: LocalDB): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export const storeBackend = supabaseConfigured ? "supabase" : "local";

export async function listEvents(organizer?: string): Promise<EventRow[]> {
  if (supabaseConfigured) {
    const supabase = getSupabase();
    let query = supabase.from("events").select("*").order("created_at", { ascending: false });
    if (organizer) query = query.ilike("organizer", organizer);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as EventRow[];
  }

  const db = await readLocal();
  let rows = db.events;
  if (organizer) rows = rows.filter((e) => e.organizer.toLowerCase() === organizer.toLowerCase());
  return rows.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function getEvent(onchainId: number): Promise<EventRow | null> {
  if (supabaseConfigured) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("onchain_id", onchainId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as EventRow) ?? null;
  }

  const db = await readLocal();
  return db.events.find((e) => e.onchain_id === onchainId) ?? null;
}

export async function upsertEvent(row: EventRow): Promise<EventRow> {
  if (supabaseConfigured) {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("events").upsert(row).select().single();
    if (error) throw new Error(error.message);
    return data as EventRow;
  }

  const db = await readLocal();
  const withTs: EventRow = { created_at: new Date().toISOString(), ...row };
  const i = db.events.findIndex((e) => e.onchain_id === row.onchain_id);
  if (i >= 0) db.events[i] = { ...db.events[i], ...withTs };
  else db.events.push(withTs);
  await writeLocal(db);
  return withTs;
}

export async function getProfile(wallet: string): Promise<ProfileRow | null> {
  if (supabaseConfigured) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("wallet", wallet)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as ProfileRow) ?? null;
  }

  const db = await readLocal();
  return db.profiles.find((p) => p.wallet.toLowerCase() === wallet.toLowerCase()) ?? null;
}

export async function upsertProfile(row: ProfileRow): Promise<ProfileRow> {
  if (supabaseConfigured) {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("profiles").upsert(row).select().single();
    if (error) throw new Error(error.message);
    return data as ProfileRow;
  }

  const db = await readLocal();
  const withTs: ProfileRow = { created_at: new Date().toISOString(), ...row };
  const i = db.profiles.findIndex((p) => p.wallet.toLowerCase() === row.wallet.toLowerCase());
  if (i >= 0) db.profiles[i] = { ...db.profiles[i], ...withTs };
  else db.profiles.push(withTs);
  await writeLocal(db);
  return withTs;
}
