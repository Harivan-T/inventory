import { pgTable, uuid, text, date, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { hospitalOrders } from "./hospital-orders";

export const hospitalGoodsReceipt = pgTable("hospital_goods_receipt", {
  id:            uuid("id").primaryKey().defaultRandom(),
  workspaceId:   uuid("workspace_id").notNull().default("cec4d702-6dae-4ea5-9a30-ef17842c00fd" as any),
  receiptNumber: text("receipt_number").unique(),
  orderId:       uuid("order_id").references(() => hospitalOrders.id),
  orderNumber:   text("order_number"),
  receivedBy:    text("received_by").notNull(),
  receiptDate:   date("receipt_date").defaultNow(),
  supplierName:  text("supplier_name"),
  supplierEmail: text("supplier_email"),
  status:        text("status").default("PENDING"), // PENDING/PARTIAL/COMPLETE
  notes:         text("notes"),
  createdAt:     timestamp("createdat").defaultNow(),
  updatedAt:     timestamp("updatedat").defaultNow(),
});

export const hospitalGoodsReceiptItems = pgTable("hospital_goods_receipt_items", {
  id:              uuid("id").primaryKey().defaultRandom(),
  receiptId:       uuid("receipt_id").notNull().references(() => hospitalGoodsReceipt.id),
  itemId:          uuid("item_id"),
  itemName:        text("item_name").notNull(),
  uom:             text("uom"),
  orderedQty:      integer("ordered_qty").default(0),
  receivedQty:     integer("received_qty").default(0),
  unitCost:        numeric("unit_cost", { precision: 10, scale: 2 }),
  batchNumber:     text("batch_number"),
  lotNumber:       text("lot_number"),
  expiryDate:      date("expiry_date"),
  manufactureDate: date("manufacture_date"),
  notes:           text("notes"),
  createdAt:       timestamp("createdat").defaultNow(),
});
