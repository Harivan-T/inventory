import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { storeRequisitions, inventoryStock, storeStock, storeTransactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/stores/requisition — create a new requisition
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeid, warehouseid, itemid, requestedqty, requestedby, notes } = body;

    if (!storeid || !warehouseid || !itemid || !requestedqty) {
      return NextResponse.json({ error: "storeid, warehouseid, itemid and requestedqty are required" }, { status: 400 });
    }

    const [req_] = await db.insert(storeRequisitions).values({
      storeid, warehouseid, itemid,
      requestedqty: Number(requestedqty),
      requestedby, notes,
      status: "pending",
    }).returning();

    return NextResponse.json(req_, { status: 201 });
  } catch (error) {
    console.error("Requisition POST error:", error);
    return NextResponse.json({ error: "Failed to create requisition" }, { status: 500 });
  }
}

// PATCH /api/stores/requisition — approve or fulfill a requisition
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, approvedqty, approvedby, batchid } = body;
    // action: "approve" | "fulfill" | "reject"

    if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });

    const [existing] = await db.select().from(storeRequisitions).where(eq(storeRequisitions.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "Requisition not found" }, { status: 404 });

    if (action === "approve") {
      await db.update(storeRequisitions)
        .set({ status: "approved", approvedqty: Number(approvedqty ?? existing.requestedqty), approvedby, updatedat: new Date() })
        .where(eq(storeRequisitions.id, id));
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      await db.update(storeRequisitions)
        .set({ status: "rejected", approvedby, updatedat: new Date() })
        .where(eq(storeRequisitions.id, id));
      return NextResponse.json({ success: true });
    }

    if (action === "fulfill") {
      const qty = Number(approvedqty ?? existing.approvedqty ?? existing.requestedqty);

      // 1. Deduct from warehouse inventory_stock
      const [warehouseStock] = await db
        .select().from(inventoryStock)
        .where(and(
          eq(inventoryStock.itemid,      existing.itemid),
          eq(inventoryStock.warehouseid, existing.warehouseid),
          ...(batchid ? [eq(inventoryStock.batchid, batchid)] : []),
        )).limit(1);

      if (!warehouseStock || warehouseStock.quantity < qty) {
        return NextResponse.json({ error: "Insufficient stock in warehouse" }, { status: 400 });
      }

      await db.update(inventoryStock)
        .set({ quantity: warehouseStock.quantity - qty, lastupdated: new Date() })
        .where(eq(inventoryStock.id, warehouseStock.id));

      // 2. Add to store_stock
      const [existingStoreStock] = await db
        .select().from(storeStock)
        .where(and(
          eq(storeStock.storeid, existing.storeid),
          eq(storeStock.itemid,  existing.itemid),
          ...(batchid ? [eq(storeStock.batchid, batchid)] : []),
        )).limit(1);

      if (existingStoreStock) {
        await db.update(storeStock)
          .set({ quantity: existingStoreStock.quantity + qty, lastupdated: new Date() })
          .where(eq(storeStock.id, existingStoreStock.id));
      } else {
        await db.insert(storeStock).values({
          storeid: existing.storeid, itemid: existing.itemid,
          batchid: batchid ?? null, quantity: qty, reservedquantity: 0,
        });
      }

      // 3. Record store transaction
      await db.insert(storeTransactions).values({
        storeid:         existing.storeid,
        itemid:          existing.itemid,
        batchid:         batchid ?? null,
        transactiontype: "RECEIVE",
        quantity:        qty,
        referencetype:   "requisition",
        referenceid:     id,
        notes:           `Fulfilled from warehouse`,
        createdby:       approvedby,
      });

      // 4. Update requisition status
      const newFulfilled = (existing.fulfilledqty ?? 0) + qty;
      const newStatus = newFulfilled >= (existing.approvedqty ?? existing.requestedqty) ? "fulfilled" : "partial";
      await db.update(storeRequisitions)
        .set({ status: newStatus as any, fulfilledqty: newFulfilled, updatedat: new Date() })
        .where(eq(storeRequisitions.id, id));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Requisition PATCH error:", error);
    return NextResponse.json({ error: "Failed to process requisition" }, { status: 500 });
  }
}
