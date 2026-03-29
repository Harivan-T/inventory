import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const rows = await db
      .select()
      .from(vendors)
      .where(
        search
          ? or(ilike(vendors.name, `%${search}%`), ilike(vendors.email, `%${search}%`))
          : eq(vendors.isactive, true)
      )
      .orderBy(vendors.name);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, contactname, phone, email, address, country, paymentterms, currency, taxnumber, notes } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
    const [created] = await db.insert(vendors).values({
      name, code, contactname, phone, email, address, country,
      paymentterms: paymentterms ?? 30,
      currency: currency ?? "USD",
      taxnumber, notes,
    }).returning();
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const [updated] = await db.update(vendors).set({ ...updates, updatedat: new Date() }).where(eq(vendors.id, id)).returning();
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db.update(vendors).set({ isactive: false }).where(eq(vendors.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
