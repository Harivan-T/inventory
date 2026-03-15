import { NextResponse } from "next/server";
import { neonDb } from "@/lib/db";
import { drugs, inventoryStock, itemBatches, stockTransactions, warehouses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [drug] = await neonDb
      .select()
      .from(drugs)
      .where(eq(drugs.drugid, id))
      .limit(1);

    if (!drug) {
      return NextResponse.json({ error: "Drug not found" }, { status: 404 });
    }

    let stock: any[] = [];
    try {
      stock = await neonDb
        .select({
          id:               inventoryStock.id,
          warehouseid:      inventoryStock.warehouseid,
          warehousename:    warehouses.name,
          batchid:          inventoryStock.batchid,
          batchnumber:      itemBatches.batchnumber,
          expirydate:       itemBatches.expirydate,
          manufacturedate:  itemBatches.manufacturedate,
          quantity:         inventoryStock.quantity,
          reservedquantity: inventoryStock.reservedquantity,
          lastupdated:      inventoryStock.lastupdated,
        })
        .from(inventoryStock)
        .leftJoin(warehouses,  eq(inventoryStock.warehouseid, warehouses.id))
        .leftJoin(itemBatches, eq(inventoryStock.batchid,     itemBatches.id))
        .where(eq(inventoryStock.itemid, id));
    } catch (_) {}

    let transactions: any[] = [];
    try {
      transactions = await neonDb
        .select({
          id:              stockTransactions.id,
          transactiontype: stockTransactions.transactiontype,
          quantity:        stockTransactions.quantity,
          warehousename:   warehouses.name,
          batchnumber:     itemBatches.batchnumber,
          notes:           stockTransactions.notes,
          createdby:       stockTransactions.createdby,
          createdat:       stockTransactions.createdat,
        })
        .from(stockTransactions)
        .leftJoin(warehouses,  eq(stockTransactions.warehouseid, warehouses.id))
        .leftJoin(itemBatches, eq(stockTransactions.batchid,     itemBatches.id))
        .where(eq(stockTransactions.itemid, id))
        .orderBy(sql`${stockTransactions.createdat} DESC`)
        .limit(10);
    } catch (_) {}

    const totalStock = stock.reduce((sum, s) => sum + (s.quantity ?? 0), 0);
    const nearExpiry = stock.filter(s => {
      if (!s.expirydate) return false;
      const diff = new Date(s.expirydate).getTime() - Date.now();
      return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
    }).length;
    const expired = stock.filter(s => s.expirydate && new Date(s.expirydate) < new Date()).length;

    return NextResponse.json({ drug, stock, transactions, totalStock, nearExpiry, expired });
  } catch (error) {
    console.error("Drug detail API error:", error);
    return NextResponse.json({ error: "Failed to fetch drug" }, { status: 500 });
  }
}
