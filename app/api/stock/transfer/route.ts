import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { inventoryStock, stockTransactions, stockTransfers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/stock/transfer
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemid, sourcewarehouseid, destinationwarehouseid, batchid, quantity, reason, createdby } = body;

    if (!itemid || !sourcewarehouseid || !destinationwarehouseid || !quantity) {
      return NextResponse.json({ error: "itemid, sourcewarehouseid, destinationwarehouseid and quantity are required" }, { status: 400 });
    }

    // Check source stock
    const sourceStock = await db
      .select()
      .from(inventoryStock)
      .where(and(
        eq(inventoryStock.itemid,      itemid),
        eq(inventoryStock.warehouseid, sourcewarehouseid),
        ...(batchid ? [eq(inventoryStock.batchid, batchid)] : []),
      ))
      .then(r => r[0]);

    if (!sourceStock || sourceStock.quantity < Number(quantity)) {
      return NextResponse.json({ error: "Insufficient stock in source warehouse" }, { status: 400 });
    }

    // 1. Create transfer record
    await db.insert(stockTransfers).values({
      itemid,
      batchid:                batchid ?? null,
      sourcewarehouseid,
      destinationwarehouseid,
      quantity:               Number(quantity),
      reason,
      createdby,
    });

    // 2. Insert TRANSFER transaction
    await db.insert(stockTransactions).values({
      itemid,
      warehouseid:     sourcewarehouseid,
      batchid:         batchid ?? null,
      transactiontype: "TRANSFER",
      quantity:        -Number(quantity),
      referencetype:   "warehouse",
      referenceid:     destinationwarehouseid,
      notes:           reason,
      createdby,
    });

    // 3. Reduce source stock
    await db
      .update(inventoryStock)
      .set({
        quantity:    sourceStock.quantity - Number(quantity),
        lastupdated: new Date(),
      })
      .where(eq(inventoryStock.id, sourceStock.id));

    // 4. Increase or create destination stock
    const destStock = await db
      .select()
      .from(inventoryStock)
      .where(and(
        eq(inventoryStock.itemid,      itemid),
        eq(inventoryStock.warehouseid, destinationwarehouseid),
        ...(batchid ? [eq(inventoryStock.batchid, batchid)] : []),
      ))
      .then(r => r[0]);

    if (destStock) {
      await db
        .update(inventoryStock)
        .set({
          quantity:    destStock.quantity + Number(quantity),
          lastupdated: new Date(),
        })
        .where(eq(inventoryStock.id, destStock.id));
    } else {
      await db.insert(inventoryStock).values({
        itemid,
        warehouseid:      destinationwarehouseid,
        batchid:          batchid ?? null,
        quantity:         Number(quantity),
        reservedquantity: 0,
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Transfer stock error:", error);
    return NextResponse.json({ error: "Failed to transfer stock" }, { status: 500 });
  }
}
