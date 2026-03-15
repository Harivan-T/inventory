import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { warehouseSections, warehouses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/sections
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const warehouseid = searchParams.get("warehouseid");

  try {
    const query = db
      .select({
        id:                   warehouseSections.id,
        warehouseid:          warehouseSections.warehouseid,
        sectionname:          warehouseSections.sectionname,
        sectiontype:          warehouseSections.sectiontype,
        temperaturecontrolled: warehouseSections.temperaturecontrolled,
        createdat:            warehouseSections.createdat,
        warehousename:        warehouses.name,
      })
      .from(warehouseSections)
      .leftJoin(warehouses, eq(warehouseSections.warehouseid, warehouses.id));

    const results = warehouseid
      ? await query.where(eq(warehouseSections.warehouseid, warehouseid))
      : await query;

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

// POST /api/sections
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { warehouseid, sectionname, sectiontype, temperaturecontrolled } = body;

    if (!warehouseid || !sectionname?.trim()) {
      return NextResponse.json({ error: "Warehouse and section name are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(warehouseSections)
      .values({ warehouseid, sectionname, sectiontype, temperaturecontrolled: temperaturecontrolled ?? false })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
