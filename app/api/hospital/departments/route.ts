import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.TIBBNA_API_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  try {
    const r = await pool.query(
      `SELECT d.departmentid AS id, d.name, d.description AS location, NULL::text AS type,
        (SELECT COUNT(*) FROM hospital_stock s WHERE s.department_id = d.departmentid AND s.quantity > 0)::int AS item_count
       FROM departments d
       WHERE ($1 = '' OR d.name ILIKE $1)
       ORDER BY d.name`,
      [`%${search}%`]
    );
    return NextResponse.json(r.rows);
  } catch (e: any) {
    console.error("hospital/departments error:", e.message);
    return NextResponse.json([]);
  }
}
