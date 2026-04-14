import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const r = await pool.query(
    `SELECT
      i.id, i.name, i.generic_name AS "genericName", i.itemcode,
      i.itemtype AS "itemType", i.uom, i.manufacturer,
      i.reorder_level AS "reorderLevel", i.min_level AS "minLevel",
      i.max_level AS "maxLevel", i.single_use, i.sterile, i.hazardous,
      i.unit_cost AS "unitCost", i.description, i.is_active AS "isActive",
      COALESCE(SUM(ist.quantity),0)::int          AS "totalStock",
      COALESCE(SUM(ist.reserved_quantity),0)::int AS "reservedStock"
    FROM items i
    LEFT JOIN inventory_stock ist ON ist.item_id = i.id
    WHERE i.inventorycategory = 'hospital'
      AND i.is_active = true
      AND ($1 = '' OR i.name ILIKE $1 OR i.itemcode ILIKE $1)
    GROUP BY i.id ORDER BY i.name`,
    [`%${search}%`]
  );
  return NextResponse.json(r.rows);
}
