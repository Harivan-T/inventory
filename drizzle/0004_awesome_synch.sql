CREATE TABLE "lab_consumption_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"store_id" uuid,
	"batch_id" uuid,
	"test_count" integer DEFAULT 1 NOT NULL,
	"quantity_consumed" numeric(10, 4) NOT NULL,
	"patient_ref" text,
	"sample_ref" text,
	"run_notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "inventory_stock" DROP CONSTRAINT "inventory_stock_item_id_drugs_drugid_fk";
--> statement-breakpoint
ALTER TABLE "item_batches" DROP CONSTRAINT "item_batches_item_id_drugs_drugid_fk";
--> statement-breakpoint
ALTER TABLE "stock_adjustments" DROP CONSTRAINT "stock_adjustments_item_id_drugs_drugid_fk";
--> statement-breakpoint
ALTER TABLE "stock_transactions" DROP CONSTRAINT "stock_transactions_item_id_drugs_drugid_fk";
--> statement-breakpoint
ALTER TABLE "stock_transfers" DROP CONSTRAINT "stock_transfers_item_id_drugs_drugid_fk";
--> statement-breakpoint
ALTER TABLE "item_batches" ADD COLUMN "warehouse_id" uuid;--> statement-breakpoint
ALTER TABLE "item_batches" ADD COLUMN "quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "item_batches" ADD COLUMN "unit_cost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "item_batches" ADD COLUMN "selling_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "item_batches" ADD COLUMN "is_quarantined" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "single_use" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "sterile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "asset_category" text;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "serial_number" text;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "contrast_type" text;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "analyzer_compat" text;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "critical_reagent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "reagent_assignments" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "reagent_assignments" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "stock_transactions" ADD COLUMN "patient_ref" text;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD COLUMN "prescription_ref" text;--> statement-breakpoint
ALTER TABLE "lab_consumption_log" ADD CONSTRAINT "lab_consumption_log_assignment_id_reagent_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."reagent_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_consumption_log" ADD CONSTRAINT "lab_consumption_log_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_consumption_log" ADD CONSTRAINT "lab_consumption_log_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_consumption_log" ADD CONSTRAINT "lab_consumption_log_batch_id_item_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."item_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_category_drug_categories_categoryid_fk" FOREIGN KEY ("category") REFERENCES "public"."drug_categories"("categoryid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_batches" ADD CONSTRAINT "item_batches_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_batches" ADD CONSTRAINT "item_batches_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;