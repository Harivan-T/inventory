import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const TIBBNA = "postgresql://neondb_owner:npg_RBybikcu3tz5@ep-long-river-allaqs25.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const INVENTORY = process.env.NEON_DATABASE_URL!;

const tibbna = new Pool({ connectionString: TIBBNA, ssl: { rejectUnauthorized: false } });
const inventory = new Pool({ connectionString: INVENTORY, ssl: { rejectUnauthorized: false } });

const WORKSPACE_ID = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

// GET - search orders by patient name/id or order status
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const status = req.nextUrl.searchParams.get("status") ?? "PENDING";

  let query = `
    SELECT
      o.orderid         AS "orderId",
      o.status,
      o.priority,
      o.source,
      o.notes,
      o.createdat       AS "createdAt",
      o.dispensedat     AS "dispensedAt",
      o.metadata,
      p.patientid       AS "patientId",
      p.firstname       AS "firstName",
      p.lastname        AS "lastName",
      p.nationalid      AS "nationalId",
      p.dateofbirth     AS "dateOfBirth",
      p.phone,
      p.gender
    FROM pharmacy_orders o
    LEFT JOIN patients p ON p.patientid = o.patientid
    WHERE o.workspaceid = $1
  `;

  const params: any[] = [WORKSPACE_ID];

  if (status && status !== "ALL") {
    params.push(status);
    query += ` AND o.status = $${params.length}`;
  }

  if (search.trim()) {
    params.push(`%${search}%`);
    query += ` AND (
      p.firstname ILIKE $${params.length}
      OR p.lastname ILIKE $${params.length}
      OR p.nationalid ILIKE $${params.length}
      OR CONCAT(p.firstname, ' ', p.lastname) ILIKE $${params.length}
      OR o.orderid::text ILIKE $${params.length}
    )`;
  }

  query += ` ORDER BY o.createdat DESC LIMIT 50`;

  const result = await tibbna.query(query, params);
  return NextResponse.json(result.rows);
}

// GET order items for a specific order
export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  // Get order items from Tibbna
  const itemsRes = await tibbna.query(
    `SELECT
      oi.itemid       AS "itemId",
      oi.drugid       AS "drugId",
      oi.drugname     AS "drugName",
      oi.dosage,
      oi.quantity,
      oi.unitprice    AS "unitPrice",
      oi.status,
      oi.notes,
      oi.createdat    AS "createdAt"
    FROM pharmacy_order_items oi
    WHERE oi.orderid = $1
    ORDER BY oi.createdat`,
    [orderId]
  );

  const orderItems = itemsRes.rows;

  // Try to match each drug to inventory items
  for (const item of orderItems) {
    if (item.drugName) {
      const invRes = await inventory.query(
        `SELECT
          i.id, i.name, i.itemcode, i.uom,
          COALESCE(SUM(ist.quantity), 0)::int AS "stockQty",
          (SELECT ib2.unit_cost FROM item_batches ib2
            WHERE ib2.item_id = i.id AND ib2.unit_cost IS NOT NULL
            ORDER BY ib2.created_at DESC LIMIT 1) AS "unitCost"
        FROM items i
        LEFT JOIN inventory_stock ist ON ist.item_id = i.id
        WHERE i.is_active = true
          AND i.inventorycategory = 'pharmacy'
          AND i.name ILIKE $1
        GROUP BY i.id, i.name, i.itemcode, i.uom
        LIMIT 1`,
        [`%${item.drugName}%`]
      );
      if (invRes.rows.length) {
        item.inventoryItem = invRes.rows[0];
      }
    }
  }

  return NextResponse.json(orderItems);
}
