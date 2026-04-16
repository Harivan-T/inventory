import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, location, type, temperature, notes } = await req.json();
  const r = await pool.query(
    `UPDATE pharmacy_storage_locations SET name=$1,location=$2,type=$3,temperature=$4,notes=$5,updatedat=NOW() WHERE id=$6 RETURNING *`,
    [name, location||null, type||"shelf", temperature||null, notes||null, id]
  );
  return NextResponse.json(r.rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query(`UPDATE pharmacy_storage_locations SET isactive=false,updatedat=NOW() WHERE id=$1`, [id]);
  return NextResponse.json({ success:true });
}
