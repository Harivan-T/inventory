import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get items supplied via item_batches
  const result = await pool.query(
    `SELECT DISTINCT
      i.id,
      i.name,
      i.itemcode,
      i.generic_name   AS "genericName",
      i.itemtype       AS "itemType",
      i.uom,
      ib.unit_cost     AS "unitCost",
      ib.selling_price AS "sellingPrice",
      ib.batch_number  AS "lastBatch",
      ib.expiry_date   AS "lastExpiry",
      ib.created_at    AS "lastSupplied"
    FROM item_batches ib
    JOIN items i ON i.id = ib.item_id
    WHERE ib.supplier_id = $1
      AND i.is_active = true
    ORDER BY ib.created_at DESC`,
    [id]
  );

  return NextResponse.json(result.rows);
}

// Link an item to this supplier
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: supplierId } = await params;
  const { itemId, supplierCode, leadTimeDays, isPreferred } = await req.json();

  // Check if drug_suppliers link exists
  const existing = await pool.query(
    `SELECT id FROM drug_suppliers WHERE supplierid = $1 AND drugid = $2`,
    [supplierId, itemId]
  );

  if (existing.rows.length) {
    await pool.query(
      `UPDATE drug_suppliers SET
        suppliercode  = COALESCE($1, suppliercode),
        leadtimedays  = COALESCE($2, leadtimedays),
        ispreferred   = COALESCE($3, ispreferred)
       WHERE supplierid = $4 AND drugid = $5`,
      [supplierCode ?? null, leadTimeDays ?? null, isPreferred ?? false, supplierId, itemId]
    );
  } else {
    await pool.query(
      `INSERT INTO drug_suppliers (id, drugid, supplierid, suppliercode, leadtimedays, ispreferred, createdat)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [crypto.randomUUID(), itemId, supplierId, supplierCode ?? null, leadTimeDays ?? 7, isPreferred ?? false]
    );
  }

  return NextResponse.json({ success: true });
}
