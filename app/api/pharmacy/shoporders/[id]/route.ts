import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  await pool.query(`UPDATE pharmacy_shop_orders SET status=$1, updatedat=NOW() WHERE id=$2`, [status, id]);
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await pool.query(`SELECT * FROM pharmacy_order_items WHERE orderid=$1`, [id]);
  return NextResponse.json(r.rows);
}
