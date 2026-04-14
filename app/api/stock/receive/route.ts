import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function POST(req: NextRequest) {
  const { itemId, warehouseId, batchNumber, quantity, unitCost, sellingPrice, expiryDate, manufactureDate, notes } = await req.json();
  if (!itemId || !warehouseId || !quantity) return NextResponse.json({ error: "Item, warehouse and quantity required" }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create batch record
    const batchRes = await client.query(
      `INSERT INTO item_batches (id, item_id, warehouse_id, batch_number, quantity, unit_cost, selling_price, expiry_date, manufacture_date, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id`,
      [itemId, warehouseId, batchNumber||null, parseInt(quantity), unitCost||null, sellingPrice||null, expiryDate||null, manufactureDate||null]
    );
    const batchId = batchRes.rows[0].id;

    // Update or insert inventory_stock
    await client.query(
      `INSERT INTO inventory_stock (id, item_id, warehouse_id, batch_id, quantity, reserved_quantity, last_updated)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 0, NOW())
       ON CONFLICT (item_id, warehouse_id) DO UPDATE
       SET quantity = inventory_stock.quantity + $4, last_updated = NOW()`,
      [itemId, warehouseId, batchId, parseInt(quantity)]
    );

    // Log transaction
    await client.query(
      `INSERT INTO stock_transactions (id, item_id, warehouse_id, batch_id, transaction_type, quantity, reference_type, notes, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'STOCK_IN', $4, 'RECEIVE', $5, NOW())`,
      [itemId, warehouseId, batchId, parseInt(quantity), notes||null]
    );

    // Update item prices if provided
    if (unitCost || sellingPrice) {
      await client.query(
        `UPDATE items SET unit_cost = COALESCE($1, unit_cost), selling_price = COALESCE($2, selling_price), updated_at = NOW() WHERE id = $3`,
        [unitCost||null, sellingPrice||null, itemId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, batchId });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
