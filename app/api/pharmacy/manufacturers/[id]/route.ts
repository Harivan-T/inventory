import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, code, country, contactname, phone, email, address, website, license_number, product_types, notes } = await req.json();
  const r = await pool.query(
    `UPDATE manufacturers SET name=$1, code=$2, country=$3, contactname=$4, phone=$5, email=$6,
     address=$7, website=$8, license_number=$9, product_types=$10, notes=$11, updatedat=NOW()
     WHERE id=$12 RETURNING *`,
    [name, code||null, country||null, contactname||null, phone||null, email||null, address||null, website||null, license_number||null, product_types||null, notes||null, id]
  );
  return NextResponse.json(r.rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query(`UPDATE manufacturers SET isactive=false, updatedat=NOW() WHERE id=$1`, [id]);
  return NextResponse.json({ success: true });
}
