"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  manager: string | null;
  description: string | null;
  isactive: boolean;
  sectioncount: number;
  totalstock: number;
  createdat: string;
}

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  plus:    "M12 5v14M5 12h14",
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  warehouse: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  box:     "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  map:     "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z",
  x:       "M18 6L6 18M6 6l12 12",
  check:   "M20 6L9 17l-5-5",
  back:    "M19 12H5M12 5l-7 7 7 7",
};

function AddWarehouseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", location: "", manager: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Warehouse name is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inp = (key: keyof typeof form, placeholder: string, multiline = false) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {key.charAt(0).toUpperCase() + key.slice(1)}{key === "name" ? " *" : ""}
      </label>
      {multiline ? (
        <textarea placeholder={placeholder} value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={3}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
      ) : (
        <input placeholder={placeholder} value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "22px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Add Warehouse</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Create a new warehouse location</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {inp("name", "e.g., Main Warehouse")}
          {inp("location", "e.g., Building A, Floor 1")}
          {inp("manager", "e.g., John Smith")}
          {inp("description", "Optional description...", true)}
          {error && <p style={{ margin: 0, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>
        <div style={{ padding: "14px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating..." : "Create Warehouse"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchWarehouses = async () => {
  try {
    const res = await fetch("/api/warehouses");
    const json = await res.json();
    // ensure it's always an array
    setWarehouses(Array.isArray(json) ? json : []);
  } finally { setLoading(false); }
};

  useEffect(() => { fetchWarehouses(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
    showToast(`"${name}" deactivated`);
    fetchWarehouses();
  };

  const active = warehouses.filter(w => w.isactive);
  const totalStock = warehouses.reduce((s, w) => s + w.totalstock, 0);
  const totalSections = warehouses.reduce((s, w) => s + w.sectioncount, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} .row:hover{background:#f8fafc!important;} .btn:hover{opacity:0.85;}`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "5px 10px", borderRadius: 6, background: "#f3f4f6" }}>
            <Icon d={icons.back} size={13} color="#6b7280" /> Dashboard
          </Link>
          <span style={{ color: "#d1d5db" }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Warehouses</span>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color="#fff" /> Add Warehouse
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Warehouse Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Manage storage locations, sections and inventory</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Warehouses", value: warehouses.length, color: "#2563eb", bg: "#eff6ff" },
            { label: "Active Warehouses", value: active.length, color: "#16a34a", bg: "#d1fae5" },
            { label: "Total Sections", value: totalSections, color: "#7c3aed", bg: "#ede9fe" },
            { label: "Total Stock Units", value: totalStock.toLocaleString(), color: "#d97706", bg: "#fef3c7" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>All Warehouses</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{warehouses.length} total</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Warehouse Name", "Location", "Manager", "Sections", "Total Stock", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {warehouses.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                      No warehouses yet. <button onClick={() => setShowAdd(true)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add one →</button>
                    </td></tr>
                  )}
                  {warehouses.map(w => (
                    <tr key={w.id} className="row" style={{ borderTop: "1px solid #f9fafb" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, background: "#eff6ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon d={icons.warehouse} size={16} color="#2563eb" />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{w.name}</div>
                            {w.description && <div style={{ fontSize: 11, color: "#9ca3af" }}>{w.description.slice(0, 40)}{w.description.length > 40 ? "…" : ""}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Icon d={icons.map} size={12} color="#9ca3af" />
                          {w.location || "—"}
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{w.manager || "—"}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", background: "#ede9fe", padding: "3px 10px", borderRadius: 20 }}>{w.sectioncount}</span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#d97706", background: "#fef3c7", padding: "3px 10px", borderRadius: 20 }}>{w.totalstock.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: w.isactive ? "#d1fae5" : "#f3f4f6", color: w.isactive ? "#065f46" : "#6b7280" }}>
                          {w.isactive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={`/warehouses/${w.id}`}
                            style={{ background: "#eff6ff", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "inline-flex", textDecoration: "none" }}>
                            <Icon d={icons.eye} size={13} color="#2563eb" />
                          </Link>
                          <button onClick={() => handleDelete(w.id, w.name)}
                            style={{ background: "#fef2f2", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "inline-flex" }}>
                            <Icon d={icons.trash} size={13} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddWarehouseModal onClose={() => setShowAdd(false)} onSuccess={() => { fetchWarehouses(); showToast("Warehouse created!"); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon d={icons.check} size={14} color="#fff" /> {toast}
        </div>
      )}
    </div>
  );
}
