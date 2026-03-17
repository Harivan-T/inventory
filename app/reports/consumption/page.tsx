"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  back:    "M19 12H5M12 5l-7 7 7 7",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  user:    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  pill:    "M10.5 6h3M7 12h10M7 16h10M4 4l16 16",
  flask:   "M9 3h6l1 7H8L9 3zM5 21h14a1 1 0 001-1 7 7 0 00-3.48-6.07L15 10H9l-1.52 3.93A7 7 0 005 20a1 1 0 001 1z",
  filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
};

const TX_COLORS: Record<string, { bg: string; color: string }> = {
  DISPENSE:        { bg: "#dbeafe", color: "#1d4ed8" },
  LAB_CONSUMPTION: { bg: "#ede9fe", color: "#6d28d9" },
  default:         { bg: "#f3f4f6", color: "#374151" },
};

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
      background: bg, color, display: "inline-block", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const s: Record<string, any> = {
  page:    { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:  { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56,
             display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 },
  content: { padding: 24, maxWidth: 1200, margin: "0 auto" },
  card:    { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 16 },
  cardHead:{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex",
             alignItems: "center", justifyContent: "space-between" },
  cardBody:{ padding: 20 },
  th:      { padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700,
             color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.04em",
             background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" as const },
  td:      { padding: "11px 14px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#111827" },
  input:   { padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13,
             color: "#111827", background: "#fff" },
  metricCard: { background: "#f9fafb", borderRadius: 8, padding: "14px 18px", flex: 1, minWidth: 120 },
};

export default function ConsumptionReportPage() {
  const [rows,      setRows]      = useState<any[]>([]);
  const [byPatient, setByPatient] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [stores,    setStores]    = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    patientref: "",
    storeid:    "",
    from:       "",
    to:         "",
    type:       "all",
  });
  const setF = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/stores")
      .then(r => r.json())
      .then(d => setStores(d.stores ?? d ?? []))
      .catch(() => {});
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.patientref) params.set("patientref", filters.patientref);
    if (filters.storeid)    params.set("storeid",    filters.storeid);
    if (filters.from)       params.set("from",       filters.from);
    if (filters.to)         params.set("to",         filters.to);
    if (filters.type !== "all") params.set("type",   filters.type);

    try {
      const res  = await fetch(`/api/reports/consumption?${params}`);
      const data = await res.json();
      setRows(data.rows ?? []);
      setByPatient(data.byPatient ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Summary stats
  const totalDispense = rows.filter(r => r.transactiontype === "DISPENSE").length;
  const totalLab      = rows.filter(r => r.transactiontype === "LAB_CONSUMPTION").length;
  const uniquePatients = new Set(rows.filter(r => r.patientref).map(r => r.patientref)).size;
  const totalUnits    = rows.reduce((s, r) => s + Math.abs(r.quantity ?? 0), 0);

  const displayRows = activePatient
    ? rows.filter(r => (r.patientref ?? "(no patient)") === activePatient)
    : rows;

  return (
    <div style={s.page}>
      <style>{`
        * { box-sizing: border-box; }
        input, select { color: #111827 !important; }
        tr:hover td { background: #f9fafb; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <Link href="/" style={{ display: "flex", alignItems: "center", color: "#6b7280", textDecoration: "none" }}>
          <Icon d={icons.back} size={15} />
        </Link>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <span style={{ fontSize: 13, color: "#9ca3af" }}>Reports</span>
        <span style={{ fontSize: 13, color: "#9ca3af" }}>/</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Consumption Report</span>
      </div>

      <div style={s.content}>

        {/* Filters */}
        <div style={{ ...s.card, marginBottom: 20 }}>
          <div style={s.cardHead}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon d={icons.filter} size={15} color="#6b7280" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Filters</span>
            </div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Patient Ref</label>
                <input style={{ ...s.input, width: "100%" }}
                  value={filters.patientref}
                  onChange={e => setF("patientref", e.target.value)}
                  placeholder="MRN / Patient ID" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Store</label>
                <select style={{ ...s.input, width: "100%" }}
                  value={filters.storeid}
                  onChange={e => setF("storeid", e.target.value)}>
                  <option value="">All stores</option>
                  {stores.map((st: any) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Type</label>
                <select style={{ ...s.input, width: "100%" }}
                  value={filters.type}
                  onChange={e => setF("type", e.target.value)}>
                  <option value="all">All</option>
                  <option value="DISPENSE">Dispense only</option>
                  <option value="LAB_CONSUMPTION">Lab only</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>From</label>
                <input type="date" style={{ ...s.input, width: "100%" }}
                  value={filters.from} onChange={e => setF("from", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>To</label>
                <input type="date" style={{ ...s.input, width: "100%" }}
                  value={filters.to} onChange={e => setF("to", e.target.value)} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button onClick={fetchData}
                  style={{ padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none",
                    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary metrics */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total Transactions", value: rows.length,      color: "#111827" },
            { label: "Dispense Events",    value: totalDispense,    color: "#1d4ed8" },
            { label: "Lab Runs",           value: totalLab,         color: "#6d28d9" },
            { label: "Unique Patients",    value: uniquePatients,   color: "#059669" },
            { label: "Total Units Out",    value: totalUnits,       color: "#dc2626" },
          ].map(m => (
            <div key={m.label} style={s.metricCard}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: m.color }}>{m.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>

          {/* Patient sidebar */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon d={icons.user} size={14} color="#6b7280" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>BY PATIENT</span>
              </div>
              {activePatient && (
                <button onClick={() => setActivePatient(null)}
                  style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>
                  Clear
                </button>
              )}
            </div>
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
              {byPatient.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af", padding: "16px 20px" }}>No data.</p>
              ) : byPatient.map((p: any) => (
                <button key={p.patientref}
                  onClick={() => setActivePatient(prev => prev === p.patientref ? null : p.patientref)}
                  style={{
                    width: "100%", textAlign: "left", display: "flex", alignItems: "center",
                    justifyContent: "space-between", padding: "10px 16px", border: "none",
                    borderBottom: "1px solid #f3f4f6", cursor: "pointer",
                    background: activePatient === p.patientref ? "#eff6ff" : "#fff",
                  }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.patientref}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.transactions.length} transactions</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700,
                    background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 12 }}>
                    {p.totalItems}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transactions table */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon d={icons.pill} size={14} color="#6b7280" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                  {activePatient ? `TRANSACTIONS — ${activePatient}` : "ALL TRANSACTIONS"}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{displayRows.length} records</span>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Date", "Type", "Item", "Store", "Qty", "Patient", "Prescription", "By"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                          No records found. Adjust filters and click Apply.
                        </td>
                      </tr>
                    ) : displayRows.map((r: any) => {
                      const tc = TX_COLORS[r.transactiontype] ?? TX_COLORS.default;
                      return (
                        <tr key={r.id}>
                          <td style={{ ...s.td, fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                            {r.createdat ? new Date(r.createdat).toLocaleString() : "—"}
                          </td>
                          <td style={s.td}>
                            <Badge label={r.transactiontype} bg={tc.bg} color={tc.color} />
                          </td>
                          <td style={s.td}>
                            <div style={{ fontWeight: 600 }}>{r.itemname ?? "—"}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.itemcode}</div>
                          </td>
                          <td style={{ ...s.td, color: "#6b7280" }}>{r.storename ?? "—"}</td>
                          <td style={s.td}>
                            <span style={{ fontWeight: 700, color: "#dc2626" }}>
                              {Math.abs(r.quantity ?? 0)} {r.uom ?? ""}
                            </span>
                          </td>
                          <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}>
                            {r.patientref ?? <span style={{ color: "#d1d5db" }}>—</span>}
                          </td>
                          <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}>
                            {r.prescriptionref ?? <span style={{ color: "#d1d5db" }}>—</span>}
                          </td>
                          <td style={{ ...s.td, color: "#6b7280" }}>{r.createdby ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
