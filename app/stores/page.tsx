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
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  store:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  arrow:    "M5 12h14M12 5l7 7-7 7",
  layers:   "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  box:      "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
};

const DEPARTMENTS = ["Pharmacy", "Lab", "ICU", "Emergency", "Ward A", "Ward B", "OT", "Radiology", "Outpatient", "Other"];
const STORE_TYPES  = ["sub", "main"];

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  main: { bg: "#dbeafe", color: "#1d4ed8" },
  sub:  { bg: "#d1fae5", color: "#065f46" },
};

const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
  Pharmacy:   { bg: "#ede9fe", color: "#5b21b6" },
  Lab:        { bg: "#d1fae5", color: "#065f46" },
  ICU:        { bg: "#fee2e2", color: "#991b1b" },
  Emergency:  { bg: "#fef3c7", color: "#92400e" },
  Radiology:  { bg: "#cffafe", color: "#0e7490" },
  OT:         { bg: "#fce7f3", color: "#9d174d" },
};

function AddStoreModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "", storetype: "sub", department: "Pharmacy",
    warehouseid: "", manager: "", location: "", description: "",
  });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    fetch("/api/warehouses").then(r => r.json()).then(setWarehouses).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) { setError("Store name is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/stores", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, warehouseid: form.warehouseid || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inp = (label: string, key: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <input value={(form as any)[key]} onChange={e => set(key, e.target.value)}
        style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", color: "#111827", background: "#fff" }} />
    </div>
  );

  const sel = (label: string, key: string, options: { value: string; label: string }[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <select value={(form as any)[key]} onChange={e => set(key, e.target.value)}
        style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", color: "#111827" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Add Store</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Create a new department sub-store</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {inp("Store Name *", "name")}
          {inp("Manager", "manager")}
          {sel("Store Type", "storetype", STORE_TYPES.map(t => ({ value: t, label: t })))}
          {sel("Department", "department", DEPARTMENTS.map(d => ({ value: d, label: d })))}
          {sel("Parent Warehouse", "warehouseid", [{ value: "", label: "— None —" }, ...warehouses.map((w: any) => ({ value: w.id, label: w.name }))])}
          {inp("Location", "location")}
          <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2}
              style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", color: "#111827", background: "#fff" }} />
          </div>
          {error && <p style={{ gridColumn: "1/-1", margin: 0, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>
        <div style={{ padding: "14px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Saving..." : "Add Store"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoresPage() {
  const [stores, setStores]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast]     = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try { setStores(await (await fetch("/api/stores")).json()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStores(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    await fetch(`/api/stores?id=${id}`, { method: "DELETE" });
    showToast(`"${name}" deactivated`);
    fetchStores();
  };

  const stats = {
    total:   stores.length,
    main:    stores.filter(s => s.storetype === "main").length,
    sub:     stores.filter(s => s.storetype === "sub").length,
    depts:   [...new Set(stores.map(s => s.department).filter(Boolean))].length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } input, select, textarea { color: #111827 !important; } .row:hover { background: #f8fafc !important; } .card:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "5px 10px", borderRadius: 6, background: "#f3f4f6" }}>
            <Icon d={icons.back} size={13} color="#6b7280" /> Dashboard
          </Link>
          <span style={{ color: "#d1d5db" }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Department Stores</span>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color="#fff" /> Add Store
        </button>
      </div>

      <div style={{ padding: "24px 28px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Department Stores</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Sub-inventory stores for each department — receive from main warehouse, issue to patients</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Stores",   value: stats.total, color: "#2563eb", bg: "#eff6ff" },
            { label: "Main Stores",    value: stats.main,  color: "#7c3aed", bg: "#ede9fe" },
            { label: "Sub Stores",     value: stats.sub,   color: "#059669", bg: "#d1fae5" },
            { label: "Departments",    value: stats.depts, color: "#d97706", bg: "#fef3c7" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Store cards */}
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading stores...</div>
        ) : stores.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", padding: 60, textAlign: "center" }}>
            <Icon d={icons.store} size={32} color="#d1d5db" />
            <p style={{ margin: "12px 0 4px", fontSize: 15, fontWeight: 600, color: "#374151" }}>No stores yet</p>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#9ca3af" }}>Create your first department store</p>
            <button onClick={() => setShowAdd(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Icon d={icons.plus} size={14} color="#fff" /> Add Store
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {stores.map((store: any) => {
              const tc = TYPE_COLORS[store.storetype] ?? { bg: "#f3f4f6", color: "#374151" };
              const dc = DEPT_COLORS[store.department] ?? { bg: "#f3f4f6", color: "#6b7280" };
              return (
                <div key={store.id} className="card" style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", padding: 20, transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, background: "#f1f5f9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon d={icons.store} size={18} color="#6b7280" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{store.name}</div>
                        {store.manager && <div style={{ fontSize: 11, color: "#9ca3af" }}>Mgr: {store.manager}</div>}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(store.id, store.name)}
                      style={{ background: "#fef2f2", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", flexShrink: 0 }}>
                      <Icon d={icons.trash} size={13} color="#dc2626" />
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: tc.bg, color: tc.color }}>{store.storetype}</span>
                    {store.department && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: dc.bg, color: dc.color }}>{store.department}</span>}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>ITEMS IN STOCK</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{store.stockcount ?? 0}</div>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>TOTAL UNITS</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{store.totalstock ?? 0}</div>
                    </div>
                  </div>

                  {store.location && <div style={{ fontSize: 12, color: "#6b7280" }}>📍 {store.location}</div>}

                  <Link href={`/stores/${store.id}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "#eff6ff", color: "#2563eb", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    View Store <Icon d={icons.arrow} size={13} color="#2563eb" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && <AddStoreModal onClose={() => setShowAdd(false)} onSuccess={() => { fetchStores(); showToast("Store created!"); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon d={icons.check} size={14} color="#fff" /> {toast}
        </div>
      )}
    </div>
  );
}
