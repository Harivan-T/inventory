import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const r = await pool.query(
    `SELECT * FROM hospital_manufacturers WHERE workspace_id=$1 AND isactive=true
     AND ($2='' OR name ILIKE $2 OR country ILIKE $2 OR product_types ILIKE $2) ORDER BY name`,
    [WS, `%${search}%`]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const r = await pool.query(
    `INSERT INTO hospital_manufacturers (id,workspace_id,name,code,country,contact_name,email,phone,product_types,notes,isactive,createdat,updatedat)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,true,NOW(),NOW()) RETURNING *`,
    [WS, b.name, b.code||null, b.country||null, b.contact_name||null, b.email||null, b.phone||null, b.product_types||null, b.notes||null]
  );
  return NextResponse.json(r.rows[0]);
}

export async function PATCH(req: NextRequest) {
  const b = await req.json();
  await pool.query(
    `UPDATE hospital_manufacturers SET name=$1,code=$2,country=$3,contact_name=$4,email=$5,phone=$6,product_types=$7,notes=$8,updatedat=NOW() WHERE id=$9`,
    [b.name, b.code||null, b.country||null, b.contact_name||null, b.email||null, b.phone||null, b.product_types||null, b.notes||null, b.id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await pool.query(`UPDATE hospital_manufacturers SET isactive=false WHERE id=$1`, [id]);
  return NextResponse.json({ success: true });
}
