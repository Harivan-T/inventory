import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, suppliers } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";

const WORKSPACE_ID = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search   = searchParams.get("search") ?? "";
    const type     = searchParams.get("type") ?? "";
    const category = searchParams.get("category") ?? "";

    const conditions: any[] = [eq(items.isactive, true)];
    if (search)   conditions.push(or(ilike(items.name, `%${search}%`), ilike(items.itemcode, `%${search}%`)));
    if (type)     conditions.push(eq(items.itemtype, type as any));
    if (category) conditions.push(eq(items.inventorycategory, category as any));

    const rows = await db
      .select()
      .from(items)
      .where(and(...conditions))
      .orderBy(items.name);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Items GET error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, itemcode, itemtype, inventorycategory, uom, ...rest } = body;

    if (!name || !itemcode || !itemtype || !inventorycategory || !uom) {
      return NextResponse.json({ error: "name, itemcode, itemtype, inventorycategory and uom are required" }, { status: 400 });
    }

    const [created] = await db.insert(items).values({
      workspaceid: WORKSPACE_ID,
      name, itemcode, itemtype, inventorycategory, uom, ...rest,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Items POST error:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const [updated] = await db.update(items)
      .set({ ...updates, updatedat: new Date() })
      .where(eq(items.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Items PATCH error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await db.update(items).set({ isactive: false, updatedat: new Date() }).where(eq(items.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Items DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
