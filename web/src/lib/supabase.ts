import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(url && serviceKey);

let client: SupabaseClient | null = null;

/** Server-only Supabase client (service role). Use inside API route handlers. */
export function getSupabase(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  if (!client) {
    client = createClient(url, serviceKey, { auth: { persistSession: false } });
  }
  return client;
}

export type EventRow = {
  onchain_id: number;
  organizer: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  start_time: string | null;
  checkin_deadline: string | null;
  stake_amount_wei: string | null;
  tx_hash: string | null;
  created_at?: string;
};
