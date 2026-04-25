import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "";
  const r = await pool.query(
    `SELECT p.*, d.name AS department_name,
      (SELECT COUNT(*) FROM hospital_pr_items pi WHERE pi.pr_id = p.id)::int AS item_count
     FROM hospital_pr p
     LEFT JOIN hospital_departments d ON d.id = p.department_id
     WHERE p.workspace_id=$1 AND ($2='' OR p.status=$2)
     ORDER BY p.createdat DESC`,
    [WS, status]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const { departmentId, requestedBy, priority, notes, items, supplierName, prDate } = b;

  if (!requestedBy?.trim()) return NextResponse.json({ error: "Requested by is required" }, { status: 400 });
  if (!items?.length)        return NextResponse.json({ error: "Add at least one item" },    { status: 400 });

  const prNum = `PR-${Date.now().toString().slice(-8)}`;

  const r = await pool.query(
    `INSERT INTO hospital_pr
       (id, workspace_id, pr_number, department_id, requested_by, status, priority, notes, createdat, updatedat)
     VALUES
       (gen_random_uuid(), $1, $2, $3, $4, 'DRAFT', $5, $6, $7, NOW())
     RETURNING *`,
    [
      WS,
      prNum,
      departmentId || null,
      requestedBy,
      priority || "NORMAL",
      [supplierName ? `Supplier: ${supplierName}` : null, notes].filter(Boolean).join(" | ") || null,
      prDate ? new Date(prDate) : new Date(),
    ]
  );

  const prId = r.rows[0].id;

  for (const item of items) {
    await pool.query(
      `INSERT INTO hospital_pr_items (id, pr_id, item_id, item_name, uom, quantity, unit_cost, createdat)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
      [prId, item.itemId, item.itemName || null, item.uom || null, item.quantity || 1, item.unitCost || null]
    );
  }

  return NextResponse.json(r.rows[0]);
}
