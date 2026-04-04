import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const page     = parseInt(req.nextUrl.searchParams.get("page")  ?? "1");
  const pageSize = parseInt(req.nextUrl.searchParams.get("limit") ?? "15");
  const offset   = (page - 1) * pageSize;

  // Get pharmacy warehouse IDs
  const whRes = await pool.query(
    `SELECT id FROM warehouses WHERE warehouse_type = 'pharmacy' AND is_active = true`
  );
  if (!whRes.rows.length) return NextResponse.json({ rows: [], total: 0 });

  const ids      = whRes.rows.map((r: any) => r.id);
  const whArray  = `{${ids.join(",")}}`;

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT
        st.id,
        st.transaction_type  AS "transactionType",
        st.quantity,
        st.reference_type    AS "referenceType",
        st.reference_id      AS "referenceId",
        st.patient_ref       AS "patientRef",
        st.notes,
        st.created_by        AS "createdBy",
        st.created_at        AS "createdAt",
        i.name               AS "itemName",
        i.itemcode,
        i.uom,
        w.name               AS "warehouseName",
        ib.batch_number      AS "batchNumber"
      FROM stock_transactions st
      LEFT JOIN items i         ON i.id = st.item_id
      LEFT JOIN warehouses w    ON w.id = st.warehouse_id
      LEFT JOIN item_batches ib ON ib.id = st.batch_id
      WHERE st.warehouse_id = ANY($1::uuid[])
      ORDER BY st.created_at DESC
      LIMIT $2 OFFSET $3`,
      [whArray, pageSize, offset]
    ),
    pool.query(
      `SELECT COUNT(*) FROM stock_transactions st
       WHERE st.warehouse_id = ANY($1::uuid[])`,
      [whArray]
    ),
  ]);

  return NextResponse.json({
    rows:  dataRes.rows,
    total: parseInt(countRes.rows[0].count),
    page,
    pageSize,
  });
}
