import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "";
  const r = await pool.query(
    `SELECT p.*, pr.pr_number,
      (SELECT COUNT(*) FROM hospital_po_items pi WHERE pi.po_id = p.id)::int AS item_count
     FROM hospital_po p
     LEFT JOIN hospital_pr pr ON pr.id = p.pr_id
     WHERE p.workspace_id=$1 AND ($2='' OR p.status=$2)
     ORDER BY p.createdat DESC`,
    [WS, status]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const { prId, supplierName, supplierId, createdBy, expectedDate, notes, items } = await req.json();
  if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });
  const total = items.reduce((s: number, i: any) => s + (i.quantity * (i.unitCost || 0)), 0);
  const poNum = `PO-${Date.now().toString().slice(-8)}`;
  const r = await pool.query(
    `INSERT INTO hospital_po (id,workspace_id,po_number,pr_id,supplier_id,supplier_name,created_by,status,total_amount,expected_date,notes,createdat,updatedat)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,'DRAFT',$7,$8,$9,NOW(),NOW()) RETURNING *`,
    [WS, poNum, prId||null, supplierId||null, supplierName||null, createdBy||null, total, expectedDate||null, notes||null]
  );
  const poId = r.rows[0].id;
  for (const item of items) {
    await pool.query(
      `INSERT INTO hospital_po_items (id,po_id,item_id,item_name,uom,quantity,unit_cost,total_cost,createdat)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,NOW())`,
      [poId, item.itemId, item.itemName||null, item.uom||null, item.quantity||0, item.unitCost||null, (item.quantity*(item.unitCost||0))]
    );
  }
  return NextResponse.json(r.rows[0]);
}
