import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  purchaseOrders, purchaseOrderItems,
  goodsReceiptNotes, grnItems,
  vendors, warehouses, items,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function genGRNNumber() {
  const year = new Date().getFullYear();
  const [last] = await db
    .select({ grnnumber: goodsReceiptNotes.grnnumber })
    .from(goodsReceiptNotes)
    .orderBy(desc(goodsReceiptNotes.createdat))
    .limit(1);
  const seq = last ? parseInt(last.grnnumber.split("-").pop() ?? "0") + 1 : 1;
  return `GRN-${year}-${String(seq).padStart(4, "0")}`;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [po] = await db
      .select({
        id:           purchaseOrders.id,
        ponumber:     purchaseOrders.ponumber,
        status:       purchaseOrders.status,
        orderdate:    purchaseOrders.orderdate,
        expecteddate: purchaseOrders.expecteddate,
        totalamount:  purchaseOrders.totalamount,
        currency:     purchaseOrders.currency,
        paymentterms: purchaseOrders.paymentterms,
        notes:        purchaseOrders.notes,
        approvedby:   purchaseOrders.approvedby,
        sentby:       purchaseOrders.sentby,
        createdat:    purchaseOrders.createdat,
        vendorname:   vendors.name,
        vendoremail:  vendors.email,
        vendorphone:  vendors.phone,
        warehousename: warehouses.name,
        warehouseid:  purchaseOrders.warehouseid,
        vendorid:     purchaseOrders.vendorid,
      })
      .from(purchaseOrders)
      .leftJoin(vendors,    eq(purchaseOrders.vendorid,    vendors.id))
      .leftJoin(warehouses, eq(purchaseOrders.warehouseid, warehouses.id))
      .where(eq(purchaseOrders.id, id));

    if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const poItems = await db
      .select({
        id:          purchaseOrderItems.id,
        itemid:      purchaseOrderItems.itemid,
        orderedqty:  purchaseOrderItems.orderedqty,
        receivedqty: purchaseOrderItems.receivedqty,
        unitprice:   purchaseOrderItems.unitprice,
        totalamount: purchaseOrderItems.totalamount,
        itemname:    items.name,
        itemcode:    items.itemcode,
        uom:         items.uom,
      })
      .from(purchaseOrderItems)
      .leftJoin(items, eq(purchaseOrderItems.itemid, items.id))
      .where(eq(purchaseOrderItems.poid, id));

    const grns = await db
      .select()
      .from(goodsReceiptNotes)
      .where(eq(goodsReceiptNotes.poid, id))
      .orderBy(desc(goodsReceiptNotes.createdat));

    return NextResponse.json({ po, items: poItems, grns });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, approvedby, sentby, receivedby, invoicenumber, grnItemsData } = body;

    if (action === "approve") {
      await db.update(purchaseOrders)
        .set({ status: "approved", approvedby, updatedat: new Date() })
        .where(eq(purchaseOrders.id, id));
      return NextResponse.json({ success: true, status: "approved" });
    }

    if (action === "send") {
      await db.update(purchaseOrders)
        .set({ status: "sent", sentby, updatedat: new Date() })
        .where(eq(purchaseOrders.id, id));
      return NextResponse.json({ success: true, status: "sent" });
    }

    if (action === "create_grn") {
      const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
      if (!["sent", "partial"].includes(po.status ?? "")) {
        return NextResponse.json({ error: "PO must be sent before creating GRN" }, { status: 400 });
      }

      const grnnumber = await genGRNNumber();
      const [grn] = await db.insert(goodsReceiptNotes).values({
        grnnumber,
        poid:       id,
        vendorid:   po.vendorid,
        warehouseid: po.warehouseid,
        status:     "draft",
        receivedby: receivedby ?? null,
        invoicenumber: invoicenumber ?? null,
      }).returning();

      if (grnItemsData?.length) {
        await db.insert(grnItems).values(
          grnItemsData.map((gi: any) => ({
            grnid:          grn.id,
            itemid:         gi.itemid,
            poitemid:       gi.poitemid ?? null,
            orderedqty:     gi.orderedqty ?? null,
            receivedqty:    gi.receivedqty,
            rejectedqty:    gi.rejectedqty ?? 0,
            unitprice:      gi.unitprice ?? null,
            batchnumber:    gi.batchnumber ?? null,
            expirydate:     gi.expirydate ? new Date(gi.expirydate) : null,
            manufacturedate: gi.manufacturedate ? new Date(gi.manufacturedate) : null,
          }))
        );
      }

      return NextResponse.json({ success: true, grn });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
