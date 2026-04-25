import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const globalDb = new Pool({
  connectionString: process.env.GLOBAL_DRUG_DB_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  try {
    const r = await globalDb.query(
      `SELECT
         supplierid   AS id,
         name,
         contactperson AS contact_person,
         email,
         phonenumber  AS phone,
         addressline1 AS address,
         city,
         country,
         category,
         type
       FROM suppliers
       WHERE isactive = true
         AND ($1 = '' OR name ILIKE $1 OR contactperson ILIKE $1 OR city ILIKE $1)
       ORDER BY name LIMIT 100`,
      [`%${search}%`]
    );
    return NextResponse.json(r.rows);
  } catch (err: any) {
    console.error("Supplier fetch error:", err.message);
    return NextResponse.json([]);
  }
}
