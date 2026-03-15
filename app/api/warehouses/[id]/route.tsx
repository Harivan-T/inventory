import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { warehouses, warehouseSections, warehouseStock, drugs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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
        id:           warehouseStock.id,
        quantity:     warehouseStock.quantity,
        createdat:    warehouseStock.createdat,
        sectionid:    warehouseStock.sectionid,
        drugid:       warehouseStock.drugid,
        drugname:     drugs.name,
        genericname:  drugs.genericname,
        form:         drugs.form,
        strength:     drugs.strength,
        manufacturer: drugs.manufacturer,
        sectionname:  warehouseSections.sectionname,
      })
      .from(warehouseStock)
      .leftJoin(drugs,             eq(warehouseStock.drugid,    drugs.drugid))
      .leftJoin(warehouseSections, eq(warehouseStock.sectionid, warehouseSections.id))
      .where(eq(warehouseStock.warehouseid, id));

    return NextResponse.json({ warehouse, sections, stock });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch warehouse" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, location, manager, description, isactive } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const [updated] = await db
      .update(warehouses)
      .set({ name, location, manager, description, isactive, updatedat: new Date() })
      .where(eq(warehouses.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.update(warehouses)
      .set({ isactive: false, updatedat: new Date() })
      .where(eq(warehouses.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
