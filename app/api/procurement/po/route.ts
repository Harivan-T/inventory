import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchaseOrders, purchaseOrderItems, vendors, warehouses, items } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const rows = await db
      .select({
        id:           purchaseOrders.id,
        ponumber:     purchaseOrders.ponumber,
        status:       purchaseOrders.status,
        orderdate:    purchaseOrders.orderdate,
        expecteddate: purchaseOrders.expecteddate,
        totalamount:  purchaseOrders.totalamount,
        currency:     purchaseOrders.currency,
        notes:        purchaseOrders.notes,
        createdat:    purchaseOrders.createdat,
        vendorname:   vendors.name,
        vendoremail:  vendors.email,
        warehousename: warehouses.name,
      })
      .from(purchaseOrders)
      .leftJoin(vendors,    eq(purchaseOrders.vendorid,    vendors.id))
      .leftJoin(warehouses, eq(purchaseOrders.warehouseid, warehouses.id))
      .where(status ? eq(purchaseOrders.status, status as any) : undefined)
      .orderBy(desc(purchaseOrders.createdat));

    const enriched = await Promise.all(rows.map(async (po) => {
      const poItems = await db
        .select({ id: purchaseOrderItems.id })
        .from(purchaseOrderItems)
        .where(eq(purchaseOrderItems.poid, po.id));
      return { ...po, itemcount: poItems.length };
    }));

    return NextResponse.json(enriched);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
