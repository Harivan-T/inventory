"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Section {
  id: string;
  warehouseid: string;
  warehousename: string | null;
  sectionname: string;
  sectiontype: string | null;
  temperaturecontrolled: boolean;
  createdat: string;
}

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  back:    "M19 12H5M12 5l-7 7 7 7",
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6L6 18M6 6l12 12",
  check:   "M20 6L9 17l-5-5",
  layers:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  thermometer: "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
};

function AddSectionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ warehouseid: "", sectionname: "", sectiontype: "", temperaturecontrolled: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/warehouses").then(r => r.json()).then(setWarehouses);
  }, []);

  const handleSave = async () => {
    if (!form.warehouseid || !form.sectionname.trim()) { setError("Warehouse and section name are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/sections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Add New Section</h3>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}><Icon d={icons.x} size={14} color="#6b7280" /></button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Warehouse *</label>
            <select value={form.warehouseid} onChange={e => setForm(f => ({ ...f, warehouseid: e.target.value }))}
              style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
              <option value="">Select a warehouse...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          {[["Section Name *", "sectionname", "e.g., Cold Storage A"], ["Section Type", "sectiontype", "e.g., Refrigerated, Dry, Controlled"]].map(([label, key, ph]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</label>
              <input placeholder={ph} value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
            </div>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
            <input type="checkbox" checked={form.temperaturecontrolled}
              onChange={e => setForm(f => ({ ...f, temperaturecontrolled: e.target.checked }))}
              style={{ width: 15, height: 15, accentColor: "#2563eb" }} />
            Temperature Controlled
          </label>
          {error && <p style={{ margin: 0, padding: "8px 12px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>
        <div style={{ padding: "12px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Adding..." : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

const fetchSections = async () => {
  try {
    const res = await fetch("/api/sections");
    const json = await res.json();
    setSections(Array.isArray(json) ? json : []);
  } finally { setLoading(false); }
};

  useEffect(() => { fetchSections(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const tempControlled = sections.filter(s => s.temperaturecontrolled).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} .row:hover{background:#f8fafc!important;} .btn:hover{opacity:0.85;}`}</style>

      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/warehouses" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "5px 10px", borderRadius: 6, background: "#f3f4f6" }}>
            <Icon d={icons.back} size={13} color="#6b7280" /> Warehouses
          </Link>
          <span style={{ color: "#d1d5db" }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Sections</span>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color="#fff" /> Add Section
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Warehouse Sections</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>All storage sections across warehouses</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Sections", value: sections.length, color: "#7c3aed", },
            { label: "Temp. Controlled", value: tempControlled, color: "#0891b2" },
            { label: "Standard Sections", value: sections.length - tempControlled, color: "#16a34a" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{sections.length} sections</span>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Section Name", "Warehouse", "Type", "Temp. Controlled", "Created"].map(h => (
                      <th key={h} style={{ padding: "9px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sections.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No sections yet.</td></tr>
                  )}
                  {sections.map(s => (
                    <tr key={s.id} className="row" style={{ borderTop: "1px solid #f9fafb" }}>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, background: "#ede9fe", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon d={icons.layers} size={13} color="#7c3aed" />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.sectionname}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Link href={`/warehouses/${s.warehouseid}`} style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                          {s.warehousename ?? "—"}
                        </Link>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        {s.sectiontype ? <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#f1f5f9", color: "#374151" }}>{s.sectiontype}</span> : "—"}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        {s.temperaturecontrolled
                          ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#0891b2", fontWeight: 600 }}><Icon d={icons.thermometer} size={12} color="#0891b2" /> Yes</span>
                          : <span style={{ fontSize: 12, color: "#9ca3af" }}>No</span>}
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 12, color: "#9ca3af" }}>{new Date(s.createdat).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddSectionModal onClose={() => setShowAdd(false)} onSuccess={() => { fetchSections(); showToast("Section added!"); }} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
