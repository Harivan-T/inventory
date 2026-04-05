import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const whRes = await pool.query(`SELECT id FROM warehouses WHERE warehouse_type = 'pharmacy' AND is_active = true`);
  if (!whRes.rows.length) return NextResponse.json([]);
  const whArray = `{${whRes.rows.map((r: any) => r.id).join(",")}}`;

  const result = await pool.query(
    `SELECT
      bq.id,
      bq.reason,
      bq.notes,
      bq.quarantined_by  AS "quarantinedBy",
      bq.resolved_by     AS "resolvedBy",
      bq.resolved_at     AS "resolvedAt",
      bq.is_resolved     AS "isResolved",
      bq.created_at      AS "createdAt",
      ib.batch_number    AS "batchNumber",
      ib.quantity,
      ib.expiry_date     AS "expiryDate",
      i.name             AS "itemName",
      i.itemcode,
      i.uom,
      w.name             AS "warehouseName"
    FROM batch_quarantine bq
    JOIN item_batches ib ON ib.id = bq.batch_id
    JOIN items i         ON i.id  = bq.item_id
    JOIN warehouses w    ON w.id  = ib.warehouse_id
    WHERE ib.warehouse_id = ANY($1::uuid[])
    ORDER BY bq.created_at DESC`,
    [whArray]
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { batchId, itemId, reason, notes, quarantinedBy } = body;

  if (!batchId || !itemId || !reason)
    return NextResponse.json({ error: "Batch, item and reason are required" }, { status: 400 });

  // Check if already quarantined
  const existing = await pool.query(
    `SELECT id FROM batch_quarantine WHERE batch_id = $1 AND is_resolved = false`,
    [batchId]
  );
  if (existing.rows.length)
    return NextResponse.json({ error: "This batch is already quarantined" }, { status: 400 });

  await pool.query(
    `INSERT INTO batch_quarantine (id, batch_id, item_id, reason, notes, quarantined_by, is_resolved, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
    [crypto.randomUUID(), batchId, itemId, reason, notes ?? null, quarantinedBy ?? "Pharmacy"]
  );

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, resolvedBy, notes } = body;

  await pool.query(
    `UPDATE batch_quarantine SET is_resolved = true, resolved_by = $1, resolved_at = NOW(), notes = COALESCE($2, notes)
     WHERE id = $3`,
    [resolvedBy ?? "Pharmacy", notes ?? null, id]
  );

  return NextResponse.json({ success: true });
}
