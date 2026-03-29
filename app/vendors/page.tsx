"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  back:   "M19 12H5M12 5l-7 7 7 7",
  plus:   "M12 5v14M5 12h14",
  x:      "M18 6L6 18M6 6l12 12",
  check:  "M20 6L9 17l-5-5",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  vendor: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  mail:   "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  phone:  "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
};

const s: Record<string, any> = {
  page:    { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:  { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 },
  content: { padding: 24, maxWidth: 1200, margin: "0 auto" },
  card:    { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20, marginBottom: 12 },
  input:   { padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, color: "#111827", width: "100%", boxSizing: "border-box" as const },
  label:   { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  fgroup:  { marginBottom: 14 },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal:   { background: "#fff", borderRadius: 12, padding: 28, width: 540, maxHeight: "90vh", overflowY: "auto" as const },
};

function AddVendorModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", code: "", contactname: "", phone: "", email: "", address: "", country: "", paymentterms: "30", currency: "USD", taxnumber: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Vendor name is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/vendors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, paymentterms: parseInt(form.paymentterms) }) });
      if (!res.ok) throw new Error((await res.json()).error);
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Add Vendor</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} color="#6b7280" /></button>
        </div>
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1/-1", ...s.fgroup }}>
            <label style={s.label}>Vendor Name *</label>
            <input style={s.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. MedSupply Co" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Vendor Code</label>
            <input style={s.input} value={form.code} onChange={e => set("code", e.target.value)} placeholder="e.g. VEND-001" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Contact Name</label>
            <input style={s.input} value={form.contactname} onChange={e => set("contactname", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Phone</label>
            <input style={s.input} value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Country</label>
            <input style={s.input} value={form.country} onChange={e => set("country", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Payment Terms (days)</label>
            <input style={s.input} type="number" value={form.paymentterms} onChange={e => set("paymentterms", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Currency</label>
            <select style={s.input} value={form.currency} onChange={e => set("currency", e.target.value)}>
              <option>USD</option><option>EUR</option><option>GBP</option><option>IQD</option>
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Tax Number</label>
            <input style={s.input} value={form.taxnumber} onChange={e => set("taxnumber", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1", ...s.fgroup }}>
            <label style={s.label}>Address</label>
            <input style={s.input} value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1", ...s.fgroup }}>
            <label style={s.label}>Notes</label>
            <input style={s.input} value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving..." : "Add Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [toast, setToast]       = useState("");

  const fetchVendors = () => {
    setLoading(true);
    fetch(`/api/vendors?search=${search}`)
      .then(r => r.json())
      .then(d => { setVendors(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, [search]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const ratingStars = (r: number) => Array.from({ length: 5 }, (_, i) => (
    <Icon key={i} d={icons.star} size={12} color={i < r ? "#f59e0b" : "#d1d5db"} />
  ));

  return (
    <div style={s.page}>
      <style>{`* { box-sizing: border-box; } input, select { color: #111827 !important; } tr:hover td { background: #f9fafb; }`}</style>

      <div style={s.header}>
        <Link href="/procurement" style={{ display: "flex", alignItems: "center", color: "#6b7280", textDecoration: "none" }}>
          <Icon d={icons.back} size={15} />
        </Link>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Vendors</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Icon d={icons.search} size={14} color="#9ca3af" />
            <input style={{ ...s.input, width: 200, paddingLeft: 28, position: "absolute", left: 0, top: -14 }}
              placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Icon d={icons.plus} size={13} color="#fff" /> Add Vendor
          </button>
        </div>
      </div>

      <div style={s.content}>
        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Vendors",  value: vendors.length,                            color: "#2563eb", bg: "#eff6ff" },
            { label: "Active Vendors", value: vendors.filter(v => v.isactive).length,    color: "#16a34a", bg: "#f0fdf4" },
            { label: "Avg Pay Terms",  value: vendors.length ? Math.round(vendors.reduce((s, v) => s + (v.paymentterms ?? 30), 0) / vendors.length) + " days" : "—", color: "#d97706", bg: "#fef3c7" },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: m.color, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Vendor grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 13 }}>Loading...</div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 13 }}>
            No vendors yet. <button onClick={() => setShowAdd(true)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add one →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {vendors.map((v: any) => (
              <div key={v.id} style={{ ...s.card, marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{v.name}</div>
                    {v.code && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{v.code}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>{ratingStars(v.rating ?? 0)}</div>
                </div>
                {v.contactname && (
                  <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Icon d={icons.vendor} size={12} color="#9ca3af" /> {v.contactname}
                  </div>
                )}
                {v.email && (
                  <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Icon d={icons.mail} size={12} color="#9ca3af" /> {v.email}
                  </div>
                )}
                {v.phone && (
                  <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Icon d={icons.phone} size={12} color="#9ca3af" /> {v.phone}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {v.country && <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: "#f3f4f6", color: "#374151" }}>{v.country}</span>}
                  <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: "#eff6ff", color: "#2563eb" }}>{v.currency ?? "USD"}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: "#f0fdf4", color: "#16a34a" }}>{v.paymentterms ?? 30} days</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} onSuccess={() => { fetchVendors(); showToast("Vendor added!"); }} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#16a34a", color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 2000, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon d={icons.check} size={14} color="#fff" /> {toast}
        </div>
      )}
    </div>
  );
}
