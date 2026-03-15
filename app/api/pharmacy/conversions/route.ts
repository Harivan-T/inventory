// ─── /api/pharmacy/conversions/route.ts ──────────────────────────────────────
import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { unitConversions, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id:        unitConversions.id,
        fromuom:   unitConversions.fromuom,
        touom:     unitConversions.touom,
        factor:    unitConversions.factor,
        createdat: unitConversions.createdat,
        itemname:  items.name,
      })
      .from(unitConversions)
      .leftJoin(items, eq(unitConversions.itemid, items.id))
      .orderBy(items.name);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { itemid, fromuom, touom, factor } = await req.json();
    if (!itemid || !fromuom || !touom || !factor) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    const [row] = await db.insert(unitConversions).values({ itemid, fromuom, touom, factor: String(factor) }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
