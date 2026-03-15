import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { inventoryStock, itemBatches, warehouses } from "@/lib/db/schema";
import { drugs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/stock — get all stock levels
export async function GET() {
  try {
    const stock = await db
      .select({
        id:                inventoryStock.id,
        itemid:            inventoryStock.itemid,
        itemname:          drugs.name,
        genericname:       drugs.genericname,
        form:              drugs.form,
        warehouseid:       inventoryStock.warehouseid,
        warehousename:     warehouses.name,
        batchid:           inventoryStock.batchid,
        batchnumber:       itemBatches.batchnumber,
        expirydate:        itemBatches.expirydate,
        quantity:          inventoryStock.quantity,
        reservedquantity:  inventoryStock.reservedquantity,
        lastupdated:       inventoryStock.lastupdated,
      })
      .from(inventoryStock)
      .leftJoin(drugs,        eq(inventoryStock.itemid,      drugs.drugid))
      .leftJoin(warehouses,   eq(inventoryStock.warehouseid, warehouses.id))
      .leftJoin(itemBatches,  eq(inventoryStock.batchid,     itemBatches.id))
      .orderBy(sql`${inventoryStock.lastupdated} DESC`);

    return NextResponse.json(stock);
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}
