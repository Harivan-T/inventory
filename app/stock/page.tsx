"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Icon = ({ d, size = 20, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  back:        "M19 12H5M12 5l-7 7 7 7",
  receive:     "M12 2v20M2 12h20M12 2l4 4M12 2l-4 4",
  issue:       "M12 22V2M2 12h20M12 22l4-4M12 22l-4-4",
  transfer:    "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  adjustment:  "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  wastage:     "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
  transactions:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  overview:    "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  alert:       "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  box:         "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  trend:       "M23 6l-9.5 9.5-5-5L1 18",
  clock:       "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
};

interface StockSummary {
  totalItems: number;
  totalWarehouses: number;
  lowStockCount: number;
  recentTransactions: number;
}

const modules = [
  {
    key: "receive",
    title: "Receive Stock",
    description: "Record incoming inventory from suppliers",
    href: "/stock/receive",
    icon: icons.receive,
    color: "#16a34a",
    bg: "#dcfce7",
    border: "#bbf7d0",
  },
  {
    key: "issue",
    title: "Issue Stock",
    description: "Dispatch items to hospital departments",
    href: "/stock/issue",
    icon: icons.issue,
    color: "#2563eb",
    bg: "#dbeafe",
    border: "#bfdbfe",
  },
  {
    key: "transfer",
    title: "Transfer Stock",
    description: "Move items between warehouses",
    href: "/stock/transfer",
    icon: icons.transfer,
    color: "#7c3aed",
    bg: "#ede9fe",
    border: "#ddd6fe",
  },
  {
    key: "adjustment",
    title: "Stock Adjustment",
    description: "Correct stock levels during physical counts",
    href: "/stock/adjustment",
    icon: icons.adjustment,
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fde68a",
  },
  {
    key: "wastage",
    title: "Record Wastage",
    description: "Log expired, damaged or lost items",
    href: "/stock/wastage",
    icon: icons.wastage,
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fecaca",
  },
  {
    key: "transactions",
    title: "Transaction History",
    description: "View all stock movements and audit trail",
    href: "/stock/transactions",
    icon: icons.transactions,
    color: "#0891b2",
    bg: "#cffafe",
    border: "#a5f3fc",
  },
];

export default function StockPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockRes, txRes] = await Promise.all([
          fetch("/api/stock"),
          fetch("/api/stock/transactions"),
        ]);
        const stockData = await stockRes.json();
        const txData    = await txRes.json();

        const stockArr = Array.isArray(stockData) ? stockData : [];
        const txArr    = Array.isArray(txData)    ? txData    : [];

        const warehouses = new Set(stockArr.map((s: any) => s.warehouseid));
        const lowStock   = stockArr.filter((s: any) => s.quantity < 100).length;
        const recentTx   = txArr.filter((t: any) => {
          const d = new Date(t.createdat);
          const now = new Date();
          return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
        }).length;

        setSummary({
          totalItems:         stockArr.length,
          totalWarehouses:    warehouses.size,
          lowStockCount:      lowStock,
          recentTransactions: recentTx,
        });
        setStock(stockArr.slice(0, 8));
      } catch (e) {
        setSummary({ totalItems: 0, totalWarehouses: 0, lowStockCount: 0, recentTransactions: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .module-card { transition: all 0.2s ease; cursor: pointer; }
        .module-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        .stock-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, fontWeight: 500, padding: "6px 0" }}>
          <Icon d={icons.back} size={16} color="#6b7280" />
          Back to Dashboard
        </button>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={icons.box} size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Stock Management</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Inventory control center</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Page title */}
        <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#111827" }}>Stock Overview</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>Manage all inventory operations from one place</p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32, animation: "fadeUp 0.4s ease 0.1s both" }}>
          {[
            { label: "Stock Records",       value: loading ? "—" : summary?.totalItems ?? 0,         icon: icons.box,    color: "#2563eb", bg: "#eff6ff" },
            { label: "Warehouses",          value: loading ? "—" : summary?.totalWarehouses ?? 0,    icon: icons.overview, color: "#7c3aed", bg: "#ede9fe" },
            { label: "Low Stock Items",     value: loading ? "—" : summary?.lowStockCount ?? 0,      icon: icons.alert,  color: "#d97706", bg: "#fef3c7" },
            { label: "Transactions (7d)",   value: loading ? "—" : summary?.recentTransactions ?? 0, icon: icons.trend,  color: "#16a34a", bg: "#dcfce7" },
          ].map((s, i) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", animation: `fadeUp 0.4s ease ${0.1 + i * 0.05}s both` }}>
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{s.value}</div>
              </div>
              <div style={{ width: 40, height: 40, background: s.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={s.icon} size={18} color={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Stock Operations</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {modules.map((m, i) => (
            <div key={m.key} className="module-card"
              onClick={() => router.push(m.href)}
              style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", border: `1px solid #f3f4f6`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: `fadeUp 0.4s ease ${0.2 + i * 0.06}s both` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 48, height: 48, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon d={m.icon} size={22} color={m.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{m.description}</div>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>Open →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Stock Table */}
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Current Stock Levels</h2>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden", animation: "fadeUp 0.4s ease 0.5s both" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Item", "Warehouse", "Batch", "Expiry", "Quantity", "Reserved", "Last Updated"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading...</td></tr>
                )}
                {!loading && stock.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No stock records yet. Start by receiving stock.</td></tr>
                )}
                {stock.map((s, i) => (
                  <tr key={s.id} className="stock-row" style={{ borderTop: "1px solid #f9fafb" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.itemname}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.genericname}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{s.warehousename ?? "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{s.batchnumber ?? "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: s.expirydate && new Date(s.expirydate) < new Date() ? "#dc2626" : "#374151" }}>
                      {s.expirydate ? new Date(s.expirydate).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.quantity < 100 ? "#dc2626" : "#111827" }}>{s.quantity}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{s.reservedquantity}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>
                      {s.lastupdated ? new Date(s.lastupdated).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stock.length > 0 && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
              <button onClick={() => router.push("/stock/transactions")}
                style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>
                View all transactions →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
