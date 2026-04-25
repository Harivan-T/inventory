import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await pool.query(`SELECT * FROM hospital_departments WHERE id = $1`, [id]);
  return NextResponse.json(r.rows[0] ?? null);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, type, location, manager, notes } = await req.json();
  const r = await pool.query(
    `UPDATE hospital_departments SET name=$1, type=$2, location=$3, manager=$4, notes=$5, updatedat=NOW() WHERE id=$6 RETURNING *`,
    [name, type || "general", location || null, manager || null, notes || null, id]
  );
  return NextResponse.json(r.rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query(`UPDATE hospital_departments SET isactive=false, updatedat=NOW() WHERE id=$1`, [id]);
  return NextResponse.json({ success: true });
}
