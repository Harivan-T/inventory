"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WizardForm {
  // Step 1 - Basic Info
  itemcode: string;
  name: string;
  genericname: string;
  brandname: string;
  category: string;
  subcategory: string;
  itemtype: string;
  manufacturer: string;
  // Step 2 - Stock Settings
  unit: string;
  reorderlevel: string;
  minstock: string;
  maxstock: string;
  leadtimedays: string;
  // Step 3 - Pricing & Billing
  unitcost: string;
  sellingprice: string;
  billingcode: string;
  defaultsupplier: string;
  billableitem: boolean;
  // Step 4 - Storage & Safety
  storagetemperature: string;
  storagehumidity: string;
  controlledsubstance: boolean;
  requiresrefrigeration: boolean;
  hazardousmaterial: boolean;
  // Step 5 - Category Specific
  drugclass: string;
  dosageform: string;
  strength: string;
  atccode: string;
  routeofadministration: string;
  pregnancycategory: string;
  highalertmedication: boolean;
  requiresprescription: boolean;
  insuranceapproved: boolean;
}

const INITIAL_FORM: WizardForm = {
  itemcode: "", name: "", genericname: "", brandname: "",
  category: "Pharmacy", subcategory: "", itemtype: "Drug", manufacturer: "",
  unit: "Tablet", reorderlevel: "", minstock: "", maxstock: "", leadtimedays: "",
  unitcost: "", sellingprice: "", billingcode: "", defaultsupplier: "", billableitem: true,
  storagetemperature: "", storagehumidity: "",
  controlledsubstance: false, requiresrefrigeration: false, hazardousmaterial: false,
  drugclass: "", dosageform: "", strength: "", atccode: "",
  routeofadministration: "", pregnancycategory: "", highalertmedication: false,
  requiresprescription: false, insuranceapproved: false,
};

const STEPS = [
  { number: 1, label: "Basic Information" },
  { number: 2, label: "Stock Settings" },
  { number: 3, label: "Pricing & Billing" },
  { number: 4, label: "Storage & Safety" },
  { number: 5, label: "Category-Specific" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  arrow_left: "M19 12H5M12 5l-7 7 7 7",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
};

// ─── Field Components ─────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8,
  fontSize: 13, background: "#fff", outline: "none", color: "#111827",
  width: "100%", boxSizing: "border-box" as const,
};
const selectStyle = { ...inputStyle, cursor: "pointer" };

