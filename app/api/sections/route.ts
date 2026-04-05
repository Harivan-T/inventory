import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  const wid = req.nextUrl.searchParams.get("warehouse_id");
  const q = wid
    ? `SELECT * FROM warehouse_sections WHERE warehouse_id=$1 ORDER BY section_name`
    : `SELECT * FROM warehouse_sections ORDER BY section_name`;
  const r = await pool.query(q, wid ? [wid] : []);
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const { name, warehouse_id, section_type, bin_location, shelf, description, temperature_controlled } = await req.json();
  if (!name?.trim() || !warehouse_id) return NextResponse.json({ error: "Name and warehouse required" }, { status: 400 });
  const r = await pool.query(
    `INSERT INTO warehouse_sections (id, warehouse_id, section_name, section_type, bin_location, shelf, description, temperature_controlled, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
    [warehouse_id, name, section_type ?? "bin", bin_location ?? null, shelf ?? null, description ?? null, temperature_controlled ?? false]
  );
  return NextResponse.json(r.rows[0]);
}
