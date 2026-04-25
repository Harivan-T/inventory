import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const r = await pool.query(
    `SELECT * FROM hospital_suppliers WHERE workspace_id=$1 AND isactive=true
     AND ($2='' OR name ILIKE $2 OR contact_person ILIKE $2) ORDER BY name`,
    [WS, `%${search}%`]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const { name, contact_person, email, phone, address } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const r = await pool.query(
    `INSERT INTO hospital_suppliers (id,workspace_id,name,contact_person,email,phone,address,isactive,createdat,updatedat)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,true,NOW(),NOW()) RETURNING *`,
    [WS, name, contact_person||null, email||null, phone||null, address||null]
  );
  return NextResponse.json(r.rows[0]);
}

export async function PATCH(req: NextRequest) {
  const { id, name, contact_person, email, phone, address } = await req.json();
  await pool.query(
    `UPDATE hospital_suppliers SET name=$1,contact_person=$2,email=$3,phone=$4,address=$5,updatedat=NOW() WHERE id=$6`,
    [name, contact_person||null, email||null, phone||null, address||null, id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await pool.query(`UPDATE hospital_suppliers SET isactive=false WHERE id=$1`, [id]);
  return NextResponse.json({ success: true });
}
