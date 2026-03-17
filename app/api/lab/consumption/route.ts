import { NextRequest, NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import {
  labConsumptionLog, reagentAssignments,
  storeStock, storeTransactions,
  items, stores,
} from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

// GET /api/lab/consumption?storeid=xxx&limit=100
export async function GET(req: NextRequest) {
  try {
    const storeid = req.nextUrl.searchParams.get("storeid");
    const limit   = parseInt(req.nextUrl.searchParams.get("limit") ?? "100");

    const where = storeid ? eq(labConsumptionLog.storeid, storeid) : undefined;

    const rows = await db
      .select({
        id:           labConsumptionLog.id,
        testtype:     labConsumptionLog.testtype,
        testcount:    labConsumptionLog.testcount,
        consumed:     labConsumptionLog.consumed,
        runby:        labConsumptionLog.runby,
        notes:        labConsumptionLog.notes,
        createdat:    labConsumptionLog.createdat,
        itemname:     items.name,
        itemcode:     items.itemcode,
        uom:          items.uom,
        storename:    stores.name,
        analyzername: reagentAssignments.analyzername,
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

// POST /api/lab/consumption
// Body: { storeid, itemid, assignmentid?, testtype, testcount, batchid?, runby, notes? }
// Auto-calculates consumed qty from assignment.consumptionpertest * testcount
// Deducts from store_stock and logs store_transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeid, itemid, assignmentid, testtype, testcount = 1, batchid, runby, notes } = body;

    if (!storeid || !itemid) {
      return NextResponse.json({ error: "storeid and itemid required" }, { status: 400 });
    }
    if (testcount <= 0) {
      return NextResponse.json({ error: "testcount must be > 0" }, { status: 400 });
    }

    // Resolve consumed amount
    let consumed = body.consumed ?? null;
    if (!consumed && assignmentid) {
      const [assignment] = await db
        .select()
        .from(reagentAssignments)
        .where(eq(reagentAssignments.id, assignmentid))
        .limit(1);
      if (assignment?.consumptionpertest) {
        consumed = parseFloat(assignment.consumptionpertest) * testcount;
      }
    }
    if (!consumed || consumed <= 0) {
      return NextResponse.json({ error: "consumed amount required (or provide assignmentid with consumptionpertest set)" }, { status: 400 });
    }

    const consumedInt = Math.ceil(consumed);

    // Check stock
    const stockWhere = batchid
      ? and(eq(storeStock.storeid, storeid), eq(storeStock.itemid, itemid), eq(storeStock.batchid, batchid))
      : and(eq(storeStock.storeid, storeid), eq(storeStock.itemid, itemid));

    const [stock] = await db.select().from(storeStock).where(stockWhere).limit(1);
    if (!stock) {
      return NextResponse.json({ error: "No stock record for this item in this store" }, { status: 400 });
    }
    const available = stock.quantity - stock.reservedquantity;
    if (available < consumedInt) {
      return NextResponse.json({
        error: `Insufficient stock. Available: ${available}, Required: ${consumedInt}`,
      }, { status: 400 });
    }

    // Deduct stock
    await db
      .update(storeStock)
      .set({ quantity: sql`${storeStock.quantity} - ${consumedInt}`, lastupdated: new Date() })
      .where(eq(storeStock.id, stock.id));

    // Log store transaction
    await db.insert(storeTransactions).values({
      storeid,
      itemid,
      batchid: batchid || null,
      transactiontype: "LAB_CONSUMPTION",
      quantity: -consumedInt,
      referencetype: "lab_run",
      notes: notes || `${testtype ?? "test"} x ${testcount}`,
      createdby: runby || null,
    });

    // Log lab consumption entry
    const [entry] = await db.insert(labConsumptionLog).values({
      storeid,
      itemid,
      assignmentid: assignmentid || null,
      testtype:     testtype || null,
      testcount,
      consumed:     String(consumed),
      batchid:      batchid || null,
      runby:        runby || null,
      notes:        notes || null,
    }).returning();

    return NextResponse.json({ success: true, entry, newQty: stock.quantity - consumedInt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
