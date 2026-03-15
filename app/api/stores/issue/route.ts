import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { storeStock, storeTransactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeid, itemid, batchid, quantity, patientref, issuedby, notes } = body;

    if (!storeid || !itemid || !quantity) {
      return NextResponse.json({ error: "storeid, itemid and quantity are required" }, { status: 400 });
    }

    const [stockRecord] = await db
      .select().from(storeStock)
      .where(and(
        eq(storeStock.storeid, storeid),
        eq(storeStock.itemid,  itemid),
        ...(batchid ? [eq(storeStock.batchid, batchid)] : []),
      )).limit(1);

    if (!stockRecord || stockRecord.quantity < Number(quantity)) {
      return NextResponse.json({ error: "Insufficient stock in store" }, { status: 400 });
    }

    await db.insert(storeTransactions).values({
      storeid, itemid, batchid: batchid ?? null,
      transactiontype: "ISSUE",
      quantity:        Number(quantity),
      referencetype:   patientref ? "patient" : "department",
      patientref,
      notes,
      createdby: issuedby,
    });

    await db.update(storeStock)
      .set({ quantity: stockRecord.quantity - Number(quantity), lastupdated: new Date() })
      .where(eq(storeStock.id, stockRecord.id));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Store issue error:", error);
    return NextResponse.json({ error: "Failed to issue stock" }, { status: 500 });
  }
}
