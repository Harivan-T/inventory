import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { stores, storeStock, storeTransactions, storeRequisitions, items, itemBatches, warehouses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [store] = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const stock = await db
      .select({
        id:               storeStock.id,
        itemid:           storeStock.itemid,
        itemname:         items.name,
        itemcode:         items.itemcode,
        itemtype:         items.itemtype,
        batchid:          storeStock.batchid,
        batchnumber:      itemBatches.batchnumber,
        expirydate:       itemBatches.expirydate,
        quantity:         storeStock.quantity,
        reservedquantity: storeStock.reservedquantity,
        lastupdated:      storeStock.lastupdated,
        minlevel:         items.minlevel,
        reorderlevel:     items.reorderlevel,
      })
      .from(storeStock)
      .leftJoin(items,       eq(storeStock.itemid,  items.id))
      .leftJoin(itemBatches, eq(storeStock.batchid, itemBatches.id))
      .where(eq(storeStock.storeid, id));

    const transactions = await db
      .select({
        id:              storeTransactions.id,
        transactiontype: storeTransactions.transactiontype,
        quantity:        storeTransactions.quantity,
        itemname:        items.name,
        batchnumber:     itemBatches.batchnumber,
        patientref:      storeTransactions.patientref,
        notes:           storeTransactions.notes,
        createdby:       storeTransactions.createdby,
        createdat:       storeTransactions.createdat,
      })
      .from(storeTransactions)
      .leftJoin(items,       eq(storeTransactions.itemid,  items.id))
      .leftJoin(itemBatches, eq(storeTransactions.batchid, itemBatches.id))
      .where(eq(storeTransactions.storeid, id))
      .orderBy(sql`${storeTransactions.createdat} DESC`)
      .limit(20);

    const requisitions = await db
      .select({
        id:           storeRequisitions.id,
        itemname:     items.name,
        requestedqty: storeRequisitions.requestedqty,
        approvedqty:  storeRequisitions.approvedqty,
        fulfilledqty: storeRequisitions.fulfilledqty,
        status:       storeRequisitions.status,
        requestedby:  storeRequisitions.requestedby,
        createdat:    storeRequisitions.createdat,
      })
      .from(storeRequisitions)
      .leftJoin(items, eq(storeRequisitions.itemid, items.id))
      .where(eq(storeRequisitions.storeid, id))
      .orderBy(sql`${storeRequisitions.createdat} DESC`)
      .limit(20);

    const totalstock  = stock.reduce((s, r) => s + (r.quantity ?? 0), 0);
    const lowstock    = stock.filter(r => r.quantity <= (r.reorderlevel ?? 0)).length;
    const nearexpiry  = stock.filter(r => {
      if (!r.expirydate) return false;
      const diff = new Date(r.expirydate).getTime() - Date.now();
      return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
    }).length;

    return NextResponse.json({ store, stock, transactions, requisitions, totalstock, lowstock, nearexpiry });
  } catch (error) {
    console.error("Store detail error:", error);
    return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 });
  }
}
