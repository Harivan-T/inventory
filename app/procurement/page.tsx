"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  vendor:  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  arrow:   "M5 12h14M12 5l7 7-7 7",
};

const PR_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft:     { bg: "#f3f4f6", color: "#374151" },
  pending:   { bg: "#fef3c7", color: "#92400e" },
  approved:  { bg: "#d1fae5", color: "#065f46" },
  rejected:  { bg: "#fee2e2", color: "#991b1b" },
  converted: { bg: "#dbeafe", color: "#1e40af" },
};

const PO_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft:     { bg: "#f3f4f6", color: "#374151" },
  approved:  { bg: "#d1fae5", color: "#065f46" },
  sent:      { bg: "#dbeafe", color: "#1e40af" },
  partial:   { bg: "#fef3c7", color: "#92400e" },
  complete:  { bg: "#d1fae5", color: "#065f46" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

const GRN_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft:     { bg: "#f3f4f6", color: "#374151" },
  confirmed: { bg: "#fef3c7", color: "#92400e" },
  posted:    { bg: "#d1fae5", color: "#065f46" },
};

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: bg, color }}>{label}</span>;
}

const s: Record<string, any> = {
  page:    { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:  { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 },
  content: { padding: 24, maxWidth: 1300, margin: "0 auto" },
  tabs:    { display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e5e7eb" },
  tab:     (a: boolean) => ({ padding: "10px 20px", fontSize: 13, fontWeight: 500, border: "none", background: "none", cursor: "pointer", borderBottom: a ? "2px solid #2563eb" : "2px solid transparent", color: a ? "#2563eb" : "#6b7280" }),
  card:    { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 16 },
  th:      { padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" as const, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" as const },
  td:      { padding: "12px 14px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#111827" },
  btn:     (c: string) => ({ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: c === "blue" ? "#2563eb" : c === "green" ? "#16a34a" : "#f3f4f6", color: c === "ghost" ? "#374151" : "#fff" }),
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal:   { background: "#fff", borderRadius: 12, padding: 28, width: 600, maxHeight: "90vh", overflowY: "auto" as const },
  label:   { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  input:   { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, color: "#111827", boxSizing: "border-box" as const },
  fgroup:  { marginBottom: 14 },
};

// ── Create PR Modal ──────────────────────────────────────────────────────────
function CreatePRModal({ warehouses, items, onClose, onSuccess }: { warehouses: any[]; items: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ warehouseid: "", requestedby: "", priority: "normal", requireddate: "", notes: "" });
  const [prItems, setPRItems] = useState([{ itemid: "", requestedqty: "", estimatedprice: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addRow = () => setPRItems(r => [...r, { itemid: "", requestedqty: "", estimatedprice: "" }]);
  const removeRow = (i: number) => setPRItems(r => r.filter((_, idx) => idx !== i));
  const setRow = (i: number, k: string, v: string) => setPRItems(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const handleSave = async () => {
    if (!form.warehouseid) { setError("Warehouse is required"); return; }
    const validItems = prItems.filter(i => i.itemid && i.requestedqty);
    if (!validItems.length) { setError("Add at least one item"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/procurement/pr", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, prItems: validItems.map(i => ({ itemid: i.itemid, requestedqty: parseInt(i.requestedqty), estimatedprice: i.estimatedprice || null })) }),
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
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Create Purchase Requisition</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} color="#6b7280" /></button>
        </div>
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={s.fgroup}>
            <label style={s.label}>Warehouse *</label>
            <select style={s.input} value={form.warehouseid} onChange={e => setForm(f => ({ ...f, warehouseid: e.target.value }))}>
              <option value="">Select warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Priority</label>
            <select style={s.input} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Requested By</label>
            <input style={s.input} value={form.requestedby} onChange={e => setForm(f => ({ ...f, requestedby: e.target.value }))} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Required Date</label>
            <input type="date" style={s.input} value={form.requireddate} onChange={e => setForm(f => ({ ...f, requireddate: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "1/-1", ...s.fgroup }}>
            <label style={s.label}>Notes</label>
            <input style={s.input} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ ...s.label, marginBottom: 0 }}>Items *</label>
            <button onClick={addRow} style={{ ...s.btn("blue"), padding: "5px 10px", fontSize: 12 }}>+ Add Item</button>
          </div>
          {prItems.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
              <select style={s.input} value={row.itemid} onChange={e => setRow(i, "itemid", e.target.value)}>
                <option value="">Select item</option>
                {items.map(item => <option key={item.id} value={item.id}>{item.name} ({item.uom})</option>)}
              </select>
              <input style={s.input} type="number" placeholder="Qty" value={row.requestedqty} onChange={e => setRow(i, "requestedqty", e.target.value)} />
              <input style={s.input} type="number" placeholder="Est. Price" value={row.estimatedprice} onChange={e => setRow(i, "estimatedprice", e.target.value)} />
              <button onClick={() => removeRow(i)} style={{ background: "#fee2e2", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>
                <Icon d={icons.x} size={12} color="#dc2626" />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{ ...s.btn("blue"), opacity: loading ? 0.7 : 1 }}>{loading ? "Saving..." : "Submit PR"}</button>
        </div>
      </div>
    </div>
  );
}

export default function ProcurementPage() {
  const router = useRouter();
  const [tab, setTab]       = useState<"pr"|"po"|"grn">("pr");
  const [prs, setPRs]       = useState<any[]>([]);
  const [pos, setPOs]       = useState<any[]>([]);
  const [grns, setGRNs]     = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePR, setShowCreatePR] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prRes, poRes, grnRes, wRes, iRes] = await Promise.all([
        fetch("/api/procurement/pr"),
        fetch("/api/procurement/po"),
        fetch("/api/procurement/grn"),
        fetch("/api/warehouses"),
        fetch("/api/items"),
      ]);
      const [prData, poData, grnData, wData, iData] = await Promise.all([
        prRes.json(), poRes.json(), grnRes.json(), wRes.json(), iRes.json(),
      ]);
      setPRs(Array.isArray(prData) ? prData : []);
      setPOs(Array.isArray(poData) ? poData : []);
      setGRNs(Array.isArray(grnData) ? grnData : []);
      setWarehouses(Array.isArray(wData) ? wData : []);
      setItems(Array.isArray(iData) ? iData : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Summary counts
  const pendingPRs = prs.filter(p => p.status === "pending").length;
  const activePOs  = pos.filter(p => ["approved","sent","partial"].includes(p.status)).length;
  const pendingGRNs = grns.filter(g => g.status === "draft" || g.status === "confirmed").length;

  return (
    <div style={s.page}>
      <style>{`* { box-sizing: border-box; } input, select { color: #111827 !important; } tr:hover td { background: #f9fafb; }`}</style>

      <div style={s.header}>
        <Link href="/" style={{ display: "flex", alignItems: "center", color: "#6b7280", textDecoration: "none" }}>
          <Icon d={icons.back} size={15} />
        </Link>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Procurement</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link href="/vendors" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#374151", textDecoration: "none" }}>
            <Icon d={icons.vendor} size={13} color="#374151" /> Vendors
          </Link>
          <button onClick={fetchAll} style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={icons.refresh} size={13} color="#374151" /> Refresh
          </button>
          {tab === "pr" && (
            <button onClick={() => setShowCreatePR(true)} style={{ ...s.btn("blue"), display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={icons.plus} size={13} color="#fff" /> New PR
            </button>
          )}
        </div>
      </div>

      <div style={s.content}>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Pending PRs",   value: pendingPRs,  color: "#d97706", bg: "#fef3c7" },
            { label: "Total PRs",     value: prs.length,  color: "#2563eb", bg: "#eff6ff" },
            { label: "Active POs",    value: activePOs,   color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Pending GRNs",  value: pendingGRNs, color: "#dc2626", bg: "#fee2e2" },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: m.color, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {(["pr", "po", "grn"] as const).map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "pr" ? `Purchase Requisitions (${prs.length})` : t === "po" ? `Purchase Orders (${pos.length})` : `Goods Receipts (${grns.length})`}
            </button>
          ))}
        </div>

        {/* PR Tab */}
        {tab === "pr" && (
          <div style={s.card}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</div>
            ) : prs.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No purchase requisitions yet. <button onClick={() => setShowCreatePR(true)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Create one →</button>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["PR Number", "Warehouse", "Priority", "Status", "Items", "Requested By", "Date", "Action"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prs.map((pr: any) => {
                    const sc = PR_STATUS_COLORS[pr.status] ?? PR_STATUS_COLORS.draft;
                    return (
                      <tr key={pr.id}>
                        <td style={{ ...s.td, fontWeight: 600, fontFamily: "monospace" }}>{pr.prnumber}</td>
                        <td style={s.td}>{pr.warehousename ?? "—"}</td>
                        <td style={s.td}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                            background: pr.priority === "urgent" ? "#fee2e2" : pr.priority === "high" ? "#fef3c7" : "#f3f4f6",
                            color: pr.priority === "urgent" ? "#991b1b" : pr.priority === "high" ? "#92400e" : "#374151",
                          }}>{pr.priority}</span>
                        </td>
                        <td style={s.td}><Badge label={pr.status} bg={sc.bg} color={sc.color} /></td>
                        <td style={s.td}>{pr.itemcount}</td>
                        <td style={{ ...s.td, color: "#6b7280" }}>{pr.requestedby ?? "—"}</td>
                        <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{new Date(pr.createdat).toLocaleDateString()}</td>
                        <td style={s.td}>
                          <button onClick={() => router.push(`/procurement/pr/${pr.id}`)}
                            style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 5 }}>
                            <Icon d={icons.eye} size={12} color="#374151" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PO Tab */}
        {tab === "po" && (
          <div style={s.card}>
            {pos.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No purchase orders yet. Approve a PR and convert it to a PO.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["PO Number", "Vendor", "Warehouse", "Status", "Items", "Total", "Expected", "Action"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pos.map((po: any) => {
                    const sc = PO_STATUS_COLORS[po.status] ?? PO_STATUS_COLORS.draft;
                    return (
                      <tr key={po.id}>
                        <td style={{ ...s.td, fontWeight: 600, fontFamily: "monospace" }}>{po.ponumber}</td>
                        <td style={s.td}>{po.vendorname ?? <span style={{ color: "#d1d5db" }}>No vendor</span>}</td>
                        <td style={s.td}>{po.warehousename ?? "—"}</td>
                        <td style={s.td}><Badge label={po.status} bg={sc.bg} color={sc.color} /></td>
                        <td style={s.td}>{po.itemcount}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{po.currency} {parseFloat(po.totalamount ?? "0").toLocaleString()}</td>
                        <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{po.expecteddate ? new Date(po.expecteddate).toLocaleDateString() : "—"}</td>
                        <td style={s.td}>
                          <button onClick={() => router.push(`/procurement/po/${po.id}`)}
                            style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 5 }}>
                            <Icon d={icons.eye} size={12} color="#374151" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* GRN Tab */}
        {tab === "grn" && (
          <div style={s.card}>
            {grns.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No goods receipts yet. Create a GRN from a sent PO.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["GRN Number", "Vendor", "Warehouse", "Status", "Invoice", "Received By", "Date", "Action"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grns.map((grn: any) => {
                    const sc = GRN_STATUS_COLORS[grn.status] ?? GRN_STATUS_COLORS.draft;
                    return (
                      <tr key={grn.id}>
                        <td style={{ ...s.td, fontWeight: 600, fontFamily: "monospace" }}>{grn.grnnumber}</td>
                        <td style={s.td}>{grn.vendorname ?? "—"}</td>
                        <td style={s.td}>{grn.warehousename ?? "—"}</td>
                        <td style={s.td}><Badge label={grn.status} bg={sc.bg} color={sc.color} /></td>
                        <td style={{ ...s.td, color: "#6b7280" }}>{grn.invoicenumber ?? "—"}</td>
                        <td style={{ ...s.td, color: "#6b7280" }}>{grn.receivedby ?? "—"}</td>
                        <td style={{ ...s.td, fontSize: 12, color: "#6b7280" }}>{new Date(grn.createdat).toLocaleDateString()}</td>
                        <td style={s.td}>
                          <button onClick={() => router.push(`/procurement/grn/${grn.id}`)}
                            style={{ ...s.btn("ghost"), border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 5 }}>
                            <Icon d={icons.eye} size={12} color="#374151" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showCreatePR && <CreatePRModal warehouses={warehouses} items={items} onClose={() => setShowCreatePR(false)} onSuccess={fetchAll} />}
    </div>
  );
}
