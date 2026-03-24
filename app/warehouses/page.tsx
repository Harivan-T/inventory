"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  plus:      "M12 5v14M5 12h14",
  warehouse: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  box:       "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  x:         "M18 6L6 18M6 6l12 12",
  check:     "M20 6L9 17l-5-5",
  back:      "M19 12H5M12 5l-7 7 7 7",
  flask:     "M9 3h6l1 7H8L9 3zM5 21h14a1 1 0 001-1 7 7 0 00-3.48-6.07L15 10H9l-1.52 3.93A7 7 0 005 20a1 1 0 001 1z",
  pill:      "M10.5 6.5L6.5 10.5M9 3l12 12-6 6L3 9l6-6z",
  radio:     "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  hospital:  { label: "Hospital",  color: "#2563eb", bg: "#eff6ff",  icon: icons.warehouse },
  pharmacy:  { label: "Pharmacy",  color: "#16a34a", bg: "#f0fdf4",  icon: icons.pill },
  lab:       { label: "Lab",       color: "#7c3aed", bg: "#f5f3ff",  icon: icons.flask },
  radiology: { label: "Radiology", color: "#d97706", bg: "#fef3c7",  icon: icons.radio },
};

function AddWarehouseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", location: "", manager: "", description: "", warehousetype: "hospital" });
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

  const inp = (label: string, key: keyof typeof form, required = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
        {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, color: "#111827" }} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Add Warehouse</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icon d={icons.x} size={18} color="#6b7280" />
          </button>
        </div>
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
            Inventory Type <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <button key={type} onClick={() => setForm(f => ({ ...f, warehousetype: type }))}
                style={{
                  padding: "10px 12px", borderRadius: 8, border: `2px solid ${form.warehousetype === type ? cfg.color : "#e5e7eb"}`,
                  background: form.warehousetype === type ? cfg.bg : "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500,
                  color: form.warehousetype === type ? cfg.color : "#374151",
                }}>
                <Icon d={cfg.icon} size={14} color={form.warehousetype === type ? cfg.color : "#9ca3af"} />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {inp("Warehouse Name", "name", true)}
        {inp("Location", "location")}
        {inp("Manager", "manager")}
        {inp("Description", "description")}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose}
            style={{ padding: "8px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving..." : "Add Warehouse"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [toast, setToast]           = useState("");

  const fetchWarehouses = () => {
    setLoading(true);
    fetch("/api/warehouses")
      .then(r => r.json())
      .then(d => { setWarehouses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = typeFilter ? warehouses.filter(w => w.warehousetype === typeFilter) : warehouses;

  // Group by type
  const grouped: Record<string, any[]> = {};
  for (const w of filtered) {
    const t = w.warehousetype ?? "hospital";
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(w);
  }

  const typeOrder = ["hospital", "pharmacy", "lab", "radiology"];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } input, select { color: #111827 !important; }`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", color: "#6b7280", textDecoration: "none" }}>
          <Icon d={icons.back} size={15} />
        </Link>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Warehouses</span>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {/* Type filter */}
          <div style={{ display: "flex", gap: 6 }}>
            {["", ...typeOrder].map(t => {
              const cfg = t ? TYPE_CONFIG[t] : null;
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{
                    padding: "5px 12px", borderRadius: 20, border: `1px solid ${typeFilter === t ? (cfg?.color ?? "#2563eb") : "#e5e7eb"}`,
                    background: typeFilter === t ? (cfg?.bg ?? "#eff6ff") : "#fff",
                    color: typeFilter === t ? (cfg?.color ?? "#2563eb") : "#6b7280",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}>
                  {t ? cfg!.label : "All"}
                </button>
              );
            })}
          </div>
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Icon d={icons.plus} size={13} color="#fff" />
            Add Warehouse
          </button>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {typeOrder.map(t => {
            const cfg = TYPE_CONFIG[t];
            const count = warehouses.filter(w => (w.warehousetype ?? "hospital") === t).length;
            return (
              <div key={t} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={cfg.icon} size={15} color={cfg.color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{cfg.label}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{count}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>warehouses</div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 13 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 13 }}>
            No warehouses yet.{" "}
            <button onClick={() => setShowAdd(true)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Add one →
            </button>
          </div>
        ) : (
          typeOrder.filter(t => grouped[t]?.length > 0).map(t => {
            const cfg = TYPE_CONFIG[t];
            return (
              <div key={t} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {cfg.label} Inventory
                  </span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>({grouped[t].length})</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {grouped[t].map((w: any) => (
                    <div key={w.id} style={{ background: "#fff", borderRadius: 10, border: `1px solid #e5e7eb`, borderTop: `3px solid ${cfg.color}`, padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{w.name}</div>
                          {w.location && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{w.location}</div>}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        <div style={{ background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }}>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>Sections</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{w.sectioncount ?? 0}</div>
                        </div>
                        <div style={{ background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }}>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>Stock Items</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{w.totalstock ?? 0}</div>
                        </div>
                      </div>
                      {w.manager && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>Manager: {w.manager}</div>}
                      <Link href={`/warehouses/${w.id}`}
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: cfg.color, textDecoration: "none" }}>
                        <Icon d={icons.eye} size={13} color={cfg.color} />
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAdd && <AddWarehouseModal onClose={() => setShowAdd(false)} onSuccess={() => { fetchWarehouses(); showToast("Warehouse added!"); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 2000, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon d={icons.check} size={14} color="#fff" /> {toast}
        </div>
      )}
    </div>
  );
}
