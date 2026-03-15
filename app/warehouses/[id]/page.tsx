"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Section {
  id: string;
  warehouseid: string;
  sectionname: string;
  sectiontype: string | null;
  temperaturecontrolled: boolean;
  createdat: string;
}

interface StockItem {
  id: string;
  drugid: string;
  drugname: string | null;
  genericname: string | null;
  form: string | null;
  strength: string | null;
  manufacturer: string | null;
  sectionname: string | null;
  quantity: number;
  createdat: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  manager: string | null;
  description: string | null;
  isactive: boolean;
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
  box:     "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  layers:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  thermometer: "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
  pill:    "M10.5 6.5L6.5 10.5M9 3l12 12-6 6L3 9l6-6zM3 9l4.5 4.5",
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
};

// ── Add Section Modal
function AddSectionModal({ warehouseid, onClose, onSuccess }: { warehouseid: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ sectionname: "", sectiontype: "", temperaturecontrolled: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.sectionname.trim()) { setError("Section name required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/sections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, warehouseid }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Add Section</h3>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}><Icon d={icons.x} size={14} color="#6b7280" /></button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
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

// ── Add Stock Modal
function AddStockModal({ warehouseid, sections, onClose, onSuccess }: { warehouseid: string; sections: Section[]; onClose: () => void; onSuccess: () => void }) {
  const [drugs, setDrugs] = useState<{ drugid: string; name: string }[]>([]);
  const [form, setForm] = useState({ drugid: "", sectionid: "", quantity: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/drugs").then(r => r.json()).then(setDrugs);
  }, []);

  const handleSave = async () => {
    if (!form.drugid || !form.quantity) { setError("Drug and quantity are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/warehouse-stock", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, warehouseid, quantity: parseInt(form.quantity) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const sel = (key: keyof typeof form, options: { value: string; label: string }[], placeholder: string) => (
    <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff", width: "100%" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Add Stock</h3>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}><Icon d={icons.x} size={14} color="#6b7280" /></button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Drug *</label>
            {sel("drugid", drugs.map(d => ({ value: d.drugid, label: d.name })), "Select a drug...")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Section</label>
            {sel("sectionid", sections.map(s => ({ value: s.id, label: s.sectionname })), "Select section (optional)")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Quantity *</label>
            <input type="number" placeholder="e.g., 500" value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} min="0"
              style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
          </div>
          {error && <p style={{ margin: 0, padding: "8px 12px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>
        <div style={{ padding: "12px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Adding..." : "Add Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Detail Page
export default function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ warehouse: Warehouse; sections: Section[]; stock: StockItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/warehouses/${id}`);
      setData(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13, fontFamily: "Inter, sans-serif" }}>Loading...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Warehouse not found.</div>;

  const { warehouse, sections, stock } = data;
  const totalStock = stock.reduce((s, i) => s + i.quantity, 0);
  const sectionTypes = [...new Set(sections.map(s => s.sectiontype).filter(Boolean))];

  const formBadgeColor: Record<string, string> = { tablet: "#dbeafe", capsule: "#d1fae5", inhaler: "#fef3c7", syrup: "#ede9fe" };
  const formTextColor: Record<string, string> = { tablet: "#1d4ed8", capsule: "#065f46", inhaler: "#92400e", syrup: "#5b21b6" };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;} .row:hover{background:#f8fafc!important;} .btn:hover{opacity:0.85;}`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/warehouses" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "5px 10px", borderRadius: 6, background: "#f3f4f6" }}>
          <Icon d={icons.back} size={13} color="#6b7280" /> Warehouses
        </Link>
        <span style={{ color: "#d1d5db" }}>›</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{warehouse.name}</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: warehouse.isactive ? "#d1fae5" : "#f3f4f6", color: warehouse.isactive ? "#065f46" : "#6b7280" }}>
          {warehouse.isactive ? "Active" : "Inactive"}
        </span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Warehouse Info Card */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #f3f4f6", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>{warehouse.name}</h1>
            {warehouse.description && <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6b7280" }}>{warehouse.description}</p>}
            <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#374151" }}>
              {warehouse.location && <span>📍 {warehouse.location}</span>}
              {warehouse.manager && <span>👤 {warehouse.manager}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowAddSection(true)} className="btn"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Icon d={icons.plus} size={13} color="#fff" /> Add Section
            </button>
            <button onClick={() => setShowAddStock(true)} className="btn"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Icon d={icons.plus} size={13} color="#fff" /> Add Stock
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Sections", value: sections.length, color: "#7c3aed", bg: "#ede9fe" },
            { label: "Stock Items", value: stock.length, color: "#2563eb", bg: "#eff6ff" },
            { label: "Total Units", value: totalStock.toLocaleString(), color: "#16a34a", bg: "#d1fae5" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Sections Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Sections</span>
            <button onClick={() => setShowAddSection(true)} className="btn"
              style={{ display: "flex", alignItems: "center", gap: 5, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Icon d={icons.plus} size={12} color="#fff" /> Add
            </button>
          </div>
          {sections.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No sections yet. <button onClick={() => setShowAddSection(true)} style={{ color: "#7c3aed", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Add one →</button></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Section Name", "Type", "Temp. Controlled", "Created"].map(h => (
                      <th key={h} style={{ padding: "9px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
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
                        {s.sectiontype ? (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#f1f5f9", color: "#374151" }}>{s.sectiontype}</span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        {s.temperaturecontrolled ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#0891b2", fontWeight: 600 }}>
                            <Icon d={icons.thermometer} size={12} color="#0891b2" /> Yes
                          </span>
                        ) : <span style={{ fontSize: 12, color: "#9ca3af" }}>No</span>}
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 12, color: "#9ca3af" }}>{new Date(s.createdat).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Inventory Stock</span>
            <button onClick={() => setShowAddStock(true)} className="btn"
              style={{ display: "flex", alignItems: "center", gap: 5, background: "#16a34a", color: "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Icon d={icons.plus} size={12} color="#fff" /> Add Stock
            </button>
          </div>
          {stock.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No stock yet. <button onClick={() => setShowAddStock(true)} style={{ color: "#16a34a", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Add stock →</button></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Drug", "Generic", "Form", "Section", "Quantity", "Added"].map(h => (
                      <th key={h} style={{ padding: "9px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => (
                    <tr key={item.id} className="row" style={{ borderTop: "1px solid #f9fafb" }}>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, background: "#eff6ff", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon d={icons.pill} size={13} color="#2563eb" />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.drugname ?? "—"}</div>
                            {item.strength && <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.strength}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 13, color: "#374151" }}>{item.genericname ?? "—"}</td>
                      <td style={{ padding: "11px 16px" }}>
                        {item.form ? (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: formBadgeColor[item.form] ?? "#f3f4f6", color: formTextColor[item.form] ?? "#374151" }}>{item.form}</span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 13, color: "#374151" }}>{item.sectionname ?? <span style={{ color: "#9ca3af" }}>—</span>}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: item.quantity < 100 ? "#dc2626" : "#16a34a" }}>{item.quantity.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 12, color: "#9ca3af" }}>{new Date(item.createdat).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddSection && <AddSectionModal warehouseid={id} onClose={() => setShowAddSection(false)} onSuccess={() => { fetchData(); showToast("Section added!"); }} />}
      {showAddStock && <AddStockModal warehouseid={id} sections={sections} onClose={() => setShowAddStock(false)} onSuccess={() => { fetchData(); showToast("Stock added!"); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
