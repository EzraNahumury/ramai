-- Ramai — Supabase schema (run in Supabase SQL editor).
-- Off-chain metadata only. Commitment/attendance state lives on-chain.

create table if not exists events (
  onchain_id        bigint primary key,
  organizer         text not null,
  title             text not null,
  description       text,
  category          text,
  location          text,
  start_time        timestamptz,
  checkin_deadline  timestamptz,
  stake_amount_wei  text,          -- string to preserve uint256 precision
  tx_hash           text,
  created_at        timestamptz not null default now()
);

create index if not exists events_organizer_idx on events (organizer);
create index if not exists events_category_idx on events (category);
create index if not exists events_start_time_idx on events (start_time);

-- Lightweight profile for interests (used later by AI matching).
create table if not exists profiles (
  wallet        text primary key,
  display_name  text,
  interests     text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- pgvector (enable when adding AI matching):
-- create extension if not exists vector;
-- alter table events add column if not exists embedding vector(1536);
-- alter table profiles add column if not exists embedding vector(1536);
