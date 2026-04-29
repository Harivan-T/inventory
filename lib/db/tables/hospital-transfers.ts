import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { hospitalDepartments } from "./hospital-departments";

export const hospitalTransfers = pgTable("hospital_transfers", {
  id:             uuid("id").primaryKey().defaultRandom(),
  workspaceId:    uuid("workspace_id").notNull(),
  transferNumber: text("transfer_number"),
  toDepartmentId: uuid("to_department_id").references(() => hospitalDepartments.id),
  sentBy:         text("sent_by"),
  receivedBy:     text("received_by"),
  status:         text("status").default("PENDING"),
  notes:          text("notes"),
  createdat:      timestamp("createdat").defaultNow(),
  updatedat:      timestamp("updatedat").defaultNow(),
});

export const hospitalTransferItems = pgTable("hospital_transfer_items", {
  id:         uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id").notNull().references(() => hospitalTransfers.id),
  itemId:     uuid("item_id"),
  itemName:   text("item_name"),
  quantity:   text("quantity").default("0"),
  createdat:  timestamp("createdat").defaultNow(),
});
