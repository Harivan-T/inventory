"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  back:  "M19 12H5M12 5l-7 7 7 7",
  plus:  "M12 5v14M5 12h14",
  x:     "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  box:   "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  drug:        { bg: "#dbeafe", color: "#1d4ed8" },
  supply:      { bg: "#d1fae5", color: "#065f46" },
  consumable:  { bg: "#fef3c7", color: "#92400e" },
  reagent:     { bg: "#ede9fe", color: "#5b21b6" },
  asset:       { bg: "#fee2e2", color: "#991b1b" },
  radiology:   { bg: "#cffafe", color: "#0e7490" },
};

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  pharmacy:  { bg: "#eff6ff", color: "#2563eb" },
  lab:       { bg: "#ecfdf5", color: "#059669" },
  hospital:  { bg: "#f5f3ff", color: "#7c3aed" },
  radiology: { bg: "#fff7ed", color: "#ea580c" },
};

const ITEM_TYPES    = ["drug", "supply", "consumable", "reagent", "asset", "radiology"];
const INV_CATS      = ["pharmacy", "lab", "hospital", "radiology"];
const UOM_OPTIONS   = ["tablet", "capsule", "vial", "ampoule", "box", "strip", "piece", "ml", "mg", "g", "L", "unit"];

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: bg, color }}>{label}</span>;
}

function AddItemModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "", itemcode: "", genericname: "", description: "",
    itemtype: "supply", inventorycategory: "hospital", uom: "piece",
    minlevel: "", maxlevel: "", reorderlevel: "",
    manufacturer: "", barcode: "",
    batchtracking: true, expirytracking: true, controlled: false, hazardous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.itemcode) { setError("Name and item code are required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/items", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          minlevel:     form.minlevel     ? Number(form.minlevel)     : 0,
          maxlevel:     form.maxlevel     ? Number(form.maxlevel)     : null,
          reorderlevel: form.reorderlevel ? Number(form.reorderlevel) : 0,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inp = (label: string, key: string, type = "text") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
        style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
    </div>
  );

  const sel = (label: string, key: string, options: string[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <select value={(form as any)[key]} onChange={e => set(key, e.target.value)}
        style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const chk = (label: string, key: string) => (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
      <input type="checkbox" checked={(form as any)[key]} onChange={e => set(key, e.target.checked)}
        style={{ width: 15, height: 15, accentColor: "#2563eb" }} />
      {label}
    </label>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Add Item</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Add a new item to the master list</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={15} color="#6b7280" />
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {inp("Item Name *", "name")}
            {inp("Item Code *", "itemcode")}
            {inp("Generic Name", "genericname")}
            {inp("Manufacturer", "manufacturer")}
            {sel("Item Type", "itemtype", ITEM_TYPES)}
            {sel("Inventory Category", "inventorycategory", INV_CATS)}
            {sel("Unit of Measure", "uom", UOM_OPTIONS)}
            {inp("Barcode", "barcode")}
            {inp("Min Level", "minlevel", "number")}
            {inp("Max Level", "maxlevel", "number")}
            {inp("Reorder Level", "reorderlevel", "number")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2}
              style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {chk("Batch tracking", "batchtracking")}
            {chk("Expiry tracking", "expirytracking")}
            {chk("Controlled item", "controlled")}
            {chk("Hazardous", "hazardous")}
          </div>
          {error && <p style={{ margin: 0, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>

        <div style={{ padding: "14px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Saving..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ItemsPage() {
  const router   = useRouter();
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter]   = useState("");
  const [catFilter,  setCatFilter]    = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast]     = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.set("search",   search);
      if (typeFilter) params.set("type",     typeFilter);
      if (catFilter)  params.set("category", catFilter);
      const res = await fetch(`/api/items?${params}`);
      setItems(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [search, typeFilter, catFilter]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    await fetch(`/api/items?id=${id}`, { method: "DELETE" });
    showToast(`"${name}" deactivated`);
    fetchItems();
  };

  const stats = {
    total:      items.length,
    controlled: items.filter(i => i.controlled).length,
    lowstock:   0,
    types:      [...new Set(items.map(i => i.itemtype))].length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } .row:hover { background: #f8fafc !important; }`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "5px 10px", borderRadius: 6, background: "#f3f4f6" }}>
            <Icon d={icons.back} size={13} color="#6b7280" /> Dashboard
          </Link>
          <span style={{ color: "#d1d5db" }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Item Master</span>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color="#fff" /> Add Item
        </button>
      </div>

      <div style={{ padding: "24px 28px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Item Master</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Universal catalog for all inventory items</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Items",      value: stats.total,      color: "#2563eb", bg: "#eff6ff" },
            { label: "Item Types",       value: stats.types,      color: "#7c3aed", bg: "#ede9fe" },
            { label: "Controlled Items", value: stats.controlled, color: "#dc2626", bg: "#fee2e2" },
            { label: "Low Stock",        value: stats.lowstock,   color: "#d97706", bg: "#fef3c7" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", padding: "14px 20px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
              <Icon d={icons.search} size={14} color="#9ca3af" />
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
              style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", color: "#374151" }}>
            <option value="">All Types</option>
            {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", color: "#374151" }}>
            <option value="">All Categories</option>
            {INV_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(typeFilter || catFilter || search) && (
            <button onClick={() => { setSearch(""); setTypeFilter(""); setCatFilter(""); }}
              style={{ fontSize: 12, color: "#6b7280", background: "#f3f4f6", border: "none", borderRadius: 6, padding: "7px 12px", cursor: "pointer", fontWeight: 600 }}>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{items.length} items</span>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Item Code", "Name", "Type", "Category", "UOM", "Min", "Reorder", "Flags", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                      No items yet. <button onClick={() => setShowAdd(true)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add one →</button>
                    </td></tr>
                  )}
                  {items.map((item: any) => {
                    const tc = TYPE_COLORS[item.itemtype]  ?? { bg: "#f3f4f6", color: "#374151" };
                    const cc = CAT_COLORS[item.inventorycategory] ?? { bg: "#f3f4f6", color: "#374151" };
                    return (
                      <tr key={item.id} className="row" style={{ borderTop: "1px solid #f9fafb" }}>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{item.itemcode}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.name}</div>
                          {item.genericname && <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.genericname}</div>}
                        </td>
                        <td style={{ padding: "12px 16px" }}><Badge label={item.itemtype} bg={tc.bg} color={tc.color} /></td>
                        <td style={{ padding: "12px 16px" }}><Badge label={item.inventorycategory} bg={cc.bg} color={cc.color} /></td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{item.uom}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{item.minlevel ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{item.reorderlevel ?? "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {item.controlled  && <Badge label="Controlled" bg="#fee2e2" color="#dc2626" />}
                            {item.hazardous   && <Badge label="Hazardous"  bg="#fef3c7" color="#d97706" />}
                            {item.batchtracking && <Badge label="Batch"    bg="#f3f4f6" color="#6b7280" />}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => handleDelete(item.id, item.name)}
                            style={{ background: "#fef2f2", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "inline-flex" }}>
                            <Icon d={icons.trash} size={13} color="#dc2626" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onSuccess={() => { fetchItems(); showToast("Item added!"); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon d={icons.check} size={14} color="#fff" /> {toast}
        </div>
      )}
    </div>
  );
}
