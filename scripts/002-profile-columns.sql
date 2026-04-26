-- Migration 002: Extend profiles table with all new fields
-- Run this in your Supabase SQL editor

-- Create profiles table if it doesn't exist yet
create table if not exists profiles (
  nullifier_hash text primary key,
  created_at     timestamptz default now() not null
);

-- Add every column we need (all safe to run even if column already exists)
alter table profiles
  add column if not exists name           text,
  add column if not exists username       text unique,
  add column if not exists bio            text,
  add column if not exists avatar_url     text,
  add column if not exists x_username     text,
  add column if not exists github_username text,
  add column if not exists portfolio_url  text,
  add column if not exists skills         text[]  default '{}',
  add column if not exists updated_at     timestamptz default now();

-- Index for fast username lookups
create unique index if not exists profiles_username_idx on profiles (lower(username));

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
