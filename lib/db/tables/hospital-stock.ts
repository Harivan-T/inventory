import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { hospitalItems } from "./hospital-items";
import { hospitalDepartments } from "./hospital-departments";

export const hospitalStock = pgTable("hospital_stock", {
  id:               uuid("id").primaryKey().defaultRandom(),
  itemId:           uuid("item_id").notNull().references(() => hospitalItems.id),
  departmentId:     uuid("department_id").references(() => hospitalDepartments.id),
  quantity:         integer("quantity").default(0),
  reservedQuantity: integer("reserved_quantity").default(0),
  lastUpdated:      timestamp("last_updated").defaultNow(),
});
