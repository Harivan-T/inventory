import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, itemBatches, inventoryStock, storeStock, stores } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

export async function GET() {
  try {
    const alerts: any[] = [];
    const now       = new Date();
    const in90Days  = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const in30Days  = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Near expiry batches
    try {
      const nearExpiry = await db
        .select({
          batchid:     itemBatches.id,
          batchnumber: itemBatches.batchnumber,
          expirydate:  itemBatches.expirydate,
          quantity:    itemBatches.quantity,
          itemname:    items.name,
        })
        .from(itemBatches)
        .leftJoin(items, eq(itemBatches.itemid, items.id))
        .where(and(
          sql`${itemBatches.expirydate} IS NOT NULL`,
          sql`${itemBatches.expirydate} <= ${in90Days.toISOString()}::date`,
          sql`${itemBatches.expirydate} >= ${now.toISOString()}::date`,
          sql`${itemBatches.quantity} > 0`
        ));

      for (const row of nearExpiry) {
        const daysLeft = Math.ceil((new Date(row.expirydate!).getTime() - now.getTime()) / 86400000);
        alerts.push({
          type:     "near_expiry",
          severity: daysLeft <= 30 ? "critical" : "warning",
          message:  `Near expiry: ${row.itemname} — batch ${row.batchnumber}`,
          detail:   { batchid: row.batchid, daysLeft, expirydate: row.expirydate, quantity: row.quantity },
        });
      }
    } catch {}

    // Expired batches still in stock
    try {
      const expired = await db
        .select({
          batchid:     itemBatches.id,
          batchnumber: itemBatches.batchnumber,
          expirydate:  itemBatches.expirydate,
          quantity:    itemBatches.quantity,
          itemname:    items.name,
        })
        .from(itemBatches)
        .leftJoin(items, eq(itemBatches.itemid, items.id))
        .where(and(
          sql`${itemBatches.expirydate} IS NOT NULL`,
          sql`${itemBatches.expirydate} < ${now.toISOString()}::date`,
          sql`${itemBatches.quantity} > 0`
        ));

      for (const row of expired) {
        alerts.push({
          type:     "expired",
          severity: "critical",
          message:  `Expired stock: ${row.itemname} — batch ${row.batchnumber}`,
          detail:   { batchid: row.batchid, expirydate: row.expirydate, quantity: row.quantity },
        });
      }
    } catch {}

    // Low stock — items where total inventory <= reorder level
    try {
      const lowStock = await db
        .select({
          itemid:       items.id,
          itemname:     items.name,
          reorderlevel: items.reorderlevel,
          minlevel:     items.minlevel,
          total:        sql<number>`coalesce(sum(${inventoryStock.quantity}), 0)`,
        })
        .from(items)
        .leftJoin(inventoryStock, eq(inventoryStock.itemid, items.id))
        .where(and(eq(items.isactive, true), sql`${items.reorderlevel} > 0`))
        .groupBy(items.id, items.name, items.reorderlevel, items.minlevel)
        .having(sql`coalesce(sum(${inventoryStock.quantity}), 0) <= ${items.reorderlevel}`);

      for (const row of lowStock) {
        alerts.push({
          type:     "low_stock",
          severity: Number(row.total) <= Number(row.minlevel ?? 0) ? "critical" : "warning",
          message:  `Low stock: ${row.itemname}`,
          detail:   { itemid: row.itemid, quantity: row.total, reorderlevel: row.reorderlevel },
        });
      }
    } catch {}

    // Low store stock
    try {
      const lowStore = await db
        .select({
          storename:    stores.name,
          itemname:     items.name,
          reorderlevel: items.reorderlevel,
          total:        sql<number>`coalesce(sum(${storeStock.quantity}), 0)`,
        })
        .from(storeStock)
        .leftJoin(items,  eq(storeStock.itemid,  items.id))
        .leftJoin(stores, eq(storeStock.storeid, stores.id))
        .where(and(eq(items.isactive, true), sql`${items.reorderlevel} > 0`))
        .groupBy(stores.name, items.name, items.reorderlevel)
        .having(sql`coalesce(sum(${storeStock.quantity}), 0) <= ${items.reorderlevel}`);

      for (const row of lowStore) {
        alerts.push({
          type:     "low_store_stock",
          severity: "warning",
          message:  `Low stock in ${row.storename}: ${row.itemname}`,
          detail:   { quantity: row.total, reorderlevel: row.reorderlevel, storename: row.storename },
        });
      }
    } catch {}

alerts.sort((a, b) => {
  const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
});
    return NextResponse.json({ alerts, total: alerts.length });
  } catch (err: any) {
    return NextResponse.json({ alerts: [], total: 0, error: err.message });
  }
}
