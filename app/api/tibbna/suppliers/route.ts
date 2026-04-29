import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  try {
    const r = await pool.query(
      "SELECT supplierid AS id, name, contactname AS contact_person, email, phone, address FROM suppliers ORDER BY name LIMIT 100"
    );
    return NextResponse.json(r.rows);
  } catch (e: any) {
    console.error("Suppliers error:", e.message);
    return NextResponse.json([]);
  }
}
