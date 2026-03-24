import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { radiologyProcedures, items, stores, storeStock } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const storeid = req.nextUrl.searchParams.get("storeid");
    const where   = storeid ? eq(radiologyProcedures.storeid, storeid) : undefined;

    const rows = await db
      .select({
        id:             radiologyProcedures.id,
        procedure_name: radiologyProcedures.procedurename,
        procedure_type: radiologyProcedures.proceduretype,
        patient_ref:    radiologyProcedures.patientref,
        quantity_used:  radiologyProcedures.quantityused,
        performed_by:   radiologyProcedures.performedby,
        notes:          radiologyProcedures.notes,
        created_at:     radiologyProcedures.createdat,
        itemname:       items.name,
        uom:            items.uom,
        storename:      stores.name,
      })
      .from(radiologyProcedures)
      .leftJoin(items,  eq(radiologyProcedures.itemid,  items.id))
      .leftJoin(stores, eq(radiologyProcedures.storeid, stores.id))
      .where(where)
      .orderBy(desc(radiologyProcedures.createdat))
      .limit(200);

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeid, itemid, procedure_name, procedure_type, patient_ref, quantity_used, performed_by, notes } = body;

    if (!storeid || !itemid || !procedure_name || !quantity_used) {
      return NextResponse.json({ error: "storeid, itemid, procedure_name and quantity_used required" }, { status: 400 });
    }

    // Deduct from store stock
    const [stock] = await db
      .select()
      .from(storeStock)
      .where(and(eq(storeStock.storeid, storeid), eq(storeStock.itemid, itemid)))
      .limit(1);

    if (stock) {
      const available = stock.quantity - stock.reservedquantity;
      const qty = Math.ceil(parseFloat(quantity_used));
      if (available >= qty) {
        await db.update(storeStock)
          .set({ quantity: sql`${storeStock.quantity} - ${qty}`, lastupdated: new Date() })
          .where(eq(storeStock.id, stock.id));
      }
    }

    const [entry] = await db.insert(radiologyProcedures).values({
      storeid,
      itemid,
      procedurename: procedure_name,
      proceduretype: procedure_type || null,
      patientref:    patient_ref || null,
      quantityused:  String(quantity_used),
      performedby:   performed_by || null,
      notes:         notes || null,
    }).returning();

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
