const https = require('https');

const PROJECT_REF = 'otyjroalzktbprhkmvwh';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SERVICE_KEY) { console.error('[v0] Missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const sql = `
create table if not exists public.profiles (
  nullifier_hash   text primary key,
  name             text,
  username         text unique,
  bio              text,
  avatar_url       text,
  x_username       text,
  github_username  text,
  portfolio_url    text,
  skills           text[] default '{}',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles disable row level security;
`;

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('[v0] Running migration via Supabase REST /rest/v1/rpc or direct SQL...');

  // Try via the management API (needs management token — may fail)
  // Fall back to direct SQL via the pg REST endpoint
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

  // Actually use the pg endpoint directly
  const sqlUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  console.log('[v0] Attempting management API:', sqlUrl);

  const res = await postJson(sqlUrl, {
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'apikey': SERVICE_KEY,
  }, { query: sql });

  console.log('[v0] Status:', res.status);
  console.log('[v0] Response:', JSON.stringify(res.body).slice(0, 300));

  if (res.status === 200 || res.status === 201) {
    console.log('[v0] Migration succeeded!');
  } else {
    console.log('[v0] Management API failed. Try the SQL editor fallback below:');
    console.log('[v0] Paste scripts/002-profiles-table.sql into your Supabase SQL editor.');
  }
})();
