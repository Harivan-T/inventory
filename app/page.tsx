"use client";
import { AddDrugWizard } from "@/components/AddDrugWizard";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
// ─── Types ────────────────────────────────────────────────────────────────────
interface Drug {
  drugid: string;
  name: string;
  genericname: string | null;
  atccode: string | null;
  form: string | null;
  strength: string | null;
  unit: string | null;
  barcode: string | null;
  manufacturer: string | null;
  requiresprescription: boolean;
  insuranceapproved: boolean;
  isactive: boolean;
  createdat: string;
  metadata?: { unitcost?: number; sellingprice?: number } | null;
}

interface DashboardData {
  totalDrugs: number;
  rxDrugs: number;
  insuredDrugs: number;
  otcDrugs: number;
  byForm: { form: string | null; count: number }[];
  byManufacturer: { manufacturer: string | null; count: number }[];
  recentDrugs: Drug[];
  allDrugs: Drug[];
  lowStockCount: number;
  notifications: { type: string; message: string }[];
}

const EMPTY_FORM = {
  name: "",
  genericname: "",
  atccode: "",
  form: "tablet",
  strength: "",
  unit: "tablet",
  barcode: "",
  manufacturer: "",
  requiresprescription: false,
  insuranceapproved: false,
  description: "",
  indication: "",
  warning: "",
  notes: "",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  pill: "M10.5 6.5L6.5 10.5M9 3l12 12-6 6L3 9l6-6zM3 9l4.5 4.5",
  package: "M16.5 9.4L7.55 4.24M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  rx: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  warning: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  info: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8h.01M11 12h1v4h1",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M6 18L18 6M6 6l12 12",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  box: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  warehouse: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  flask: "M9 3h6l1 7H8L9 3zM5 21h14a1 1 0 001-1 7 7 0 00-3.48-6.07L15 10H9l-1.52 3.93A7 7 0 005 20a1 1 0 001 1z",
  store: "M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM3 9l2-5h14l2 5M12 12v6M8 12v6M16 12v6",
  report: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8",
};

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{d.value}</span>
          <div style={{ width: "100%", background: colors[i % colors.length], borderRadius: 4, height: `${(d.value / max) * 56}px`, minHeight: 4, transition: "height 0.6s ease" }} />
          <span style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Add Drug Modal ───────────────────────────────────────────────────────────
function AddDrugModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.genericname) { setError("Name and generic name are required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/drugs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      onSuccess(); onClose();
    } catch { setError("Failed to add drug. Please try again."); }
    finally { setLoading(false); }
  };

  const field = (label: string, key: keyof typeof form, type = "text", options?: string[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {options ? (
        <select value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#f9fafb", outline: "none", color: "#111827" }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "checkbox" ? (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form[key] as boolean} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
            style={{ width: 16, height: 16, accentColor: "#2563eb" }} />
          <span style={{ fontSize: 13, color: "#374151" }}>Yes</span>
        </label>
      ) : (
        <input type={type} value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#f9fafb", outline: "none", color: "#111827" }} />
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>Add New Drug</h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>Fill in the drug details below</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={16} color="#6b7280" />
          </button>
        </div>

        <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {field("Drug Name *", "name")}
          {field("Generic Name *", "genericname")}
          {field("ATC Code", "atccode")}
          {field("Barcode", "barcode")}
          {field("Form", "form", "text", ["tablet", "capsule", "inhaler", "syrup", "injection", "cream", "drops"])}
          {field("Strength", "strength")}
          {field("Unit", "unit", "text", ["tablet", "capsule", "puff", "ml", "mg", "g"])}
          {field("Manufacturer", "manufacturer")}
          <div style={{ gridColumn: "1/-1" }}>{field("Description", "description")}</div>
          <div style={{ gridColumn: "1/-1" }}>{field("Indication", "indication")}</div>
          <div style={{ gridColumn: "1/-1" }}>{field("Warning", "warning")}</div>
          <div style={{ gridColumn: "1/-1" }}>{field("Notes", "notes")}</div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Requires Prescription</label>
            <div style={{ marginTop: 4 }}>{field("", "requiresprescription", "checkbox")}</div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Insurance Approved</label>
            <div style={{ marginTop: 4 }}>{field("", "insuranceapproved", "checkbox")}</div>
          </div>
        </div>

        {error && (
          <div style={{ margin: "0 28px", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{error}</div>
        )}

        <div style={{ padding: "16px 28px 24px", display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: "10px 24px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Adding..." : "Add Drug"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "drugs">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch { showToast("Failed to load dashboard", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/drugs?search=${encodeURIComponent(search)}`);
        setSearchResults(await res.json());
      } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    await fetch(`/api/drugs?id=${id}`, { method: "DELETE" });
    showToast(`"${name}" deactivated`);
    fetchDashboard();
  };

  const formBadgeColor: Record<string, string> = {
    tablet: "#dbeafe", capsule: "#d1fae5", inhaler: "#fef3c7",
    syrup: "#ede9fe", injection: "#fee2e2", cream: "#fce7f3",
  };
  const formTextColor: Record<string, string> = {
    tablet: "#1d4ed8", capsule: "#065f46", inhaler: "#92400e",
    syrup: "#5b21b6", injection: "#991b1b", cream: "#9d174d",
  };

  const displayDrugs = search.trim() ? searchResults : (data?.allDrugs ?? []);

  const navItems = [
    { key: "overview",  label: "Overview",          icon: icons.home,      href: null },
    { key: "drugs",     label: "Drug Inventory",     icon: icons.pill,      href: null },
    { key: "warehouses",label: "Warehouses",         icon: icons.warehouse, href: "/warehouses" },
    { key: "sections",  label: "Sections",           icon: icons.layers,    href: "/sections" },
    { key: "stock",     label: "Stock Management",   icon: icons.box,       href: "/stock" },
    { key: "items",     label: "Item Master",        icon: icons.box,       href: "/items" },
    { key: "stores",    label: "Dept Stores",        icon: icons.store,     href: "/stores" },
    { key: "pharmacy",  label: "Pharmacy",           icon: icons.pill,      href: "/pharmacy" },
    { key: "lab",       label: "Lab",                icon: icons.flask,     href: "/lab" },
    { key: "reports",   label: "Reports",            icon: icons.report,    href: "/reports/consumption" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        input:focus, select:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }
        .nav-item:hover { background: #eff6ff !important; color: #2563eb !important; }
        .nav-item:hover svg { stroke: #2563eb !important; }
        .row-hover:hover { background: #f8fafc !important; }
        .action-btn:hover { opacity: 0.8; }
        .card-hover:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; transform: translateY(-1px); transition: all 0.2s; }
        .drug-name-btn:hover { color: #1d4ed8 !important; text-decoration: underline; }
      `}</style>

      {/* ── Sidebar */}
      {sidebarOpen && (
        <aside style={{ width: 240, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "#2563eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={icons.pill} size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>PharmaDash</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>Inventory System</div>
              </div>
            </div>
          </div>

          <nav style={{ padding: "12px 12px", flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", padding: "0 8px 8px", textTransform: "uppercase" }}>Main Menu</div>
            {navItems.map(item => (
              item.href ? (
                <a key={item.key} href={item.href} className="nav-item"
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 2, background: "transparent", color: "#374151", textDecoration: "none" }}>
                  <Icon d={item.icon} size={16} color="#6b7280" />
                  {item.label}
                </a>
              ) : (
                <button key={item.key} className="nav-item"
                  onClick={() => setActiveTab(item.key as any)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, marginBottom: 2,
                    background: activeTab === item.key ? "#eff6ff" : "transparent",
                    color: activeTab === item.key ? "#2563eb" : "#374151" }}>
                  <Icon d={item.icon} size={16} color={activeTab === item.key ? "#2563eb" : "#6b7280"} />
                  {item.label}
                </button>
              )
            ))}

            <div style={{ marginTop: 20, fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", padding: "0 8px 8px", textTransform: "uppercase" }}>Quick Stats</div>
            <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Total Drugs</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{data?.totalDrugs ?? 0}</div>
            </div>
            <div style={{ padding: "8px 12px", background: "#fef3c7", borderRadius: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: "#92400e" }}>Low Stock Alerts</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#d97706" }}>{data?.lowStockCount ?? 0}</div>
            </div>
          </nav>

          <div style={{ padding: "12px 12px", borderTop: "1px solid #f3f4f6" }}>
            <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: "transparent", color: "#6b7280" }}>
              <Icon d={icons.logout} size={16} color="#6b7280" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* ── Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── Top bar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
            <Icon d={sidebarOpen ? icons.close : icons.menu} size={20} color="#6b7280" />
          </button>

          <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <Icon d={icons.search} size={15} color="#9ca3af" />
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search drugs by name, generic, manufacturer, ATC code..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, background: "#f9fafb", outline: "none", color: "#111827" }} />
            {searching && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, border: "2px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: "relative", background: showNotifications ? "#eff6ff" : "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Icon d={icons.bell} size={17} color={showNotifications ? "#2563eb" : "#6b7280"} />
              {(data?.notifications?.length ?? 0) > 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "1.5px solid #fff" }} />
              )}
            </button>
            {showNotifications && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "slideIn 0.15s ease", zIndex: 200 }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Notifications</span>
                  <span style={{ fontSize: 11, background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{data?.notifications?.length ?? 0}</span>
                </div>
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {data?.notifications?.length === 0 && (
                    <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>All clear!</div>
                  )}
                  {data?.notifications?.map((n, i) => (
                    <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #f9fafb", display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: n.type === "warning" ? "#fef3c7" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon d={n.type === "warning" ? icons.warning : icons.info} size={14} color={n.type === "warning" ? "#d97706" : "#2563eb"} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{n.message}</p>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>Just now</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setShowAddModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Icon d={icons.plus} size={15} color="#fff" />
            Add Drug
          </button>
        </header>

        {/* ── Content */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>
              {activeTab === "overview" ? "Dashboard Overview" : "Drug Inventory"}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
              {activeTab === "overview" ? "Pharmacy inventory statistics and insights" : "Manage and view all drugs in the system"}
            </p>
          </div>

          {/* ── OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <div style={{ marginBottom: 8 }}>
                <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Key Metrics</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Total Drugs", value: data?.totalDrugs ?? 0, sub: "Active in system", icon: icons.pill, color: "#2563eb", bg: "#eff6ff" },
                  { label: "Prescription Only", value: data?.rxDrugs ?? 0, sub: "Require Rx", icon: icons.rx, color: "#7c3aed", bg: "#ede9fe" },
                  { label: "OTC Drugs", value: data?.otcDrugs ?? 0, sub: "Over the counter", icon: icons.tag, color: "#059669", bg: "#d1fae5" },
                  { label: "Insurance Approved", value: data?.insuredDrugs ?? 0, sub: "Covered drugs", icon: icons.shield, color: "#d97706", bg: "#fef3c7" },
                ].map((m) => (
                  <div key={m.label} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 6 }}>{m.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{m.value}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{m.sub}</div>
                    </div>
                    <div style={{ width: 36, height: 36, background: m.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={m.icon} size={17} color={m.color} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: "20px", border: "1px solid #f3f4f6" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#111827" }}>Drugs by Form</h3>
                  <MiniBarChart data={(data?.byForm ?? []).map(f => ({ label: f.form ?? "unknown", value: Number(f.count) }))} />
                </div>
                <div style={{ background: "#fff", borderRadius: 12, padding: "20px", border: "1px solid #f3f4f6" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#111827" }}>Drugs by Manufacturer</h3>
                  <MiniBarChart data={(data?.byManufacturer ?? []).map(m => ({ label: m.manufacturer ?? "Unknown", value: Number(m.count) }))} />
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Status</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Low Stock Alerts", value: data?.lowStockCount ?? 0, sub: "Items need reorder", color: "#d97706", border: "#d97706" },
                  { label: "Inactive Drugs", value: 0, sub: "Deactivated items", color: "#6b7280", border: "#6b7280" },
                  { label: "System Status", value: "Active", sub: "All systems operational", color: "#16a34a", border: "#16a34a", isText: true },
                ].map((s) => (
                  <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #f3f4f6", borderLeft: `4px solid ${s.border}` }}>
                    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: (s as any).isText ? 20 : 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 8 }}>
                <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recently Added</h2>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden", marginBottom: 24 }}>
                {(data?.recentDrugs ?? []).map((drug, i) => (
                  <div key={drug.drugid} className="row-hover" style={{ padding: "14px 20px", borderBottom: i < (data?.recentDrugs?.length ?? 0) - 1 ? "1px solid #f9fafb" : "none", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "#f1f5f9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon d={icons.pill} size={16} color="#6b7280" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button className="drug-name-btn" onClick={() => router.push(`/drugs/${drug.drugid}`)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{drug.name}</div>
                      </button>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{drug.genericname} · {drug.manufacturer}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: formBadgeColor[drug.form ?? ""] ?? "#f3f4f6", color: formTextColor[drug.form ?? ""] ?? "#374151" }}>
                      {drug.form}
                    </span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(drug.createdat).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 8 }}>
                <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Actions</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { label: "Add New Drug", desc: "Register a new drug in inventory", icon: icons.plus, color: "#2563eb", bg: "#eff6ff", action: () => setShowAddModal(true) },
                  { label: "View All Drugs", desc: "Browse the full drug inventory", icon: icons.pill, color: "#7c3aed", bg: "#ede9fe", action: () => setActiveTab("drugs") },
                  { label: "Check Alerts", desc: "Review low stock notifications", icon: icons.bell, color: "#d97706", bg: "#fef3c7", action: () => setShowNotifications(true) },
                ].map((a) => (
                  <button key={a.label} onClick={a.action}
                    style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 12, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", transition: "all 0.15s" }}
                    className="card-hover">
                    <div style={{ width: 44, height: 44, background: a.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon d={a.icon} size={20} color={a.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── DRUGS TAB */}
          {activeTab === "drugs" && (
            <>
              {search.trim() && (
                <div style={{ marginBottom: 16, padding: "10px 16px", background: "#eff6ff", borderRadius: 8, fontSize: 13, color: "#2563eb", fontWeight: 500 }}>
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{search}"
                </div>
              )}

              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{displayDrugs.length} drugs</span>
                  <button onClick={() => setShowAddModal(true)}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    <Icon d={icons.plus} size={13} color="#fff" /> Add Drug
                  </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Drug Name", "Generic", "Form", "Strength", "Unit Cost", "Selling Price", "Manufacturer", "Rx", "Insurance", "Barcode", "Actions"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayDrugs.length === 0 && (
                        <tr><td colSpan={11} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No drugs found</td></tr>
                      )}
                      {displayDrugs.map((drug) => (
                        <tr key={drug.drugid} className="row-hover" style={{ borderTop: "1px solid #f9fafb" }}>
                          <td style={{ padding: "12px 16px" }}>
                            <button className="drug-name-btn" onClick={() => router.push(`/drugs/${drug.drugid}`)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#2563eb" }}>{drug.name}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>{drug.atccode}</div>
                            </button>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{drug.genericname ?? "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: formBadgeColor[drug.form ?? ""] ?? "#f3f4f6", color: formTextColor[drug.form ?? ""] ?? "#374151" }}>
                              {drug.form ?? "—"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{drug.strength ?? "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                            {drug.metadata?.unitcost ? `$${Number(drug.metadata.unitcost).toFixed(2)}` : "—"}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                            {drug.metadata?.sellingprice ? `$${Number(drug.metadata.sellingprice).toFixed(2)}` : "—"}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{drug.manufacturer ?? "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: drug.requiresprescription ? "#fee2e2" : "#d1fae5", color: drug.requiresprescription ? "#991b1b" : "#065f46" }}>
                              {drug.requiresprescription ? "Rx" : "OTC"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: drug.insuranceapproved ? "#d1fae5" : "#f3f4f6", color: drug.insuranceapproved ? "#065f46" : "#6b7280" }}>
                              {drug.insuranceapproved ? "Yes" : "No"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>{drug.barcode ?? "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <button onClick={() => handleDelete(drug.drugid, drug.name)} className="action-btn"
                              style={{ background: "#fef2f2", border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "inline-flex" }}>
                              <Icon d={icons.trash} size={13} color="#dc2626" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {showAddModal && (
        <AddDrugWizard
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { fetchDashboard(); showToast("Drug added successfully!"); setActiveTab("drugs"); }}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "error" ? "#dc2626" : "#16a34a", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "slideIn 0.2s ease", zIndex: 2000, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon d={toast.type === "error" ? icons.x : icons.check} size={15} color="#fff" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
