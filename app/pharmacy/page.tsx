"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImportDrugModal } from "@/components/ImportDrugModal";



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
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  alert:   "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  pill:    "M10.5 6.5L6.5 10.5M9 3l12 12-6 6L3 9l6-6z",
  import:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  lock:    "M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V9a6 6 0 10-12 0v2H4v13h16V11h-2z",
};

const s: Record<string, any> = {
  page:    { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:  { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 },
  content: { padding: 24, maxWidth: 1400, margin: "0 auto" },
  tabs:    { display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid #e5e7eb" },
  tab:     (a: boolean) => ({ padding: "10px 20px", fontSize: 13, fontWeight: 500, border: "none", background: "none", cursor: "pointer", borderBottom: a ? "2px solid #6366f1" : "2px solid transparent", color: a ? "#6366f1" : "#6b7280" }),
  card:    { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 16 },
  th:      { padding: "10px 12px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" as const, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" as const },
  td:      { padding: "10px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#111827" },
  btn:     (c: string) => ({ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: c === "purple" ? "#6366f1" : c === "green" ? "#16a34a" : c === "blue" ? "#2563eb" : c === "red" ? "#dc2626" : "#f3f4f6", color: c === "ghost" ? "#374151" : "#fff" }),
  input:   { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, color: "#111827", boxSizing: "border-box" as const },
  label:   { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal:   { background: "#fff", borderRadius: 12, padding: 28, width: 600, maxHeight: "90vh", overflowY: "auto" as const },
  fgroup:  { marginBottom: 14 },
};

function stockColor(qty: number, reorder: number) {
  if (qty === 0) return { bg: "#fee2e2", color: "#991b1b", label: "Out of stock" };
  if (qty <= reorder) return { bg: "#fef3c7", color: "#92400e", label: "Low stock" };
  return { bg: "#d1fae5", color: "#065f46", label: "In stock" };
}

function expiryAlert(date: string | null) {
  if (!date) return null;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (days <= 0) return { label: "Expired", bg: "#fee2e2", color: "#991b1b" };
  if (days <= 90) return { label: `Expires ${days}d`, bg: "#fef3c7", color: "#92400e" };
  return null;
}

// ── Add/Edit Item Modal ────────────────────────────────────────────────────────
function ItemModal({ item, warehouses, onClose, onSuccess }: { item?: any; warehouses: any[]; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name:          item?.name          ?? "",
    genericname:   item?.genericName   ?? "",
    itemcode:      item?.itemcode      ?? "",
    itemtype:      item?.itemType      ?? "drug",
    uom:           item?.uom           ?? "tablet",
    manufacturer:  item?.manufacturer  ?? "",
    description:   item?.description   ?? "",
    barcode:       item?.barcode       ?? "",
    min_level:     String(item?.minLevel    ?? ""),
    reorder_level: String(item?.reorderLevel ?? ""),
    max_level:     String(item?.maxLevel    ?? ""),
    controlled:    item?.controlled    ?? false,
    warehouseid:   "",
    unitcost:      String(item?.unitCost     ?? ""),
    sellingprice:  String(item?.sellingPrice ?? ""),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.itemcode.trim()) { setError("Name and item code are required"); return; }
    if (!isEdit && !form.warehouseid) { setError("Warehouse is required"); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        inventorycategory: "pharmacy",
        min_level:     parseInt(form.min_level)     || 0,
        reorder_level: parseInt(form.reorder_level) || 0,
        max_level:     parseInt(form.max_level)     || null,
      };
      const url    = isEdit ? `/api/items/${item.id}` : "/api/items";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{isEdit ? "Edit Item" : "Add Pharmacy Item"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} color="#6b7280" /></button>
        </div>
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={s.fgroup}>
            <label style={s.label}>Item Name *</label>
            <input style={s.input} value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Generic Name</label>
            <input style={s.input} value={form.genericname} onChange={e => set("genericname", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Item Code *</label>
            <input style={s.input} value={form.itemcode} onChange={e => set("itemcode", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Barcode</label>
            <input style={s.input} value={form.barcode} onChange={e => set("barcode", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Item Type</label>
            <select style={s.input} value={form.itemtype} onChange={e => set("itemtype", e.target.value)}>
              {["drug","supply","consumable","asset"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Unit of Measure</label>
            <select style={s.input} value={form.uom} onChange={e => set("uom", e.target.value)}>
              {["tablet","capsule","ampoule","vial","bag","bottle","sachet","strip","piece","ml","mg","g"].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Manufacturer</label>
            <input style={s.input} value={form.manufacturer} onChange={e => set("manufacturer", e.target.value)} />
          </div>
          {!isEdit && (
            <div style={s.fgroup}>
              <label style={s.label}>Pharmacy Warehouse *</label>
              <select style={s.input} value={form.warehouseid} onChange={e => set("warehouseid", e.target.value)}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}
          <div style={s.fgroup}>
            <label style={s.label}>Purchase Price (unit cost)</label>
            <input type="number" step="0.01" style={s.input} value={form.unitcost} onChange={e => set("unitcost", e.target.value)} placeholder="0.00" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Selling Price</label>
            <input type="number" step="0.01" style={s.input} value={form.sellingprice} onChange={e => set("sellingprice", e.target.value)} placeholder="0.00" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Min Level</label>
            <input type="number" style={s.input} value={form.min_level} onChange={e => set("min_level", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Reorder Level</label>
            <input type="number" style={s.input} value={form.reorder_level} onChange={e => set("reorder_level", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Max Level</label>
            <input type="number" style={s.input} value={form.max_level} onChange={e => set("max_level", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1", ...s.fgroup }}>
            <label style={s.label}>Description</label>
            <input style={s.input} value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" id="ctrl" checked={form.controlled} onChange={e => set("controlled", e.target.checked)} style={{ width: 15, height: 15, accentColor: "#6366f1" }} />
            <label htmlFor="ctrl" style={{ fontSize: 13, color: "#374151", cursor: "pointer" }}>Controlled substance</label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={s.btn("purple")}>{loading ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────────
function ConfirmModal({ item, onClose, onSuccess }: { item: any; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      onSuccess(); onClose();
    } finally { setLoading(false); }
  };
  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, width: 420 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Deactivate Item</h3>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Are you sure you want to deactivate <strong>{item.name}</strong>? It will no longer appear in stock operations.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb" }}>Cancel</button>
          <button onClick={handleDelete} disabled={loading} style={s.btn("red")}>{loading ? "Deactivating..." : "Deactivate"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Dispense Modal ─────────────────────────────────────────────────────────────
function DispenseModal({ stores, onClose, onSuccess }: { stores: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ storeid: "", itemid: "", batchid: "", quantity: "", patientref: "", prescriptionref: "", dispensedby: "", witnessedby: "", notes: "" });
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!form.storeid) return;
    fetch(`/api/stores/${form.storeid}`).then(r => r.json()).then(d => setStoreItems(d.stock ?? []));
  }, [form.storeid]);

  const handleSave = async () => {
    if (!form.storeid || !form.itemid || !form.quantity) { setError("Store, item and quantity are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/pharmacy/dispense", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, quantity: parseInt(form.quantity), actiontype: "DISPENSE" }) });
      if (!res.ok) throw new Error((await res.json()).error);
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Dispense Drug</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} color="#6b7280" /></button>
        </div>
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={s.fgroup}>
            <label style={s.label}>Store *</label>
            <select style={s.input} value={form.storeid} onChange={e => set("storeid", e.target.value)}>
              <option value="">Select store</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Item *</label>
            <select style={s.input} value={form.itemid} onChange={e => set("itemid", e.target.value)}>
              <option value="">Select item</option>
              {storeItems.map(i => <option key={i.itemid} value={i.itemid}>{i.itemname}</option>)}
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Quantity *</label>
            <input type="number" style={s.input} value={form.quantity} onChange={e => set("quantity", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Patient Ref</label>
            <input style={s.input} value={form.patientref} onChange={e => set("patientref", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Prescription Ref</label>
            <input style={s.input} value={form.prescriptionref} onChange={e => set("prescriptionref", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Dispensed By</label>
            <input style={s.input} value={form.dispensedby} onChange={e => set("dispensedby", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1", ...s.fgroup }}>
            <label style={s.label}>Witness (controlled drugs)</label>
            <input style={s.input} value={form.witnessedby} onChange={e => set("witnessedby", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1", ...s.fgroup }}>
            <label style={s.label}>Notes</label>
            <input style={s.input} value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={s.btn("purple")}>{loading ? "Dispensing..." : "Dispense"}</button>
        </div>
      </div>
    </div>
  );
}
// ── Batch Viewer Modal ─────────────────────────────────────────────────────────
function BatchModal({ item, onClose }: { item: any; onClose: () => void }) {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pharmacy/items/${item.id}/batches`)
      .then(r => r.json())
      .then(d => { setBatches(Array.isArray(d) ? d : []); setLoading(false); });
  }, [item.id]);

  function batchStatus(b: any) {
    if (!b.expiryDate) return { label: "No Expiry", bg: "#f3f4f6", color: "#374151" };
    const days = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / 86400000);
    if (days <= 0)  return { label: "Expired",    bg: "#fee2e2", color: "#991b1b" };
    if (days <= 30) return { label: `${days}d`,   bg: "#fee2e2", color: "#991b1b" };
    if (days <= 90) return { label: `${days}d`,   bg: "#fef3c7", color: "#92400e" };
    return { label: "OK", bg: "#d1fae5", color: "#065f46" };
  }

  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, width: 760 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{item.name}</h3>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {item.itemcode} · {item.uom} · Batch Viewer (FEFO order)
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icon d={icons.x} size={18} color="#6b7280" />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading batches...</div>
        ) : batches.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No batches found for this item</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Batch No","Qty","Purchase Price","Selling Price","Expiry","Manufactured","Warehouse","Supplier","Status"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map(b => {
                const st = batchStatus(b);
                return (
                  <tr key={b.id}>
                    <td style={{ ...s.td, fontFamily: "monospace", fontWeight: 600 }}>{b.batchNumber ?? "—"}</td>
                    <td style={{ ...s.td, fontWeight: 700, fontSize: 15 }}>{b.quantity}</td>
                    <td style={s.td}>{b.unitCost ? `$${parseFloat(b.unitCost).toFixed(2)}` : "—"}</td>
                    <td style={{ ...s.td, color: "#16a34a", fontWeight: 600 }}>{b.sellingPrice ? `$${parseFloat(b.sellingPrice).toFixed(2)}` : "—"}</td>
                    <td style={s.td}>
                      {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>
                      {b.manufactureDate ? new Date(b.manufactureDate).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ ...s.td, fontSize: 12 }}>{b.warehouseName ?? "—"}</td>
                    <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{b.supplierName ?? "—"}</td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Summary footer */}
        {!loading && batches.length > 0 && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f9fafb", borderRadius: 8, display: "flex", gap: 24 }}>
            <div><span style={{ fontSize: 11, color: "#6b7280" }}>Total Qty</span><div style={{ fontWeight: 700, fontSize: 16 }}>{batches.reduce((s, b) => s + (b.quantity || 0), 0)}</div></div>
            <div><span style={{ fontSize: 11, color: "#6b7280" }}>Batches</span><div style={{ fontWeight: 700, fontSize: 16 }}>{batches.length}</div></div>
            <div><span style={{ fontSize: 11, color: "#6b7280" }}>Expired</span><div style={{ fontWeight: 700, fontSize: 16, color: "#dc2626" }}>{batches.filter(b => b.expiryDate && new Date(b.expiryDate) < new Date()).length}</div></div>
            <div><span style={{ fontSize: 11, color: "#6b7280" }}>Expiring &lt;90d</span><div style={{ fontWeight: 700, fontSize: 16, color: "#d97706" }}>{batches.filter(b => { if (!b.expiryDate) return false; const d = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / 86400000); return d > 0 && d <= 90; }).length}</div></div>
          </div>
        )}
      </div>
    </div>
  );
}
// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PharmacyPage() {
  const router = useRouter();
  const [tab, setTab]           = useState<"items"|"stock"|"dispense"|"controlled"|"history">("items");
  const [items, setItems]       = useState<any[]>([]);
  const [dispenses, setDispenses] = useState<any[]>([]);
  const [controlled, setControlled] = useState<any[]>([]);
  const [stores, setStores]     = useState<any[]>([]);
  const [pharmaWh, setPharmaWh] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDispense, setShowDispense]   = useState(false);
  const [showAddItem, setShowAddItem]     = useState(false);
  const [editItem, setEditItem]           = useState<any>(null);
  const [deleteItem, setDeleteItem]       = useState<any>(null);
  const [toast, setToast]       = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [history, setHistory]         = useState<any[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage]   = useState(1);
  const HISTORY_SIZE = 15;
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const [batchItem, setBatchItem] = useState<any>(null);  
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, dRes, cRes, sRes, wRes] = await Promise.all([
        fetch(`/api/pharmacy/items?search=${encodeURIComponent(search)}`),
        fetch("/api/pharmacy/dispense"),
        fetch("/api/pharmacy/controlled"),
        fetch("/api/stores"),
        fetch("/api/warehouses"),
      ]);
      const [iData, dData, cData, sData, wData] = await Promise.all([
        iRes.json(), dRes.json(), cRes.json(), sRes.json(), wRes.json(),
      ]);
      setItems(Array.isArray(iData) ? iData : []);
      setDispenses(Array.isArray(dData) ? dData : []);
      setControlled(Array.isArray(cData) ? cData : []);
      setStores(Array.isArray(sData) ? sData : []);
      const allWh = Array.isArray(wData) ? wData : (wData.warehouses ?? []);
      setPharmaWh(allWh.filter((w: any) => w.warehousetype === "pharmacy" || w.warehouse_type === "pharmacy"));
    } finally { setLoading(false); }

    if (tab === "history") {
      fetch(`/api/pharmacy/history?page=${historyPage}&limit=${HISTORY_SIZE}`)
        .then(r => r.json())
        .then(d => { setHistory(d.rows ?? []); setHistoryTotal(d.total ?? 0); });
    }
  }, [search, tab, historyPage]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredItems = items.filter(i => typeFilter === "all" || i.itemType === typeFilter);
  const totalItems  = items.length;
  const lowStock    = items.filter(i => parseInt(i.totalStock) > 0 && parseInt(i.totalStock) <= parseInt(i.reorderLevel ?? 0)).length;
  const outOfStock  = items.filter(i => parseInt(i.totalStock) === 0).length;
  const controlledCt = items.filter(i => i.controlled).length;

  return (
    <div style={s.page}>
      <style>{`* { box-sizing: border-box; } input, select { color: #111827 !important; } tr:hover td { background: #f9fafb; }`}</style>

      {/* ── Header ── */}
      <div style={s.header}>
        <Link href="/" style={{ display: "flex", alignItems: "center", color: "#6b7280", textDecoration: "none" }}>
          <Icon d={icons.back} size={15} />
        </Link>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <div style={{ width: 32, height: 32, background: "#ede9fe", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={icons.pill} size={16} color="#6366f1" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Pharmacy Inventory</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={fetchAll} style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 5 }}>
            <Icon d={icons.refresh} size={13} color="#374151" />
          </button>
          <button onClick={() => setShowImportModal(true)}
            style={{ ...s.btn("ghost"), border: "1px solid #bbf7d0", color: "#16a34a", background: "#f0fdf4", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={icons.import} size={13} color="#16a34a" /> Import from DB
          </button>
          <button onClick={() => setShowAddItem(true)} style={{ ...s.btn("purple"), display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={icons.plus} size={13} color="#fff" /> Add Item
          </button>
        </div>
      </div>

      <div style={s.content}>

        {/* ── Summary ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Items",  value: totalItems,   color: "#6366f1", bg: "#eef2ff" },
            { label: "Low Stock",    value: lowStock,     color: "#d97706", bg: "#fef3c7" },
            { label: "Out of Stock", value: outOfStock,   color: "#dc2626", bg: "#fee2e2" },
            { label: "Controlled",   value: controlledCt, color: "#7c3aed", bg: "#f5f3ff" },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: m.color, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={s.tabs}>
          {(["items","stock","dispense","controlled","history"] as const).map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "items" ? `Items (${items.length})` : t === "stock" ? "Stock" : t === "dispense" ? "Dispense Log" : t === "controlled" ? "Controlled" : "History"}
            </button>
          ))}
        </div>
        {/* ── ITEMS TAB ── */}
        {tab === "items" && (
          <div style={s.card}>
            
            {/* Toolbar */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: 10, pointerEvents: "none" }}>
                  <Icon d={icons.search} size={13} color="#9ca3af" />
                </div>
                <input
                  placeholder="Search items..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  style={{ ...s.input, width: 200, paddingLeft: 30 }}
                />
              </div>

            <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
              {[
                { key: "all",        label: "All",        count: items.length },
                { key: "drug",       label: "Drug",       count: items.filter(i => i.itemType === "drug").length },
                { key: "supply",     label: "Supply",     count: items.filter(i => i.itemType === "supply").length },
                { key: "consumable", label: "Consumable", count: items.filter(i => i.itemType === "consumable").length },
                { key: "asset",      label: "Asset",      count: items.filter(i => i.itemType === "asset").length },
              ].map(t => (
                <button key={t.key} onClick={() => { setTypeFilter(t.key); setPage(1); }}
                  style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    border: `1px solid ${typeFilter === t.key ? "#6366f1" : "#e5e7eb"}`,
                    background: typeFilter === t.key ? "#6366f1" : "#f9fafb",
                    color: typeFilter === t.key ? "#fff" : "#374151",
                    cursor: "pointer", whiteSpace: "nowrap" as const }}>
                  {t.label} ({t.count})
                </button>
              ))}

              <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>{filteredItems.length} items</span>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No items found.{" "}
                <button onClick={() => setShowAddItem(true)} style={{ color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Add one →</button>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Item","Code","Type","UOM","Stock","Reorder","Purchase Price","Selling Price","Expiry","Status","Actions"].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).map(item => {
                        const sc  = stockColor(parseInt(item.totalStock), parseInt(item.reorderLevel ?? 0));
                        const exp = expiryAlert(item.nearestExpiry);
                        return (
                          <tr key={item.id}>
                            <td style={s.td}>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              {(item.genericName ?? item.generic_Name) && <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.genericName ?? item.generic_Name}</div>}
                              {item.controlled && (
                                <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: "#f5f3ff", color: "#7c3aed", display: "inline-block", marginTop: 2 }}>
                                  Controlled
                                </span>
                              )}
                            </td>
                            <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{item.itemcode}</td>
                            <td style={s.td}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#f3f4f6", color: "#374151" }}>{item.itemType}</span>
                            </td>
                            <td style={s.td}>{item.uom}</td>
                            <td style={{ ...s.td, fontWeight: 700, fontSize: 15 }}>{item.totalStock}</td>
                            <td style={{ ...s.td, color: "#6b7280" }}>{item.reorderLevel ?? 0}</td>
                            <td style={s.td}>
                              {item.unitCost ? <span style={{ fontWeight: 600 }}>${parseFloat(item.unitCost).toFixed(2)}</span> : <span style={{ color: "#d1d5db" }}>—</span>}
                            </td>
                            <td style={s.td}>
                              {item.sellingPrice ? <span style={{ fontWeight: 600, color: "#16a34a" }}>${parseFloat(item.sellingPrice).toFixed(2)}</span> : <span style={{ color: "#d1d5db" }}>—</span>}
                            </td>
                            <td style={s.td}>
                              {exp ? (
                                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: exp.bg, color: exp.color }}>{exp.label}</span>
                              ) : item.nearestExpiry ? (
                                <span style={{ fontSize: 11, color: "#6b7280" }}>{new Date(item.nearestExpiry).toLocaleDateString()}</span>
                              ) : <span style={{ color: "#d1d5db" }}>—</span>}
                            </td>
                            <td style={s.td}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                            </td>
                            <td style={s.td}>
                              <div style={{ display: "flex", gap: 5 }}>
                                <button onClick={() => setEditItem(item)}
                                  style={{ background: "#eff6ff", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <Icon d={icons.edit} size={12} color="#2563eb" />
                                </button>
                                <button onClick={() => setDeleteItem(item)}
                                  style={{ background: "#fee2e2", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <Icon d={icons.trash} size={12} color="#dc2626" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredItems.length > PAGE_SIZE && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Showing {(page-1)*PAGE_SIZE + 1}–{Math.min(page*PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: page === 1 ? "#f9fafb" : "#fff", fontSize: 12, cursor: page === 1 ? "default" : "pointer", color: page === 1 ? "#d1d5db" : "#374151" }}>
                        ← Prev
                      </button>
                      {Array.from({ length: Math.ceil(filteredItems.length / PAGE_SIZE) }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === Math.ceil(filteredItems.length / PAGE_SIZE) || Math.abs(p - page) <= 1)
                        .reduce((acc: (number|string)[], p, idx, arr) => {
                          if (idx > 0 && (p as number) - (arr[idx-1] as number) > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) => (
                          typeof p === "string" ? (
                            <span key={`dots-${idx}`} style={{ padding: "5px 8px", fontSize: 12, color: "#9ca3af" }}>…</span>
                          ) : (
                            <button key={p} onClick={() => setPage(p as number)}
                              style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid", fontSize: 12, cursor: "pointer",
                                background: page === p ? "#6366f1" : "#fff",
                                borderColor: page === p ? "#6366f1" : "#e5e7eb",
                                color: page === p ? "#fff" : "#374151", fontWeight: page === p ? 600 : 400 }}>
                              {p}
                            </button>
                          )
                        ))
                      }
                      <button onClick={() => setPage(p => Math.min(Math.ceil(filteredItems.length / PAGE_SIZE), p+1))}
                        disabled={page === Math.ceil(filteredItems.length / PAGE_SIZE)}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: page === Math.ceil(filteredItems.length / PAGE_SIZE) ? "#f9fafb" : "#fff", fontSize: 12, cursor: page === Math.ceil(filteredItems.length / PAGE_SIZE) ? "default" : "pointer", color: page === Math.ceil(filteredItems.length / PAGE_SIZE) ? "#d1d5db" : "#374151" }}>
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      {/* ── STOCK TAB ── */}
        {tab === "stock" && (
          <div style={s.card}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Stock Overview</span>
              <Link href="/stock/receive" style={{ ...s.btn("purple"), textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={icons.plus} size={13} color="#fff" /> Receive Stock
              </Link>
            </div>
            {items.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No stock data</div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>{["Item","Code","UOM","Total Stock","Reserved","Available","Batches","Purchase Price","Selling Price","Reorder","Status"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {items.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).map(item => {
                        const avail = parseInt(item.totalStock) - parseInt(item.reservedStock ?? 0);
                        const sc = stockColor(avail, parseInt(item.reorderLevel ?? 0));
                        return (
                          <tr key={item.id}>
                            <td style={{ ...s.td, fontWeight: 600 }}>{item.name}</td>
                            <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{item.itemcode}</td>
                            <td style={s.td}>{item.uom}</td>
                            <td style={{ ...s.td, fontWeight: 700, fontSize: 15 }}>{item.totalStock}</td>
                            <td style={{ ...s.td, color: "#d97706" }}>{item.reservedStock ?? 0}</td>
                            <td style={{ ...s.td, fontWeight: 700, color: sc.color, fontSize: 15 }}>{avail}</td>
                            <td style={s.td}>{item.batchCount}</td>
                            <td style={s.td}>{item.unitCost ? `$${parseFloat(item.unitCost).toFixed(2)}` : "—"}</td>
                            <td style={{ ...s.td, color: "#16a34a", fontWeight: 600 }}>{item.sellingPrice ? `$${parseFloat(item.sellingPrice).toFixed(2)}` : "—"}</td>
                            <td style={{ ...s.td, color: "#6b7280" }}>{item.reorderLevel ?? 0}</td>
                            <td style={s.td}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {items.length > PAGE_SIZE && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Showing {(page-1)*PAGE_SIZE + 1}–{Math.min(page*PAGE_SIZE, items.length)} of {items.length}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: page === 1 ? "#f9fafb" : "#fff", fontSize: 12, cursor: page === 1 ? "default" : "pointer", color: page === 1 ? "#d1d5db" : "#374151" }}>
                        ← Prev
                      </button>
                      {Array.from({ length: Math.ceil(items.length / PAGE_SIZE) }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === Math.ceil(items.length / PAGE_SIZE) || Math.abs(p - page) <= 1)
                        .reduce((acc: (number|string)[], p, idx, arr) => {
                          if (idx > 0 && (p as number) - (arr[idx-1] as number) > 1) acc.push("...");
                          acc.push(p); return acc;
                        }, [])
                        .map((p, idx) => (
                          typeof p === "string" ? (
                            <span key={`dots-${idx}`} style={{ padding: "5px 8px", fontSize: 12, color: "#9ca3af" }}>…</span>
                          ) : (
                            <button key={p} onClick={() => setPage(p as number)}
                              style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid", fontSize: 12, cursor: "pointer",
                                background: page === p ? "#6366f1" : "#fff",
                                borderColor: page === p ? "#6366f1" : "#e5e7eb",
                                color: page === p ? "#fff" : "#374151", fontWeight: page === p ? 600 : 400 }}>
                              {p}
                            </button>
                          )
                        ))
                      }
                      <button onClick={() => setPage(p => Math.min(Math.ceil(items.length / PAGE_SIZE), p+1))}
                        disabled={page === Math.ceil(items.length / PAGE_SIZE)}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: page === Math.ceil(items.length / PAGE_SIZE) ? "#f9fafb" : "#fff", fontSize: 12, cursor: page === Math.ceil(items.length / PAGE_SIZE) ? "default" : "pointer", color: page === Math.ceil(items.length / PAGE_SIZE) ? "#d1d5db" : "#374151" }}>
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── DISPENSE TAB ── */}
        {tab === "dispense" && (
          <div style={s.card}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Dispense Log</span>
              <button onClick={() => setShowDispense(true)} style={{ ...s.btn("purple"), display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={icons.plus} size={13} color="#fff" /> Dispense Drug
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Drug","Qty","Patient","Prescription","Dispensed By","Date"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {dispenses.length === 0 && <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", padding: 40, color: "#9ca3af" }}>No dispense records yet</td></tr>}
                  {dispenses.map((d: any) => (
                    <tr key={d.logid ?? d.id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{d.drugname ?? d.itemname ?? "—"}</td>
                      <td style={{ ...s.td, fontWeight: 700 }}>{d.quantity}</td>
                      <td style={s.td}>{d.patientref ?? "—"}</td>
                      <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}>{d.prescriptionref ?? "—"}</td>
                      <td style={s.td}>{d.dispensedby ?? "—"}</td>
                      <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{new Date(d.createdat).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CONTROLLED TAB ── */}
        {tab === "controlled" && (
          <div style={s.card}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Controlled Drug Register</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Item","Action","Qty","Patient","Dispensed By","Witness","Date"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {controlled.length === 0 && <tr><td colSpan={7} style={{ ...s.td, textAlign: "center", padding: 40, color: "#9ca3af" }}>No controlled drug records</td></tr>}
                  {controlled.map((c: any) => {
                    const colors: Record<string, [string,string]> = { DISPENSE: ["#dbeafe","#1e40af"], RETURN: ["#d1fae5","#065f46"], DESTROY: ["#fee2e2","#991b1b"], AUDIT: ["#fef3c7","#92400e"] };
                    const [bg, color] = colors[c.actiontype] ?? ["#f3f4f6","#374151"];
                    return (
                      <tr key={c.id}>
                        <td style={{ ...s.td, fontWeight: 600 }}>{c.itemname ?? "—"}</td>
                        <td style={s.td}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: bg, color }}>{c.actiontype}</span></td>
                        <td style={{ ...s.td, fontWeight: 700 }}>{c.quantity}</td>
                        <td style={s.td}>{c.patientref ?? "—"}</td>
                        <td style={s.td}>{c.dispensedby ?? "—"}</td>
                        <td style={{ ...s.td, color: c.witnessedby ? "#111827" : "#d1d5db" }}>{c.witnessedby ?? "No witness"}</td>
                        <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{new Date(c.createdat).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
{/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div style={s.card}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Transaction History</span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{historyTotal} total records</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No transactions yet</div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>{["Item","Code","Type","Qty","Warehouse","Batch","Patient","Reference","By","Date"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {history.map((tx: any) => {
                        const typeColors: Record<string, [string,string]> = {
                          STOCK_IN:   ["#d1fae5","#065f46"],
                          STOCK_OUT:  ["#fee2e2","#991b1b"],
                          TRANSFER:   ["#dbeafe","#1e40af"],
                          ADJUSTMENT: ["#fef3c7","#92400e"],
                          WASTAGE:    ["#f3f4f6","#374151"],
                          DISPENSE:   ["#ede9fe","#5b21b6"],
                        };
                        const [tbg, tcol] = typeColors[tx.transactionType] ?? ["#f3f4f6","#374151"];
                        return (
                          <tr key={tx.id}>
                            <td style={{ ...s.td, fontWeight: 600 }}>{tx.itemName ?? "—"}</td>
                            <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{tx.itemcode ?? "—"}</td>
                            <td style={s.td}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: tbg, color: tcol }}>{tx.transactionType}</span>
                            </td>
                            <td style={{ ...s.td, fontWeight: 700, color: tx.transactionType === "STOCK_IN" ? "#16a34a" : "#dc2626" }}>
                              {tx.transactionType === "STOCK_IN" ? "+" : "-"}{tx.quantity}
                            </td>
                            <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{tx.warehouseName ?? "—"}</td>
                            <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{tx.batchNumber ?? "—"}</td>
                            <td style={{ ...s.td, fontSize: 12 }}>{tx.patientRef ?? "—"}</td>
                            <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{tx.referenceId ?? "—"}</td>
                            <td style={{ ...s.td, fontSize: 12 }}>{tx.createdBy ?? "—"}</td>
                            <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {historyTotal > HISTORY_SIZE && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      Showing {(historyPage-1)*HISTORY_SIZE + 1}–{Math.min(historyPage*HISTORY_SIZE, historyTotal)} of {historyTotal}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setHistoryPage(p => Math.max(1, p-1))} disabled={historyPage === 1}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, cursor: historyPage === 1 ? "default" : "pointer", color: historyPage === 1 ? "#d1d5db" : "#374151", background: "#fff" }}>
                        ← Prev
                      </button>
                      <span style={{ padding: "5px 12px", fontSize: 12, color: "#374151" }}>Page {historyPage} of {Math.ceil(historyTotal / HISTORY_SIZE)}</span>
                      <button onClick={() => setHistoryPage(p => Math.min(Math.ceil(historyTotal / HISTORY_SIZE), p+1))}
                        disabled={historyPage === Math.ceil(historyTotal / HISTORY_SIZE)}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, cursor: historyPage === Math.ceil(historyTotal / HISTORY_SIZE) ? "default" : "pointer", color: historyPage === Math.ceil(historyTotal / HISTORY_SIZE) ? "#d1d5db" : "#374151", background: "#fff" }}>
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        </div>
      {/* Modals */}

      {showDispense && <DispenseModal stores={stores} onClose={() => setShowDispense(false)} onSuccess={() => { fetchAll(); showToast("Drug dispensed!"); }} />}
      {showAddItem  && <ItemModal warehouses={pharmaWh} onClose={() => setShowAddItem(false)} onSuccess={() => { fetchAll(); showToast("Item added!"); }} />}
      {editItem     && <ItemModal item={editItem} warehouses={pharmaWh} onClose={() => setEditItem(null)} onSuccess={() => { fetchAll(); showToast("Item updated!"); }} />}
      {deleteItem   && <ConfirmModal item={deleteItem} onClose={() => setDeleteItem(null)} onSuccess={() => { fetchAll(); showToast("Item deactivated"); }} />}
      {showImportModal && (
        <ImportDrugModal
          onClose={() => setShowImportModal(false)}
          onImport={() => { setShowImportModal(false); setShowAddItem(true); }}
        />
      )}
      {batchItem && <BatchModal item={batchItem} onClose={() => setBatchItem(null)} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 2000 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
