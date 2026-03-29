import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  purchaseRequisitions, purchaseRequisitionItems,
  purchaseOrders, purchaseOrderItems, items, warehouses,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function genPONumber() {
  const year = new Date().getFullYear();
  const [last] = await db
    .select({ ponumber: purchaseOrders.ponumber })
    .from(purchaseOrders)
    .orderBy(desc(purchaseOrders.createdat))
    .limit(1);
  const seq = last ? parseInt(last.ponumber.split("-").pop() ?? "0") + 1 : 1;
  return `PO-${year}-${String(seq).padStart(4, "0")}`;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [pr] = await db
      .select({
        id:           purchaseRequisitions.id,
        prnumber:     purchaseRequisitions.prnumber,
        status:       purchaseRequisitions.status,
        priority:     purchaseRequisitions.priority,
        requestedby:  purchaseRequisitions.requestedby,
        approvedby:   purchaseRequisitions.approvedby,
        requireddate: purchaseRequisitions.requireddate,
        notes:        purchaseRequisitions.notes,
        createdat:    purchaseRequisitions.createdat,
        warehousename: warehouses.name,
        warehouseid:  purchaseRequisitions.warehouseid,
      })
      .from(purchaseRequisitions)
      .leftJoin(warehouses, eq(purchaseRequisitions.warehouseid, warehouses.id))
      .where(eq(purchaseRequisitions.id, id));

    if (!pr) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prItems = await db
      .select({
        id:             purchaseRequisitionItems.id,
        itemid:         purchaseRequisitionItems.itemid,
        requestedqty:   purchaseRequisitionItems.requestedqty,
        approvedqty:    purchaseRequisitionItems.approvedqty,
        estimatedprice: purchaseRequisitionItems.estimatedprice,
        notes:          purchaseRequisitionItems.notes,
        itemname:       items.name,
        itemcode:       items.itemcode,
        uom:            items.uom,
      })
      .from(purchaseRequisitionItems)
      .leftJoin(items, eq(purchaseRequisitionItems.itemid, items.id))
      .where(eq(purchaseRequisitionItems.prid, id));

    return NextResponse.json({ pr, items: prItems });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, approvedby, approvedItems, vendorid, expecteddate, notes: poNotes } = body;

    if (action === "approve") {
      await db.update(purchaseRequisitions)
        .set({ status: "approved", approvedby, updatedat: new Date() })
        .where(eq(purchaseRequisitions.id, id));

      // Update approved quantities
      if (approvedItems?.length) {
        for (const ai of approvedItems) {
          await db.update(purchaseRequisitionItems)
            .set({ approvedqty: ai.approvedqty })
            .where(eq(purchaseRequisitionItems.id, ai.id));
        }
      }
      return NextResponse.json({ success: true, status: "approved" });
    }

    if (action === "reject") {
      await db.update(purchaseRequisitions)
        .set({ status: "rejected", approvedby, updatedat: new Date() })
        .where(eq(purchaseRequisitions.id, id));
      return NextResponse.json({ success: true, status: "rejected" });
    }

    if (action === "convert_to_po") {
      // Get PR and its items
      const [pr] = await db.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.id, id));
      if (pr.status !== "approved") return NextResponse.json({ error: "PR must be approved first" }, { status: 400 });

      const prItems = await db
        .select()
        .from(purchaseRequisitionItems)
        .where(eq(purchaseRequisitionItems.prid, id));

      const ponumber = await genPONumber();

      // Calculate total
      const total = prItems.reduce((sum, i) => sum + (parseFloat(i.estimatedprice ?? "0") * (i.approvedqty ?? i.requestedqty)), 0);

      const [po] = await db.insert(purchaseOrders).values({
        ponumber,
        vendorid: vendorid ?? null,
        prid: id,
        warehouseid: pr.warehouseid,
        status: "draft",
        expecteddate: expecteddate ? new Date(expecteddate) : null,
        totalamount: String(total),
        notes: poNotes ?? pr.notes,
      }).returning();

      await db.insert(purchaseOrderItems).values(
        prItems.map(i => ({
          poid:        po.id,
          itemid:      i.itemid,
          orderedqty:  i.approvedqty ?? i.requestedqty,
          unitprice:   i.estimatedprice ?? "0",
          totalamount: String(parseFloat(i.estimatedprice ?? "0") * (i.approvedqty ?? i.requestedqty)),
        }))
      );

      await db.update(purchaseRequisitions)
        .set({ status: "converted", updatedat: new Date() })
        .where(eq(purchaseRequisitions.id, id));

      return NextResponse.json({ success: true, po });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
