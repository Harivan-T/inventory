import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchaseRequisitions, purchaseRequisitionItems, items, warehouses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// Auto-generate PR number
async function genPRNumber() {
  const year = new Date().getFullYear();
  const [last] = await db
    .select({ prnumber: purchaseRequisitions.prnumber })
    .from(purchaseRequisitions)
    .orderBy(desc(purchaseRequisitions.createdat))
    .limit(1);
  const seq = last ? parseInt(last.prnumber.split("-").pop() ?? "0") + 1 : 1;
  return `PR-${year}-${String(seq).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const rows = await db
      .select({
        id:          purchaseRequisitions.id,
        prnumber:    purchaseRequisitions.prnumber,
        status:      purchaseRequisitions.status,
        priority:    purchaseRequisitions.priority,
        requestedby: purchaseRequisitions.requestedby,
        approvedby:  purchaseRequisitions.approvedby,
        requireddate: purchaseRequisitions.requireddate,
        notes:       purchaseRequisitions.notes,
        createdat:   purchaseRequisitions.createdat,
        warehousename: warehouses.name,
      })
      .from(purchaseRequisitions)
      .leftJoin(warehouses, eq(purchaseRequisitions.warehouseid, warehouses.id))
      .where(status ? eq(purchaseRequisitions.status, status as any) : undefined)
      .orderBy(desc(purchaseRequisitions.createdat));

    // Enrich with item count
    const enriched = await Promise.all(rows.map(async (pr) => {
      const prItems = await db
        .select({ id: purchaseRequisitionItems.id })
        .from(purchaseRequisitionItems)
        .where(eq(purchaseRequisitionItems.prid, pr.id));
      return { ...pr, itemcount: prItems.length };
    }));

    return NextResponse.json(enriched);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { warehouseid, requestedby, priority, requireddate, notes, prItems } = body;

    if (!prItems?.length) return NextResponse.json({ error: "At least one item required" }, { status: 400 });

    const prnumber = await genPRNumber();

    const [pr] = await db.insert(purchaseRequisitions).values({
      prnumber, warehouseid, requestedby,
      priority: priority ?? "normal",
      requireddate: requireddate ? new Date(requireddate) : null,
      notes,
      status: "pending",
    }).returning();

    await db.insert(purchaseRequisitionItems).values(
      prItems.map((i: any) => ({
        prid:           pr.id,
        itemid:         i.itemid,
        requestedqty:   i.requestedqty,
        estimatedprice: i.estimatedprice ?? null,
        notes:          i.notes ?? null,
      }))
    );

    return NextResponse.json(pr, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
