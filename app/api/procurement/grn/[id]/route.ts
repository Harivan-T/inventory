import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  goodsReceiptNotes, grnItems,
  purchaseOrders, purchaseOrderItems,
  inventoryStock, itemBatches, stockTransactions,
  vendors, warehouses, items,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [grn] = await db
      .select({
        id:            goodsReceiptNotes.id,
        grnnumber:     goodsReceiptNotes.grnnumber,
        status:        goodsReceiptNotes.status,
        receiptdate:   goodsReceiptNotes.receiptdate,
        invoicenumber: goodsReceiptNotes.invoicenumber,
        invoicedate:   goodsReceiptNotes.invoicedate,
        receivedby:    goodsReceiptNotes.receivedby,
        notes:         goodsReceiptNotes.notes,
        createdat:     goodsReceiptNotes.createdat,
        poid:          goodsReceiptNotes.poid,
        warehouseid:   goodsReceiptNotes.warehouseid,
        vendorname:    vendors.name,
        warehousename: warehouses.name,
      })
      .from(goodsReceiptNotes)
      .leftJoin(vendors,    eq(goodsReceiptNotes.vendorid,    vendors.id))
      .leftJoin(warehouses, eq(goodsReceiptNotes.warehouseid, warehouses.id))
      .where(eq(goodsReceiptNotes.id, id));

    if (!grn) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const grnItemRows = await db
      .select({
        id:              grnItems.id,
        itemid:          grnItems.itemid,
        orderedqty:      grnItems.orderedqty,
        receivedqty:     grnItems.receivedqty,
        rejectedqty:     grnItems.rejectedqty,
        unitprice:       grnItems.unitprice,
        batchnumber:     grnItems.batchnumber,
        expirydate:      grnItems.expirydate,
        manufacturedate: grnItems.manufacturedate,
        notes:           grnItems.notes,
        itemname:        items.name,
        itemcode:        items.itemcode,
        uom:             items.uom,
      })
      .from(grnItems)
      .leftJoin(items, eq(grnItems.itemid, items.id))
      .where(eq(grnItems.grnid, id));

    return NextResponse.json({ grn, items: grnItemRows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === "confirm") {
      await db.update(goodsReceiptNotes)
        .set({ status: "confirmed", updatedat: new Date() })
        .where(eq(goodsReceiptNotes.id, id));
      return NextResponse.json({ success: true, status: "confirmed" });
    }

    if (action === "post") {
      // Post GRN to inventory — creates batches and updates stock
      const [grn] = await db.select().from(goodsReceiptNotes).where(eq(goodsReceiptNotes.id, id));
      if (grn.status !== "confirmed") {
        return NextResponse.json({ error: "GRN must be confirmed before posting" }, { status: 400 });
      }

      const grnItemRows = await db.select().from(grnItems).where(eq(grnItems.grnid, id));

      for (const gi of grnItemRows) {
        if (!gi.itemid || !grn.warehouseid) continue;

        const acceptedQty = gi.receivedqty - (gi.rejectedqty ?? 0);
        if (acceptedQty <= 0) continue;

        // Create item batch
        const [batch] = await db.insert(itemBatches).values({
          itemid:         gi.itemid,
          warehouseid:    grn.warehouseid,
          batchnumber:    gi.batchnumber ?? `GRN-${grn.grnnumber}-${gi.itemid.slice(0, 8)}`,
          quantity:       acceptedQty,
          unitcost:       gi.unitprice ?? null,
          expirydate:     gi.expirydate ?? null,
          manufacturedate: gi.manufacturedate ?? null,
        }).returning();

        // Update or insert inventory stock
        const [existing] = await db
          .select()
          .from(inventoryStock)
          .where(and(
            eq(inventoryStock.itemid, gi.itemid),
            eq(inventoryStock.warehouseid, grn.warehouseid),
            eq(inventoryStock.batchid, batch.id)
          ));

        if (existing) {
          await db.update(inventoryStock)
            .set({ quantity: sql`${inventoryStock.quantity} + ${acceptedQty}`, lastupdated: new Date() })
            .where(eq(inventoryStock.id, existing.id));
        } else {
          await db.insert(inventoryStock).values({
            itemid:      gi.itemid,
            warehouseid: grn.warehouseid,
            batchid:     batch.id,
            quantity:    acceptedQty,
          });
        }

        // Log stock transaction
        await db.insert(stockTransactions).values({
          itemid:          gi.itemid,
          warehouseid:     grn.warehouseid,
          batchid:         batch.id,
          transactiontype: "STOCK_IN",
          quantity:        acceptedQty,
          referencetype:   "GRN",
          referenceid:     grn.grnnumber,
          notes:           `Received via ${grn.grnnumber}`,
          createdby:       grn.receivedby ?? "system",
        });

        // Update PO item received qty
        if (gi.poitemid) {
          await db.update(purchaseOrderItems)
            .set({ receivedqty: sql`${purchaseOrderItems.receivedqty} + ${acceptedQty}` })
            .where(eq(purchaseOrderItems.id, gi.poitemid));
        }
      }

      // Update PO status
      if (grn.poid) {
        const poItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poid, grn.poid));
        const allReceived = poItems.every(i => (i.receivedqty ?? 0) >= i.orderedqty);
        const anyReceived = poItems.some(i => (i.receivedqty ?? 0) > 0);
        await db.update(purchaseOrders)
          .set({ status: allReceived ? "complete" : anyReceived ? "partial" : "sent", updatedat: new Date() })
          .where(eq(purchaseOrders.id, grn.poid));
      }

      // Mark GRN as posted
      await db.update(goodsReceiptNotes)
        .set({ status: "posted", updatedat: new Date() })
        .where(eq(goodsReceiptNotes.id, id));

      return NextResponse.json({ success: true, status: "posted", message: "Stock updated successfully" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
