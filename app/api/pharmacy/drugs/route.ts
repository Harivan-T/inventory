import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WORKSPACE_ID = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

// POST - create a new drug + item + inventory_stock in one shot
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    // Drug fields
    name, genericname, atccode, form, strength, unit, barcode,
    manufacturer, description, indication, warning, notes,
    requiresprescription, insuranceapproved, storagetype,
    price_type, insurance_coverage_pct, selling_price, unit_cost,
    // Item fields
    itemcode, uom, min_level, reorder_level, max_level, controlled,
    // Stock fields
    warehouse_id, initial_quantity,
  } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Drug name is required" }, { status: 400 });
  if (!itemcode?.trim()) return NextResponse.json({ error: "Item code is required" }, { status: 400 });
  if (!warehouse_id) return NextResponse.json({ error: "Warehouse is required" }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert into drugs
    const drugRes = await client.query(
      `INSERT INTO drugs (drugid, workspaceid, name, genericname, atccode, form, strength, unit, barcode,
        manufacturer, description, indication, warning, notes, requiresprescription, insuranceapproved,
        storagetype, price_type, insurance_coverage_pct, selling_price, unit_cost, isactive, createdat, updatedat)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, true, NOW(), NOW())
       RETURNING drugid`,
      [WORKSPACE_ID, name, genericname ?? null, atccode ?? null, form ?? null, strength ?? null,
       unit ?? null, barcode ?? null, manufacturer ?? null, description ?? null, indication ?? null,
       warning ?? null, notes ?? null, requiresprescription ?? false, insuranceapproved ?? false,
       storagetype ?? null, price_type ?? "fixed", insurance_coverage_pct ?? 0,
       selling_price ?? null, unit_cost ?? null]
    );
    const drugId = drugRes.rows[0].drugid;

    // 2. Insert into items linked to drug
    const itemRes = await client.query(
      `INSERT INTO items (id, workspace_id, itemcode, name, generic_name, itemtype, inventorycategory,
        uom, manufacturer, barcode, description, min_level, reorder_level, max_level, controlled,
        drug_id, price_type, insurance_coverage_pct, selling_price, unit_cost,
        batch_tracking, expiry_tracking, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'drug', 'pharmacy', $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, true, true, true, NOW(), NOW())
       RETURNING id`,
      [WORKSPACE_ID, itemcode, name, genericname ?? null, uom ?? "tablet",
       manufacturer ?? null, barcode ?? null, description ?? null,
       min_level ?? 0, reorder_level ?? 0, max_level ?? null, controlled ?? false,
       drugId, price_type ?? "fixed", insurance_coverage_pct ?? 0,
       selling_price ?? null, unit_cost ?? null]
    );
    const itemId = itemRes.rows[0].id;

    // 3. Insert into inventory_stock
    await client.query(
      `INSERT INTO inventory_stock (id, item_id, warehouse_id, quantity, reserved_quantity, last_updated)
       VALUES (gen_random_uuid(), $1, $2, $3, 0, NOW())
       ON CONFLICT (item_id, warehouse_id) DO UPDATE SET quantity = inventory_stock.quantity + $3, last_updated = NOW()`,
      [itemId, warehouse_id, initial_quantity ?? 0]
    );

    await client.query("COMMIT");
    return NextResponse.json({ success: true, drugId, itemId });
  } catch (e: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// GET - search drugs in drugs table that are NOT yet in pharmacy items
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const mode   = req.nextUrl.searchParams.get("mode") ?? "unlinked"; // unlinked | all

  let query: string;
  let params: any[];

  if (mode === "unlinked") {
    // Drugs not yet linked to any pharmacy item
    query = `
      SELECT d.drugid, d.name, d.genericname, d.atccode, d.form, d.strength, d.unit,
             d.manufacturer, d.barcode, d.requiresprescription, d.insuranceapproved,
             d.price_type, d.insurance_coverage_pct, d.selling_price, d.unit_cost
      FROM drugs d
      WHERE d.isactive = true
        AND d.workspaceid = $1
        AND NOT EXISTS (
          SELECT 1 FROM items i WHERE i.drug_id = d.drugid AND i.inventorycategory = 'pharmacy' AND i.is_active = true
        )
        AND ($2 = '' OR d.name ILIKE $3 OR d.genericname ILIKE $3)
      ORDER BY d.name
      LIMIT 30`;
    params = [WORKSPACE_ID, search, `%${search}%`];
  } else {
    query = `
      SELECT d.drugid, d.name, d.genericname, d.atccode, d.form, d.strength, d.unit,
             d.manufacturer, d.barcode, d.requiresprescription, d.insuranceapproved,
             d.price_type, d.insurance_coverage_pct, d.selling_price, d.unit_cost
      FROM drugs d
      WHERE d.isactive = true AND d.workspaceid = $1
        AND ($2 = '' OR d.name ILIKE $3 OR d.genericname ILIKE $3)
      ORDER BY d.name LIMIT 30`;
    params = [WORKSPACE_ID, search, `%${search}%`];
  }

  const r = await pool.query(query, params);
  return NextResponse.json(r.rows);
}
