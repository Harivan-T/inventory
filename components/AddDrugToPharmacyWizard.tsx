"use client";
import { useState, useEffect } from "react";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  x:      "M18 6L6 18M6 6l12 12",
  check:  "M20 6L9 17l-5-5",
  arrow:  "M5 12h14M12 5l7 7-7 7",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  pill:   "M10.5 6.5L6.5 10.5M9 3l12 12-6 6L3 9l6-6z",
  warning:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
};

const s: Record<string, any> = {
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal:   { background: "#fff", borderRadius: 14, width: 700, maxHeight: "92vh", overflowY: "auto" as const, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" },
  input:   { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, color: "#111827", boxSizing: "border-box" as const },
  inputHL: { width: "100%", padding: "8px 10px", borderRadius: 8, border: "2px solid #6366f1", fontSize: 13, color: "#111827", boxSizing: "border-box" as const, background: "#eef2ff" },
  label:   { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  fgroup:  { marginBottom: 12 },
  btn:     (c: string) => ({ padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: c === "purple" ? "#6366f1" : c === "green" ? "#16a34a" : c === "ghost" ? "#f3f4f6" : "#e5e7eb", color: c === "ghost" ? "#374151" : "#fff" }),
};

const STEPS = ["Drug Info", "Clinical", "Pricing", "Inventory"];

interface Props {
  warehouses: any[];
  prefill?: any;
  existingDrugId?: string;
  onClose: () => void;
  onSuccess: () => void;
}


function MfgSearch({ value, manufacturers, onChange }: { value: string; manufacturers: any[]; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen]   = useState(false);
  const filtered = manufacturers.filter(m =>
    !query || m.name.toLowerCase().includes(query.toLowerCase()) || (m.country??"").toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div style={{ position:"relative" }}>
      <input
        style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #d1d5db", fontSize:13, color:"#111827", boxSizing:"border-box" as const }}
        value={query}
        placeholder="Search manufacturer..."
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, boxShadow:"0 4px 12px rgba(0,0,0,0.1)", zIndex:200, maxHeight:200, overflowY:"auto" as const }}>
          {filtered.slice(0,10).map(m => (
            <div key={m.id}
              onMouseDown={() => { setQuery(m.name); onChange(m.name); setOpen(false); }}
              style={{ padding:"8px 12px", cursor:"pointer", fontSize:13, borderBottom:"1px solid #f3f4f6" }}
              onMouseEnter={e => (e.currentTarget.style.background="#f9fafb")}
              onMouseLeave={e => (e.currentTarget.style.background="#fff")}>
              <strong>{m.name}</strong>
              {m.country && <span style={{ fontSize:11, color:"#6b7280", marginLeft:6 }}>{m.country}</span>}
              {m.product_types && <div style={{ fontSize:10, color:"#9ca3af" }}>{m.product_types}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddDrugToPharmacyWizard({ warehouses, prefill, existingDrugId, onClose, onSuccess }: Props) {
  const [step, setStep]           = useState(prefill?._isUpdate ? 3 : 0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [existingItem, setExistingItem] = useState<any>(prefill?._isUpdate ? prefill : null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [isUpdate, setIsUpdate]   = useState(prefill?._isUpdate ?? false);

  const [form, setForm] = useState({
    name:                 prefill?.name          ?? "",
    genericname:          prefill?.genericname   ?? "",
    atccode:              prefill?.atccode        ?? "",
    form:                 prefill?.form           ?? "tablet",
    strength:             prefill?.strength       ?? "",
    unit:                 prefill?.unit           ?? "tablet",
    barcode:              prefill?.barcode        ?? "",
    manufacturer:         prefill?.manufacturer   ?? "",
    storagetype:          prefill?.storagetype    ?? "",
    requiresprescription: prefill?.requiresprescription ?? false,
    insuranceapproved:    prefill?.insuranceapproved    ?? false,
    description:  prefill?.description  ?? "",
    indication:   prefill?.indication   ?? "",
    warning:      prefill?.warning      ?? "",
    notes:        prefill?.notes        ?? "",
    price_type:             "fixed",
    insurance_coverage_pct: "0",
    selling_price:          "",
    unit_cost:              "",
    uom:              prefill?.unit ?? "tablet",
    itemcode:         "",
    min_level:        "5",
    max_level:        "100",
    controlled:       false,
    warehouseid:      warehouses[0]?.id ?? "",
    initial_quantity: "0",
    supplierid:       "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const [manufacturers, setManufacturers] = useState<any[]>([]);

  // Load suppliers and manufacturers
  useEffect(() => {
    fetch("/api/pharmacy/suppliers").then(r => r.json()).then(d => setSuppliers(Array.isArray(d) ? d : []));
    fetch("/api/pharmacy/manufacturers").then(r => r.json()).then(d => setManufacturers(Array.isArray(d) ? d : []));
  }, []);

  // Check if drug already exists in pharmacy inventory when name changes
  useEffect(() => {
    if (!form.name.trim() || step !== 0) return;
    const timer = setTimeout(async () => {
      setCheckingExisting(true);
      try {
        const res = await fetch(`/api/pharmacy/items?search=${encodeURIComponent(form.name)}`);
        const data = await res.json();
        const exact = Array.isArray(data) ? data.find((i: any) =>
          i.name.toLowerCase() === form.name.toLowerCase() ||
          (form.genericname && i.genericName?.toLowerCase() === form.genericname.toLowerCase())
        ) : null;
        if (exact) {
          setExistingItem(exact);
          setIsUpdate(true);
          // Pre-fill form with existing item data
          setForm(f => ({
            ...f,
            name: exact.name,
            genericname: exact.genericName ?? "",
            itemcode: exact.itemcode ?? "",
            unit_cost: String(exact.unitCost ?? ""),
            selling_price: String(exact.sellingPrice ?? ""),
            price_type: exact.priceType ?? "fixed",
            insurance_coverage_pct: String(exact.insuranceCoveragePct ?? "0"),
            uom: exact.uom ?? f.uom,
            min_level: String(exact.minLevel ?? "5"),
            max_level: String(exact.maxLevel ?? "100"),
          }));
        } else {
          setExistingItem(null);
          setIsUpdate(false);
        }
      } catch {}
      setCheckingExisting(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [form.name, form.genericname, step]);

  const validate = () => {
    if (step === 0 && !form.name.trim()) { setError("Drug name is required"); return false; }
    if (step === 0 && !form.manufacturer.trim()) { setError("Manufacturer is required — please select from the list"); return false; }
    if (step === 3 && !form.warehouseid) { setError("Warehouse is required"); return false; }
    setError(""); return true;
  };

  const handleNext = () => { if (validate()) setStep(s => s + 1); };
  const handleBack = () => { setError(""); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isUpdate && existingItem) {
        // Update existing item stock
        const res = await fetch("/api/pharmacy/adjustments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: existingItem.id,
            warehouseId: form.warehouseid,
            adjustmentQty: parseInt(form.initial_quantity) || 0,
            reason: "Stock update via Add Drug wizard",
            createdBy: "Pharmacy",
          }),
        });
        if (!res.ok) throw new Error("Failed to update stock");
        onSuccess(); onClose();
      } else {
        const res = await fetch("/api/pharmacy/drugs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, existing_drug_id: existingDrugId ?? null }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        onSuccess(); onClose();
      }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const sellingPrice  = parseFloat(form.selling_price)  || 0;
  const coveragePct   = parseFloat(form.insurance_coverage_pct) || 0;
  const insurancePays = sellingPrice * coveragePct / 100;
  const patientPays   = sellingPrice - insurancePays;

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#ede9fe", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={icons.pill} size={16} color="#6366f1"/>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                {isUpdate ? "Update Drug Stock" : "Add Drug to Pharmacy"}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} color="#6b7280"/></button>
        </div>

        {/* Existing drug alert */}
        {isUpdate && existingItem && (
          <div style={{ margin: "16px 24px 0", padding: "12px 16px", background: "#fef3c7", borderRadius: 8, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d={icons.warning} size={16} color="#d97706"/>
            <div>
              <strong>{existingItem.name}</strong> already exists in pharmacy inventory
              (Code: {existingItem.itemcode}, Stock: {existingItem.totalStock} {existingItem.uom}).
              You can update the stock quantity below.
            </div>
          </div>
        )}

        {/* Step indicators */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 8 }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: 4, borderRadius: 2, background: i <= step ? "#6366f1" : "#e5e7eb" }}/>
              <span style={{ fontSize: 10, fontWeight: 600, color: i <= step ? "#6366f1" : "#9ca3af" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Form body */}
        <div style={{ padding: "20px 24px" }}>
          {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 14 }}>{error}</div>}
          {checkingExisting && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>🔍 Checking pharmacy inventory...</div>}

          {/* STEP 0 — Drug Info */}
          {step === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1/-1", ...s.fgroup }}>
                <label style={s.label}>Drug Name *</label>
                <input style={s.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Amoxicillin"/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Generic Name</label>
                <input style={s.input} value={form.genericname} onChange={e => set("genericname", e.target.value)}/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>ATC Code</label>
                <input style={s.input} value={form.atccode} onChange={e => set("atccode", e.target.value)} placeholder="e.g. J01CA04"/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Form</label>
                <select style={s.input} value={form.form} onChange={e => set("form", e.target.value)}>
                  {["tablet","capsule","syrup","injection","inhaler","cream","drops","sachet","ampoule","vial"].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
                </select>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Strength</label>
                <input style={s.input} value={form.strength} onChange={e => set("strength", e.target.value)} placeholder="e.g. 500mg"/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Unit</label>
                <select style={s.input} value={form.unit} onChange={e => { set("unit", e.target.value); set("uom", e.target.value); }}>
                  {["tablet","capsule","ml","mg","g","puff","ampoule","vial","sachet","piece"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={{...s.fgroup, position:"relative"}}>
                <label style={s.label}>Manufacturer *</label>
                <MfgSearch value={form.manufacturer} manufacturers={manufacturers} onChange={v => set("manufacturer", v)}/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Barcode</label>
                <input style={s.input} value={form.barcode} onChange={e => set("barcode", e.target.value)}/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Storage Type</label>
                <select style={s.input} value={form.storagetype} onChange={e => set("storagetype", e.target.value)}>
                  {["","room_temperature","refrigerated","frozen","controlled"].map(t => <option key={t} value={t}>{t || "— Select —"}</option>)}
                </select>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Supplier</label>
                <select style={s.input} value={form.supplierid} onChange={e => set("supplierid", e.target.value)}>
                  <option value="">— No supplier —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:"1/-1", display:"flex", gap:20, flexWrap:"wrap" as const }}>
                {[["requiresprescription","Requires Prescription"],["insuranceapproved","Insurance Approved"],["controlled","Controlled Substance"]].map(([k,l]) => (
                  <label key={k} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
                    <input type="checkbox" checked={(form as any)[k]} onChange={e => set(k, e.target.checked)} style={{ width:15, height:15, accentColor:"#6366f1" }}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — Clinical */}
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              {[["Description","description","General drug description"],["Indication","indication","What it treats"],["Warning","warning","Warnings and contraindications"],["Notes","notes","Additional notes"]].map(([lbl, key, ph]) => (
                <div key={key} style={s.fgroup}>
                  <label style={s.label}>{lbl}</label>
                  <textarea style={{ ...s.input, minHeight: 60, resize: "vertical" as const }} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={ph}/>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2 — Pricing */}
          {step === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn:"1/-1", ...s.fgroup }}>
                <label style={s.label}>Price Type</label>
                <select style={s.input} value={form.price_type} onChange={e => set("price_type", e.target.value)}>
                  <option value="fixed">Fixed — patient pays full price</option>
                  <option value="insurance">Insurance — patient pays % only</option>
                </select>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Purchase Price (Unit Cost)</label>
                <input type="number" step="0.01" style={isUpdate ? s.inputHL : s.input} value={form.unit_cost} onChange={e => set("unit_cost", e.target.value)} placeholder="0.00"/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Selling Price</label>
                <input type="number" step="0.01" style={isUpdate ? s.inputHL : s.input} value={form.selling_price} onChange={e => set("selling_price", e.target.value)} placeholder="0.00"/>
              </div>
              {form.price_type === "insurance" && (
                <div style={s.fgroup}>
                  <label style={s.label}>Insurance Coverage %</label>
                  <input type="number" min="0" max="100" style={s.input} value={form.insurance_coverage_pct} onChange={e => set("insurance_coverage_pct", e.target.value)} placeholder="e.g. 80"/>
                </div>
              )}
              {sellingPrice > 0 && (
                <div style={{ gridColumn:"1/-1", padding:"12px 16px", background: form.price_type==="insurance"?"#eef2ff":"#f0fdf4", borderRadius:8, fontSize:13 }}>
                  {form.price_type === "fixed" ? (
                    <span>💊 Patient pays full price: <strong style={{ color:"#16a34a" }}>${sellingPrice.toFixed(2)}</strong></span>
                  ) : (
                    <div style={{ display:"flex", gap:20, flexWrap:"wrap" as const }}>
                      <span>💊 Selling: <strong>${sellingPrice.toFixed(2)}</strong></span>
                      <span style={{ color:"#6366f1" }}>🏥 Insurance: <strong>${insurancePays.toFixed(2)}</strong> ({coveragePct}%)</span>
                      <span style={{ color:"#16a34a" }}>👤 Patient: <strong>${patientPays.toFixed(2)}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Inventory */}
          {step === 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {isUpdate ? (
                <div style={{ gridColumn:"1/-1", padding:"12px 16px", background:"#fef3c7", borderRadius:8, fontSize:13, color:"#92400e" }}>
                  ⚠️ This drug already exists. Only the stock quantity will be updated. The existing item code and settings will be kept.
                </div>
              ) : (
                <div style={{ gridColumn:"1/-1", padding:"10px 14px", background:"#fef3c7", borderRadius:8, fontSize:12, color:"#92400e" }}>
                  💡 This will create an inventory item linked to the drug and set up stock in the selected warehouse.
                </div>
              )}
              {!isUpdate && (
                <div style={s.fgroup}>
                  <label style={s.label}>Item Code</label>
                  <input style={s.input} value={form.itemcode} onChange={e => set("itemcode", e.target.value)} placeholder="Auto-generated if empty"/>
                </div>
              )}
              <div style={s.fgroup}>
                <label style={s.label}>Unit of Measure</label>
                <select style={s.input} value={form.uom} onChange={e => set("uom", e.target.value)}>
                  {["tablet","capsule","ml","mg","g","puff","ampoule","vial","sachet","piece","strip","bottle"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Pharmacy Warehouse *</label>
                <select style={s.input} value={form.warehouseid} onChange={e => set("warehouseid", e.target.value)}>
                  <option value="">Select warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: isUpdate ? "1/-1" : "auto", ...s.fgroup }}>
                <label style={{ ...s.label, color: isUpdate ? "#6366f1" : "#374151", fontWeight: isUpdate ? 700 : 600 }}>
                  {isUpdate ? "➕ Quantity to Add *" : "Initial Stock Quantity"}
                  {isUpdate && existingItem && <span style={{ marginLeft: 8, fontSize: 11, color: "#6b7280", fontWeight: 400 }}>(Current: {existingItem.totalStock} {existingItem.uom})</span>}
                </label>
                <input type="number" style={isUpdate ? s.inputHL : s.input} value={form.initial_quantity} onChange={e => set("initial_quantity", e.target.value)} placeholder="0"/>
                {isUpdate && <div style={{ fontSize: 11, color: "#6366f1", marginTop: 4 }}>New total will be: {(parseInt(existingItem?.totalStock)||0) + (parseInt(form.initial_quantity)||0)} {existingItem?.uom}</div>}
              </div>
              {!isUpdate && (
                <>
                  <div style={s.fgroup}>
                    <label style={s.label}>Min Level</label>
                    <input type="number" style={s.input} value={form.min_level} onChange={e => set("min_level", e.target.value)}/>
                  </div>
                  <div style={s.fgroup}>
                    <label style={s.label}>Max Level</label>
                    <input type="number" style={s.input} value={form.max_level} onChange={e => set("max_level", e.target.value)}/>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={step === 0 ? onClose : handleBack} style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb" }}>
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{step + 1} / {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button onClick={handleNext} style={{ ...s.btn("purple"), display: "flex", alignItems: "center", gap: 6 }}>
                Next <Icon d={icons.arrow} size={13} color="#fff"/>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ ...s.btn(isUpdate ? "green" : "purple"), display: "flex", alignItems: "center", gap: 6 }}>
                {loading ? "Saving..." : isUpdate ? <><Icon d={icons.check} size={13} color="#fff"/> Update Stock</> : <><Icon d={icons.check} size={13} color="#fff"/> Add to Pharmacy</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
