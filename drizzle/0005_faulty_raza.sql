CREATE TYPE "public"."grn_status" AS ENUM('draft', 'confirmed', 'posted');--> statement-breakpoint
CREATE TYPE "public"."po_status" AS ENUM('draft', 'approved', 'sent', 'partial', 'complete', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."pr_status" AS ENUM('draft', 'pending', 'approved', 'rejected', 'converted');--> statement-breakpoint
CREATE TYPE "public"."warehouse_type" AS ENUM('hospital', 'pharmacy', 'lab', 'radiology');--> statement-breakpoint
CREATE TABLE "goods_receipt_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grnnumber" text NOT NULL,
	"poid" uuid,
	"vendorid" uuid,
	"warehouseid" uuid,
	"status" "grn_status" DEFAULT 'draft',
	"receiptdate" timestamp with time zone DEFAULT now(),
	"invoicenumber" text,
	"invoicedate" timestamp with time zone,
	"receivedby" text,
	"notes" text,
	"createdat" timestamp with time zone DEFAULT now(),
	"updatedat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grn_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grnid" uuid,
	"itemid" uuid,
	"poitemid" uuid,
	"orderedqty" integer,
	"receivedqty" integer NOT NULL,
	"rejectedqty" integer DEFAULT 0,
	"unitprice" numeric(10, 4),
	"batchnumber" text,
	"expirydate" timestamp with time zone,
	"manufacturedate" timestamp with time zone,
	"notes" text,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poid" uuid,
	"itemid" uuid,
	"orderedqty" integer NOT NULL,
	"receivedqty" integer DEFAULT 0,
	"unitprice" numeric(10, 4) NOT NULL,
	"totalamount" numeric(12, 4),
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ponumber" text NOT NULL,
	"vendorid" uuid,
	"prid" uuid,
	"warehouseid" uuid,
	"status" "po_status" DEFAULT 'draft',
	"orderdate" timestamp with time zone DEFAULT now(),
	"expecteddate" timestamp with time zone,
	"totalamount" numeric(12, 4) DEFAULT '0',
	"currency" text DEFAULT 'USD',
	"paymentterms" integer DEFAULT 30,
	"shippingaddress" text,
	"notes" text,
	"approvedby" text,
	"sentby" text,
	"createdat" timestamp with time zone DEFAULT now(),
	"updatedat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_requisition_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prid" uuid,
	"itemid" uuid,
	"requestedqty" integer NOT NULL,
	"approvedqty" integer,
	"estimatedprice" numeric(10, 4),
	"notes" text,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_requisitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prnumber" text NOT NULL,
	"warehouseid" uuid,
	"requestedby" text,
	"approvedby" text,
	"status" "pr_status" DEFAULT 'draft',
	"priority" text DEFAULT 'normal',
	"requiredddate" timestamp with time zone,
	"notes" text,
	"createdat" timestamp with time zone DEFAULT now(),
	"updatedat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "radiology_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"batch_id" uuid,
	"procedure_name" text NOT NULL,
	"procedure_type" text,
	"patient_ref" text,
	"quantity_used" numeric(10, 4) NOT NULL,
	"performed_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendorid" uuid,
	"itemid" uuid,
	"unitprice" numeric(10, 4) NOT NULL,
	"currency" text DEFAULT 'USD',
	"minorderqty" integer DEFAULT 1,
	"leadtimedays" integer DEFAULT 7,
	"validfrom" timestamp with time zone,
	"validto" timestamp with time zone,
	"isactive" boolean DEFAULT true,
	"createdat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"contactname" text,
	"phone" text,
	"email" text,
	"address" text,
	"country" text,
	"paymentterms" integer DEFAULT 30,
	"currency" text DEFAULT 'USD',
	"taxnumber" text,
	"rating" integer DEFAULT 0,
	"isactive" boolean DEFAULT true,
	"notes" text,
	"createdat" timestamp with time zone DEFAULT now(),
	"updatedat" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "warehouse_sections" ADD COLUMN "bin_location" text;--> statement-breakpoint
ALTER TABLE "warehouse_sections" ADD COLUMN "shelf" text;--> statement-breakpoint
ALTER TABLE "warehouse_sections" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "warehouse_type" "warehouse_type" DEFAULT 'hospital';--> statement-breakpoint
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_poid_purchase_orders_id_fk" FOREIGN KEY ("poid") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_vendorid_vendors_id_fk" FOREIGN KEY ("vendorid") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_warehouseid_warehouses_id_fk" FOREIGN KEY ("warehouseid") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_grnid_goods_receipt_notes_id_fk" FOREIGN KEY ("grnid") REFERENCES "public"."goods_receipt_notes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_itemid_items_id_fk" FOREIGN KEY ("itemid") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_poitemid_purchase_order_items_id_fk" FOREIGN KEY ("poitemid") REFERENCES "public"."purchase_order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_poid_purchase_orders_id_fk" FOREIGN KEY ("poid") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_itemid_items_id_fk" FOREIGN KEY ("itemid") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendorid_vendors_id_fk" FOREIGN KEY ("vendorid") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_prid_purchase_requisitions_id_fk" FOREIGN KEY ("prid") REFERENCES "public"."purchase_requisitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_warehouseid_warehouses_id_fk" FOREIGN KEY ("warehouseid") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_prid_purchase_requisitions_id_fk" FOREIGN KEY ("prid") REFERENCES "public"."purchase_requisitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_itemid_items_id_fk" FOREIGN KEY ("itemid") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_warehouseid_warehouses_id_fk" FOREIGN KEY ("warehouseid") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_procedures" ADD CONSTRAINT "radiology_procedures_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_procedures" ADD CONSTRAINT "radiology_procedures_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_procedures" ADD CONSTRAINT "radiology_procedures_batch_id_item_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."item_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_contracts" ADD CONSTRAINT "vendor_contracts_vendorid_vendors_id_fk" FOREIGN KEY ("vendorid") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_contracts" ADD CONSTRAINT "vendor_contracts_itemid_items_id_fk" FOREIGN KEY ("itemid") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;