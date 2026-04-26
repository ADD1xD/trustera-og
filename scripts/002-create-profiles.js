const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
create table if not exists public.profiles (
  nullifier_hash  text primary key,
  name            text not null default '',
  username        text unique,
  bio             text default '',
  avatar_url      text default '',
  x_username      text default '',
  github_username text default '',
  portfolio_url   text default '',
  skills          text[] default '{}',
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='x_username') then
    alter table public.profiles add column x_username text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='github_username') then
    alter table public.profiles add column github_username text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='portfolio_url') then
    alter table public.profiles add column portfolio_url text default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='skills') then
    alter table public.profiles add column skills text[] default '{}';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='avatar_url') then
    alter table public.profiles add column avatar_url text default '';
  end if;
end $$;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

alter table public.profiles enable row level security;

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles for select using (true);

drop policy if exists "profiles_self_write" on public.profiles;
create policy "profiles_self_write" on public.profiles for all using (true) with check (true);
`;

async function run() {
  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .replace('https://', '').split('.')[0];

  console.log('[v0] Connecting to project:', projectRef);

  // Try Management API first
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (res.ok) {
    console.log('[v0] Migration applied via Management API. Done.');
    return;
  }

  const errText = await res.text();
  console.log('[v0] Management API returned:', res.status, errText.slice(0, 200));

  // Probe table existence directly
  const { data, error } = await supabase.from('profiles').select('nullifier_hash').limit(1);
  if (error && error.code === '42P01') {
    console.log('[v0] profiles table does not exist.');
    console.log('[v0] Please run the SQL below in your Supabase SQL editor:');
    console.log('---SQL---');
    console.log(sql);
    console.log('---END---');
  } else if (!error) {
    const cols = data && data[0] ? Object.keys(data[0]).join(', ') : '(empty table)';
    console.log('[v0] profiles table already exists. Columns sample:', cols);
    console.log('[v0] Add-column migrations may need to be run manually in SQL editor if missing.');
  } else {
    console.log('[v0] Unknown error:', error.message);
  }
}

run().catch(err => console.error('[v0] Fatal:', err.message));
