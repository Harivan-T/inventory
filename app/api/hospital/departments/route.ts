import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const r = await pool.query(
    `SELECT d.*, 
      (SELECT COUNT(*) FROM hospital_stock s WHERE s.department_id = d.id AND s.quantity > 0)::int AS item_count
     FROM hospital_departments d
     WHERE d.workspace_id = $1 AND d.isactive = true
       AND ($2 = '' OR d.name ILIKE $2 OR d.type ILIKE $2)
     ORDER BY d.name`,
    [WS, `%${search}%`]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const { name, type, location, manager, notes } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const r = await pool.query(
    `INSERT INTO hospital_departments (id, workspace_id, name, type, location, manager, notes, isactive, createdat, updatedat)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW()) RETURNING *`,
    [WS, name, type || "general", location || null, manager || null, notes || null]
  );
  return NextResponse.json(r.rows[0]);
}
