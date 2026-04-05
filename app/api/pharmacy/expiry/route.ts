import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "90");

  const whRes = await pool.query(`SELECT id FROM warehouses WHERE warehouse_type = 'pharmacy' AND is_active = true`);
  if (!whRes.rows.length) return NextResponse.json([]);
  const whArray = `{${whRes.rows.map((r: any) => r.id).join(",")}}`;

  const result = await pool.query(
    `SELECT
      ib.id                AS "batchId",
      ib.batch_number      AS "batchNumber",
      ib.quantity,
      ib.expiry_date       AS "expiryDate",
      ib.unit_cost         AS "unitCost",
      i.id                 AS "itemId",
      i.name               AS "itemName",
      i.itemcode,
      i.uom,
      i.controlled,
      w.name               AS "warehouseName",
      CASE
        WHEN ib.expiry_date < NOW() THEN 'expired'
        WHEN ib.expiry_date < NOW() + INTERVAL '30 days' THEN 'critical'
        WHEN ib.expiry_date < NOW() + INTERVAL '90 days' THEN 'warning'
        ELSE 'ok'
      END AS status,
      EXTRACT(DAY FROM ib.expiry_date - NOW())::int AS "daysLeft"
    FROM item_batches ib
    JOIN items i      ON i.id  = ib.item_id
    JOIN warehouses w ON w.id  = ib.warehouse_id
    WHERE ib.warehouse_id = ANY($1::uuid[])
      AND ib.quantity > 0
      AND ib.expiry_date IS NOT NULL
      AND ib.expiry_date <= NOW() + ($2 || ' days')::INTERVAL
      AND i.is_active = true
    ORDER BY ib.expiry_date ASC`,
    [whArray, days]
  );

  return NextResponse.json(result.rows);
}
