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
  flask:   "M9 3h6M9 3v8L6.8 15.6A2 2 0 008.7 19h6.6a2 2 0 001.9-3.4L15 11V3",
  alert:   "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  cpu:     "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
};

function AddAssignmentModal({ items, onClose, onSuccess }: { items: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    itemid: "", analyzername: "", testtype: "",
    consumptionpertest: "", criticalflag: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSave = async () => {
    if (!form.itemid || !form.analyzername) { setError("Reagent and analyzer are required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/lab/reagents", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consumptionpertest: form.consumptionpertest ? Number(form.consumptionpertest) : null }),
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
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Assign Reagent to Analyzer</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Link a reagent to a lab analyzer and test type</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reagent *</label>
            <select value={form.itemid} onChange={e => setForm(f => ({ ...f, itemid: e.target.value }))}
              style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}>
              <option value="">Select reagent...</option>
              {items.filter(i => i.itemtype === "reagent" || i.inventorycategory === "lab").map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.itemcode})</option>
              ))}
            </select>
          </div>
          {[
            { label: "Analyzer Name *",        key: "analyzername",       type: "text",   ph: "e.g. Cobas c501" },
            { label: "Test Type",               key: "testtype",           type: "text",   ph: "e.g. Glucose, CBC" },
            { label: "Consumption Per Test",    key: "consumptionpertest", type: "number", ph: "e.g. 0.5 (ml per test)" },
          ].map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))} placeholder={f.ph}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
            </div>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
            <input type="checkbox" checked={form.criticalflag} onChange={e => setForm(f => ({ ...f, criticalflag: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: "#dc2626" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>Critical Reagent</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Triggers alerts when stock is low</div>
            </div>
          </label>
          {error && <p style={{ margin: 0, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>}
        </div>
        <div style={{ padding: "14px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Saving..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LabPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [items, setItems]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [toast, setToast]             = useState<string | null>(null);
  const [filterAnalyzer, setFilter]   = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, iRes] = await Promise.all([fetch("/api/lab/reagents"), fetch("/api/items?category=lab")]);
      setAssignments(await aRes.json());
      setItems(await iRes.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch("/api/lab/reagents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isactive: !current }) });
    fetchAll();
  };

  const filtered = filterAnalyzer ? assignments.filter(a => a.analyzername?.toLowerCase().includes(filterAnalyzer.toLowerCase())) : assignments;
  const analyzers = [...new Set(assignments.map(a => a.analyzername).filter(Boolean))];
  const critical  = assignments.filter(a => a.criticalflag && a.isactive);

  const stats = {
    total:      assignments.length,
    active:     assignments.filter(a => a.isactive).length,
    critical:   critical.length,
    analyzers:  analyzers.length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } .row:hover { background: #f8fafc !important; }`}</style>

      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "5px 10px", borderRadius: 6, background: "#f3f4f6" }}>
            <Icon d={icons.back} size={13} color="#6b7280" /> Dashboard
          </Link>
          <span style={{ color: "#d1d5db" }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Lab Inventory</span>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Icon d={icons.plus} size={14} color="#fff" /> Assign Reagent
        </button>
      </div>

      <div style={{ padding: "24px 28px" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Lab Sub-Inventory</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Reagent-analyzer assignments, consumption per test, and critical stock monitoring</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Assignments", value: stats.total,     color: "#059669", bg: "#d1fae5" },
            { label: "Active",            value: stats.active,    color: "#2563eb", bg: "#eff6ff" },
            { label: "Critical Reagents", value: stats.critical,  color: "#dc2626", bg: "#fee2e2" },
            { label: "Analyzers",         value: stats.analyzers, color: "#7c3aed", bg: "#ede9fe" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Critical alert banner */}
        {critical.length > 0 && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <Icon d={icons.alert} size={16} color="#dc2626" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{critical.length} critical reagent{critical.length > 1 ? "s" : ""} assigned — monitor stock levels closely:</span>
            <span style={{ fontSize: 13, color: "#dc2626" }}>{critical.map(c => c.reagentname).join(", ")}</span>
          </div>
        )}

        {/* Filter */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <select value={filterAnalyzer} onChange={e => setFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", color: "#374151", minWidth: 200 }}>
            <option value="">All Analyzers</option>
            {analyzers.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {filterAnalyzer && (
            <button onClick={() => setFilter("")} style={{ fontSize: 12, color: "#6b7280", background: "#f3f4f6", border: "none", borderRadius: 6, padding: "7px 12px", cursor: "pointer", fontWeight: 600 }}>
              Clear
            </button>
          )}
          <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: "auto" }}>{filtered.length} assignments</span>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Reagent", "Analyzer", "Test Type", "Consumption / Test", "Critical", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                      No reagent assignments yet.{" "}
                      <button onClick={() => setShowModal(true)} style={{ color: "#059669", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Assign one →</button>
                    </td></tr>
                  )}
                  {filtered.map((a: any) => (
                    <tr key={a.id} className="row" style={{ borderTop: "1px solid #f9fafb", opacity: a.isactive ? 1 : 0.5 }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{a.reagentname ?? a.itemname ?? "—"}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{a.itemcode}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#ede9fe", color: "#5b21b6" }}>{a.analyzername}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{a.testtype ?? "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                        {a.consumptionpertest ? `${a.consumptionpertest} units` : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {a.criticalflag
                          ? <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>Critical</span>
                          : <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#f3f4f6", color: "#6b7280" }}>Normal</span>
                        }
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: a.isactive ? "#d1fae5" : "#f3f4f6", color: a.isactive ? "#065f46" : "#6b7280" }}>
                          {a.isactive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => toggleActive(a.id, a.isactive)}
                          style={{ background: a.isactive ? "#fef3c7" : "#d1fae5", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: a.isactive ? "#92400e" : "#065f46" }}>
                          {a.isactive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Analyzer summary cards */}
        {analyzers.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Analyzer Summary</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {analyzers.map(analyzer => {
                const aAssignments = assignments.filter(a => a.analyzername === analyzer && a.isactive);
                const hasCritical  = aAssignments.some(a => a.criticalflag);
                return (
                  <div key={analyzer} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${hasCritical ? "#fecaca" : "#f3f4f6"}`, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{analyzer}</span>
                      {hasCritical && <Icon d={icons.alert} size={14} color="#dc2626" />}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{aAssignments.length} reagent{aAssignments.length !== 1 ? "s" : ""} assigned</div>
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {aAssignments.slice(0, 3).map(a => (
                        <span key={a.id} style={{ fontSize: 10, background: "#f1f5f9", color: "#374151", padding: "2px 8px", borderRadius: 20 }}>{a.reagentname ?? a.itemname}</span>
                      ))}
                      {aAssignments.length > 3 && <span style={{ fontSize: 10, color: "#9ca3af" }}>+{aAssignments.length - 3} more</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && <AddAssignmentModal items={items} onClose={() => setShowModal(false)} onSuccess={() => { fetchAll(); showToast("Reagent assigned!"); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon d={icons.check} size={14} color="#fff" /> {toast}
        </div>
      )}
    </div>
  );
}
