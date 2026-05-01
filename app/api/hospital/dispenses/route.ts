import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.TIBBNA_API_URL, ssl: { rejectUnauthorized: false } });
const WS = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: NextRequest) {
  const deptId = req.nextUrl.searchParams.get("department_id") ?? "";
  const r = await pool.query(
    `SELECT d.*, i.name AS item_name, i.uom, dep.name AS department_name
     FROM hospital_dispenses d
     LEFT JOIN hospital_items i ON i.id = d.item_id
     LEFT JOIN departments dep ON dep.departmentid = d.department_id
     WHERE d.workspace_id = $1
       AND ($2 = '' OR d.department_id::text = $2)
     ORDER BY d.createdat DESC LIMIT 200`,
    [WS, deptId]
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.itemId || !b.departmentId || !b.quantity) return NextResponse.json({ error: "Item, department and quantity required" }, { status: 400 });

  // Check stock
  const stock = await pool.query(
    `SELECT quantity FROM hospital_stock WHERE item_id = $1 AND department_id = $2`,
    [b.itemId, b.departmentId]
  );
  const available = stock.rows[0]?.quantity ?? 0;
  if (available < parseInt(b.quantity)) return NextResponse.json({ error: `Insufficient stock. Available: ${available}` }, { status: 400 });

  // Reduce stock
  await pool.query(
    `UPDATE hospital_stock SET quantity = quantity - $1, last_updated = NOW() WHERE item_id = $2 AND department_id = $3`,
    [parseInt(b.quantity), b.itemId, b.departmentId]
  );

  // Save dispense
  const r = await pool.query(
    `INSERT INTO hospital_dispenses (id,workspace_id,item_id,department_id,quantity,dispensed_by,patient_name,patient_ref,
      bed_number,ward_number,doctor_name,procedure_type,surgeon_name,anaesthetist,case_number,notes,createdat)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()) RETURNING *`,
    [WS, b.itemId, b.departmentId, parseInt(b.quantity), b.dispensedBy||null, b.patientName||null,
     b.patientRef||null, b.bedNumber||null, b.wardNumber||null, b.doctorName||null,
     b.procedureType||null, b.surgeonName||null, b.anaesthetist||null, b.caseNumber||null, b.notes||null]
  );

  // If radiology procedure — save extra details
  if (b.procedureType && b.contrastItemId) {
    await pool.query(
      `INSERT INTO hospital_radiology_procedures (id,workspace_id,dispense_id,department_id,procedure_type,patient_ref,
        contrast_item_id,contrast_lot,contrast_concentration,contrast_volume,film_used,chemicals_used,accessories,notes,createdat)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`,
      [WS, r.rows[0].id, b.departmentId, b.procedureType, b.patientRef||null,
       b.contrastItemId||null, b.contrastLot||null, b.contrastConcentration||null,
       b.contrastVolume||null, b.filmUsed||null, b.chemicalsUsed||null, b.accessories||null, b.notes||null]
    );
  }

  // Log history
  const item = await pool.query(`SELECT name FROM hospital_items WHERE id = $1`, [b.itemId]);
  await pool.query(
    `INSERT INTO hospital_history (id,workspace_id,item_id,item_name,department_id,action_type,quantity,created_by,createdat)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,'DISPENSE',$5,$6,NOW())`,
    [WS, b.itemId, item.rows[0]?.name, b.departmentId, parseInt(b.quantity), b.dispensedBy||null]
  );

  return NextResponse.json(r.rows[0]);
}
