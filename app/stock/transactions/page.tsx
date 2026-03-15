"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Icon = ({ d, size = 20, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const icons = { back: "M19 12H5M12 5l-7 7 7 7" };

const TX_COLORS: Record<string, { bg: string; color: string }> = {
  STOCK_IN:   { bg: "#dcfce7", color: "#16a34a" },
  STOCK_OUT:  { bg: "#dbeafe", color: "#2563eb" },
  TRANSFER:   { bg: "#ede9fe", color: "#7c3aed" },
  ADJUSTMENT: { bg: "#fef3c7", color: "#d97706" },
  WASTAGE:    { bg: "#fee2e2", color: "#dc2626" },
  RETURN:     { bg: "#cffafe", color: "#0891b2" },
};

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/stock/transactions")
      .then(r => r.json())
      .then(d => { setTransactions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(t =>
    !filter || t.transactiontype === filter ||
    t.itemname?.toLowerCase().includes(filter.toLowerCase()) ||
    t.warehousename?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } .tx-row:hover { background: #f8fafc !important; }`}</style>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.push("/stock")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, fontWeight: 500 }}>
          <Icon d={icons.back} size={16} color="#6b7280" /> Back to Stock
        </button>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Transaction History</div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Transaction History</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Full audit trail of all stock movements</p>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", color: "#111827" }}>
            <option value="">All Types</option>
            {Object.keys(TX_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{filtered.length} transactions</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Date", "Item", "Warehouse", "Type", "Quantity", "Batch", "Notes", "By"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading...</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No transactions found</td></tr>}
                {filtered.map(t => {
                  const c = TX_COLORS[t.transactiontype] ?? { bg: "#f3f4f6", color: "#374151" };
                  return (
                    <tr key={t.id} className="tx-row" style={{ borderTop: "1px solid #f9fafb" }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                        {t.createdat ? new Date(t.createdat).toLocaleString() : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.itemname}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.genericname}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{t.warehousename ?? "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color }}>{t.transactiontype}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: t.quantity > 0 ? "#16a34a" : "#dc2626" }}>
                          {t.quantity > 0 ? "+" : ""}{t.quantity}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{t.batchnumber ?? "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{t.notes ?? "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{t.createdby ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
