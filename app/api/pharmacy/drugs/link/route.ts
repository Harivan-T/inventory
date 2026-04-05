import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WORKSPACE_ID = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

// POST - link an existing drug to pharmacy inventory
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { drugId, itemcode, uom, min_level, reorder_level, max_level,
          controlled, warehouse_id, initial_quantity } = body;

  if (!drugId) return NextResponse.json({ error: "Drug ID required" }, { status: 400 });
  if (!itemcode?.trim()) return NextResponse.json({ error: "Item code required" }, { status: 400 });
  if (!warehouse_id) return NextResponse.json({ error: "Warehouse required" }, { status: 400 });

  // Get drug info
  const drugRes = await pool.query(`SELECT * FROM drugs WHERE drugid = $1`, [drugId]);
  if (!drugRes.rows.length) return NextResponse.json({ error: "Drug not found" }, { status: 404 });
  const drug = drugRes.rows[0];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create item linked to drug
    const itemRes = await client.query(
      `INSERT INTO items (id, workspace_id, itemcode, name, generic_name, itemtype, inventorycategory,
        uom, manufacturer, barcode, description, min_level, reorder_level, max_level, controlled,
        drug_id, price_type, insurance_coverage_pct, selling_price, unit_cost,
        batch_tracking, expiry_tracking, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'drug', 'pharmacy', $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, true, true, true, NOW(), NOW())
       RETURNING id`,
      [WORKSPACE_ID, itemcode, drug.name, drug.genericname ?? null,
       uom ?? drug.unit ?? "tablet", drug.manufacturer ?? null,
       drug.barcode ?? null, drug.description ?? null,
       min_level ?? 0, reorder_level ?? 0, max_level ?? null, controlled ?? false,
       drugId, drug.price_type ?? "fixed",
       drug.insurance_coverage_pct ?? 0, drug.selling_price ?? null, drug.unit_cost ?? null]
    );
    const itemId = itemRes.rows[0].id;

    // Create inventory stock entry
    await client.query(
      `INSERT INTO inventory_stock (id, item_id, warehouse_id, quantity, reserved_quantity, last_updated)
       VALUES (gen_random_uuid(), $1, $2, $3, 0, NOW())
       ON CONFLICT (item_id, warehouse_id) DO UPDATE SET quantity = inventory_stock.quantity + $3, last_updated = NOW()`,
      [itemId, warehouse_id, initial_quantity ?? 0]
    );

    await client.query("COMMIT");
    return NextResponse.json({ success: true, itemId });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
