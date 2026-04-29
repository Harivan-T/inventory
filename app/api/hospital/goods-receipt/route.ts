import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "";
  try {
    const r = await pool.query(
      `SELECT gr.*,
        (SELECT COUNT(*) FROM hospital_goods_receipt_items gri WHERE gri.receipt_id=gr.id)::int AS item_count
       FROM hospital_goods_receipt gr
       WHERE gr.workspace_id=$1 AND ($2='' OR gr.status=$2)
       ORDER BY gr.createdat DESC`,
      [WS, status]
    );
    return NextResponse.json(r.rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const { orderId, orderNumber, purchaseNoteId, receivedBy, receiptDate,
            supplierName, supplierEmail, notes, items } = b;

    if (!receivedBy?.trim()) return NextResponse.json({ error: "Received by is required" }, { status: 400 });
    if (!items?.length)      return NextResponse.json({ error: "No items" }, { status: 400 });

    // Auto-find Main Store department
    const deptResult = await pool.query(
      `SELECT id FROM hospital_departments
       WHERE workspace_id=$1 AND (LOWER(name) LIKE '%main%store%' OR LOWER(name) LIKE '%main store%' OR type='general')
       ORDER BY CASE WHEN LOWER(name) LIKE '%main%store%' THEN 0 ELSE 1 END
       LIMIT 1`,
      [WS]
    );
    const mainStoreId = deptResult.rows[0]?.id || null;

    // Determine status
    const allComplete = items.every((i: any) => parseInt(i.receivedQty) >= parseInt(i.orderedQty));
    const anyReceived = items.some((i: any)  => parseInt(i.receivedQty) > 0);
    const status      = allComplete ? "COMPLETE" : anyReceived ? "PARTIAL" : "PENDING";

    const rNum = `GR-${Date.now().toString().slice(-8)}`;
    const r = await pool.query(
      `INSERT INTO hospital_goods_receipt
         (id,workspace_id,receipt_number,order_id,order_number,received_by,
          receipt_date,supplier_name,supplier_email,status,notes,createdat,updatedat)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
       RETURNING *`,
      [WS, rNum, orderId||null, orderNumber||null, receivedBy,
       receiptDate||null, supplierName||null, supplierEmail||null, status, notes||null]
    );

    const receiptId = r.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO hospital_goods_receipt_items
           (id,receipt_id,item_id,item_name,uom,ordered_qty,received_qty,unit_cost,
            batch_number,lot_number,expiry_date,manufacture_date,notes,createdat)
         VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`,
        [receiptId, item.itemId||null, item.itemName||null, item.uom||null,
         item.orderedQty||0, item.receivedQty||0, item.unitCost||null,
         item.batchNumber||null, item.lotNumber||null,
         item.expiryDate||null, item.manufactureDate||null, item.notes||null]
      );

      // Update stock in Main Store
      if (parseInt(item.receivedQty) > 0 && item.itemId && mainStoreId) {
        await pool.query(
          `INSERT INTO hospital_stock (id,item_id,department_id,quantity,reserved_quantity,last_updated)
           VALUES (gen_random_uuid(),$1,$2,$3,0,NOW())
           ON CONFLICT (item_id,department_id)
           DO UPDATE SET quantity=hospital_stock.quantity+$3, last_updated=NOW()`,
          [item.itemId, mainStoreId, parseInt(item.receivedQty)]
        );
        await pool.query(
          `INSERT INTO hospital_batches
             (id,item_id,department_id,batch_number,lot_number,quantity,unit_cost,expiry_date,manufacture_date,createdat)
           VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
          [item.itemId, mainStoreId, item.batchNumber||null, item.lotNumber||null,
           parseInt(item.receivedQty), item.unitCost||null, item.expiryDate||null, item.manufactureDate||null]
        );
        await pool.query(
          `INSERT INTO hospital_history
             (id,workspace_id,item_id,item_name,department_id,action_type,quantity,reference_id,created_by,createdat)
           VALUES (gen_random_uuid(),$1,$2,$3,$4,'STOCK_IN',$5,$6,$7,NOW())`,
          [WS, item.itemId, item.itemName, mainStoreId, parseInt(item.receivedQty), rNum, receivedBy]
        );
      }
    }

    // Update order status
    if (orderId) {
      await pool.query(
        `UPDATE hospital_orders SET status=$1, updatedat=NOW() WHERE id=$2`,
        [status==="COMPLETE"?"DELIVERED":status==="PARTIAL"?"PARTIALLY_DELIVERED":"PENDING", orderId]
      );
    }

    // Mark purchase note as processed
    if (purchaseNoteId) {
      await pool.query(
        `UPDATE hospital_purchase_notes SET status='PROCESSED', updatedat=NOW() WHERE id=$1`,
        [purchaseNoteId]
      );
    }

    return NextResponse.json({ ...r.rows[0], status });
  } catch (e: any) {
    console.error("POST /api/hospital/goods-receipt error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
