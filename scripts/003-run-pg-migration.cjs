const { Client } = require('pg');

// Supabase postgres connection string format:
// postgresql://postgres:[SERVICE_ROLE_KEY]@db.[REF].supabase.co:5432/postgres
// Actually for direct DB access we need the DB password, not the service role key.
// Build from env vars - Supabase provides POSTGRES_URL or we build it from the project ref.

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const ref = supabaseUrl.replace('https://', '').split('.')[0];

  // Try POSTGRES_URL first (set by some Supabase integrations)
  const connStr = process.env.POSTGRES_URL
    || process.env.DATABASE_URL
    || `postgresql://postgres.${ref}:${serviceKey}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

  console.log('[v0] Connecting to Postgres...');
  console.log('[v0] ref:', ref);
  console.log('[v0] POSTGRES_URL present:', !!process.env.POSTGRES_URL);
  console.log('[v0] DATABASE_URL present:', !!process.env.DATABASE_URL);

  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('[v0] Connected!');

    const sql = `
CREATE TABLE IF NOT EXISTS public.profiles (
  nullifier_hash    TEXT PRIMARY KEY,
  full_name         TEXT NOT NULL DEFAULT '',
  username          TEXT UNIQUE NOT NULL DEFAULT '',
  bio               TEXT DEFAULT '',
  avatar_url        TEXT DEFAULT '',
  x_username        TEXT DEFAULT '',
  github_username   TEXT DEFAULT '',
  portfolio_url     TEXT DEFAULT '',
  skills            TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Anyone can read profiles') THEN
    CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role can write profiles') THEN
    CREATE POLICY "Service role can write profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (lower(username));
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles (created_at DESC);
    `;

    await client.query(sql);
    console.log('[v0] profiles table created successfully!');

    // Verify
    const check = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public' ORDER BY ordinal_position`);
    console.log('[v0] Columns:', check.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error('[v0] Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
