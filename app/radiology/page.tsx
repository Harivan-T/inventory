"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
  alert:   "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  radio:   "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  beaker:  "M4 5h16M7 5v7l-3 9h16l-3-9V5",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
};

const s: Record<string, any> = {
  page:    { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:  { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 },
  content: { padding: 24, maxWidth: 1100, margin: "0 auto" },
  tabs:    { display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e5e7eb" },
  tab:     (a: boolean) => ({ padding: "10px 18px", fontSize: 13, fontWeight: 500, border: "none", background: "none", cursor: "pointer", borderBottom: a ? "2px solid #d97706" : "2px solid transparent", color: a ? "#d97706" : "#6b7280" }),
  card:    { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 16 },
  cardHead:{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" },
  th:      { padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" as const, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" as const },
  td:      { padding: "11px 14px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#111827" },
  btn:     (v: "primary"|"ghost") => ({ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: v === "primary" ? "#d97706" : "#f3f4f6", color: v === "ghost" ? "#374151" : "#fff" }),
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal:   { background: "#fff", borderRadius: 12, padding: 28, width: 500, maxHeight: "90vh", overflowY: "auto" as const },
  label:   { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  input:   { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, color: "#111827", boxSizing: "border-box" as const },
  fgroup:  { marginBottom: 14 },
};

function LogProcedureModal({ stores, items, onClose, onSuccess }: {
  stores: any[]; items: any[]; onClose: () => void; onSuccess: () => void;
}) {
  const [form, setForm] = useState({ storeid: "", itemid: "", procedure_name: "", procedure_type: "", patient_ref: "", quantity_used: "", performed_by: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.storeid || !form.itemid || !form.procedure_name || !form.quantity_used) {
      setError("Store, item, procedure name and quantity are required"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/radiology/procedures", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity_used: parseFloat(form.quantity_used) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Log Procedure Usage</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} color="#6b7280" /></button>
        </div>
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={s.fgroup}>
          <label style={s.label}>Store / Department *</label>
          <select style={s.input} value={form.storeid} onChange={e => set("storeid", e.target.value)}>
            <option value="">Select store</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Item (contrast/film/chemical) *</label>
          <select style={s.input} value={form.itemid} onChange={e => set("itemid", e.target.value)}>
            <option value="">Select item</option>
            {items.filter(i => i.inventorycategory === "radiology" || i.itemtype === "radiology").map(i => (
              <option key={i.id} value={i.id}>{i.name} ({i.uom})</option>
            ))}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={s.fgroup}>
            <label style={s.label}>Procedure Name *</label>
            <input style={s.input} value={form.procedure_name} onChange={e => set("procedure_name", e.target.value)} placeholder="e.g. Chest CT" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Procedure Type</label>
            <select style={s.input} value={form.procedure_type} onChange={e => set("procedure_type", e.target.value)}>
              <option value="">Select type</option>
              <option value="CT">CT Scan</option>
              <option value="MRI">MRI</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="Fluoroscopy">Fluoroscopy</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Quantity Used *</label>
            <input style={s.input} type="number" step="0.01" value={form.quantity_used} onChange={e => set("quantity_used", e.target.value)} placeholder="e.g. 100" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Patient Ref</label>
            <input style={s.input} value={form.patient_ref} onChange={e => set("patient_ref", e.target.value)} placeholder="MRN / Patient ID" />
          </div>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Performed By</label>
          <input style={s.input} value={form.performed_by} onChange={e => set("performed_by", e.target.value)} />
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Notes</label>
          <input style={s.input} value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={s.btn("ghost")}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={s.btn("primary")}>{loading ? "Saving..." : "Log Procedure"}</button>
        </div>
      </div>
    </div>
  );
}

export default function RadiologyPage() {
  const [tab,        setTab]        = useState<"procedures"|"stock"|"alerts">("procedures");
  const [procedures, setProcedures] = useState<any[]>([]);
  const [stock,      setStock]      = useState<any[]>([]);
  const [alerts,     setAlerts]     = useState<any[]>([]);
  const [stores,     setStores]     = useState<any[]>([]);
  const [items,      setItems]      = useState<any[]>([]);
  const [showModal,  setShowModal]  = useState(false);
  const [loading,    setLoading]    = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [procRes, stockRes, alertRes, storeRes, itemRes] = await Promise.all([
        fetch("/api/radiology/procedures"),
        fetch("/api/items?category=radiology"),
        fetch("/api/alerts"),
        fetch("/api/stores"),
        fetch("/api/items?category=radiology"),
      ]);
      const [procData, stockData, alertData, storeData, itemData] = await Promise.all([
        procRes.json(), stockRes.json(), alertRes.json(), storeRes.json(), itemRes.json(),
      ]);
      setProcedures(Array.isArray(procData) ? procData : (procData.procedures ?? []));
      setStock(Array.isArray(stockData) ? stockData : []);
      setAlerts((alertData.alerts ?? []).filter((a: any) => a.detail?.storename?.toLowerCase().includes("radio") || a.type === "expired" || a.type === "near_expiry"));
      setStores(Array.isArray(storeData) ? storeData : (storeData.stores ?? []));
      setItems(Array.isArray(itemData) ? itemData : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Summary stats
  const contrastItems  = items.filter(i => i.contrasttype || i.itemtype === "radiology").length;
  const totalProcedures = procedures.length;
  const criticalAlerts  = alerts.filter(a => a.severity === "critical").length;

  return (
    <div style={s.page}>
      <style>{`* { box-sizing: border-box; } input, select, textarea { color: #111827 !important; } tr:hover td { background: #f9fafb; }`}</style>

      <div style={s.header}>
        <Link href="/" style={{ display: "flex", alignItems: "center", color: "#6b7280", textDecoration: "none" }}>
          <Icon d={icons.back} size={15} />
        </Link>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Radiology Inventory</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button onClick={fetchAll} style={{ ...s.btn("ghost"), display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={icons.refresh} size={13} color="#374151" /> Refresh
          </button>
          {tab === "procedures" && (
            <button onClick={() => setShowModal(true)} style={{ ...s.btn("primary"), display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={icons.plus} size={13} color="#fff" /> Log Procedure
            </button>
          )}
        </div>
      </div>

      <div style={s.content}>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Radiology Items",   value: contrastItems,   color: "#d97706", bg: "#fef3c7" },
            { label: "Procedures Logged", value: totalProcedures, color: "#2563eb", bg: "#eff6ff" },
            { label: "Critical Alerts",   value: criticalAlerts,  color: "#dc2626", bg: "#fee2e2" },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: m.color, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {(["procedures", "stock", "alerts"] as const).map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "procedures" ? "Procedure Log" : t === "stock" ? `Radiology Stock (${stock.length})` : `Alerts (${alerts.length})`}
            </button>
          ))}
        </div>

        {/* Procedures Tab */}
        {tab === "procedures" && (
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>PROCEDURE USAGE LOG</span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{procedures.length} records</span>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</div>
            ) : procedures.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No procedures logged. Click "Log Procedure" to record usage.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Date", "Procedure", "Type", "Item Used", "Qty", "Patient", "Performed By"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {procedures.map((p: any) => (
                      <tr key={p.id}>
                        <td style={{ ...s.td, fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                          {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                        </td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{p.procedure_name}</td>
                        <td style={s.td}>
                          {p.procedure_type && (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>
                              {p.procedure_type}
                            </span>
                          )}
                        </td>
                        <td style={s.td}>{p.itemname ?? "—"}</td>
                        <td style={{ ...s.td, fontWeight: 700, color: "#d97706" }}>{p.quantity_used} {p.uom ?? ""}</td>
                        <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}>{p.patient_ref ?? "—"}</td>
                        <td style={{ ...s.td, color: "#6b7280" }}>{p.performed_by ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stock Tab */}
        {tab === "stock" && (
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>RADIOLOGY ITEMS</span>
            </div>
            {stock.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No radiology items found. Add items with category "radiology" in Item Master.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Item Code", "Name", "Type", "UOM", "Contrast Type", "Controlled", "Status"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((i: any) => (
                      <tr key={i.id}>
                        <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{i.itemcode}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{i.name}</td>
                        <td style={s.td}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>
                            {i.itemtype}
                          </span>
                        </td>
                        <td style={s.td}>{i.uom}</td>
                        <td style={s.td}>{i.contrasttype ?? "—"}</td>
                        <td style={s.td}>
                          {i.controlled && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>Yes</span>}
                        </td>
                        <td style={s.td}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: i.isactive ? "#d1fae5" : "#f3f4f6", color: i.isactive ? "#065f46" : "#6b7280" }}>
                            {i.isactive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {tab === "alerts" && (
          <div>
            {alerts.length === 0 ? (
              <div style={{ ...s.card, padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No alerts for radiology items.
              </div>
            ) : alerts.map((a: any, i: number) => (
              <div key={i} style={{
                borderRadius: 8, padding: "12px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start",
                background: a.severity === "critical" ? "#fef2f2" : "#fff7ed",
                border: `1px solid ${a.severity === "critical" ? "#fecaca" : "#fed7aa"}`,
              }}>
                <Icon d={icons.alert} size={16} color={a.severity === "critical" ? "#dc2626" : "#d97706"} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{a.message}</div>
                  {a.detail?.daysLeft !== undefined && (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{a.detail.daysLeft} days until expiry · Qty: {a.detail.quantity}</div>
                  )}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                  background: a.severity === "critical" ? "#fee2e2" : "#fed7aa",
                  color: a.severity === "critical" ? "#991b1b" : "#92400e",
                }}>{a.severity.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <LogProcedureModal stores={stores} items={items} onClose={() => setShowModal(false)} onSuccess={fetchAll} />}
    </div>
  );
}
