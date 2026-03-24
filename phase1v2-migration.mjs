import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    // Enums
    await pool.query(`DO $$ BEGIN CREATE TYPE warehouse_type AS ENUM ('hospital','pharmacy','lab','radiology'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    console.log("✓ warehouse_type enum");

    // Add warehouse_type to warehouses
    await pool.query(`ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS warehouse_type warehouse_type DEFAULT 'hospital';`);
    console.log("✓ warehouses.warehouse_type");

    // Add bin/shelf to warehouse_sections
    await pool.query(`
      ALTER TABLE warehouse_sections
      ADD COLUMN IF NOT EXISTS bin_location text,
      ADD COLUMN IF NOT EXISTS shelf text,
      ADD COLUMN IF NOT EXISTS description text;
    `);
    console.log("✓ warehouse_sections: bin_location, shelf, description");

    // Radiology procedures table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS radiology_procedures (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id        uuid REFERENCES stores(id),
        item_id         uuid REFERENCES items(id),
        batch_id        uuid REFERENCES item_batches(id),
        procedure_name  text NOT NULL,
        procedure_type  text,
        patient_ref     text,
        quantity_used   decimal(10,4) NOT NULL,
        performed_by    text,
        notes           text,
        created_at      timestamptz DEFAULT now()
      );
    `);
    console.log("✓ radiology_procedures table");

    console.log("\n✅ Phase 1 updates applied successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}
run();
