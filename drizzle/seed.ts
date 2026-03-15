import { db } from "../db/index";
import {
  workspaces,
  drugCategories,
  drugs,
  drugInventory,
  suppliers,
  warehouses,
  warehouseSections,
  inventoryStock,
  items,
  stores,
  storeStock,
  itemBatches,
} from "../db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // ── 1. Workspace ──────────────────────────────────────
  console.log("Adding workspace...");
  const [workspace] = await db.insert(workspaces).values({
    name: "Tibbna Hospital",
    isactive: true,
  }).returning();

  // ── 2. Suppliers ──────────────────────────────────────
  console.log("Adding suppliers...");
  const insertedSuppliers = await db.insert(suppliers).values([
    { workspaceid: workspace.workspaceid, name: "MedCo Pharmaceuticals", contactname: "Ahmed Ali",   phone: "+964-770-1234567", email: "ahmed@medco.iq",     isactive: true },
    { workspaceid: workspace.workspaceid, name: "PharmaDist Iraq",       contactname: "Sara Hassan", phone: "+964-750-2345678", email: "sara@pharmadist.iq", isactive: true },
    { workspaceid: workspace.workspaceid, name: "IraqMed Supplies",      contactname: "Omar Khalid", phone: "+964-780-3456789", email: "omar@iraqmed.iq",    isactive: true },
  ]).returning();

  // ── 3. Drug Categories ────────────────────────────────
  console.log("Adding drug categories...");
  const insertedCategories = await db.insert(drugCategories).values([
    { workspaceid: workspace.workspaceid, name: "Antibiotics",     atcgroup: "J01", description: "Antibacterial drugs" },
    { workspaceid: workspace.workspaceid, name: "Analgesics",      atcgroup: "N02", description: "Pain relief medications" },
    { workspaceid: workspace.workspaceid, name: "Infusions",       atcgroup: "B05", description: "IV fluids and infusions" },
    { workspaceid: workspace.workspaceid, name: "Antidiabetics",   atcgroup: "A10", description: "Diabetes medications" },
    { workspaceid: workspace.workspaceid, name: "Consumables",     atcgroup: "Z01", description: "Medical consumables & supplies" },
  ]).returning();

  // ── 4. Drugs ──────────────────────────────────────────
  console.log("Adding drugs...");
  const insertedDrugs = await db.insert(drugs).values([
    { workspaceid: workspace.workspaceid, categoryid: insertedCategories[0].categoryid, name: "Amoxicillin 500mg",    genericname: "Amoxicillin",    form: "capsule",   strength: "500mg", unit: "box",   manufacturer: "MedCo",    traffic: "rx",         storagetype: "room_temperature", requiresprescription: true,  isactive: true },
    { workspaceid: workspace.workspaceid, categoryid: insertedCategories[1].categoryid, name: "Paracetamol 1g IV",   genericname: "Paracetamol",    form: "injection", strength: "1g",    unit: "vial",  manufacturer: "PharmaCo", traffic: "otc",        storagetype: "room_temperature", requiresprescription: false, isactive: true },
    { workspaceid: workspace.workspaceid, categoryid: insertedCategories[2].categoryid, name: "IV Saline 0.9%",      genericname: "Sodium Chloride",form: "injection", strength: "0.9%",  unit: "bag",   manufacturer: "IVCo",     traffic: "rx",         storagetype: "room_temperature", requiresprescription: true,  isactive: true },
    { workspaceid: workspace.workspaceid, categoryid: insertedCategories[3].categoryid, name: "Insulin Glargine",    genericname: "Insulin",        form: "injection", strength: "100U",  unit: "pen",   manufacturer: "BioPharm", traffic: "controlled", storagetype: "refrigerated",     requiresprescription: true,  isactive: true },
    { workspaceid: workspace.workspaceid, categoryid: insertedCategories[3].categoryid, name: "Metformin 850mg",     genericname: "Metformin",      form: "tablet",    strength: "850mg", unit: "strip", manufacturer: "GenPharma",traffic: "rx",         storagetype: "room_temperature", requiresprescription: true,  isactive: true },
    { workspaceid: workspace.workspaceid, categoryid: insertedCategories[1].categoryid, name: "Omeprazole 20mg",     genericname: "Omeprazole",     form: "capsule",   strength: "20mg",  unit: "box",   manufacturer: "MedCo",    traffic: "rx",         storagetype: "room_temperature", requiresprescription: true,  isactive: true },
    { workspaceid: workspace.workspaceid, categoryid: insertedCategories[2].categoryid, name: "Ringer Lactate 500ml",genericname: "Ringer Lactate", form: "injection", strength: "500ml", unit: "bag",   manufacturer: "IVCo",     traffic: "rx",         storagetype: "room_temperature", requiresprescription: true,  isactive: true },
  ]).returning();

  // ── 5. Warehouses ─────────────────────────────────────
  console.log("Adding warehouses...");
  const insertedWarehouses = await db.insert(warehouses).values([
    { name: "Main Warehouse",     location: "Building A, Ground Floor", manager: "Harivan Admin",   description: "Central medical supplies warehouse", isactive: true },
    { name: "Pharmacy Warehouse", location: "Building B, Floor 1",      manager: "Khalid Hassan",   description: "Pharmacy storage",                   isactive: true },
    { name: "ICU Warehouse",      location: "Building C, Floor 3",      manager: "Sara Mahmoud",    description: "ICU dedicated storage",              isactive: true },
  ]).returning();

  // ── 6. Warehouse Sections ─────────────────────────────
  console.log("Adding warehouse sections...");
  const insertedSections = await db.insert(warehouseSections).values([
    { warehouseid: insertedWarehouses[0].id, sectionname: "Section A — Medications",  sectiontype: "medications",  temperaturecontrolled: false },
    { warehouseid: insertedWarehouses[0].id, sectionname: "Section B — Infusions",    sectiontype: "infusions",    temperaturecontrolled: false },
    { warehouseid: insertedWarehouses[0].id, sectionname: "Section C — Refrigerated", sectiontype: "refrigerated", temperaturecontrolled: true  },
    { warehouseid: insertedWarehouses[1].id, sectionname: "Pharmacy Main",            sectiontype: "medications",  temperaturecontrolled: false },
  ]).returning();

  // ── 7. Item Batches ───────────────────────────────────
  console.log("Adding item batches...");
  const insertedBatches = await db.insert(itemBatches).values([
    { itemid: insertedDrugs[0].drugid, batchnumber: "BATCH-AMX-001", expirydate: new Date("2026-08-15") },
    { itemid: insertedDrugs[1].drugid, batchnumber: "BATCH-PCM-001", expirydate: new Date("2026-12-01") },
    { itemid: insertedDrugs[2].drugid, batchnumber: "BATCH-SAL-001", expirydate: new Date("2027-01-01") },
    { itemid: insertedDrugs[3].drugid, batchnumber: "BATCH-INS-001", expirydate: new Date("2025-09-15") },
    { itemid: insertedDrugs[4].drugid, batchnumber: "BATCH-MET-001", expirydate: new Date("2026-12-01") },
    { itemid: insertedDrugs[5].drugid, batchnumber: "BATCH-OMP-001", expirydate: new Date("2026-10-01") },
    { itemid: insertedDrugs[6].drugid, batchnumber: "BATCH-RIN-001", expirydate: new Date("2027-03-01") },
  ]).returning();

  // ── 8. Drug Inventory ─────────────────────────────────
  console.log("Adding drug inventory...");
  await db.insert(drugInventory).values([
    { drugid: insertedDrugs[0].drugid, workspaceid: workspace.workspaceid, quantity: 240, minquantity: 50,  unitcost: "12500", sellingprice: "15000", batchnumber: "BATCH-AMX-001", expirydate: new Date("2026-08-15"), location: "Section A" },
    { drugid: insertedDrugs[1].drugid, workspaceid: workspace.workspaceid, quantity: 95,  minquantity: 40,  unitcost: "8500",  sellingprice: "10000", batchnumber: "BATCH-PCM-001", expirydate: new Date("2026-12-01"), location: "Section A" },
    { drugid: insertedDrugs[2].drugid, workspaceid: workspace.workspaceid, quantity: 320, minquantity: 100, unitcost: "3500",  sellingprice: "4500",  batchnumber: "BATCH-SAL-001", expirydate: new Date("2027-01-01"), location: "Section B" },
    { drugid: insertedDrugs[3].drugid, workspaceid: workspace.workspaceid, quantity: 12,  minquantity: 20,  unitcost: "85000", sellingprice: "95000", batchnumber: "BATCH-INS-001", expirydate: new Date("2025-09-15"), location: "Section C" },
    { drugid: insertedDrugs[4].drugid, workspaceid: workspace.workspaceid, quantity: 180, minquantity: 60,  unitcost: "2500",  sellingprice: "3500",  batchnumber: "BATCH-MET-001", expirydate: new Date("2026-12-01"), location: "Section A" },
    { drugid: insertedDrugs[5].drugid, workspaceid: workspace.workspaceid, quantity: 8,   minquantity: 40,  unitcost: "9500",  sellingprice: "12000", batchnumber: "BATCH-OMP-001", expirydate: new Date("2026-10-01"), location: "Section A" },
    { drugid: insertedDrugs[6].drugid, workspaceid: workspace.workspaceid, quantity: 200, minquantity: 80,  unitcost: "4000",  sellingprice: "5000",  batchnumber: "BATCH-RIN-001", expirydate: new Date("2027-03-01"), location: "Section B" },
  ]);

  // ── 9. Inventory Stock (warehouse level) ──────────────
  console.log("Adding inventory stock...");
  await db.insert(inventoryStock).values([
    { itemid: insertedDrugs[0].drugid, warehouseid: insertedWarehouses[0].id, batchid: insertedBatches[0].id, quantity: 240, reservedquantity: 0 },
    { itemid: insertedDrugs[1].drugid, warehouseid: insertedWarehouses[0].id, batchid: insertedBatches[1].id, quantity: 95,  reservedquantity: 0 },
    { itemid: insertedDrugs[2].drugid, warehouseid: insertedWarehouses[0].id, batchid: insertedBatches[2].id, quantity: 320, reservedquantity: 0 },
    { itemid: insertedDrugs[3].drugid, warehouseid: insertedWarehouses[0].id, batchid: insertedBatches[3].id, quantity: 12,  reservedquantity: 0 },
    { itemid: insertedDrugs[4].drugid, warehouseid: insertedWarehouses[0].id, batchid: insertedBatches[4].id, quantity: 180, reservedquantity: 0 },
    { itemid: insertedDrugs[5].drugid, warehouseid: insertedWarehouses[0].id, batchid: insertedBatches[5].id, quantity: 8,   reservedquantity: 0 },
    { itemid: insertedDrugs[6].drugid, warehouseid: insertedWarehouses[0].id, batchid: insertedBatches[6].id, quantity: 200, reservedquantity: 0 },
  ]);

  // ── 10. Stores ────────────────────────────────────────
  console.log("Adding stores...");
  const insertedStores = await db.insert(stores).values([
    { workspaceid: workspace.workspaceid, name: "Pharmacy Store",   storetype: "sub",  department: "Pharmacy",   warehouseid: insertedWarehouses[1].id, manager: "Khalid Hassan", location: "Ground Floor", isactive: true },
    { workspaceid: workspace.workspaceid, name: "ICU Store",        storetype: "sub",  department: "ICU",        warehouseid: insertedWarehouses[2].id, manager: "Sara Mahmoud",  location: "Floor 3",      isactive: true },
    { workspaceid: workspace.workspaceid, name: "Emergency Store",  storetype: "sub",  department: "Emergency",  warehouseid: insertedWarehouses[0].id, manager: "Ali Hassan",    location: "Ground Floor", isactive: true },
  ]).returning();

  // ── 11. Items (Universal Item Master) ─────────────────
  console.log("Adding items...");
  await db.insert(items).values([
    { workspaceid: workspace.workspaceid, itemcode: "ITM-001", name: "Amoxicillin 500mg",    itemtype: "drug",        inventorycategory: "pharmacy",   uom: "box",   minlevel: 50,  reorderlevel: 60,  batchtracking: true, expirytracking: true, controlled: false, isactive: true },
    { workspaceid: workspace.workspaceid, itemcode: "ITM-002", name: "Paracetamol 1g IV",    itemtype: "drug",        inventorycategory: "pharmacy",   uom: "vial",  minlevel: 40,  reorderlevel: 50,  batchtracking: true, expirytracking: true, controlled: false, isactive: true },
    { workspaceid: workspace.workspaceid, itemcode: "ITM-003", name: "IV Saline 0.9%",       itemtype: "drug",        inventorycategory: "pharmacy",   uom: "bag",   minlevel: 100, reorderlevel: 120, batchtracking: true, expirytracking: true, controlled: false, isactive: true },
    { workspaceid: workspace.workspaceid, itemcode: "ITM-004", name: "Insulin Glargine",     itemtype: "drug",        inventorycategory: "pharmacy",   uom: "pen",   minlevel: 20,  reorderlevel: 25,  batchtracking: true, expirytracking: true, controlled: true,  isactive: true },
    { workspaceid: workspace.workspaceid, itemcode: "ITM-005", name: "Surgical Gloves (M)",  itemtype: "consumable",  inventorycategory: "hospital",   uom: "pack",  minlevel: 30,  reorderlevel: 40,  batchtracking: false,expirytracking: false,controlled: false, isactive: true },
    { workspaceid: workspace.workspaceid, itemcode: "ITM-006", name: "Surgical Masks",       itemtype: "consumable",  inventorycategory: "hospital",   uom: "box",   minlevel: 50,  reorderlevel: 60,  batchtracking: false,expirytracking: false,controlled: false, isactive: true },
    { workspaceid: workspace.workspaceid, itemcode: "ITM-007", name: "Blood Glucose Strips", itemtype: "reagent",     inventorycategory: "lab",        uom: "box",   minlevel: 30,  reorderlevel: 40,  batchtracking: true, expirytracking: true, controlled: false, isactive: true },
  ]);

  console.log("✅ Seed complete! Database is ready.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  console.error(err.message);
  process.exit(1);
});