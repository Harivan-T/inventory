import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {

    // Enums
    await pool.query(`DO $$ BEGIN CREATE TYPE pr_status AS ENUM ('draft','pending','approved','rejected','converted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await pool.query(`DO $$ BEGIN CREATE TYPE po_status AS ENUM ('draft','approved','sent','partial','complete','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    await pool.query(`DO $$ BEGIN CREATE TYPE grn_status AS ENUM ('draft','confirmed','posted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    console.log("✓ enums");

    // Vendors
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name            text NOT NULL,
        code            text,
        contactname     text,
        phone           text,
        email           text,
        address         text,
        country         text,
        paymentterms    integer DEFAULT 30,
        currency        text DEFAULT 'USD',
        taxnumber       text,
        rating          integer DEFAULT 0,
        isactive        boolean DEFAULT true,
        notes           text,
        createdat       timestamptz DEFAULT now(),
        updatedat       timestamptz DEFAULT now()
      );
    `);
    console.log("✓ vendors");

    // Vendor contracts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_contracts (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        vendorid        uuid REFERENCES vendors(id),
        itemid          uuid REFERENCES items(id),
        unitprice       decimal(10,4) NOT NULL,
        currency        text DEFAULT 'USD',
        minorderqty     integer DEFAULT 1,
        leadtimedays    integer DEFAULT 7,
        validfrom       date,
        validto         date,
        isactive        boolean DEFAULT true,
        createdat       timestamptz DEFAULT now()
      );
    `);
    console.log("✓ vendor_contracts");

    // Purchase Requisitions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_requisitions (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        prnumber        text NOT NULL,
        warehouseid     uuid REFERENCES warehouses(id),
        requestedby     text,
        approvedby      text,
        status          pr_status DEFAULT 'draft',
        priority        text DEFAULT 'normal',
        requiredddate   date,
        notes           text,
        createdat       timestamptz DEFAULT now(),
        updatedat       timestamptz DEFAULT now()
      );
    `);
    console.log("✓ purchase_requisitions");

    // PR Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_requisition_items (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        prid            uuid REFERENCES purchase_requisitions(id),
        itemid          uuid REFERENCES items(id),
        requestedqty    integer NOT NULL,
        approvedqty     integer,
        estimatedprice  decimal(10,4),
        notes           text,
        createdat       timestamptz DEFAULT now()
      );
    `);
    console.log("✓ purchase_requisition_items");

    // Purchase Orders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        ponumber        text NOT NULL,
        vendorid        uuid REFERENCES vendors(id),
        prid            uuid REFERENCES purchase_requisitions(id),
        warehouseid     uuid REFERENCES warehouses(id),
        status          po_status DEFAULT 'draft',
        orderdate       date DEFAULT CURRENT_DATE,
        expecteddate    date,
        totalamount     decimal(12,4) DEFAULT 0,
        currency        text DEFAULT 'USD',
        paymentterms    integer DEFAULT 30,
        shippingaddress text,
        notes           text,
        approvedby      text,
        sentby          text,
        createdat       timestamptz DEFAULT now(),
        updatedat       timestamptz DEFAULT now()
      );
    `);
    console.log("✓ purchase_orders");

    // PO Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        poid            uuid REFERENCES purchase_orders(id),
        itemid          uuid REFERENCES items(id),
        orderedqty      integer NOT NULL,
        receivedqty     integer DEFAULT 0,
        unitprice       decimal(10,4) NOT NULL,
        totalamount     decimal(12,4),
        createdat       timestamptz DEFAULT now()
      );
    `);
    console.log("✓ purchase_order_items");

    // Goods Receipt Notes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goods_receipt_notes (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        grnnumber       text NOT NULL,
        poid            uuid REFERENCES purchase_orders(id),
        vendorid        uuid REFERENCES vendors(id),
        warehouseid     uuid REFERENCES warehouses(id),
        status          grn_status DEFAULT 'draft',
        receiptdate     date DEFAULT CURRENT_DATE,
        invoicenumber   text,
        invoicedate     date,
        receivedby      text,
        notes           text,
        createdat       timestamptz DEFAULT now(),
        updatedat       timestamptz DEFAULT now()
      );
    `);
    console.log("✓ goods_receipt_notes");

    // GRN Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grn_items (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        grnid           uuid REFERENCES goods_receipt_notes(id),
        itemid          uuid REFERENCES items(id),
        poitemid        uuid REFERENCES purchase_order_items(id),
        orderedqty      integer,
        receivedqty     integer NOT NULL,
        rejectedqty     integer DEFAULT 0,
        unitprice       decimal(10,4),
        batchnumber     text,
        expirydate      date,
        manufacturedate date,
        notes           text,
        createdat       timestamptz DEFAULT now()
      );
    `);
    console.log("✓ grn_items");

    console.log("\n✅ Phase 2 tables created!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}
run();
