import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "";
  const r = await pool.query(
    `SELECT g.*, po.po_number, d.name AS department_name,
      (SELECT COUNT(*) FROM hospital_grn_items gi WHERE gi.grn_id = g.id)::int AS item_count
     FROM hospital_grn g
     LEFT JOIN hospital_po po ON po.id = g.po_id
     LEFT JOIN hospital_departments d ON d.id = g.department_id
     WHERE g.workspace_id=$1 AND ($2='' OR g.status=$2)
     ORDER BY g.createdat DESC`,
    [WS, status]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const { poId, receivedBy, departmentId, supplierName, invoiceNumber, notes, items } = await req.json();
  if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });
  const grnNum = `GRN-${Date.now().toString().slice(-8)}`;
  const allReceived = items.every((i: any) => i.receivedQty >= i.orderedQty);
  const status = allReceived ? "COMPLETE" : "PARTIAL";

  const r = await pool.query(
    `INSERT INTO hospital_grn (id,workspace_id,grn_number,po_id,received_by,department_id,supplier_name,invoice_number,status,notes,createdat,updatedat)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) RETURNING *`,
    [WS, grnNum, poId||null, receivedBy||null, departmentId||null, supplierName||null, invoiceNumber||null, status, notes||null]
  );
  const grnId = r.rows[0].id;

  for (const item of items) {
    await pool.query(
      `INSERT INTO hospital_grn_items (id,grn_id,item_id,item_name,uom,ordered_qty,received_qty,unit_cost,batch_number,lot_number,expiry_date,manufacture_date,notes,createdat)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`,
      [grnId, item.itemId, item.itemName||null, item.uom||null, item.orderedQty||0, item.receivedQty||0, item.unitCost||null, item.batchNumber||null, item.lotNumber||null, item.expiryDate||null, item.manufactureDate||null, item.notes||null]
    );

    // Update stock in main store
    if (item.receivedQty > 0) {
      await pool.query(
        `INSERT INTO hospital_stock (id,item_id,department_id,quantity,reserved_quantity,last_updated)
         VALUES (gen_random_uuid(),$1,$2,$3,0,NOW())
         ON CONFLICT (item_id,department_id) DO UPDATE SET quantity=hospital_stock.quantity+$3, last_updated=NOW()`,
        [item.itemId, departmentId, item.receivedQty]
      );
      // Add batch
      await pool.query(
        `INSERT INTO hospital_batches (id,item_id,department_id,batch_number,lot_number,quantity,unit_cost,expiry_date,manufacture_date,createdat)
         VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
        [item.itemId, departmentId||null, item.batchNumber||null, item.lotNumber||null, item.receivedQty, item.unitCost||null, item.expiryDate||null, item.manufactureDate||null]
      );
      // Log history
      await pool.query(
        `INSERT INTO hospital_history (id,workspace_id,item_id,item_name,department_id,action_type,quantity,reference_id,created_by,createdat)
         VALUES (gen_random_uuid(),$1,$2,$3,$4,'STOCK_IN',$5,$6,$7,NOW())`,
        [WS, item.itemId, item.itemName, departmentId||null, item.receivedQty, grnNum, receivedBy||null]
      );
    }
  }

  // Update PO status
  if (poId && allReceived) {
    await pool.query(`UPDATE hospital_po SET status='RECEIVED', updatedat=NOW() WHERE id=$1`, [poId]);
  }

  return NextResponse.json(r.rows[0]);
}
