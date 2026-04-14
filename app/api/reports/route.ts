import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  const tab      = req.nextUrl.searchParams.get("tab")      ?? "stock";
  const dateFrom = req.nextUrl.searchParams.get("dateFrom") ?? "";
  const dateTo   = req.nextUrl.searchParams.get("dateTo")   ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? "all";

  if (tab === "stock") {
    const r = await pool.query(
      `SELECT
        i.id, i.name, i.generic_name AS "genericName", i.itemcode, i.uom,
        i.inventorycategory AS category,
        i.reorder_level AS "reorderLevel",
        i.unit_cost AS "unitCost",
        COALESCE(SUM(ist.quantity),0)::int          AS "totalStock",
        COALESCE(SUM(ist.reserved_quantity),0)::int AS "reservedStock"
      FROM items i
      LEFT JOIN inventory_stock ist ON ist.item_id = i.id
      WHERE i.is_active = true
        ${category !== "all" ? `AND i.inventorycategory = '${category}'` : ""}
      GROUP BY i.id
      ORDER BY i.inventorycategory, i.name`
    );
    return NextResponse.json(r.rows);
  }

  if (tab === "consumption") {
    const r = await pool.query(
      `SELECT
        i.name AS "itemName", i.itemcode,
        st.transaction_type AS "transactionType",
        SUM(st.quantity)::int AS "totalQty",
        COUNT(*)::int AS "txCount",
        w.name AS "warehouseName",
        MAX(st.created_at) AS "lastActivity"
      FROM stock_transactions st
      JOIN items i ON i.id = st.item_id
      LEFT JOIN warehouses w ON w.id = st.warehouse_id
      WHERE st.transaction_type IN ('STOCK_OUT','DISPENSE','WASTAGE','ADJUSTMENT')
        AND st.created_at BETWEEN $1 AND $2
      GROUP BY i.name, i.itemcode, st.transaction_type, w.name
      ORDER BY "totalQty" DESC`,
      [dateFrom || "2000-01-01", dateTo || "2099-01-01"]
    );
    return NextResponse.json(r.rows);
  }

  if (tab === "expiry") {
    const r = await pool.query(
      `SELECT
        i.name AS "itemName", i.itemcode,
        ib.batch_number AS "batchNumber",
        ib.quantity, ib.expiry_date AS "expiryDate",
        w.name AS "warehouseName"
      FROM item_batches ib
      JOIN items i ON i.id = ib.item_id
      JOIN warehouses w ON w.id = ib.warehouse_id
      WHERE ib.quantity > 0
        AND ib.expiry_date IS NOT NULL
        AND ib.expiry_date <= $1
        AND i.is_active = true
      ORDER BY ib.expiry_date ASC`,
      [dateTo || new Date(Date.now() + 180*86400000).toISOString().slice(0,10)]
    );
    return NextResponse.json(r.rows);
  }

  if (tab === "pr") {
    const r = await pool.query(
      `SELECT
        pr.id, pr.prnumber, pr.requestedby, pr.status, pr.priority,
        pr.createdat, pr.updatedat,
        w.name AS "warehouseName",
        COUNT(pri.id)::int AS "itemCount"
      FROM purchase_requisitions pr
      LEFT JOIN warehouses w ON w.id = pr.warehouseid
      LEFT JOIN purchase_requisition_items pri ON pri.prid = pr.id
      WHERE pr.createdat BETWEEN $1 AND $2
      GROUP BY pr.id, w.name
      ORDER BY pr.createdat DESC`,
      [dateFrom || "2000-01-01", dateTo || "2099-01-01"]
    );
    return NextResponse.json(r.rows);
  }

  if (tab === "po") {
    const r = await pool.query(
      `SELECT
        po.id, po.ponumber, po.status, po.totalamount,
        po.orderdate, po.expecteddate,
        v.name AS "vendorName",
        w.name AS "warehouseName"
      FROM purchase_orders po
      LEFT JOIN vendors v ON v.vendorid = po.vendorid
      LEFT JOIN warehouses w ON w.id = po.warehouseid
      WHERE po.createdat BETWEEN $1 AND $2
      ORDER BY po.createdat DESC`,
      [dateFrom || "2000-01-01", dateTo || "2099-01-01"]
    );
    return NextResponse.json(r.rows);
  }

  if (tab === "grn") {
    const r = await pool.query(
      `SELECT
        g.id, g.grnnumber, g.status, g.receiptdate,
        g.invoicenumber, g.receivedby,
        v.name AS "vendorName",
        w.name AS "warehouseName"
      FROM goods_receipt_notes g
      LEFT JOIN vendors v ON v.vendorid = g.vendorid
      LEFT JOIN warehouses w ON w.id = g.warehouseid
      WHERE g.createdat BETWEEN $1 AND $2
      ORDER BY g.createdat DESC`,
      [dateFrom || "2000-01-01", dateTo || "2099-01-01"]
    );
    return NextResponse.json(r.rows);
  }

  return NextResponse.json([]);
}
