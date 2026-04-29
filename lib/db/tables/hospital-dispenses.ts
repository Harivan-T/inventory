import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { hospitalItems } from "./hospital-items";
import { hospitalDepartments } from "./hospital-departments";

export const hospitalDispenses = pgTable("hospital_dispenses", {
  id:            uuid("id").primaryKey().defaultRandom(),
  workspaceId:   uuid("workspace_id").notNull(),
  itemId:        uuid("item_id").references(() => hospitalItems.id),
  departmentId:  uuid("department_id").references(() => hospitalDepartments.id),
  quantity:      integer("quantity").default(0),
  dispensedBy:   text("dispensed_by"),
  patientName:   text("patient_name"),
  patientRef:    text("patient_ref"),
  bedNumber:     text("bed_number"),
  wardNumber:    text("ward_number"),
  doctorName:    text("doctor_name"),
  procedureType: text("procedure_type"),
  surgeonName:   text("surgeon_name"),
  anaesthetist:  text("anaesthetist"),
  caseNumber:    text("case_number"),
  notes:         text("notes"),
  createdat:     timestamp("createdat").defaultNow(),
});
