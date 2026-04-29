CREATE TABLE "hospital_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"department_id" uuid,
	"batch_number" text,
	"lot_number" text,
	"serial_number" text,
	"quantity" integer DEFAULT 0,
	"unit_cost" numeric(10, 2),
	"expiry_date" date,
	"manufacture_date" date,
	"notes" text,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'general',
	"location" text,
	"manager" text,
	"notes" text,
	"isactive" boolean DEFAULT true,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_dispenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"item_id" uuid,
	"department_id" uuid,
	"quantity" integer DEFAULT 0,
	"dispensed_by" text,
	"patient_name" text,
	"patient_ref" text,
	"bed_number" text,
	"ward_number" text,
	"doctor_name" text,
	"procedure_type" text,
	"surgeon_name" text,
	"anaesthetist" text,
	"case_number" text,
	"notes" text,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_goods_receipt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid DEFAULT 'cec4d702-6dae-4ea5-9a30-ef17842c00fd' NOT NULL,
	"receipt_number" text,
	"order_id" uuid,
	"order_number" text,
	"received_by" text NOT NULL,
	"receipt_date" date DEFAULT now(),
	"supplier_name" text,
	"supplier_email" text,
	"status" text DEFAULT 'PENDING',
	"notes" text,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now(),
	CONSTRAINT "hospital_goods_receipt_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "hospital_goods_receipt_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" uuid NOT NULL,
	"item_id" uuid,
	"item_name" text NOT NULL,
	"uom" text,
	"ordered_qty" integer DEFAULT 0,
	"received_qty" integer DEFAULT 0,
	"unit_cost" numeric(10, 2),
	"batch_number" text,
	"lot_number" text,
	"expiry_date" date,
	"manufacture_date" date,
	"notes" text,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"item_id" uuid,
	"item_name" text,
	"department_id" uuid,
	"action_type" text,
	"quantity" integer,
	"reference_id" text,
	"notes" text,
	"created_by" text,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"generic_name" text,
	"itemcode" text,
	"itemtype" text DEFAULT 'supply',
	"uom" text DEFAULT 'piece',
	"manufacturer" text,
	"supplier_id" text,
	"supplier_name" text,
	"barcode" text,
	"storage_location" text,
	"storage_type" text,
	"atc_code" text,
	"form" text,
	"strength" text,
	"description" text,
	"min_level" integer DEFAULT 0,
	"reorder_level" integer DEFAULT 10,
	"max_level" integer,
	"unit_cost" numeric(10, 2),
	"selling_price" numeric(10, 2),
	"notes" text,
	"isactive" boolean DEFAULT true,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_manufacturers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"country" text,
	"contact_name" text,
	"email" text,
	"phone" text,
	"product_types" text,
	"notes" text,
	"isactive" boolean DEFAULT true,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_order_items_new" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"item_id" uuid,
	"item_name" text NOT NULL,
	"uom" text,
	"ordered_qty" numeric DEFAULT '0',
	"unit_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"notes" text,
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid DEFAULT 'cec4d702-6dae-4ea5-9a30-ef17842c00fd' NOT NULL,
	"order_number" text,
	"ordered_by" text NOT NULL,
	"order_date" date DEFAULT now(),
	"expected_date" date,
	"supplier_id" text,
	"supplier_name" text,
	"supplier_email" text,
	"supplier_phone" text,
	"status" text DEFAULT 'PENDING',
	"notes" text,
	"total_amount" numeric(10, 2) DEFAULT '0',
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now(),
	CONSTRAINT "hospital_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "hospital_stock" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"department_id" uuid,
	"quantity" integer DEFAULT 0,
	"reserved_quantity" integer DEFAULT 0,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_storage_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"department_id" uuid,
	"name" text NOT NULL,
	"location" text,
	"type" text DEFAULT 'shelf',
	"temperature" text,
	"notes" text,
	"isactive" boolean DEFAULT true,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_transfer_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"item_id" uuid,
	"item_name" text,
	"quantity" text DEFAULT '0',
	"createdat" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"transfer_number" text,
	"to_department_id" uuid,
	"sent_by" text,
	"received_by" text,
	"status" text DEFAULT 'PENDING',
	"notes" text,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hospital_batches" ADD CONSTRAINT "hospital_batches_item_id_hospital_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."hospital_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_batches" ADD CONSTRAINT "hospital_batches_department_id_hospital_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hospital_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_dispenses" ADD CONSTRAINT "hospital_dispenses_item_id_hospital_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."hospital_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_dispenses" ADD CONSTRAINT "hospital_dispenses_department_id_hospital_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hospital_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_goods_receipt" ADD CONSTRAINT "hospital_goods_receipt_order_id_hospital_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."hospital_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_goods_receipt_items" ADD CONSTRAINT "hospital_goods_receipt_items_receipt_id_hospital_goods_receipt_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."hospital_goods_receipt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_history" ADD CONSTRAINT "hospital_history_item_id_hospital_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."hospital_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_history" ADD CONSTRAINT "hospital_history_department_id_hospital_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hospital_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_order_items_new" ADD CONSTRAINT "hospital_order_items_new_order_id_hospital_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."hospital_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_stock" ADD CONSTRAINT "hospital_stock_item_id_hospital_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."hospital_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_stock" ADD CONSTRAINT "hospital_stock_department_id_hospital_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hospital_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_storage_locations" ADD CONSTRAINT "hospital_storage_locations_department_id_hospital_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hospital_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_transfer_items" ADD CONSTRAINT "hospital_transfer_items_transfer_id_hospital_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."hospital_transfers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_transfers" ADD CONSTRAINT "hospital_transfers_to_department_id_hospital_departments_id_fk" FOREIGN KEY ("to_department_id") REFERENCES "public"."hospital_departments"("id") ON DELETE no action ON UPDATE no action;