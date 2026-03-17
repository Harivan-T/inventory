import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { drugs, drugInventory } from "@/lib/db/schema";
import { eq, count, sql, and } from "drizzle-orm";

export async function GET() {
  try {
    // Total drugs
    const [totalDrugs] = await db
      .select({ count: count() })
      .from(drugs)
      .where(eq(drugs.isactive, true));

    // Total by form
    const byForm = await db
      .select({ form: drugs.form, count: count() })
      .from(drugs)
      .where(eq(drugs.isactive, true))
      .groupBy(drugs.form);

    // Requires prescription
    const [rxDrugs] = await db
      .select({ count: count() })
      .from(drugs)
      .where(and(eq(drugs.requiresprescription, true), eq(drugs.isactive, true)));

    // Insurance approved
    const [insuredDrugs] = await db
      .select({ count: count() })
      .from(drugs)
      .where(and(eq(drugs.insuranceapproved, true), eq(drugs.isactive, true)));

    // By manufacturer
    const byManufacturer = await db
      .select({ manufacturer: drugs.manufacturer, count: count() })
      .from(drugs)
      .where(eq(drugs.isactive, true))
      .groupBy(drugs.manufacturer);

    // Recent drugs (last 5)
    const recentDrugs = await db
      .select()
      .from(drugs)
      .orderBy(sql`${drugs.createdat} DESC`)
      .limit(5);

    // All active drugs for table
    const allDrugs = await db
      .select()
      .from(drugs)
      .where(eq(drugs.isactive, true))
      .orderBy(sql`${drugs.createdat} DESC`);

    // Inventory stats (if any)
    const inventoryStats = await db
      .select({
        drugid: drugInventory.drugid,
        quantity: drugInventory.quantity,
        minquantity: drugInventory.minquantity,
        sellingprice: drugInventory.sellingprice,
        expirydate: drugInventory.expirydate,
      })
      .from(drugInventory);

    // Low stock alerts (quantity <= minquantity)
    const lowStock = inventoryStats.filter(
      (i) => i.minquantity !== null && i.quantity <= (i.minquantity ?? 0)
    );

    return NextResponse.json({
      totalDrugs: totalDrugs.count,
      rxDrugs: rxDrugs.count,
      insuredDrugs: insuredDrugs.count,
      otcDrugs: Number(totalDrugs.count) - Number(rxDrugs.count),
      byForm,
      byManufacturer,
      recentDrugs,
      allDrugs,
      inventoryStats,
      lowStockCount: lowStock.length,
      notifications: [
        ...(lowStock.length > 0
          ? [{ type: "warning", message: `${lowStock.length} items are low on stock` }]
          : []),
        { type: "info", message: `${totalDrugs.count} active drugs in system` },
        rxDrugs.count > 0
          ? { type: "info", message: `${rxDrugs.count} prescription-only drugs` }
          : null,
      ].filter(Boolean),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
