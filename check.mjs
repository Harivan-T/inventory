import pg from "pg";
const p = new pg.Pool({ 
  connectionString: "postgresql://neondb_owner:npg_wf3UBYIOxSE8@ep-dry-frog-aiud4h7j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false } 
});

for (const t of [
  "store_requisitions", "stores", "store_stock", "store_transactions",
  "purchase_orders", "purchase_order_items", "goods_receipt_notes", "grn_items",
  "purchase_requisitions", "purchase_requisition_items",
  "unit_conversions", "drug_interactions", "drug_alternatives",
  "lab_consumption_log", "reagent_assignments"
]) {
  const r = await p.query(`SELECT column_name FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [t]);
  console.log(`${t}:`, r.rows.map(x => x.column_name));
}
p.end();