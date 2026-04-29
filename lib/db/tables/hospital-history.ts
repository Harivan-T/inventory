import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { hospitalItems } from "./hospital-items";
import { hospitalDepartments } from "./hospital-departments";

export const hospitalHistory = pgTable("hospital_history", {
  id:           uuid("id").primaryKey().defaultRandom(),
  workspaceId:  uuid("workspace_id").notNull(),
  itemId:       uuid("item_id").references(() => hospitalItems.id),
  itemName:     text("item_name"),
  departmentId: uuid("department_id").references(() => hospitalDepartments.id),
  actionType:   text("action_type"),
  quantity:     integer("quantity"),
  referenceId:  text("reference_id"),
  notes:        text("notes"),
  createdBy:    text("created_by"),
  createdat:    timestamp("createdat").defaultNow(),
});
