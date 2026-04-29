import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const hospitalManufacturers = pgTable("hospital_manufacturers", {
  id:           uuid("id").primaryKey().defaultRandom(),
  workspaceId:  uuid("workspace_id").notNull(),
  name:         text("name").notNull(),
  code:         text("code"),
  country:      text("country"),
  contactName:  text("contact_name"),
  email:        text("email"),
  phone:        text("phone"),
  productTypes: text("product_types"),
  notes:        text("notes"),
  isactive:     boolean("isactive").default(true),
  createdat:    timestamp("createdat").defaultNow(),
  updatedat:    timestamp("updatedat").defaultNow(),
});
