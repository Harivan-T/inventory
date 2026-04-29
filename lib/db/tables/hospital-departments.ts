import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const hospitalDepartments = pgTable("hospital_departments", {
  id:          uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull(),
  name:        text("name").notNull(),
  type:        text("type").default("general"),
  location:    text("location"),
  manager:     text("manager"),
  notes:       text("notes"),
  isactive:    boolean("isactive").default(true),
  createdat:   timestamp("createdat").defaultNow(),
  updatedat:   timestamp("updatedat").defaultNow(),
});
