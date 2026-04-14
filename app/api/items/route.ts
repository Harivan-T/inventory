import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "";
  const search   = req.nextUrl.searchParams.get("search") ?? "";
  const r = await pool.query(
    `SELECT * FROM items
     WHERE is_active = true
       AND ($1 = '' OR inventorycategory::text = $1::text)
       AND ($2 = '' OR name ILIKE $2 OR itemcode ILIKE $2)
     ORDER BY name`,
    [category, `%${search}%`]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, genericname, itemcode, itemtype, inventorycategory,
    uom, manufacturer, description, barcode, drug_id,
    min_level, reorder_level, max_level, controlled, hazardous,
    single_use, sterile, batch_tracking, expiry_tracking,
    price_type, insurance_coverage_pct, selling_price, unit_cost,
    warehouseid, critical_reagent, analyzer_compat,
  } = body;

  if (!name?.trim() || !itemcode?.trim())
    return NextResponse.json({ error: "Name and item code required" }, { status: 400 });

  const WORKSPACE_ID = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

  const r = await pool.query(
    `INSERT INTO items (
      id, workspace_id, name, generic_name, itemcode, itemtype,
      inventorycategory, uom, manufacturer, description, barcode, drug_id,
      min_level, reorder_level, max_level, controlled, hazardous,
      single_use, sterile, batch_tracking, expiry_tracking,
      price_type, insurance_coverage_pct, selling_price, unit_cost,
      critical_reagent, analyzer_compat, is_active, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16,
      $17, $18, $19, $20,
      $21, $22, $23, $24,
      $25, $26, true, NOW(), NOW()
    ) RETURNING *`,
    [
      WORKSPACE_ID, name, genericname??null, itemcode, itemtype??'supply',
      inventorycategory??'hospital', uom??'piece', manufacturer??null,
      description??null, barcode??null, drug_id??null,
      parseInt(min_level)||0, parseInt(reorder_level)||0, max_level?parseInt(max_level):null,
      controlled??false, hazardous??false,
      single_use??false, sterile??false, batch_tracking??true, expiry_tracking??true,
      price_type??'fixed', parseFloat(insurance_coverage_pct)||0,
      selling_price?parseFloat(selling_price):null,
      unit_cost?parseFloat(unit_cost):null,
      critical_reagent??false, analyzer_compat??null,
    ]
  );

  // Create inventory stock record if warehouse provided
  if (warehouseid && r.rows[0]) {
    await pool.query(
      `INSERT INTO inventory_stock (id, item_id, warehouse_id, quantity, reserved_quantity, last_updated)
       VALUES (gen_random_uuid(), $1, $2, 0, 0, NOW())
       ON CONFLICT DO NOTHING`,
      [r.rows[0].id, warehouseid]
    );
  }

  return NextResponse.json(r.rows[0]);
}