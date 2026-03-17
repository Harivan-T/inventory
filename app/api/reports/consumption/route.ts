import { NextRequest, NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { storeTransactions, items, stores } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc, isNotNull } from "drizzle-orm";

// GET /api/reports/consumption
// Query params: patientref, storeid, itemid, from, to, type (DISPENSE|LAB_CONSUMPTION|all)
export async function GET(req: NextRequest) {
  try {
    const p       = req.nextUrl.searchParams;
    const patient = p.get("patientref");
    const storeid = p.get("storeid");
    const itemid  = p.get("itemid");
    const from    = p.get("from");
    const to      = p.get("to");
    const type    = p.get("type") ?? "all";

    const conditions: any[] = [];

    if (patient)  conditions.push(eq(storeTransactions.patientref, patient));
    if (storeid)  conditions.push(eq(storeTransactions.storeid, storeid));
    if (itemid)   conditions.push(eq(storeTransactions.itemid, itemid));
    if (from)     conditions.push(gte(storeTransactions.createdat, new Date(from)));
    if (to)       conditions.push(lte(storeTransactions.createdat, new Date(to)));

    if (type === "DISPENSE")        conditions.push(eq(storeTransactions.transactiontype, "DISPENSE"));
    else if (type === "LAB_CONSUMPTION") conditions.push(eq(storeTransactions.transactiontype, "LAB_CONSUMPTION"));
    else {
      // All patient-linked or lab consumption
      conditions.push(
        sql`(${storeTransactions.transactiontype} IN ('DISPENSE','LAB_CONSUMPTION') OR ${storeTransactions.patientref} IS NOT NULL)`
      );
    }

    const rows = await db
      .select({
        id:              storeTransactions.id,
        transactiontype: storeTransactions.transactiontype,
        quantity:        storeTransactions.quantity,
        patientref:      storeTransactions.patientref,
        prescriptionref: storeTransactions.prescriptionref,
        notes:           storeTransactions.notes,
        createdby:       storeTransactions.createdby,
        createdat:       storeTransactions.createdat,
        itemname:        items.name,
        itemcode:        items.itemcode,
        uom:             items.uom,
        storename:       stores.name,
      })
      .from(storeTransactions)
      .leftJoin(items,  eq(storeTransactions.itemid,  items.id))
      .leftJoin(stores, eq(storeTransactions.storeid, stores.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(storeTransactions.createdat))
      .limit(500);

    // Aggregate by patient
    const byPatient: Record<string, { patientref: string; totalItems: number; transactions: any[] }> = {};
    for (const row of rows) {
      const key = row.patientref ?? "(no patient)";
      if (!byPatient[key]) byPatient[key] = { patientref: key, totalItems: 0, transactions: [] };
      byPatient[key].transactions.push(row);
      byPatient[key].totalItems += Math.abs(row.quantity ?? 0);
    }

    return NextResponse.json({
      rows,
      byPatient: Object.values(byPatient).sort((a, b) => b.totalItems - a.totalItems),
      total: rows.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
