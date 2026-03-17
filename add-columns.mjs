import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await pool.query(`
      ALTER TABLE items 
      ADD COLUMN IF NOT EXISTS single_use boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS sterile boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS asset_category text,
      ADD COLUMN IF NOT EXISTS serial_number text,
      ADD COLUMN IF NOT EXISTS contrast_type text,
      ADD COLUMN IF NOT EXISTS analyzer_compat text,
      ADD COLUMN IF NOT EXISTS critical_reagent boolean DEFAULT false;
    `);
    console.log("✓ items columns added");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id uuid,
        name text NOT NULL,
        store_type text DEFAULT 'sub',
        department text,
        warehouse_id uuid,
        manager text,
        location text,
        description text,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);
    console.log("✓ stores table");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_stock (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid REFERENCES stores(id),
        item_id uuid REFERENCES items(id),
        batch_id uuid,
        quantity integer DEFAULT 0,
        reserved_quantity integer DEFAULT 0,
        last_updated timestamptz DEFAULT now()
      );
    `);
    console.log("✓ store_stock table");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid REFERENCES stores(id),
        item_id uuid REFERENCES items(id),
        batch_id uuid,
        transaction_type text NOT NULL,
        quantity integer NOT NULL,
        reference_type text,
        reference_id text,
        patient_ref text,
        prescription_ref text,
        notes text,
        created_by text,
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log("✓ store_transactions table");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_requisitions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid REFERENCES stores(id),
        warehouse_id uuid,
        item_id uuid REFERENCES items(id),
        requested_qty integer NOT NULL,
        approved_qty integer,
        fulfilled_qty integer DEFAULT 0,
        status text DEFAULT 'pending',
        requested_by text,
        approved_by text,
        notes text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);
    console.log("✓ store_requisitions table");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS controlled_drug_log (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid REFERENCES stores(id),
        item_id uuid REFERENCES items(id),
        batch_id uuid,
        action_type text NOT NULL,
        quantity integer NOT NULL,
        patient_ref text,
        prescription_ref text,
        dispensed_by text,
        witnessed_by text,
        notes text,
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log("✓ controlled_drug_log table");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS unit_conversions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id uuid REFERENCES items(id),
        from_uom text NOT NULL,
        to_uom text NOT NULL,
        factor decimal(10,4) NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log("✓ unit_conversions table");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS batch_quarantine (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_id uuid,
        item_id uuid REFERENCES items(id),
        reason text NOT NULL,
        quarantined_by text,
        resolved_by text,
        resolved_at timestamptz,
        is_resolved boolean DEFAULT false,
        notes text,
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log("✓ batch_quarantine table");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reagent_assignments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id uuid REFERENCES items(id),
        analyzer_name text NOT NULL,
        test_type text,
        consumption_per_test decimal(10,4),
        critical_flag boolean DEFAULT false,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log("✓ reagent_assignments table");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab_consumption_log (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid REFERENCES stores(id),
        item_id uuid REFERENCES items(id),
        assignment_id uuid REFERENCES reagent_assignments(id),
        test_type text,
        test_count integer DEFAULT 1,
        consumed decimal(10,4) NOT NULL,
        batch_id uuid,
        run_by text,
        notes text,
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log("✓ lab_consumption_log table");

    console.log("\n✅ All done! Phase 1 tables are ready.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

run();
