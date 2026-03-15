import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { inventoryStock, stockTransactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/stock/wastage
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemid, warehouseid, batchid, quantity, reason, createdby } = body;

    if (!itemid || !warehouseid || !quantity) {
      return NextResponse.json({ error: "itemid, warehouseid and quantity are required" }, { status: 400 });
    }

    // Check stock
    const stockRecord = await db
      .select()
      .from(inventoryStock)
      .where(and(
        eq(inventoryStock.itemid,      itemid),
        eq(inventoryStock.warehouseid, warehouseid),
        ...(batchid ? [eq(inventoryStock.batchid, batchid)] : []),
      ))
      .then(r => r[0]);

    if (!stockRecord || stockRecord.quantity < Number(quantity)) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // 1. Insert WASTAGE transaction
    await db.insert(stockTransactions).values({
      itemid,
      warehouseid,
      batchid:         batchid ?? null,
      transactiontype: "WASTAGE",
      quantity:        -Number(quantity),
      notes:           reason,
      createdby,
    });

    // 2. Reduce inventory stock
    await db
      .update(inventoryStock)
      .set({
        quantity:    stockRecord.quantity - Number(quantity),
        lastupdated: new Date(),
      })
      .where(eq(inventoryStock.id, stockRecord.id));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Wastage error:", error);
    return NextResponse.json({ error: "Failed to record wastage" }, { status: 500 });
  }
}
