// ─── /api/lab/reagents/route.ts ───────────────────────────────────────────────
import { NextResponse } from "next/server";
import { localDb as db } from "@/lib/db";
import { reagentAssignments, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id:                  reagentAssignments.id,
        analyzername:        reagentAssignments.analyzername,
        testtype:            reagentAssignments.testtype,
        consumptionpertest:  reagentAssignments.consumptionpertest,
        criticalflag:        reagentAssignments.criticalflag,
        isactive:            reagentAssignments.isactive,
        createdat:           reagentAssignments.createdat,
        reagentname:         items.name,
        itemcode:            items.itemcode,
        itemid:              items.id,
      })
      .from(reagentAssignments)
      .leftJoin(items, eq(reagentAssignments.itemid, items.id))
      .orderBy(reagentAssignments.analyzername);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Reagent GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reagents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { itemid, analyzername, testtype, consumptionpertest, criticalflag } = await req.json();
    if (!itemid || !analyzername) return NextResponse.json({ error: "itemid and analyzername required" }, { status: 400 });
    const [row] = await db.insert(reagentAssignments).values({
      itemid, analyzername, testtype: testtype || null,
      consumptionpertest: consumptionpertest ? String(consumptionpertest) : null,
      criticalflag: criticalflag ?? false,
    }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("Reagent POST error:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, isactive } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db.update(reagentAssignments).set({ isactive }).where(eq(reagentAssignments.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reagent PATCH error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
