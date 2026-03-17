import pg from "pg";
const p = new pg.Pool({ 
  connectionString: process.env.LOCAL_DATABASE_URL,
  ssl: false
});
await p.query(`
  ALTER TABLE items
  ADD COLUMN IF NOT EXISTS single_use boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sterile boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS asset_category text,
  ADD COLUMN IF NOT EXISTS serial_number text,
  ADD COLUMN IF NOT EXISTS contrast_type text,
  ADD COLUMN IF NOT EXISTS analyzer_compat text,
  ADD COLUMN IF NOT EXISTS critical_reagent boolean DEFAULT false
`);
console.log("✅ local DB fixed");
await p.end();
