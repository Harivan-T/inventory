import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { warehouses, warehouseSections, warehouseStock } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/warehouses
export async function GET() {
  try {
    const all = await db
      .select({
        id:          warehouses.id,
        name:        warehouses.name,
        location:    warehouses.location,
        manager:     warehouses.manager,
        description: warehouses.description,
        isactive:    warehouses.isactive,
        createdat:   warehouses.createdat,
        updatedat:   warehouses.updatedat,
      })
      .from(warehouses)
      .orderBy(sql`${warehouses.createdat} DESC`);

    // Attach section + stock counts
    const enriched = await Promise.all(
      all.map(async (w) => {
        const [{ sectioncount }] = await db
          .select({ sectioncount: sql<number>`count(*)` })
          .from(warehouseSections)
          .where(eq(warehouseSections.warehouseid, w.id));

        const [{ stockcount }] = await db
          .select({ stockcount: sql<number>`coalesce(sum(quantity), 0)` })
          .from(warehouseStock)
          .where(eq(warehouseStock.warehouseid, w.id));

        return { ...w, sectioncount: Number(sectioncount), totalstock: Number(stockcount) };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch warehouses" }, { status: 500 });
  }
}

// POST /api/warehouses
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, location, manager, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Warehouse name is required" }, { status: 400 });
    }

    const [created] = await db
      .insert(warehouses)
      .values({ name, location, manager, description, isactive: true })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create warehouse" }, { status: 500 });
  }
}
