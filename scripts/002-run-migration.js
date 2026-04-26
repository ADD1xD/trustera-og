import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Run raw SQL via the Supabase REST /rest/v1/rpc endpoint isn't available for DDL.
// Instead we use the Postgres REST API directly via fetch.
const sql = readFileSync("scripts/002-profile-columns.sql", "utf8");

const res = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_raw`,
  {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }
);

if (!res.ok) {
  // exec_raw may not exist — try splitting and running via pg directly
  console.log("[v0] exec_raw not available, trying direct upsert approach...");
  // Probe existing columns by trying a select
  const probe = await client.from("profiles").select("nullifier_hash").limit(1);
  if (probe.error) {
    console.log("[v0] profiles table error:", probe.error.message);
  } else {
    console.log("[v0] profiles table exists. Columns will be added via SQL editor.");
    console.log("[v0] Please run scripts/002-profile-columns.sql in your Supabase SQL editor.");
  }
} else {
  console.log("[v0] Migration applied successfully.");
}
