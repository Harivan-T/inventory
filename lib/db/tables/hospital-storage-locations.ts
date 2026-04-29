import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { hospitalDepartments } from "./hospital-departments";

export const hospitalStorageLocations = pgTable("hospital_storage_locations", {
  id:           uuid("id").primaryKey().defaultRandom(),
  workspaceId:  uuid("workspace_id").notNull(),
  departmentId: uuid("department_id").references(() => hospitalDepartments.id),
  name:         text("name").notNull(),
  location:     text("location"),
  type:         text("type").default("shelf"),
  temperature:  text("temperature"),
  notes:        text("notes"),
  isactive:     boolean("isactive").default(true),
  createdat:    timestamp("createdat").defaultNow(),
  updatedat:    timestamp("updatedat").defaultNow(),
});
