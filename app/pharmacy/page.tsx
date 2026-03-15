"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  back:     "M19 12H5M12 5l-7 7 7 7",
  plus:     "M12 5v14M5 12h14",
  x:        "M18 6L6 18M6 6l12 12",
  check:    "M20 6L9 17l-5-5",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  convert:  "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3m10 0h3a2 2 0 002-2v-3",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  pill:     "M10.5 6.5L6.5 10.5M9 3l12 12-6 6L3 9l6-6zM3 9l4.5 4.5",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
};

const LOG_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  DISPENSE:   { bg: "#fee2e2", color: "#991b1b" },
  RETURN:     { bg: "#dbeafe", color: "#1d4ed8" },
  WASTAGE:    { bg: "#f3f4f6", color: "#6b7280" },
  COUNT:      { bg: "#d1fae5", color: "#065f46" },
};

function AddControlledLogModal({ stores, items, onClose, onSuccess }: { stores: any[]; items: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    storeid: "", itemid: "", quantity: "", actiontype: "DISPENSE",
    patientref: "", prescriptionref: "", dispensedby: "", witnessedby: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSave = async () => {
    if (!form.storeid || !form.itemid || !form.quantity) { setError("Store, item and quantity are required"); return; }
    if (!form.witnessedby) { setError("Witness signature is required for controlled drugs"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/pharmacy/controlled", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Log Controlled Drug</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>Witness signature required</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Store *",       key: "storeid",   type: "select", options: [{ value: "", label: "Select store..." }, ...stores.map(s => ({ value: s.id, label: s.name }))] },
            { label: "Controlled Drug *", key: "itemid", type: "select", options: [{ value: "", label: "Select drug..." }, ...items.filter(i => i.controlled).map(i => ({ value: i.id, label: i.name }))] },
            { label: "Action Type",   key: "actiontype", type: "select", options: ["DISPENSE","RETURN","WASTAGE","COUNT"].map(t => ({ value: t, label: t })) },
          ].map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
              <select value={(form as any)[f.key]} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}>
                {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
          {[
            { label: "Quantity *",        key: "quantity",        type: "number" },
            { label: "Patient Ref",       key: "patientref",      type: "text" },
            { label: "Prescription Ref",  key: "prescriptionref", type: "text" },
            { label: "Dispensed By",      key: "dispensedby",     type: "text" },
            { label: "Witnessed By *",    key: "witnessedby",     type: "text" },
            { label: "Notes",             key: "notes",           type: "text" },
          ].map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: f.key === "witnessedby" ? "#dc2626" : "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                style={{ padding: "8px 12px", border: `1px solid ${f.key === "witnessedby" ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, outline: "none" }} />
            </div>
          ))}
          {error && <p style={{ margin: 0, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>
        <div style={{ padding: "14px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #f3f4f6" }}>
