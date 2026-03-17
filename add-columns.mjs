import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await pool.query(`DO $$ BEGIN CREATE TYPE item_type AS ENUM ('drug','supply','consumable','reagent','asset','radiology'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await pool.query(`DO $$ BEGIN CREATE TYPE inventory_category AS ENUM ('pharmacy','lab','hospital','radiology'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await pool.query(`DO $$ BEGIN CREATE TYPE store_type AS ENUM ('main','sub'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await pool.query(`DO $$ BEGIN CREATE TYPE requisition_status AS ENUM ('pending','approved','rejected','fulfilled','partial'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    console.log("✓ enums");

    await pool.query(`CREATE TABLE IF NOT EXISTS workspaces (workspaceid uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, isactive boolean DEFAULT true, createdat timestamptz DEFAULT now());`);
    console.log("✓ workspaces");

    await pool.query(`CREATE TABLE IF NOT EXISTS suppliers (supplierid uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, isactive boolean DEFAULT true, createdat timestamptz DEFAULT now());`);
    console.log("✓ suppliers");

    await pool.query(`CREATE TABLE IF NOT EXISTS items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid, item_code text NOT NULL, name text NOT NULL, generic_name text, description text, item_type item_type NOT NULL, inventory_category inventory_category NOT NULL, uom text NOT NULL, secondary_uom text, tertiary_uom text, min_level integer DEFAULT 0, max_level integer, reorder_level integer DEFAULT 0, batch_tracking boolean DEFAULT true, serial_tracking boolean DEFAULT false, expiry_tracking boolean DEFAULT true, controlled boolean DEFAULT false, hazardous boolean DEFAULT false, manufacturer text, supplier_id uuid, barcode text, drug_id uuid, single_use boolean DEFAULT false, sterile boolean DEFAULT false, asset_category text, serial_number text, contrast_type text, analyzer_compat text, critical_reagent boolean DEFAULT false, is_active boolean DEFAULT true, metadata jsonb DEFAULT '{}', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());`);
    console.log("✓ items");

    await pool.query(`CREATE TABLE IF NOT EXISTS warehouses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, location text, manager text, description text, isactive boolean DEFAULT true, createdat timestamptz DEFAULT now(), updatedat timestamptz DEFAULT now());`);
    console.log("✓ warehouses");

    await pool.query(`CREATE TABLE IF NOT EXISTS warehouse_sections (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), warehouse_id uuid REFERENCES warehouses(id), sectionname text NOT NULL, description text, isactive boolean DEFAULT true, createdat timestamptz DEFAULT now());`);
    console.log("✓ warehouse_sections");

    await pool.query(`CREATE TABLE IF NOT EXISTS item_batches (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid REFERENCES items(id), warehouse_id uuid REFERENCES warehouses(id), batch_number text NOT NULL, lot_number text, manufacture_date date, expiry_date date, quantity integer DEFAULT 0, unit_cost decimal(10,4), supplier_id uuid, notes text, created_at timestamptz DEFAULT now());`);
    console.log("✓ item_batches");

    await pool.query(`CREATE TABLE IF NOT EXISTS inventory_stock (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid REFERENCES items(id), warehouse_id uuid REFERENCES warehouses(id), batch_id uuid REFERENCES item_batches(id), quantity integer DEFAULT 0, reserved_quantity integer DEFAULT 0, last_updated timestamptz DEFAULT now());`);
    console.log("✓ inventory_stock");

    await pool.query(`CREATE TABLE IF NOT EXISTS stock_transactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid REFERENCES items(id), warehouse_id uuid REFERENCES warehouses(id), batch_id uuid REFERENCES item_batches(id), transaction_type text NOT NULL, quantity integer NOT NULL, reference_type text, reference_id text, notes text, created_by text, created_at timestamptz DEFAULT now());`);
    console.log("✓ stock_transactions");

    await pool.query(`CREATE TABLE IF NOT EXISTS stock_transfers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid REFERENCES items(id), from_warehouse_id uuid REFERENCES warehouses(id), to_warehouse_id uuid REFERENCES warehouses(id), batch_id uuid REFERENCES item_batches(id), quantity integer NOT NULL, notes text, created_by text, created_at timestamptz DEFAULT now());`);
    console.log("✓ stock_transfers");

    await pool.query(`CREATE TABLE IF NOT EXISTS stock_adjustments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid REFERENCES items(id), warehouse_id uuid REFERENCES warehouses(id), batch_id uuid REFERENCES item_batches(id), quantity integer NOT NULL, reason text, notes text, created_by text, created_at timestamptz DEFAULT now());`);
    console.log("✓ stock_adjustments");

    await pool.query(`CREATE TABLE IF NOT EXISTS stores (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid, name text NOT NULL, store_type store_type DEFAULT 'sub', department text, warehouse_id uuid REFERENCES warehouses(id), manager text, location text, description text, is_active boolean DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());`);
    console.log("✓ stores");

    await pool.query(`CREATE TABLE IF NOT EXISTS store_stock (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), store_id uuid REFERENCES stores(id), item_id uuid REFERENCES items(id), batch_id uuid REFERENCES item_batches(id), quantity integer DEFAULT 0, reserved_quantity integer DEFAULT 0, last_updated timestamptz DEFAULT now());`);
    console.log("✓ store_stock");

    await pool.query(`CREATE TABLE IF NOT EXISTS store_transactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), store_id uuid REFERENCES stores(id), item_id uuid REFERENCES items(id), batch_id uuid REFERENCES item_batches(id), transaction_type text NOT NULL, quantity integer NOT NULL, reference_type text, reference_id text, patient_ref text, prescription_ref text, notes text, created_by text, created_at timestamptz DEFAULT now());`);
    console.log("✓ store_transactions");

    await pool.query(`CREATE TABLE IF NOT EXISTS store_requisitions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), store_id uuid REFERENCES stores(id), warehouse_id uuid REFERENCES warehouses(id), item_id uuid REFERENCES items(id), requested_qty integer NOT NULL, approved_qty integer, fulfilled_qty integer DEFAULT 0, status requisition_status DEFAULT 'pending', requested_by text, approved_by text, notes text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());`);
    console.log("✓ store_requisitions");

    await pool.query(`CREATE TABLE IF NOT EXISTS controlled_drug_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), store_id uuid REFERENCES stores(id), item_id uuid REFERENCES items(id), batch_id uuid REFERENCES item_batches(id), action_type text NOT NULL, quantity integer NOT NULL, patient_ref text, prescription_ref text, dispensed_by text, witnessed_by text, notes text, created_at timestamptz DEFAULT now());`);
    console.log("✓ controlled_drug_log");

    await pool.query(`CREATE TABLE IF NOT EXISTS unit_conversions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid REFERENCES items(id), from_uom text NOT NULL, to_uom text NOT NULL, factor decimal(10,4) NOT NULL, created_at timestamptz DEFAULT now());`);
    console.log("✓ unit_conversions");

    await pool.query(`CREATE TABLE IF NOT EXISTS batch_quarantine (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), batch_id uuid REFERENCES item_batches(id), item_id uuid REFERENCES items(id), reason text NOT NULL, quarantined_by text, resolved_by text, resolved_at timestamptz, is_resolved boolean DEFAULT false, notes text, created_at timestamptz DEFAULT now());`);
    console.log("✓ batch_quarantine");

    await pool.query(`CREATE TABLE IF NOT EXISTS reagent_assignments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid REFERENCES items(id), analyzer_name text NOT NULL, test_type text, consumption_per_test decimal(10,4), critical_flag boolean DEFAULT false, is_active boolean DEFAULT true, created_at timestamptz DEFAULT now());`);
    console.log("✓ reagent_assignments");

    await pool.query(`CREATE TABLE IF NOT EXISTS lab_consumption_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), assignment_id uuid REFERENCES reagent_assignments(id), item_id uuid REFERENCES items(id), store_id uuid REFERENCES stores(id), batch_id uuid REFERENCES item_batches(id), test_count integer DEFAULT 1, quantity_consumed decimal(10,4) NOT NULL, patient_ref text, sample_ref text, run_notes text, created_by text, created_at timestamptz DEFAULT now());`);
    console.log("✓ lab_consumption_log");

    console.log("\n✅ All done! All Phase 1 tables are ready in Neon.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

run();
