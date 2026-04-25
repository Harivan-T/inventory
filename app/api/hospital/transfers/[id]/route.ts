import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = await pool.query(`SELECT * FROM hospital_transfer_items WHERE transfer_id = $1`, [id]);
  return NextResponse.json(items.rows);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, receivedBy, sentBy, items } = await req.json();

  // Update transfer items quantities if provided
  if (items?.length) {
    for (const item of items) {
      await pool.query(
        `UPDATE hospital_transfer_items SET quantity=$1 WHERE id=$2`,
        [item.quantity, item.id]
      );
    }
  }

  // If fulfilling a request — move stock and confirm
  if (status === "RECEIVED") {
    const transfer = await pool.query(`SELECT * FROM hospital_transfers WHERE id=$1`, [id]);
    const t = transfer.rows[0];
    const tItems = await pool.query(`SELECT * FROM hospital_transfer_items WHERE transfer_id=$1`, [id]);
    for (const item of tItems.rows) {
      await pool.query(
        `INSERT INTO hospital_stock (id, item_id, department_id, quantity, reserved_quantity, last_updated)
         VALUES (gen_random_uuid(),$1,$2,$3,0,NOW())
         ON CONFLICT (item_id, department_id)
         DO UPDATE SET quantity=hospital_stock.quantity+$3, last_updated=NOW()`,
        [item.item_id, t.to_department_id, item.quantity]
      );
      await pool.query(
        `INSERT INTO hospital_history (id,workspace_id,item_id,item_name,department_id,action_type,quantity,reference_id,created_by,createdat)
         VALUES (gen_random_uuid(),$1,$2,$3,$4,'TRANSFER',$5,$6,$7,NOW())`,
        [WS, item.item_id, item.item_name, t.to_department_id, item.quantity, t.transfer_number, receivedBy||null]
      );
    }
  }

  await pool.query(
    `UPDATE hospital_transfers SET
       status = COALESCE($1, status),
       received_by = COALESCE($2, received_by),
       sent_by = COALESCE($3, sent_by),
       updatedat = NOW()
     WHERE id=$4`,
    [status||null, receivedBy||null, sentBy||null, id]
  );

  return NextResponse.json({ success: true });
}
