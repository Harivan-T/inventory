"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  back:    "M19 12H5M12 5l-7 7 7 7",
  flask:   "M9 3h6l1 7H8L9 3zM5 21h14a1 1 0 001-1 7 7 0 00-3.48-6.07L15 10H9l-1.52 3.93A7 7 0 005 20a1 1 0 001 1z",
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6L6 18M6 6l12 12",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  alert:   "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  beaker:  "M4 5h16M7 5v7l-3 9h16l-3-9V5",
  check:   "M20 6L9 17l-5-5",
};

const s: Record<string, any> = {
  page:     { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:   { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56,
              display: "flex", alignItems: "center", gap: 16 },
  title:    { fontSize: 16, fontWeight: 600, color: "#111827" },
  content:  { padding: 24, maxWidth: 1100, margin: "0 auto" },
  tabs:     { display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e5e7eb" },
  tab:      (a: boolean) => ({
    padding: "10px 18px", fontSize: 13, fontWeight: 500, border: "none", background: "none",
    cursor: "pointer", borderBottom: a ? "2px solid #059669" : "2px solid transparent",
    color: a ? "#059669" : "#6b7280",
  }),
  card:     { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20, marginBottom: 16 },
  table:    { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th:       { padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12,
              color: "#6b7280", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  td:       { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#111827" },
  btn:      (v: "primary"|"ghost"|"danger") => ({
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
    background: v === "primary" ? "#059669" : v === "danger" ? "#dc2626" : "#f3f4f6",
    color: v === "ghost" ? "#374151" : "#fff",
  }),
  overlay:  { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal:    { background: "#fff", borderRadius: 12, padding: 28, width: 520, maxHeight: "90vh", overflowY: "auto" as const },
  label:    { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  input:    { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db",
              fontSize: 13, color: "#111827", boxSizing: "border-box" as const },
  row2:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fgroup:   { marginBottom: 14 },
  errorBox: { background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 },
  successBox:{ background: "#d1fae5", color: "#065f46", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 },
  alertCard:(sev: string) => ({
    borderRadius: 8, padding: "12px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start",
    background: sev === "critical" ? "#fef2f2" : sev === "high" ? "#fff7ed" : "#f0fdf4",
    border: `1px solid ${sev === "critical" ? "#fecaca" : sev === "high" ? "#fed7aa" : "#bbf7d0"}`,
  }),
};

// ── Add Assignment Modal ──────────────────────────────────────────────────────
function AddAssignmentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    itemid: "", analyzername: "", testtype: "",
    consumptionpertest: "", criticalflag: false, notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.itemid || !form.analyzername) { setError("Item ID and analyzer name required"); return; }
    setLoading(true);
    const res = await fetch("/api/lab/reagents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        consumptionpertest: form.consumptionpertest ? parseFloat(form.consumptionpertest) : null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    onSuccess(); onClose();
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>New Reagent Assignment</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} /></button>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <div style={s.fgroup}>
          <label style={s.label}>Item ID (Reagent)</label>
          <input style={s.input} value={form.itemid} onChange={e => set("itemid", e.target.value)} placeholder="Item UUID" />
        </div>
        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Analyzer Name</label>
            <input style={s.input} value={form.analyzername} onChange={e => set("analyzername", e.target.value)} placeholder="e.g. Cobas c311" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Test Type</label>
            <input style={s.input} value={form.testtype} onChange={e => set("testtype", e.target.value)} placeholder="e.g. CBC, Glucose" />
          </div>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Consumption Per Test (units)</label>
          <input style={s.input} type="number" step="0.0001" value={form.consumptionpertest}
            onChange={e => set("consumptionpertest", e.target.value)} placeholder="e.g. 0.5" />
        </div>
        <div style={s.fgroup}>
          <label style={{ ...s.label, display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.criticalflag} onChange={e => set("criticalflag", e.target.checked)} />
            Mark as Critical Reagent
          </label>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Notes</label>
          <input style={s.input} value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button style={s.btn("ghost")} onClick={onClose}>Cancel</button>
          <button style={s.btn("primary")} onClick={handleSave} disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Log Consumption Modal ─────────────────────────────────────────────────────
function LogConsumptionModal({ assignments, stores, onClose, onSuccess }: {
  assignments: any[]; stores: any[];
  onClose: () => void; onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    assignmentid: "", storeid: "", testcount: "1",
    patientref: "", sampleref: "", runnotes: "", createdby: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const selectedAssignment = assignments.find(a => a.id === form.assignmentid);

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.assignmentid || !form.testcount) { setError("Assignment and test count required"); return; }
    if (!form.storeid) { setError("Store required for stock deduction"); return; }
    setLoading(true);
    const res = await fetch("/api/lab/consumption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, testcount: parseInt(form.testcount) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setSuccess(`Logged ${data.testsRun} test(s). Consumed: ${data.quantityConsumed} units.`);
    setTimeout(() => { onSuccess(); onClose(); }, 1200);
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Log Test Run</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} /></button>
        </div>
        {error   && <div style={s.errorBox}>{error}</div>}
        {success && <div style={s.successBox}>{success}</div>}

        <div style={s.fgroup}>
          <label style={s.label}>Reagent / Analyzer Assignment</label>
          <select style={s.input} value={form.assignmentid} onChange={e => set("assignmentid", e.target.value)}>
            <option value="">Select assignment…</option>
            {assignments.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.analyzername} — {a.testtype || "General"} (×{a.consumptionpertest} per test)
              </option>
            ))}
          </select>
        </div>

        {selectedAssignment && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
                        padding: "10px 14px", marginBottom: 14, fontSize: 13 }}>
            <strong>Consumption: </strong>
            {selectedAssignment.consumptionpertest} units/test
            &nbsp;·&nbsp;
            <strong>Total: </strong>
            {(parseFloat(selectedAssignment.consumptionpertest || "0") * parseInt(form.testcount || "1")).toFixed(4)} units
          </div>
        )}

        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Number of Tests</label>
            <input style={s.input} type="number" min="1" value={form.testcount}
              onChange={e => set("testcount", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Store (for deduction)</label>
            <select style={s.input} value={form.storeid} onChange={e => set("storeid", e.target.value)}>
              <option value="">Select store…</option>
              {stores.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
            </select>
          </div>
        </div>

        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Patient Ref (optional)</label>
            <input style={s.input} value={form.patientref} onChange={e => set("patientref", e.target.value)} placeholder="MRN-XXXX" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Sample Ref</label>
            <input style={s.input} value={form.sampleref} onChange={e => set("sampleref", e.target.value)} placeholder="S-XXXX" />
          </div>
        </div>

        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Run By</label>
            <input style={s.input} value={form.createdby} onChange={e => set("createdby", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Notes</label>
            <input style={s.input} value={form.runnotes} onChange={e => set("runnotes", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button style={s.btn("ghost")} onClick={onClose}>Cancel</button>
          <button style={s.btn("primary")} onClick={handleSave} disabled={loading}>{loading ? "Logging…" : "Log Run"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LabPage() {
  const [tab, setTab]               = useState<"assignments"|"consumption"|"alerts">("assignments");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [consumptionLog, setConsumptionLog] = useState<any[]>([]);
  const [alerts, setAlerts]         = useState<any[]>([]);
  const [stores, setStores]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [showAddModal, setShowAddModal]         = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, cRes, alRes, stRes] = await Promise.all([
        fetch("/api/lab/reagents"),
        fetch("/api/lab/consumption"),
        fetch("/api/alerts"),
        fetch("/api/stores"),
      ]);
      const [aData, cData, alData, stData] = await Promise.all([
        aRes.json(), cRes.json(), alRes.json(), stRes.json(),
      ]);
      setAssignments(aData.assignments || []);
      setConsumptionLog(cData.logs || []);
      setAlerts((alData.alerts || []).filter((a: any) => a.area === "lab" || a.type === "critical_reagent"));
      setStores(stData.stores || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmt = (d: any) => d ? new Date(d).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "—";

  // Analyzer summary
  const analyzerMap: Record<string, any[]> = {};
  assignments.forEach((a: any) => {
    if (!analyzerMap[a.analyzername]) analyzerMap[a.analyzername] = [];
    analyzerMap[a.analyzername].push(a);
  });

  return (
    <div style={s.page}>
      <style>{`input,select,textarea{color:#111827 !important;}`}</style>
      <div style={s.header}>
        <Link href="/" style={{ color: "#6b7280", display: "flex" }}><Icon d={icons.back} size={18} /></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon d={icons.flask} size={18} />
          <span style={s.title}>Lab Hub</span>
        </div>
        {alerts.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef2f2",
                        border: "1px solid #fecaca", borderRadius: 8, padding: "4px 12px", fontSize: 13, color: "#dc2626" }}>
            <Icon d={icons.alert} size={14} />
            {alerts.filter((a: any) => a.severity === "critical").length} critical alerts
          </div>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={fetchAll} style={s.btn("ghost")}><Icon d={icons.refresh} size={14} /></button>
          {tab === "assignments"  && <button style={s.btn("primary")} onClick={() => setShowAddModal(true)}>Add Assignment</button>}
          {tab === "consumption" && <button style={s.btn("primary")} onClick={() => setShowConsumeModal(true)}>Log Test Run</button>}
        </div>
      </div>

      <div style={s.content}>

        {/* Analyzer summary cards */}
        {Object.keys(analyzerMap).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12, marginBottom: 24 }}>
            {Object.entries(analyzerMap).map(([name, items]) => (
              <div key={name} style={{ ...s.card, marginBottom: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{items.length} reagent{items.length !== 1 ? "s" : ""} assigned</div>
                <div style={{ fontSize: 12, color: items.some((i: any) => i.criticalflag) ? "#dc2626" : "#6b7280", marginTop: 2 }}>
                  {items.filter((i: any) => i.criticalflag).length} critical
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={s.tabs}>
          {(["assignments","consumption","alerts"] as const).map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "assignments" ? "Reagent Assignments" : t === "consumption" ? "Consumption Log" : `Alerts (${alerts.length})`}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: "#6b7280", fontSize: 13 }}>Loading…</p>}

        {/* ── Assignments ── */}
        {tab === "assignments" && (
          <div style={s.card}>
            {assignments.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>No assignments yet. Add reagent-analyzer assignments to track consumption.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Analyzer</th>
                    <th style={s.th}>Test Type</th>
                    <th style={s.th}>Item ID</th>
                    <th style={s.th}>Consumption / Test</th>
                    <th style={s.th}>Critical</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ ...s.td, fontWeight: 500 }}>{a.analyzername}</td>
                      <td style={s.td}>{a.testtype || "—"}</td>
                      <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11 }}>{a.itemid?.slice(0,8)}…</td>
                      <td style={{ ...s.td, color: "#6366f1", fontWeight: 600 }}>{a.consumptionpertest ? `${a.consumptionpertest} units` : "—"}</td>
                      <td style={s.td}>
                        {a.criticalflag
                          ? <span style={{ background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>CRITICAL</span>
                          : <span style={{ color: "#9ca3af", fontSize: 12 }}>No</span>}
                      </td>
                      <td style={s.td}>
                        <span style={{ background: a.isactive ? "#d1fae5" : "#f3f4f6", color: a.isactive ? "#065f46" : "#374151",
                                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                          {a.isactive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: "#6b7280" }}>{a.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Consumption Log ── */}
        {tab === "consumption" && (
          <div style={s.card}>
            {consumptionLog.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>No consumption logged. Use "Log Test Run" to record reagent usage per test batch.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Analyzer</th>
                    <th style={s.th}>Test Type</th>
                    <th style={s.th}>Item</th>
                    <th style={s.th}>Tests Run</th>
                    <th style={s.th}>Qty Consumed</th>
                    <th style={s.th}>Patient</th>
                    <th style={s.th}>Sample</th>
                    <th style={s.th}>By</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionLog.map((l: any) => (
                    <tr key={l.id}>
                      <td style={s.td}>{fmt(l.createdat)}</td>
                      <td style={{ ...s.td, fontWeight: 500 }}>{l.analyzername || "—"}</td>
                      <td style={s.td}>{l.testtype || "—"}</td>
                      <td style={s.td}>{l.itemname || "—"}</td>
                      <td style={{ ...s.td, color: "#6366f1", fontWeight: 600 }}>{l.testcount}</td>
                      <td style={{ ...s.td, color: "#dc2626", fontWeight: 600 }}>{parseFloat(l.quantityconsumed).toFixed(4)}</td>
                      <td style={s.td}>{l.patientref || "—"}</td>
                      <td style={s.td}>{l.sampleref || "—"}</td>
                      <td style={s.td}>{l.createdby || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Alerts ── */}
        {tab === "alerts" && (
          <div>
            {alerts.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center" as const, padding: 40 }}>
                <Icon d={icons.check} size={32} />
                <p style={{ color: "#065f46", fontWeight: 600, marginTop: 8 }}>All reagents are within stock levels</p>
              </div>
            ) : (
              alerts.map((a: any, i: number) => (
                <div key={i} style={s.alertCard(a.severity)}>
                  <div style={{ color: a.severity === "critical" ? "#dc2626" : a.severity === "high" ? "#ea580c" : "#16a34a", marginTop: 2 }}>
                    <Icon d={icons.alert} size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{a.message}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {a.detail?.quantity !== undefined && `Current qty: ${a.detail.quantity}`}
                      {a.detail?.reorderlevel !== undefined && ` · Reorder at: ${a.detail.reorderlevel}`}
                      {a.detail?.storename && ` · Store: ${a.detail.storename}`}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                    background: a.severity === "critical" ? "#fee2e2" : a.severity === "high" ? "#fed7aa" : "#dcfce7",
                    color:      a.severity === "critical" ? "#991b1b" : a.severity === "high" ? "#9a3412" : "#14532d",
                  }}>{a.severity.toUpperCase()}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal     && <AddAssignmentModal  onClose={() => setShowAddModal(false)}     onSuccess={fetchAll} />}
      {showConsumeModal && <LogConsumptionModal assignments={assignments} stores={stores}
                            onClose={() => setShowConsumeModal(false)} onSuccess={fetchAll} />}
    </div>
  );
}
