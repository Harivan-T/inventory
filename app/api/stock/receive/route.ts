import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { inventoryStock, itemBatches, stockTransactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/stock/receive
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemid, warehouseid, batchnumber, manufacturedate, expirydate, quantity, notes, createdby } = body;

    if (!itemid || !warehouseid || !batchnumber || !quantity) {
      return NextResponse.json({ error: "itemid, warehouseid, batchnumber and quantity are required" }, { status: 400 });
    }

    // 1. Find or create batch
    let batch = await db
      .select()
      .from(itemBatches)
      .where(and(eq(itemBatches.itemid, itemid), eq(itemBatches.batchnumber, batchnumber)))
      .then(r => r[0]);

    if (!batch) {
      const [newBatch] = await db
        .insert(itemBatches)
        .values({
          itemid,
          batchnumber,
          expirydate:      expirydate ? new Date(expirydate) : null,
          manufacturedate: manufacturedate ? new Date(manufacturedate) : null,
        })
        .returning();
      batch = newBatch;
    }

    // 2. Insert STOCK_IN transaction
    await db.insert(stockTransactions).values({
      itemid,
      warehouseid,
      batchid:         batch.id,
      transactiontype: "STOCK_IN",
      quantity:        Number(quantity),
      notes,
      createdby,
    });

    // 3. Update or create inventory_stock
    const existing = await db
      .select()
      .from(inventoryStock)
      .where(and(
        eq(inventoryStock.itemid,      itemid),
        eq(inventoryStock.warehouseid, warehouseid),
        eq(inventoryStock.batchid,     batch.id),
      ))
      .then(r => r[0]);

    if (existing) {
      await db
        .update(inventoryStock)
        .set({
          quantity:    existing.quantity + Number(quantity),
          lastupdated: new Date(),
        })
        .where(eq(inventoryStock.id, existing.id));
    } else {
      await db.insert(inventoryStock).values({
        itemid,
        warehouseid,
        batchid:          batch.id,
        quantity:         Number(quantity),
        reservedquantity: 0,
      });
    }

    return NextResponse.json({ success: true, batchid: batch.id }, { status: 201 });
  } catch (error) {
    console.error("Receive stock error:", error);
    return NextResponse.json({ error: "Failed to receive stock" }, { status: 500 });
  }
}
