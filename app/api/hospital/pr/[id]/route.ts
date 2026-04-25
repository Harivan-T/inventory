import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = await pool.query(`SELECT * FROM hospital_pr_items WHERE pr_id=$1`, [id]);
  return NextResponse.json(items.rows);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, approvedBy } = await req.json();
  await pool.query(
    `UPDATE hospital_pr SET status=$1, approved_by=$2, updatedat=NOW() WHERE id=$3`,
    [status, approvedBy||null, id]
  );
  return NextResponse.json({ success: true });
}
