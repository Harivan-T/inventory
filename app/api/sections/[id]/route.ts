import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, warehouse_id, section_type, bin_location, shelf, description, temperature_controlled } = await req.json();
  const r = await pool.query(
    `UPDATE warehouse_sections SET section_name=$1, warehouse_id=$2, section_type=$3, bin_location=$4, shelf=$5, description=$6, temperature_controlled=$7
     WHERE id=$8 RETURNING *`,
    [name, warehouse_id, section_type, bin_location ?? null, shelf ?? null, description ?? null, temperature_controlled ?? false, id]
  );
  if (!r.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(r.rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query(`DELETE FROM warehouse_sections WHERE id=$1`, [id]);
  return NextResponse.json({ success: true });
}
