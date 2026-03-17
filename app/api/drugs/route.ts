import { NextResponse } from "next/server";
import { neonDb, localDb } from "@/lib/db";
import { drugs } from "@/lib/db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";

// GET /api/drugs?search=xxx — reads from Neon
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    const results = await neonDb
      .select()
      .from(drugs)
      .where(
        search
          ? or(
              ilike(drugs.name, `%${search}%`),
              ilike(drugs.genericname, `%${search}%`),
              ilike(drugs.manufacturer, `%${search}%`),
              ilike(drugs.atccode, `%${search}%`)
            )
          : undefined
      )
      .orderBy(sql`${drugs.createdat} DESC`);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch drugs" }, { status: 500 });
  }
}

// POST /api/drugs — writes to local
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const [newDrug] = await localDb
      .insert(drugs)
      .values({
        workspaceid: "cec4d702-6dae-4ea5-9a30-ef17842c00fd",
        name: body.name,
        genericname: body.genericname,
        atccode: body.atccode,
        form: body.form,
        strength: body.strength,
        unit: body.unit,
        barcode: body.barcode,
        manufacturer: body.manufacturer,
        requiresprescription: body.requiresprescription ?? false,
        insuranceapproved: body.insuranceapproved ?? false,
        isactive: true,
        description: body.description,
        indication: body.indication,
        warning: body.warning,
        notes: body.notes,
        metadata: body.metadata ?? {},
      })
      .returning();

    return NextResponse.json(newDrug, { status: 201 });
  } catch (error) {
    console.error("Add drug error:", error);
    return NextResponse.json({ error: "Failed to add drug" }, { status: 500 });
  }
}

// PATCH /api/drugs — writes to local
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { drugid, ...updates } = body;

    if (!drugid) return NextResponse.json({ error: "drugid required" }, { status: 400 });

    const [updated] = await localDb
      .update(drugs)
      .set({ ...updates, updatedat: new Date() })
      .where(eq(drugs.drugid, drugid))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update drug" }, { status: 500 });
  }
}

// DELETE /api/drugs?id=xxx — writes to local
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await localDb
      .update(drugs)
      .set({ isactive: false, updatedat: new Date() })
      .where(eq(drugs.drugid, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete drug" }, { status: 500 });
  }
}
