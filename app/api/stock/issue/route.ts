import { NextResponse } from "next/server";
import { localDb as db, neonDb } from "@/lib/db";
import { inventoryStock, stockTransactions } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET /api/stock/issue — get departments and employees from Neon
export async function GET() {
  try {
    const [departments, employees] = await Promise.all([
      neonDb.execute(sql`SELECT id, name FROM departments`),
      neonDb.execute(sql`SELECT id, name FROM employees`),
    ]);

    return NextResponse.json({
      departments: departments.rows ?? [],
      employees:   employees.rows ?? [],
    });
  } catch (error) {
    console.error("Issue stock GET error:", error);
    // Return empty if Neon tables don't exist yet
    return NextResponse.json({ departments: [], employees: [] });
  }
}

// POST /api/stock/issue
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemid, warehouseid, batchid, quantity, departmentid, issuedby, notes } = body;

    if (!itemid || !warehouseid || !quantity) {
      return NextResponse.json({ error: "itemid, warehouseid and quantity are required" }, { status: 400 });
    }

    // Check available stock
    const stockQuery = db
      .select()
      .from(inventoryStock)
      .where(and(
        eq(inventoryStock.itemid,      itemid),
        eq(inventoryStock.warehouseid, warehouseid),
        ...(batchid ? [eq(inventoryStock.batchid, batchid)] : []),
      ));

    const stockRecord = await stockQuery.then(r => r[0]);

    if (!stockRecord || stockRecord.quantity < Number(quantity)) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // 1. Insert STOCK_OUT transaction
    await db.insert(stockTransactions).values({
      itemid,
      warehouseid,
      batchid:         batchid ?? null,
      transactiontype: "STOCK_OUT",
      quantity:        Number(quantity),
      referencetype:   departmentid ? "department" : null,
      referenceid:     departmentid ?? null,
      notes,
      createdby:       issuedby,
    });

    // 2. Reduce inventory stock
    await db
      .update(inventoryStock)
      .set({
        quantity:    stockRecord.quantity - Number(quantity),
        lastupdated: new Date(),
      })
      .where(eq(inventoryStock.id, stockRecord.id));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Issue stock error:", error);
    return NextResponse.json({ error: "Failed to issue stock" }, { status: 500 });
  }
}
