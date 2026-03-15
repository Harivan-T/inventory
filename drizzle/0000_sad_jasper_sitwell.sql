CREATE TYPE "public"."drug_form" AS ENUM('tablet', 'capsule', 'inhaler', 'syrup', 'injection', 'cream', 'drops', 'suppository', 'patch', 'powder');--> statement-breakpoint
CREATE TYPE "public"."pregnancy_category" AS ENUM('A', 'B', 'C', 'D', 'X', 'N');--> statement-breakpoint
CREATE TYPE "public"."storage_type" AS ENUM('room_temperature', 'refrigerated', 'frozen', 'protect_from_light', 'protect_from_moisture');--> statement-breakpoint
CREATE TYPE "public"."traffic" AS ENUM('otc', 'rx', 'controlled', 'narcotic');--> statement-breakpoint
CREATE TABLE "dispensing_log" (
	"logid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drugid" uuid NOT NULL,
	"workspaceid" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"patientref" text,
	"prescriptionref" text,
	"dispensedby" uuid,
	"notes" text,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drug_alternatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drugid" uuid NOT NULL,
	"alternativeid" uuid NOT NULL,
	"reason" text,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drug_categories" (
	"categoryid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceid" uuid,
	"name" text NOT NULL,
	"atcgroup" text,
	"description" text,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drug_interactions" (
	"interactionid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drugid_a" uuid NOT NULL,
	"drugid_b" uuid NOT NULL,
	"severity" text,
	"description" text,
	"clinicaleffect" text,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drug_inventory" (
	"inventoryid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drugid" uuid NOT NULL,
	"workspaceid" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"minquantity" integer DEFAULT 0,
	"maxquantity" integer,
	"unitcost" numeric(10, 2),
	"sellingprice" numeric(10, 2),
	"expirydate" timestamp with time zone,
	"batchnumber" text,
	"location" text,
	"createdat" timestamp with time zone DEFAULT now(),
	"updatedat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drug_suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drugid" uuid NOT NULL,
	"supplierid" uuid NOT NULL,
	"suppliercode" text,
	"leadtimedays" integer,
	"ispreferred" boolean DEFAULT false,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drugs" (
	"drugid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceid" uuid NOT NULL,
	"categoryid" uuid,
	"name" text NOT NULL,
	"genericname" text,
	"atccode" text,
	"nationalcode" text,
	"barcode" text,
	"form" "drug_form",
	"strength" text,
	"unit" text,
	"manufacturer" text,
	"description" text,
	"indication" text,
	"interaction" text,
	"warning" text,
	"sideeffect" text,
	"pregnancy" "pregnancy_category",
	"storagetype" "storage_type",
	"traffic" "traffic",
	"notes" text,
	"requiresprescription" boolean DEFAULT false,
	"insuranceapproved" boolean DEFAULT false,
	"isactive" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"createdat" timestamp with time zone DEFAULT now(),
	"updatedat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"supplierid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceid" uuid,
	"name" text NOT NULL,
	"contactname" text,
	"phone" text,
	"email" text,
	"address" text,
	"isactive" boolean DEFAULT true,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"workspaceid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"isactive" boolean DEFAULT true,
	"createdat" timestamp with time zone DEFAULT now(),
	"updatedat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "dispensing_log" ADD CONSTRAINT "dispensing_log_drugid_drugs_drugid_fk" FOREIGN KEY ("drugid") REFERENCES "public"."drugs"("drugid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensing_log" ADD CONSTRAINT "dispensing_log_workspaceid_workspaces_workspaceid_fk" FOREIGN KEY ("workspaceid") REFERENCES "public"."workspaces"("workspaceid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_alternatives" ADD CONSTRAINT "drug_alternatives_drugid_drugs_drugid_fk" FOREIGN KEY ("drugid") REFERENCES "public"."drugs"("drugid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_alternatives" ADD CONSTRAINT "drug_alternatives_alternativeid_drugs_drugid_fk" FOREIGN KEY ("alternativeid") REFERENCES "public"."drugs"("drugid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_categories" ADD CONSTRAINT "drug_categories_workspaceid_workspaces_workspaceid_fk" FOREIGN KEY ("workspaceid") REFERENCES "public"."workspaces"("workspaceid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_drugid_a_drugs_drugid_fk" FOREIGN KEY ("drugid_a") REFERENCES "public"."drugs"("drugid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_drugid_b_drugs_drugid_fk" FOREIGN KEY ("drugid_b") REFERENCES "public"."drugs"("drugid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_inventory" ADD CONSTRAINT "drug_inventory_drugid_drugs_drugid_fk" FOREIGN KEY ("drugid") REFERENCES "public"."drugs"("drugid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_inventory" ADD CONSTRAINT "drug_inventory_workspaceid_workspaces_workspaceid_fk" FOREIGN KEY ("workspaceid") REFERENCES "public"."workspaces"("workspaceid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_suppliers" ADD CONSTRAINT "drug_suppliers_drugid_drugs_drugid_fk" FOREIGN KEY ("drugid") REFERENCES "public"."drugs"("drugid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_suppliers" ADD CONSTRAINT "drug_suppliers_supplierid_suppliers_supplierid_fk" FOREIGN KEY ("supplierid") REFERENCES "public"."suppliers"("supplierid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_workspaceid_workspaces_workspaceid_fk" FOREIGN KEY ("workspaceid") REFERENCES "public"."workspaces"("workspaceid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_categoryid_drug_categories_categoryid_fk" FOREIGN KEY ("categoryid") REFERENCES "public"."drug_categories"("categoryid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_workspaceid_workspaces_workspaceid_fk" FOREIGN KEY ("workspaceid") REFERENCES "public"."workspaces"("workspaceid") ON DELETE no action ON UPDATE no action;