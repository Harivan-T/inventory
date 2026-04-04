import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const {
    name, genericname, itemcode, itemtype, inventorycategory,
    uom, manufacturer, description, barcode,
    min_level, reorder_level, max_level, controlled,
  } = body;

  const result = await pool.query(
    `UPDATE items SET
      name               = COALESCE($1,  name),
      generic_name       = COALESCE($2,  generic_name),
      itemcode           = COALESCE($3,  itemcode),
      itemtype           = COALESCE($4,  itemtype),
      inventorycategory  = COALESCE($5,  inventorycategory),
      uom                = COALESCE($6,  uom),
      manufacturer       = COALESCE($7,  manufacturer),
      description        = COALESCE($8,  description),
      barcode            = COALESCE($9,  barcode),
      min_level          = COALESCE($10, min_level),
      reorder_level      = COALESCE($11, reorder_level),
      max_level          = COALESCE($12, max_level),
      controlled         = COALESCE($13, controlled),
      updated_at         = NOW()
    WHERE id = $14
    RETURNING *`,
    [
      name, genericname, itemcode, itemtype, inventorycategory,
      uom, manufacturer, description, barcode,
      min_level, reorder_level, max_level, controlled, id,
    ]
  );

  if (!result.rows.length)
    return NextResponse.json({ error: "Item not found" }, { status: 404 });

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query(
    `UPDATE items SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]
  );
  return NextResponse.json({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await pool.query(`SELECT * FROM items WHERE id = $1`, [id]);
  if (!result.rows.length)
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}