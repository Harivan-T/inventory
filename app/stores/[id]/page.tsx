"use client";
import { useEffect, useState } from "react";
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
  warning: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  box:     "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  send:    "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  list:    "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  activity:"M22 12h-4l-3 9L9 3l-3 9H2",
};

const TX_COLORS: Record<string, { bg: string; color: string }> = {
  RECEIVE:    { bg: "#d1fae5", color: "#065f46" },
  ISSUE:      { bg: "#fee2e2", color: "#991b1b" },
  RETURN:     { bg: "#dbeafe", color: "#1d4ed8" },
  ADJUSTMENT: { bg: "#fef3c7", color: "#92400e" },
  WASTAGE:    { bg: "#f3f4f6", color: "#6b7280" },
};

const REQ_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#fef3c7", color: "#92400e" },
  approved:  { bg: "#d1fae5", color: "#065f46" },
  rejected:  { bg: "#fee2e2", color: "#991b1b" },
  fulfilled: { bg: "#dbeafe", color: "#1d4ed8" },
  partial:   { bg: "#ede9fe", color: "#5b21b6" },
};

function IssueModal({ storeid, storestock, onClose, onSuccess }: { storeid: string; storestock: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ itemid: "", batchid: "", quantity: "", patientref: "", issuedby: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const selectedItem  = storestock.find(s => s.itemid === form.itemid);
  const availableQty  = selectedItem?.quantity ?? 0;

  const handleSave = async () => {
    if (!form.itemid || !form.quantity) { setError("Item and quantity are required"); return; }
    if (Number(form.quantity) > availableQty) { setError(`Only ${availableQty} units available`); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/stores/issue", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeid, ...form, quantity: Number(form.quantity), batchid: form.batchid || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Issue Stock</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Dispense to patient or department</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Item *</label>
            <select value={form.itemid} onChange={e => setForm(f => ({ ...f, itemid: e.target.value, batchid: "" }))}
              style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}>
              <option value="">Select item...</option>
              {storestock.map(s => <option key={s.itemid} value={s.itemid}>{s.itemname} ({s.quantity} available)</option>)}
            </select>
          </div>
          {form.itemid && selectedItem?.batchnumber && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Batch</label>
              <select value={form.batchid} onChange={e => setForm(f => ({ ...f, batchid: e.target.value }))}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}>
                <option value="">Any batch</option>
                <option value={selectedItem.batchid}>{selectedItem.batchnumber}</option>
              </select>
            </div>
          )}
          {[
            { label: "Quantity *",     key: "quantity",   type: "number" },
            { label: "Patient Ref",    key: "patientref", type: "text" },
            { label: "Issued By",      key: "issuedby",   type: "text" },
            { label: "Notes",          key: "notes",      type: "text" },
          ].map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
            </div>
          ))}
          {error && <p style={{ margin: 0, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>
        <div style={{ padding: "14px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#dc2626", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Issuing..." : "Issue"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequisitionModal({ storeid, onClose, onSuccess }: { storeid: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm]       = useState({ itemid: "", requestedqty: "", requestedby: "", notes: "", warehouseid: "" });
  const [items, setItems]     = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch("/api/items").then(r => r.json()).then(setItems).catch(() => {});
    fetch("/api/warehouses").then(r => r.json()).then(setWarehouses).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.itemid || !form.requestedqty || !form.warehouseid) { setError("Item, warehouse and quantity are required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/stores/requisition", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeid, ...form, requestedqty: Number(form.requestedqty) }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 50px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>New Requisition</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Request stock from main warehouse</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Source Warehouse *", key: "warehouseid", type: "select", options: [{ value: "", label: "Select warehouse..." }, ...warehouses.map((w: any) => ({ value: w.id, label: w.name }))] },
            { label: "Item *", key: "itemid", type: "select", options: [{ value: "", label: "Select item..." }, ...items.map((i: any) => ({ value: i.id, label: `${i.name} (${i.itemcode})` }))] },
          ].map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
              <select value={(form as any)[f.key]} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}>
                {f.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
          {[
            { label: "Quantity *",    key: "requestedqty", type: "number" },
            { label: "Requested By",  key: "requestedby",  type: "text" },
            { label: "Notes",         key: "notes",        type: "text" },
          ].map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
            </div>
          ))}
          {error && <p style={{ margin: 0, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>
        <div style={{ padding: "14px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId]           = useState<string | null>(null);
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"stock" | "transactions" | "requisitions">("stock");
  const [showIssue, setShowIssue] = useState(false);
  const [showReq,   setShowReq]   = useState(false);
  const [toast, setToast]     = useState<string | null>(null);

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);

  const fetchData = async (storeId: string) => {
    setLoading(true);
    try { setData(await (await fetch(`/api/stores/${storeId}`)).json()); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (id) fetchData(id); }, [id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  if (loading || !data) return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#6b7280", fontSize: 13 }}>Loading store...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const { store, stock, transactions, requisitions, totalstock, lowstock, nearexpiry } = data;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } .row:hover { background: #f8fafc !important; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/stores" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "5px 10px", borderRadius: 6, background: "#f3f4f6" }}>
            <Icon d={icons.back} size={13} color="#6b7280" /> Stores
          </Link>
          <span style={{ color: "#d1d5db" }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{store.name}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowReq(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#2563eb", border: "1px solid #2563eb", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Icon d={icons.send} size={13} color="#2563eb" /> Request Stock
          </button>
          <button onClick={() => setShowIssue(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Icon d={icons.plus} size={13} color="#fff" /> Issue Stock
          </button>
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {/* Store Header */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", padding: "20px 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>{store.name}</h1>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#d1fae5", color: "#065f46" }}>{store.storetype}</span>
              {store.department && <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#ede9fe", color: "#5b21b6" }}>{store.department}</span>}
              {store.manager && <span style={{ fontSize: 12, color: "#6b7280" }}>Manager: {store.manager}</span>}
              {store.location && <span style={{ fontSize: 12, color: "#6b7280" }}>📍 {store.location}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Total Units",  value: totalstock,  color: "#2563eb" },
              { label: "Low Stock",    value: lowstock,    color: "#d97706" },
              { label: "Near Expiry",  value: nearexpiry,  color: "#dc2626" },
            ].map(s => (
              <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 16px", textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 10, border: "1px solid #f3f4f6", width: "fit-content" }}>
          {([
            { key: "stock",        label: "Stock",        icon: icons.box },
            { key: "transactions", label: "Transactions", icon: icons.activity },
            { key: "requisitions", label: "Requisitions", icon: icons.list },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                background: tab === t.key ? "#2563eb" : "transparent",
                color:      tab === t.key ? "#fff"    : "#6b7280" }}>
              <Icon d={t.icon} size={13} color={tab === t.key ? "#fff" : "#6b7280"} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Stock Tab */}
        {tab === "stock" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{stock.length} line items</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Item", "Batch", "Expiry", "Qty Available", "Reserved", "Min Level", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stock.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No stock in this store. Request from warehouse to add items.</td></tr>
                  )}
                  {stock.map((s: any) => {
                    const isExpired   = s.expirydate && new Date(s.expirydate) < new Date();
                    const isNearExp   = !isExpired && s.expirydate && (new Date(s.expirydate).getTime() - Date.now()) < 90 * 24 * 60 * 60 * 1000;
                    const isLow       = s.quantity <= (s.reorderlevel ?? 0);
                    return (
                      <tr key={s.id} className="row" style={{ borderTop: "1px solid #f9fafb" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.itemname}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.itemcode} · {s.itemtype}</div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", fontFamily: "monospace" }}>{s.batchnumber ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: isExpired ? "#dc2626" : isNearExp ? "#d97706" : "#374151", fontWeight: isExpired || isNearExp ? 600 : 400 }}>
                          {s.expirydate ? new Date(s.expirydate).toLocaleDateString() : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: isLow ? "#d97706" : "#111827" }}>{s.quantity}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{s.reservedquantity ?? 0}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{s.reorderlevel ?? 0}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {isExpired   && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>Expired</span>}
                          {isNearExp   && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "#fef3c7", color: "#d97706" }}>Near Expiry</span>}
                          {isLow && !isExpired && !isNearExp && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "#fff7ed", color: "#ea580c" }}>Low Stock</span>}
                          {!isExpired && !isNearExp && !isLow  && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "#d1fae5", color: "#065f46" }}>OK</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {tab === "transactions" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Last {transactions.length} transactions</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Type", "Item", "Batch", "Qty", "Patient Ref", "By", "Date"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No transactions yet.</td></tr>
                  )}
                  {transactions.map((tx: any) => {
                    const tc = TX_COLORS[tx.transactiontype] ?? { bg: "#f3f4f6", color: "#374151" };
                    const isOut = ["ISSUE", "WASTAGE"].includes(tx.transactiontype);
                    return (
                      <tr key={tx.id} className="row" style={{ borderTop: "1px solid #f9fafb" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: tc.bg, color: tc.color }}>{tx.transactiontype}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{tx.itemname ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{tx.batchnumber ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: isOut ? "#dc2626" : "#16a34a" }}>
                          {isOut ? "−" : "+"}{tx.quantity}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{tx.patientref ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{tx.createdby ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{new Date(tx.createdat).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requisitions Tab */}
        {tab === "requisitions" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{requisitions.length} requisitions</span>
              <button onClick={() => setShowReq(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, padding: "6px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Icon d={icons.plus} size={12} color="#fff" /> New Request
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Item", "Requested", "Approved", "Fulfilled", "Status", "By", "Date"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requisitions.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No requisitions yet. Request stock to get started.</td></tr>
                  )}
                  {requisitions.map((r: any) => {
                    const rc = REQ_COLORS[r.status] ?? { bg: "#f3f4f6", color: "#374151" };
                    return (
                      <tr key={r.id} className="row" style={{ borderTop: "1px solid #f9fafb" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.itemname ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{r.requestedqty}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{r.approvedqty ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{r.fulfilledqty ?? 0}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: rc.bg, color: rc.color }}>{r.status}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{r.requestedby ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{new Date(r.createdat).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showIssue && id && <IssueModal storeid={id} storestock={stock} onClose={() => setShowIssue(false)} onSuccess={() => { fetchData(id); showToast("Stock issued!"); }} />}
      {showReq   && id && <RequisitionModal storeid={id} onClose={() => setShowReq(false)} onSuccess={() => { fetchData(id); showToast("Requisition submitted!"); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon d={icons.check} size={14} color="#fff" /> {toast}
        </div>
      )}
    </div>
  );
}
