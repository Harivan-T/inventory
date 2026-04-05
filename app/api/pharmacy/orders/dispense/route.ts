import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const TIBBNA = "postgresql://neondb_owner:npg_RBybikcu3tz5@ep-long-river-allaqs25.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const INVENTORY = process.env.NEON_DATABASE_URL!;

const tibbna = new Pool({ connectionString: TIBBNA, ssl: { rejectUnauthorized: false } });
const inventory = new Pool({ connectionString: INVENTORY, ssl: { rejectUnauthorized: false } });

const WORKSPACE_ID = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";
const PHARMACY_WH  = "22222222-0000-0000-0000-000000000002";

// POST - dispense one or all items from an order
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, items, dispensedBy, dispenseAll } = body;
  // items = [{ inventoryItemId, quantity, batchId? }]

  const errors: string[] = [];
  const dispensed: string[] = [];

  for (const item of items) {
    const { inventoryItemId, quantity, batchId, drugName } = item;
    if (!inventoryItemId || !quantity) continue;

    // Check stock
    const stockRes = await inventory.query(
      `SELECT COALESCE(SUM(quantity), 0)::int AS qty
       FROM inventory_stock
       WHERE item_id = $1 AND warehouse_id = $2`,
      [inventoryItemId, PHARMACY_WH]
    );
    const available = stockRes.rows[0]?.qty ?? 0;

    if (available < quantity) {
      errors.push(`${drugName ?? inventoryItemId}: insufficient stock (need ${quantity}, have ${available})`);
      continue;
    }

    // Deduct from inventory_stock
    await inventory.query(
      `UPDATE inventory_stock
       SET quantity = quantity - $1
       WHERE item_id = $2 AND warehouse_id = $3`,
      [quantity, inventoryItemId, PHARMACY_WH]
    );

    // Log stock transaction
    await inventory.query(
      `INSERT INTO stock_transactions
        (id, item_id, warehouse_id, batch_id, transaction_type, quantity, reference_type, reference_id, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, 'STOCK_OUT', $5, 'PRESCRIPTION', $6, $7, $8, NOW())`,
      [
        crypto.randomUUID(),
        inventoryItemId,
        PHARMACY_WH,
        batchId ?? null,
        quantity,
        orderId,
        `Dispensed for prescription order ${orderId}`,
        dispensedBy ?? "Pharmacy",
      ]
    );

    dispensed.push(drugName ?? inventoryItemId);
  }

  // If all items dispensed successfully, mark order as DISPENSED in Tibbna
  if (errors.length === 0 || dispenseAll) {
    await tibbna.query(
      `UPDATE pharmacy_orders
       SET status = 'DISPENSED', dispensedat = NOW(), updatedat = NOW()
       WHERE orderid = $1`,
      [orderId]
    );

    // Update each order item status
    for (const item of items) {
      if (!errors.find(e => e.startsWith(item.drugName))) {
        await tibbna.query(
          `UPDATE pharmacy_order_items SET status = 'dispensed' WHERE orderid = $1 AND drugname = $2`,
          [orderId, item.drugName]
        );
      }
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    dispensed,
    errors,
    message: errors.length === 0
      ? `Successfully dispensed ${dispensed.length} item(s)`
      : `Dispensed ${dispensed.length} item(s) with ${errors.length} error(s)`,
  });
}