// ─── Step Progress ────────────────────────────────────────────────────────────
function StepProgress({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid #f3f4f6", overflowX: "auto" }}>
      {STEPS.map((step, i) => {
        const done = current > step.number;
        const active = current === step.number;
        return (
          <div key={step.number} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "#16a34a" : active ? "#2563eb" : "#f3f4f6",
                border: `2px solid ${done ? "#16a34a" : active ? "#2563eb" : "#e5e7eb"}`,
                fontSize: 12, fontWeight: 700,
                color: done || active ? "#fff" : "#9ca3af",
                flexShrink: 0,
              }}>
                {done ? <Icon d={icons.check} size={13} color="#fff" /> : step.number}
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "#2563eb" : done ? "#16a34a" : "#9ca3af", whiteSpace: "nowrap" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 40, height: 2, background: done ? "#16a34a" : "#e5e7eb", margin: "0 8px", flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Preview Bar ──────────────────────────────────────────────────────────────
function PreviewBar({ form }: { form: WizardForm }) {
  return (
    <div style={{ padding: "14px 28px", background: "#f8fafc", borderTop: "1px solid #f3f4f6" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Preview</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Item Code", value: form.itemcode || "—" },
          { label: "Item Name", value: form.name || "—" },
          { label: "Category", value: form.category },
          { label: "Unit Cost", value: form.unitcost ? `$${form.unitcost}` : "$0.00" },
        ].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{f.label}:</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export function AddDrugWizard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof WizardForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key: keyof WizardForm, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const clearErr = (key: keyof WizardForm) =>
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });

  // ── Validation per step
  const validate = (): boolean => {
    const errs: Partial<Record<keyof WizardForm, string>> = {};
    if (step === 1) {
      if (!form.itemcode.trim()) errs.itemcode = "Item code is required";
      if (!form.name.trim()) errs.name = "Item name is required";
      if (!form.category.trim()) errs.category = "Category is required";
      if (!form.itemtype.trim()) errs.itemtype = "Item type is required";
    }
    if (step === 2) {
      if (!form.unit.trim()) errs.unit = "Unit of measure is required";
      if (!form.reorderlevel.trim()) errs.reorderlevel = "Reorder level is required";
      if (!form.minstock.trim()) errs.minstock = "Minimum stock is required";
      if (!form.maxstock.trim()) errs.maxstock = "Maximum stock is required";
      if (!form.leadtimedays.trim()) errs.leadtimedays = "Lead time is required";
    }
    if (step === 3) {
      if (!form.unitcost.trim()) errs.unitcost = "Unit cost is required";
      if (!form.sellingprice.trim()) errs.sellingprice = "Selling price is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 5)); };
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true); setApiError("");
    try {
      const payload = {
        name: form.name,
        genericname: form.genericname || null,
        atccode: form.atccode || null,
        form: form.dosageform || null,
        strength: form.strength || null,
        unit: form.unit,
        barcode: form.itemcode,
        manufacturer: form.manufacturer || null,
        requiresprescription: form.requiresprescription,
        insuranceapproved: form.insuranceapproved,
        description: form.drugclass || null,
        indication: form.subcategory || null,
        warning: form.highalertmedication ? "High Alert Medication" : null,
        notes: [
          form.storagetemperature && `Storage: ${form.storagetemperature}`,
          form.storagehumidity && `Humidity: ${form.storagehumidity}`,
          form.controlledsubstance && "Controlled Substance",
          form.requiresrefrigeration && "Requires Refrigeration",
          form.hazardousmaterial && "Hazardous Material",
        ].filter(Boolean).join(" | ") || null,
        metadata: {
          brandname: form.brandname,
          category: form.category,
          subcategory: form.subcategory,
          itemtype: form.itemtype,
          billingcode: form.billingcode,
          billableitem: form.billableitem,
          unitcost: parseFloat(form.unitcost) || 0,
          sellingprice: parseFloat(form.sellingprice) || 0,
          reorderlevel: parseInt(form.reorderlevel) || 0,
          minstock: parseInt(form.minstock) || 0,
          maxstock: parseInt(form.maxstock) || 0,
          leadtimedays: parseInt(form.leadtimedays) || 0,
          routeofadministration: form.routeofadministration,
          pregnancycategory: form.pregnancycategory,
        },
      };

      const res = await fetch("/api/drugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      setApiError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step renders
  const renderStep = () => {
    const inp = (key: keyof WizardForm, placeholder = "", type = "text") => (
      <div>
        <input
          type={type}
          placeholder={placeholder}
          value={form[key] as string}
          onChange={e => { set(key, e.target.value); clearErr(key); }}
          style={{ ...inputStyle, borderColor: errors[key] ? "#ef4444" : "#e5e7eb" }}
        />
        {errors[key] && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors[key]}</p>}
      </div>
    );

    const sel = (key: keyof WizardForm, options: string[]) => (
      <div>
        <select value={form[key] as string} onChange={e => { set(key, e.target.value); clearErr(key); }}
          style={{ ...selectStyle, borderColor: errors[key] ? "#ef4444" : "#e5e7eb" }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {errors[key] && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors[key]}</p>}
      </div>
    );

    const chk = (key: keyof WizardForm, label: string) => (
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
        <input type="checkbox" checked={form[key] as boolean}
          onChange={e => set(key, e.target.checked)}
          style={{ width: 15, height: 15, accentColor: "#2563eb", cursor: "pointer" }} />
        {label}
      </label>
    );

    const grid2 = (children: React.ReactNode) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>{children}</div>
    );

    if (step === 1) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Step 1: Basic Information</div>
        {grid2(<>
          <Field label="Item Code" required><div>{inp("itemcode", "e.g., PAR-500-TAB")}</div></Field>
          <Field label="Item Name" required><div>{inp("name", "e.g., Paracetamol 500mg Tablet")}</div></Field>
          <Field label="Generic Name"><div>{inp("genericname", "e.g., Paracetamol")}</div></Field>
          <Field label="Brand Name"><div>{inp("brandname", "e.g., Panadol")}</div></Field>
          <Field label="Category" required>
            {sel("category", ["Pharmacy", "Medical Supplies", "Equipment", "Lab Reagents"])}
          </Field>
          <Field label="Subcategory"><div>{inp("subcategory", "e.g., Analgesics")}</div></Field>
          <Field label="Item Type" required>
            {sel("itemtype", ["Drug", "Supply", "Equipment", "Reagent"])}
          </Field>
          <Field label="Manufacturer"><div>{inp("manufacturer", "e.g., GlaxoSmithKline")}</div></Field>
        </>)}
      </div>
    );

    if (step === 2) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Step 2: Stock Settings</div>
        {grid2(<>
          <Field label="Unit of Measure" required>
            {sel("unit", ["Tablet", "Capsule", "Vial", "Ampule", "Box", "Bottle", "Puff", "ml", "g"])}
          </Field>
          <Field label="Reorder Level" required><div>{inp("reorderlevel", "e.g., 500", "number")}</div></Field>
          <Field label="Minimum Stock" required><div>{inp("minstock", "e.g., 200", "number")}</div></Field>
          <Field label="Maximum Stock" required><div>{inp("maxstock", "e.g., 2000", "number")}</div></Field>
          <Field label="Lead Time (Days)" required><div>{inp("leadtimedays", "e.g., 7", "number")}</div></Field>
        </>)}
      </div>
    );

    if (step === 3) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Step 3: Pricing & Billing</div>
        {grid2(<>
          <Field label="Unit Cost" required><div>{inp("unitcost", "e.g., 0.05", "number")}</div></Field>
          <Field label="Selling Price" required><div>{inp("sellingprice", "e.g., 0.15", "number")}</div></Field>
          <Field label="Billing Code"><div>{inp("billingcode", "e.g., DRUG-001")}</div></Field>
          <Field label="Default Supplier">
            <select disabled style={{ ...selectStyle, background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" }}>
              <option>Select Supplier (coming soon)</option>
            </select>
          </Field>
        </>)}
        <div>{chk("billableitem", "Billable Item")}</div>
      </div>
    );

    if (step === 4) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Step 4: Storage & Safety</div>
        {grid2(<>
          <Field label="Storage Temperature"><div>{inp("storagetemperature", "e.g., 15-30°C")}</div></Field>
          <Field label="Storage Humidity"><div>{inp("storagehumidity", "e.g., Below 60%")}</div></Field>
        </>)}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
          {chk("controlledsubstance", "Controlled Substance")}
          {chk("requiresrefrigeration", "Requires Refrigeration")}
          {chk("hazardousmaterial", "Hazardous Material")}
        </div>
      </div>
    );

    if (step === 5) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Step 5: Category-Specific</div>
        {grid2(<>
          <Field label="Drug Class"><div>{inp("drugclass", "e.g., Analgesic")}</div></Field>
          <Field label="Dosage Form"><div>{inp("dosageform", "e.g., Tablet")}</div></Field>
          <Field label="Strength"><div>{inp("strength", "e.g., 500mg")}</div></Field>
          <Field label="ATC Code"><div>{inp("atccode", "e.g., N02BE01")}</div></Field>
          <Field label="Route of Administration">
            {sel("routeofadministration", ["", "Oral", "Intravenous", "Intramuscular", "Subcutaneous", "Topical", "Inhalation", "Rectal", "Sublingual"])}
          </Field>
          <Field label="Pregnancy Category">
            {sel("pregnancycategory", ["", "A", "B", "C", "D", "X", "N"])}
          </Field>
        </>)}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {chk("highalertmedication", "High Alert Medication")}
          {chk("requiresprescription", "Requires Prescription")}
          {chk("insuranceapproved", "Insurance Approved")}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 780, maxHeight: "95vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 5, background: "#f3f4f6", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>
                <Icon d={icons.arrow_left} size={13} color="#374151" /> Back
              </button>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>Add New Item</h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280", paddingLeft: 80 }}>Create a new inventory item</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={15} color="#6b7280" />
          </button>
        </div>

        {/* Step progress */}
        <div style={{ flexShrink: 0 }}>
          <StepProgress current={step} />
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {renderStep()}
        </div>

        {/* API Error */}
        {apiError && (
          <div style={{ margin: "0 28px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626", flexShrink: 0 }}>
            {apiError}
          </div>
        )}

        {/* Footer nav */}
        <div style={{ padding: "14px 28px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "#fff" }}>
          <div>
            {step > 1 && (
              <button onClick={prev} style={{ padding: "9px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
                Previous
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              Cancel
            </button>
            {step < 5 ? (
              <button onClick={next} style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Next
              </button>
            ) : (
              <button onClick={handleSave} disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#111827", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                <Icon d={icons.save} size={14} color="#fff" />
                {loading ? "Saving..." : "Save Item"}
              </button>
            )}
          </div>
        </div>

        {/* Preview — only on step 5 */}
        {step === 5 && <PreviewBar form={form} />}
      </div>
    </div>
  );
}
