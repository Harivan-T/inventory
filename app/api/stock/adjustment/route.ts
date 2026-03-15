import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { inventoryStock, stockTransactions, stockAdjustments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/stock/adjustment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemid, warehouseid, batchid, adjustmentquantity, reason, createdby } = body;

    if (!itemid || !warehouseid || adjustmentquantity === undefined) {
      return NextResponse.json({ error: "itemid, warehouseid and adjustmentquantity are required" }, { status: 400 });
    }

    // 1. Insert adjustment record
    await db.insert(stockAdjustments).values({
      itemid,
      warehouseid,
      batchid:            batchid ?? null,
      adjustmentquantity: Number(adjustmentquantity),
      reason,
      createdby,
    });

    // 2. Insert ADJUSTMENT transaction
    await db.insert(stockTransactions).values({
      itemid,
      warehouseid,
      batchid:         batchid ?? null,
      transactiontype: "ADJUSTMENT",
      quantity:        Number(adjustmentquantity),
      notes:           reason,
      createdby,
    });

    // 3. Update inventory stock
    const stockRecord = await db
      .select()
      .from(inventoryStock)
      .where(and(
        eq(inventoryStock.itemid,      itemid),
        eq(inventoryStock.warehouseid, warehouseid),
        ...(batchid ? [eq(inventoryStock.batchid, batchid)] : []),
      ))
      .then(r => r[0]);

    if (stockRecord) {
      await db
        .update(inventoryStock)
        .set({
          quantity:    Math.max(0, stockRecord.quantity + Number(adjustmentquantity)),
          lastupdated: new Date(),
        })
        .where(eq(inventoryStock.id, stockRecord.id));
    } else {
      await db.insert(inventoryStock).values({
        itemid,
        warehouseid,
        batchid:          batchid ?? null,
        quantity:         Math.max(0, Number(adjustmentquantity)),
        reservedquantity: 0,
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Adjustment error:", error);
    return NextResponse.json({ error: "Failed to record adjustment" }, { status: 500 });
  }
}
