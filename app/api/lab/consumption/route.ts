import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  labConsumptionLog, reagentAssignments,
  storeStock, storeTransactions,
  items, stores,
} from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const storeid = req.nextUrl.searchParams.get("storeid");
    const limit   = parseInt(req.nextUrl.searchParams.get("limit") ?? "100");
    const where   = storeid ? eq(labConsumptionLog.storeid, storeid) : undefined;

    const rows = await db
      .select({
        id:               labConsumptionLog.id,
        testcount:        labConsumptionLog.testcount,
        quantityconsumed: labConsumptionLog.quantityconsumed,
        patientref:       labConsumptionLog.patientref,
        sampleref:        labConsumptionLog.sampleref,
        runnotes:         labConsumptionLog.runnotes,
        createdby:        labConsumptionLog.createdby,
        createdat:        labConsumptionLog.createdat,
        itemname:         items.name,
        itemcode:         items.itemcode,
        uom:              items.uom,
        storename:        stores.name,
        analyzername:     reagentAssignments.analyzername,
        testtype:         reagentAssignments.testtype,
      })
      .from(labConsumptionLog)
      .leftJoin(items,              eq(labConsumptionLog.itemid,       items.id))
      .leftJoin(stores,             eq(labConsumptionLog.storeid,      stores.id))
      .leftJoin(reagentAssignments, eq(labConsumptionLog.assignmentid, reagentAssignments.id))
      .where(where)
      .orderBy(desc(labConsumptionLog.createdat))
      .limit(limit);

    return NextResponse.json({ logs: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      storeid, itemid, assignmentid,
      testcount = 1, batchid,
      patientref, sampleref, runnotes, createdby,
    } = body;

    if (!storeid || !itemid || !assignmentid) {
      return NextResponse.json({ error: "storeid, itemid and assignmentid required" }, { status: 400 });
    }

    const [assignment] = await db
      .select()
      .from(reagentAssignments)
      .where(eq(reagentAssignments.id, assignmentid))
      .limit(1);

    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    const consumptionPerTest = parseFloat(assignment.consumptionpertest ?? "0");
    if (consumptionPerTest <= 0) {
      return NextResponse.json({ error: "Assignment has no consumption_per_test set" }, { status: 400 });
    }

    const totalConsumed = consumptionPerTest * testcount;
    const consumedInt   = Math.ceil(totalConsumed);

    const stockWhere = batchid
      ? and(eq(storeStock.storeid, storeid), eq(storeStock.itemid, itemid), eq(storeStock.batchid, batchid))
      : and(eq(storeStock.storeid, storeid), eq(storeStock.itemid, itemid));

    const [stock] = await db.select().from(storeStock).where(stockWhere).limit(1);
    if (!stock) return NextResponse.json({ error: "No stock record for this item in this store" }, { status: 400 });

    const available = stock.quantity - stock.reservedquantity;
    if (available < consumedInt) {
      return NextResponse.json({ error: `Insufficient stock. Available: ${available}, Required: ${consumedInt}` }, { status: 400 });
    }

    await db.update(storeStock)
      .set({ quantity: sql`${storeStock.quantity} - ${consumedInt}`, lastupdated: new Date() })
      .where(eq(storeStock.id, stock.id));

    await db.insert(storeTransactions).values({
      storeid, itemid,
      batchid:         batchid || null,
      transactiontype: "LAB_CONSUMPTION",
      quantity:        -consumedInt,
      referencetype:   "lab_run",
      notes:           runnotes || `${assignment.testtype ?? "test"} x ${testcount}`,
      createdby:       createdby || null,
    });

    const [entry] = await db.insert(labConsumptionLog).values({
      assignmentid, itemid, storeid,
      batchid:          batchid || null,
      testcount,
      quantityconsumed: String(totalConsumed),
      patientref:       patientref || null,
      sampleref:        sampleref  || null,
      runnotes:         runnotes   || null,
      createdby:        createdby  || null,
    }).returning();

    return NextResponse.json({ success: true, entry, newQty: stock.quantity - consumedInt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
