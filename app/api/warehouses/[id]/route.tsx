import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { warehouses, warehouseSections, warehouseStock, drugs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/warehouses/[id]
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const [warehouse] = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, id));

    if (!warehouse) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const sections = await db
      .select()
      .from(warehouseSections)
      .where(eq(warehouseSections.warehouseid, id));

    const stock = await db
      .select({
        id:         warehouseStock.id,
        quantity:   warehouseStock.quantity,
        createdat:  warehouseStock.createdat,
        sectionid:  warehouseStock.sectionid,
        drugid:     warehouseStock.drugid,
        drugname:   drugs.name,
        genericname: drugs.genericname,
        form:       drugs.form,
        strength:   drugs.strength,
        manufacturer: drugs.manufacturer,
        sectionname: warehouseSections.sectionname,
      })
      .from(warehouseStock)
      .leftJoin(drugs, eq(warehouseStock.drugid, drugs.drugid))
      .leftJoin(warehouseSections, eq(warehouseStock.sectionid, warehouseSections.id))
      .where(eq(warehouseStock.warehouseid, id));

    return NextResponse.json({ warehouse, sections, stock });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch warehouse" }, { status: 500 });
  }
}

// PUT /api/warehouses/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, location, manager, description, isactive } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const [updated] = await db
      .update(warehouses)
      .set({ name, location, manager, description, isactive, updatedat: new Date() })
      .where(eq(warehouses.id, params.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/warehouses/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await db.update(warehouses)
      .set({ isactive: false, updatedat: new Date() })
      .where(eq(warehouses.id, params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
