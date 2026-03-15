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
      .orderBy(items.name// ─── /api/pharmacy/recalls/route.ts ──────────────────────────────────────────
import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { batchQuarantine, itemBatches, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id:             batchQuarantine.id,
        reason:         batchQuarantine.reason,
        quarantinedby:  batchQuarantine.quarantinedby,
        resolvedby:     batchQuarantine.resolvedby,
        resolvedat:     batchQuarantine.resolvedat,
        isresolved:     batchQuarantine.isresolved,
        notes:          batchQuarantine.notes,
        createdat:      batchQuarantine.createdat,
        batchnumber:    itemBatches.batchnumber,
        itemname:       items.name,
      })
      .from(batchQuarantine)
      .leftJoin(itemBatches, eq(batchQuarantine.batchid, itemBatches.id))
      .leftJoin(items,       eq(batchQuarantine.itemid,  items.id))
      .orderBy(batchQuarantine.createdat);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { batchid, itemid, reason, quarantinedby, notes } = await req.json();
    if (!batchid || !reason) return NextResponse.json({ error: "batchid and reason required" }, { status: 400 });
    const [row] = await db.insert(batchQuarantine).values({ batchid, itemid: itemid ?? null, reason, quarantinedby, notes }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, resolvedby } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db.update(batchQuarantine)
      .set({ isresolved: true, resolvedby, resolvedat: new Date() })
      .where(eq(batchQuarantine.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
);
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
