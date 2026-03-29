import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  goodsReceiptNotes, grnItems, purchaseOrderItems,
  vendors, warehouses, items,
  inventoryStock, itemBatches, stockTransactions,
} from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const rows = await db
      .select({
        id:            goodsReceiptNotes.id,
        grnnumber:     goodsReceiptNotes.grnnumber,
        status:        goodsReceiptNotes.status,
        receiptdate:   goodsReceiptNotes.receiptdate,
        invoicenumber: goodsReceiptNotes.invoicenumber,
        receivedby:    goodsReceiptNotes.receivedby,
        notes:         goodsReceiptNotes.notes,
        createdat:     goodsReceiptNotes.createdat,
        vendorname:    vendors.name,
        warehousename: warehouses.name,
      })
      .from(goodsReceiptNotes)
      .leftJoin(vendors,    eq(goodsReceiptNotes.vendorid,    vendors.id))
      .leftJoin(warehouses, eq(goodsReceiptNotes.warehouseid, warehouses.id))
      .orderBy(desc(goodsReceiptNotes.createdat));
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
