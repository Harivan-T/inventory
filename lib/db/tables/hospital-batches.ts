import { pgTable, uuid, text, integer, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { hospitalItems } from "./hospital-items";
import { hospitalDepartments } from "./hospital-departments";

export const hospitalBatches = pgTable("hospital_batches", {
  id:              uuid("id").primaryKey().defaultRandom(),
  itemId:          uuid("item_id").notNull().references(() => hospitalItems.id),
  departmentId:    uuid("department_id").references(() => hospitalDepartments.id),
  batchNumber:     text("batch_number"),
  lotNumber:       text("lot_number"),
  serialNumber:    text("serial_number"),
  quantity:        integer("quantity").default(0),
  unitCost:        numeric("unit_cost", { precision: 10, scale: 2 }),
  expiryDate:      date("expiry_date"),
  manufactureDate: date("manufacture_date"),
  notes:           text("notes"),
  createdat:       timestamp("createdat").defaultNow(),
});
