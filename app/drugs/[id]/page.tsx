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
      // TODO: Add your API call or submission logic here
      // Example:
      // await api.addDrug(form);
      onSuccess();
      setLoading(false);
    } catch (e: any) {
      setError(e.message || "Failed to add drug");
      setLoading(false);
    }
  };