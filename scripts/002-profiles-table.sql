-- ================================================================
-- Trustera – profiles table
-- Paste this into: Supabase Dashboard → SQL Editor → New query → Run
-- ================================================================

create table if not exists public.profiles (
  nullifier_hash   text        primary key,
  name             text        not null default '',
  username         text        unique not null default '',
  bio              text        not null default '',
  avatar_url       text        not null default '',
  x_username       text        not null default '',
  github_username  text        not null default '',
  portfolio_url    text        not null default '',
  skills           text[]      not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-bump updated_at on every write
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Disable RLS so service-role key can read/write freely
alter table public.profiles disable row level security;
