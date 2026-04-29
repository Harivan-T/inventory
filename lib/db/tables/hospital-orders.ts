import { pgTable, uuid, text, date, numeric, timestamp } from "drizzle-orm/pg-core";

export const hospitalOrders = pgTable("hospital_orders", {
  id:            uuid("id").primaryKey().defaultRandom(),
  workspaceId:   uuid("workspace_id").notNull().default("cec4d702-6dae-4ea5-9a30-ef17842c00fd" as any),
  orderNumber:   text("order_number").unique(),
  orderedBy:     text("ordered_by").notNull(),
  orderDate:     date("order_date").defaultNow(),
  expectedDate:  date("expected_date"),
  supplierId:    text("supplier_id"),
  supplierName:  text("supplier_name"),
  supplierEmail: text("supplier_email"),
  supplierPhone: text("supplier_phone"),
  status:        text("status").default("PENDING"),
  notes:         text("notes"),
  totalAmount:   numeric("total_amount", { precision: 10, scale: 2 }).default("0"),
  createdAt:     timestamp("createdat").defaultNow(),
  updatedAt:     timestamp("updatedat").defaultNow(),
});

export const hospitalOrderItems = pgTable("hospital_order_items_new", {
  id:          uuid("id").primaryKey().defaultRandom(),
  orderId:     uuid("order_id").notNull().references(() => hospitalOrders.id),
  itemId:      uuid("item_id"),
  itemName:    text("item_name").notNull(),
  uom:         text("uom"),
  orderedQty:  numeric("ordered_qty").default("0"),
  unitCost:    numeric("unit_cost", { precision: 10, scale: 2 }),
  totalCost:   numeric("total_cost", { precision: 10, scale: 2 }),
  notes:       text("notes"),
  createdAt:   timestamp("createdat").defaultNow(),
});
