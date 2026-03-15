import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { stockTransactions, itemBatches, warehouses } from "@/lib/db/schema";
import { drugs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/stock/transactions
export async function GET() {
  try {
    const transactions = await db
      .select({
        id:              stockTransactions.id,
        itemid:          stockTransactions.itemid,
        itemname:        drugs.name,
        genericname:     drugs.genericname,
        warehouseid:     stockTransactions.warehouseid,
        warehousename:   warehouses.name,
        batchnumber:     itemBatches.batchnumber,
        transactiontype: stockTransactions.transactiontype,
        quantity:        stockTransactions.quantity,
        referencetype:   stockTransactions.referencetype,
        referenceid:     stockTransactions.referenceid,
        notes:           stockTransactions.notes,
        createdby:       stockTransactions.createdby,
        createdat:       stockTransactions.createdat,
      })
      .from(stockTransactions)
      .leftJoin(drugs,       eq(stockTransactions.itemid,      drugs.drugid))
      .leftJoin(warehouses,  eq(stockTransactions.warehouseid, warehouses.id))
      .leftJoin(itemBatches, eq(stockTransactions.batchid,     itemBatches.id))
      .orderBy(sql`${stockTransactions.createdat} DESC`);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
