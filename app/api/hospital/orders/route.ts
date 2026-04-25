import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "";
  const r = await pool.query(
    `SELECT o.*,
      (SELECT COUNT(*) FROM hospital_order_items oi WHERE oi.order_id = o.id)::int AS item_count
     FROM hospital_shop_orders o WHERE o.workspace_id=$1
     AND ($2='' OR $2='ALL' OR o.status=$2)
     ORDER BY o.createdat DESC`,
    [WS, status]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const { supplier, createdBy, items, totalAmount } = await req.json();
  if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });
  const oNum = `HORD-${Date.now().toString().slice(-8)}`;
  const r = await pool.query(
    `INSERT INTO hospital_shop_orders (id,workspace_id,order_number,supplier,created_by,total_amount,status,createdat,updatedat)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,'PENDING',NOW(),NOW()) RETURNING *`,
    [WS, oNum, supplier||null, createdBy||null, totalAmount||0]
  );
  for (const item of items) {
    await pool.query(
      `INSERT INTO hospital_order_items (id,order_id,item_id,item_name,quantity,unit_cost,supplier_name,createdat)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,NOW())`,
      [r.rows[0].id, item.itemId, item.itemName||null, item.quantity||0, item.unitCost||null, item.supplierName||null]
    );
  }
  return NextResponse.json(r.rows[0]);
}
