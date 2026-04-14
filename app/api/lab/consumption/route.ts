import { NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET() {
  const r = await pool.query(
    `SELECT lc.*, i.name AS "itemName"
     FROM lab_consumption_log lc
     LEFT JOIN items i ON i.id = lc.item_id
     ORDER BY lc.created_at DESC LIMIT 200`
  );
  return NextResponse.json(r.rows);
}
