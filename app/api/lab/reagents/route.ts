import { NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET() {
  const r = await pool.query(
    `SELECT ra.*, i.name AS "itemName", i.uom
     FROM reagent_assignments ra
     LEFT JOIN items i ON i.id = ra.item_id
     ORDER BY ra.analyzer_name, ra.test_type`
  );
  return NextResponse.json(r.rows);
}
