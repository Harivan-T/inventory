import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const WORKSPACE_ID = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

async function run() {
  try {

    // ── 1. Workspace ──────────────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO workspaces (workspaceid, name, isactive)
      VALUES ('${WORKSPACE_ID}', 'Main Hospital', true)
      ON CONFLICT (workspaceid) DO NOTHING;
    `);
    console.log("✓ workspace");

    // ── 2. Suppliers ──────────────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO suppliers (supplierid, name, contactname, phone, email, address, isactive) VALUES
        ('11111111-0000-0000-0000-000000000001', 'MedSupply Co',       'Ahmed Hassan',  '+964-750-1234567', 'ahmed@medsupply.com',  'Baghdad, Iraq', true),
        ('11111111-0000-0000-0000-000000000002', 'PharmaDist Ltd',     'Sara Ali',      '+964-751-2345678', 'sara@pharmadist.com',  'Erbil, Iraq',   true),
        ('11111111-0000-0000-0000-000000000003', 'LabReagents Inc',    'John Smith',    '+1-800-555-0100',  'john@labreagents.com', 'Chicago, USA',  true),
        ('11111111-0000-0000-0000-000000000004', 'RadioPharm Supply',  'Maria Lopez',   '+34-91-555-0200',  'maria@radiopharm.com', 'Madrid, Spain', true),
        ('11111111-0000-0000-0000-000000000005', 'Hospital Equipment', 'Karim Mahmoud', '+964-752-3456789', 'karim@hosequip.com',   'Mosul, Iraq',   true)
      ON CONFLICT (supplierid) DO NOTHING;
    `);
    console.log("✓ suppliers");

    // ── 3. Warehouses (uses DB column names from schema strings) ──────────────
    await pool.query(`
      INSERT INTO warehouses (id, name, warehouse_type, location, manager, description, is_active) VALUES
        ('22222222-0000-0000-0000-000000000001', 'Main Hospital Store',  'hospital',  'Building A, Ground Floor', 'Omar Khalid',   'Main hospital inventory',           true),
        ('22222222-0000-0000-0000-000000000002', 'Pharmacy Main Store',  'pharmacy',  'Building B, Floor 1',      'Fatima Noor',   'Central pharmacy inventory',        true),
        ('22222222-0000-0000-0000-000000000003', 'Laboratory Store',     'lab',       'Building C, Basement',     'Dr. Yusuf Ali', 'Laboratory reagents and supplies',  true),
        ('22222222-0000-0000-0000-000000000004', 'Radiology Store',      'radiology', 'Building D, Floor 2',      'Layla Hassan',  'Radiology and imaging supplies',    true),
        ('22222222-0000-0000-0000-000000000005', 'Emergency Store',      'hospital',  'Emergency Wing',           'Zaid Ibrahim',  'Emergency department supplies',     true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ warehouses");

    // ── 4. Warehouse Sections ─────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO warehouse_sections (id, warehouse_id, section_name, section_type, bin_location, shelf, temperature_controlled) VALUES
        ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Dry Goods',        'dry',         'A1', 'S1', false),
        ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Cold Storage',     'refrigerated','B1', 'S2', true),
        ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 'Controlled Items', 'controlled',  'C1', 'S3', false),
        ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'Oral Medications', 'dry',         'A1', 'S1', false),
        ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 'Injectables',      'refrigerated','B1', 'S2', true),
        ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000002', 'Controlled Drugs', 'controlled',  'C1', 'S3', false),
        ('33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000003', 'Reagents',         'refrigerated','A1', 'S1', true),
        ('33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000003', 'Consumables',      'dry',         'B1', 'S2', false),
        ('33333333-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000004', 'Contrast Media',   'refrigerated','A1', 'S1', true),
        ('33333333-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000004', 'Film & Chemicals', 'dry',         'B1', 'S2', false)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ warehouse_sections");

    // ── 5. Stores ─────────────────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO stores (id, workspace_id, name, store_type, department, warehouse_id, manager, location, is_active) VALUES
        ('44444444-0000-0000-0000-000000000001', '${WORKSPACE_ID}', 'ICU Pharmacy Store',     'sub', 'ICU',               '22222222-0000-0000-0000-000000000002', 'Nurse Hana',    'ICU Wing Floor 3',  true),
        ('44444444-0000-0000-0000-000000000002', '${WORKSPACE_ID}', 'Emergency Pharmacy',     'sub', 'Emergency',         '22222222-0000-0000-0000-000000000002', 'Nurse Sami',    'Emergency Wing',    true),
        ('44444444-0000-0000-0000-000000000003', '${WORKSPACE_ID}', 'Ward A Pharmacy',        'sub', 'Ward A',            '22222222-0000-0000-0000-000000000002', 'Nurse Leila',   'Ward A, Floor 2',   true),
        ('44444444-0000-0000-0000-000000000004', '${WORKSPACE_ID}', 'Lab Reagent Store',      'sub', 'Laboratory',        '22222222-0000-0000-0000-000000000003', 'Tech Rami',     'Lab Building',      true),
        ('44444444-0000-0000-0000-000000000005', '${WORKSPACE_ID}', 'Radiology Supply Store', 'sub', 'Radiology',         '22222222-0000-0000-0000-000000000004', 'Tech Dina',     'Radiology Wing',    true),
        ('44444444-0000-0000-0000-000000000006', '${WORKSPACE_ID}', 'OT Supply Store',        'sub', 'Operating Theatre', '22222222-0000-0000-0000-000000000001', 'Nurse Tara',    'OT Block',          true),
        ('44444444-0000-0000-0000-000000000007', '${WORKSPACE_ID}', 'Outpatient Pharmacy',    'sub', 'Outpatient',        '22222222-0000-0000-0000-000000000002', 'Pharm. Waleed', 'OPD Building',      true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ stores");

    // ── 6. Items (using actual DB column names) ───────────────────────────────
    await pool.query(`
      INSERT INTO items (id, workspace_id, itemcode, name, generic_name, itemtype, inventorycategory, uom, min_level, max_level, reorder_level, controlled, hazardous, manufacturer, is_active) VALUES
        ('55555555-0000-0000-0000-000000000001', '${WORKSPACE_ID}', 'PHR-001', 'Amoxicillin 500mg Capsule',  'Amoxicillin',      'drug',       'pharmacy',  'capsule', 100, 5000, 500,  false, false, 'Pfizer',        true),
        ('55555555-0000-0000-0000-000000000002', '${WORKSPACE_ID}', 'PHR-002', 'Morphine Sulphate 10mg/ml',  'Morphine',         'drug',       'pharmacy',  'ampoule', 50,  1000, 100,  true,  false, 'Hameln Pharma', true),
        ('55555555-0000-0000-0000-000000000003', '${WORKSPACE_ID}', 'PHR-003', 'Normal Saline 0.9% 500ml',   'Sodium Chloride',  'drug',       'pharmacy',  'bag',     200, 5000, 500,  false, false, 'Baxter',        true),
        ('55555555-0000-0000-0000-000000000004', '${WORKSPACE_ID}', 'PHR-004', 'Insulin Glargine 100IU/ml',  'Insulin Glargine', 'drug',       'pharmacy',  'vial',    50,  2000, 200,  false, false, 'Sanofi',        true),
        ('55555555-0000-0000-0000-000000000005', '${WORKSPACE_ID}', 'PHR-005', 'Omeprazole 20mg Capsule',    'Omeprazole',       'drug',       'pharmacy',  'capsule', 100, 5000, 500,  false, false, 'AstraZeneca',   true),
        ('55555555-0000-0000-0000-000000000006', '${WORKSPACE_ID}', 'LAB-001', 'CBC Reagent Kit',            'CBC Reagent',      'reagent',    'lab',       'kit',     10,  100,  20,   false, false, 'Sysmex',        true),
        ('55555555-0000-0000-0000-000000000007', '${WORKSPACE_ID}', 'LAB-002', 'HbA1c Reagent',              'HbA1c',            'reagent',    'lab',       'vial',    10,  100,  15,   false, false, 'Bio-Rad',       true),
        ('55555555-0000-0000-0000-000000000008', '${WORKSPACE_ID}', 'LAB-003', 'Blood Culture Bottle',       'Culture Bottle',   'consumable', 'lab',       'piece',   50,  500,  100,  false, false, 'BD Bactec',     true),
        ('55555555-0000-0000-0000-000000000009', '${WORKSPACE_ID}', 'LAB-004', 'Urine Test Strip',           'Urinalysis Strip', 'consumable', 'lab',       'strip',   100, 2000, 300,  false, false, 'Roche',         true),
        ('55555555-0000-0000-0000-000000000010', '${WORKSPACE_ID}', 'RAD-001', 'Iohexol Contrast 350mg/ml',  'Iohexol',          'radiology',  'radiology', 'vial',    20,  200,  50,   false, false, 'GE Healthcare', true),
        ('55555555-0000-0000-0000-000000000011', '${WORKSPACE_ID}', 'RAD-002', 'X-Ray Film 35x43cm',         'X-Ray Film',       'radiology',  'radiology', 'sheet',   50,  1000, 100,  false, false, 'Kodak',         true),
        ('55555555-0000-0000-0000-000000000012', '${WORKSPACE_ID}', 'RAD-003', 'Developer Solution 5L',      'X-Ray Developer',  'radiology',  'radiology', 'bottle',  10,  100,  20,   false, true,  'Kodak',         true),
        ('55555555-0000-0000-0000-000000000013', '${WORKSPACE_ID}', 'HSP-001', 'Surgical Gloves Size 7',     'Latex Gloves',     'supply',     'hospital',  'pair',    100, 5000, 500,  false, false, '3M',            true),
        ('55555555-0000-0000-0000-000000000014', '${WORKSPACE_ID}', 'HSP-002', 'IV Cannula 18G',             'IV Cannula',       'consumable', 'hospital',  'piece',   100, 3000, 300,  false, false, 'BD',            true),
        ('55555555-0000-0000-0000-000000000015', '${WORKSPACE_ID}', 'HSP-003', 'Surgical Mask Type IIR',     'Face Mask',        'consumable', 'hospital',  'piece',   500, 10000,1000, false, false, '3M',            true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ items");

    // ── 7. Item Batches (DB column names from schema) ─────────────────────────
    await pool.query(`
      INSERT INTO item_batches (id, item_id, warehouse_id, batch_number, quantity, unit_cost, selling_price, expiry_date, manufacture_date) VALUES
        ('66666666-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'AMX-2024-001', 2000, 0.25,  0.50,  '2026-06-30', '2024-01-15'),
        ('66666666-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'AMX-2024-002', 1500, 0.25,  0.50,  '2026-12-31', '2024-06-01'),
        ('66666666-0000-0000-0000-000000000003', '55555555-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'MOR-2024-001', 500,  2.50,  5.00,  '2025-12-31', '2024-01-01'),
        ('66666666-0000-0000-0000-000000000004', '55555555-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'SAL-2024-001', 1000, 1.20,  2.00,  '2026-03-31', '2024-03-01'),
        ('66666666-0000-0000-0000-000000000005', '55555555-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'INS-2024-001', 300,  12.00, 20.00, '2025-08-31', '2024-02-01'),
        ('66666666-0000-0000-0000-000000000006', '55555555-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 'OMP-2024-001', 3000, 0.15,  0.30,  '2027-01-31', '2024-01-01'),
        ('66666666-0000-0000-0000-000000000007', '55555555-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000003', 'CBC-2024-001', 50,   45.00, 0.00,  '2025-06-30', '2024-01-15'),
        ('66666666-0000-0000-0000-000000000008', '55555555-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000003', 'HBA-2024-001', 30,   85.00, 0.00,  '2025-09-30', '2024-02-01'),
        ('66666666-0000-0000-0000-000000000009', '55555555-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000004', 'IOH-2024-001', 100,  25.00, 0.00,  '2026-12-31', '2024-03-01'),
        ('66666666-0000-0000-0000-000000000010', '55555555-0000-0000-0000-000000000011', '22222222-0000-0000-0000-000000000004', 'XRF-2024-001', 500,  2.50,  0.00,  '2027-06-30', '2024-01-01'),
        ('66666666-0000-0000-0000-000000000011', '55555555-0000-0000-0000-000000000013', '22222222-0000-0000-0000-000000000001', 'GLV-2024-001', 2000, 0.30,  0.60,  '2027-12-31', '2024-01-01'),
        ('66666666-0000-0000-0000-000000000012', '55555555-0000-0000-0000-000000000014', '22222222-0000-0000-0000-000000000001', 'CAN-2024-001', 1500, 0.45,  0.90,  '2027-06-30', '2024-02-01')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ item_batches");

    // ── 8. Inventory Stock ────────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO inventory_stock (id, item_id, warehouse_id, batch_id, quantity, reserved_quantity) VALUES
        ('77777777-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 2000, 0),
        ('77777777-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000002', 1500, 0),
        ('77777777-0000-0000-0000-000000000003', '55555555-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000003', 500,  50),
        ('77777777-0000-0000-0000-000000000004', '55555555-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000004', 1000, 0),
        ('77777777-0000-0000-0000-000000000005', '55555555-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000005', 300,  0),
        ('77777777-0000-0000-0000-000000000006', '55555555-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000006', 3000, 0),
        ('77777777-0000-0000-0000-000000000007', '55555555-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000007', 50,   0),
        ('77777777-0000-0000-0000-000000000008', '55555555-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000008', 30,   0),
        ('77777777-0000-0000-0000-000000000009', '55555555-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000004', '66666666-0000-0000-0000-000000000009', 100,  0),
        ('77777777-0000-0000-0000-000000000010', '55555555-0000-0000-0000-000000000011', '22222222-0000-0000-0000-000000000004', '66666666-0000-0000-0000-000000000010', 500,  0),
        ('77777777-0000-0000-0000-000000000011', '55555555-0000-0000-0000-000000000013', '22222222-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000011', 2000, 0),
        ('77777777-0000-0000-0000-000000000012', '55555555-0000-0000-0000-000000000014', '22222222-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000012', 1500, 0)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ inventory_stock");

    // ── 9. Store Stock ────────────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO store_stock (id, store_id, item_id, batch_id, quantity, reserved_quantity) VALUES
        ('88888888-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 200, 0),
        ('88888888-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000003', 50,  10),
        ('88888888-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000004', 100, 0),
        ('88888888-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 150, 0),
        ('88888888-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000004', 80,  0),
        ('88888888-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000004', '55555555-0000-0000-0000-000000000006', '66666666-0000-0000-0000-000000000007', 20,  0),
        ('88888888-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000004', '55555555-0000-0000-0000-000000000007', '66666666-0000-0000-0000-000000000008', 15,  0),
        ('88888888-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000005', '55555555-0000-0000-0000-000000000010', '66666666-0000-0000-0000-000000000009', 40,  0),
        ('88888888-0000-0000-0000-000000000009', '44444444-0000-0000-0000-000000000005', '55555555-0000-0000-0000-000000000011', '66666666-0000-0000-0000-000000000010', 200, 0),
        ('88888888-0000-0000-0000-000000000010', '44444444-0000-0000-0000-000000000006', '55555555-0000-0000-0000-000000000013', '66666666-0000-0000-0000-000000000011', 300, 0),
        ('88888888-0000-0000-0000-000000000011', '44444444-0000-0000-0000-000000000006', '55555555-0000-0000-0000-000000000014', '66666666-0000-0000-0000-000000000012', 200, 0)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ store_stock");

    // ── 10. Reagent Assignments ───────────────────────────────────────────────
    await pool.query(`
      INSERT INTO reagent_assignments (id, item_id, analyzer_name, test_type, consumption_per_test, critical_flag, is_active) VALUES
        ('99999999-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000006', 'Sysmex XN-1000', 'CBC',          0.5,  true,  true),
        ('99999999-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000007', 'Bio-Rad D-100',  'HbA1c',        1.0,  true,  true),
        ('99999999-0000-0000-0000-000000000003', '55555555-0000-0000-0000-000000000008', 'BD Bactec FX',   'Blood Culture', 1.0, false, true),
        ('99999999-0000-0000-0000-000000000004', '55555555-0000-0000-0000-000000000009', 'Manual',         'Urinalysis',   1.0,  false, true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ reagent_assignments");

    // ── 11. Unit Conversions ──────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO unit_conversions (item_id, from_uom, to_uom, factor) VALUES
        ('55555555-0000-0000-0000-000000000001', 'box',   'strip',   10),
        ('55555555-0000-0000-0000-000000000001', 'strip', 'capsule', 10),
        ('55555555-0000-0000-0000-000000000005', 'box',   'strip',   10),
        ('55555555-0000-0000-0000-000000000005', 'strip', 'capsule', 10)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✓ unit_conversions");

    // ── 12. Stock Transactions ────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO stock_transactions (item_id, warehouse_id, batch_id, transaction_type, quantity, notes, created_by) VALUES
        ('55555555-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', 'STOCK_IN', 2000, 'Initial stock receipt',   'system'),
        ('55555555-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000003', 'STOCK_IN', 500,  'Initial stock receipt',   'system'),
        ('55555555-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000007', 'STOCK_IN', 50,   'Initial reagent receipt', 'system'),
        ('55555555-0000-0000-0000-000000000013', '22222222-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000011', 'STOCK_IN', 2000, 'Initial stock receipt',   'system')
      ON CONFLICT DO NOTHING;
    `);
    console.log("✓ stock_transactions");

    console.log("\n✅ All seed data inserted!");
    console.log("  5 warehouses | 10 sections | 7 stores | 15 items | 12 batches | 12 inventory records | 4 reagent assignments");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

run();
