import pg from "pg";
const p = new pg.Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const r = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name='warehouse_sections' ORDER BY ordinal_position");
console.log('warehouse_sections:', r.rows.map(x => x.column_name));
p.end();