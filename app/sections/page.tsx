"use client";
import { useEffect, useState, useCallback } from "react";
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
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  layers:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
};

const s: Record<string, any> = {
  page:    { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:  { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 },
  content: { padding: 24, maxWidth: 1200, margin: "0 auto" },
  card:    { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 16 },
  th:      { padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" as const, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" as const },
  td:      { padding: "12px 14px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#111827" },
  btn:     (c: string) => ({ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: c === "purple" ? "#6366f1" : c === "red" ? "#dc2626" : "#f3f4f6", color: c === "ghost" ? "#374151" : "#fff" }),
  input:   { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, color: "#111827", boxSizing: "border-box" as const },
  label:   { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal:   { background: "#fff", borderRadius: 12, padding: 28, width: 520, maxHeight: "90vh", overflowY: "auto" as const },
  fgroup:  { marginBottom: 14 },
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  bin:        { bg: "#dbeafe", color: "#1d4ed8" },
  shelf:      { bg: "#d1fae5", color: "#065f46" },
  room:       { bg: "#fef3c7", color: "#92400e" },
  cabinet:    { bg: "#ede9fe", color: "#6d28d9" },
  fridge:     { bg: "#cffafe", color: "#0e7490" },
  freezer:    { bg: "#e0f2fe", color: "#0369a1" },
  controlled: { bg: "#fee2e2", color: "#991b1b" },
};

function SectionModal({ section, warehouses, onClose, onSuccess }: { section?: any; warehouses: any[]; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!section;
  const [form, setForm] = useState({
    name:                 section?.section_name          ?? "",
    warehouse_id:         section?.warehouse_id          ?? "",
    section_type:         section?.section_type          ?? "bin",
    bin_location:         section?.bin_location          ?? "",
    shelf:                section?.shelf                 ?? "",
    description:          section?.description           ?? "",
    temperature_controlled: section?.temperature_controlled ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim())    { setError("Name is required"); return; }
    if (!form.warehouse_id)   { setError("Warehouse is required"); return; }
    setLoading(true);
    try {
      const url    = isEdit ? `/api/sections/${section.id}` : "/api/sections";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}><div style={s.modal}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h3 style={{ fontSize:16, fontWeight:600, margin:0 }}>{isEdit ? "Edit Section" : "Add Section"}</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      {error && <div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"8px 12px", fontSize:13, marginBottom:12 }}>{error}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div style={{ gridColumn:"1/-1", ...s.fgroup }}>
          <label style={s.label}>Section Name *</label>
          <input style={s.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Bin A-01, Shelf B-2"/>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Warehouse *</label>
          <select style={s.input} value={form.warehouse_id} onChange={e => set("warehouse_id", e.target.value)}>
            <option value="">Select warehouse</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Section Type</label>
          <select style={s.input} value={form.section_type} onChange={e => set("section_type", e.target.value)}>
            {["bin","shelf","room","cabinet","fridge","freezer","controlled"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Bin Location</label>
          <input style={s.input} value={form.bin_location} onChange={e => set("bin_location", e.target.value)} placeholder="e.g. A-01"/>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Shelf</label>
          <input style={s.input} value={form.shelf} onChange={e => set("shelf", e.target.value)} placeholder="e.g. Top shelf"/>
        </div>
        <div style={{ gridColumn:"1/-1", ...s.fgroup }}>
          <label style={s.label}>Description</label>
          <input style={s.input} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional notes..."/>
        </div>
        <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:8 }}>
          <input type="checkbox" id="tc" checked={form.temperature_controlled} onChange={e => set("temperature_controlled", e.target.checked)}
            style={{ width:15, height:15, accentColor:"#6366f1" }}/>
          <label htmlFor="tc" style={{ fontSize:13, color:"#374151", cursor:"pointer" }}>Temperature controlled (fridge/freezer)</label>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:16 }}>
        <button onClick={onClose} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb" }}>Cancel</button>
        <button onClick={handleSave} disabled={loading} style={s.btn("purple")}>{loading ? "Saving..." : isEdit ? "Save Changes" : "Add Section"}</button>
      </div>
    </div></div>
  );
}

export default function SectionsPage() {
  const [sections,   setSections]   = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [whFilter,   setWhFilter]   = useState("all");
  const [showAdd,    setShowAdd]    = useState(false);
  const [editSec,    setEditSec]    = useState<any>(null);
  const [deleteSec,  setDeleteSec]  = useState<any>(null);
  const [toast,      setToast]      = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sRes, wRes] = await Promise.all([fetch("/api/sections"), fetch("/api/warehouses")]);
    const sData = await sRes.json();
    const wData = await wRes.json();
    setSections(Array.isArray(sData) ? sData : []);
    setWarehouses(Array.isArray(wData) ? wData : (wData.warehouses ?? []));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    if (!deleteSec) return;
    await fetch(`/api/sections/${deleteSec.id}`, { method: "DELETE" });
    setDeleteSec(null); fetchAll(); showToast("Section deleted");
  };

  const filtered = sections.filter(sec =>
    (whFilter === "all" || sec.warehouse_id === whFilter) &&
    (sec.section_name?.toLowerCase().includes(search.toLowerCase()) ||
     sec.section_type?.toLowerCase().includes(search.toLowerCase()) ||
     sec.bin_location?.toLowerCase().includes(search.toLowerCase()) ||
     sec.shelf?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={s.page}>
      <style>{`* { box-sizing: border-box; } input,select { color: #111827 !important; } tr:hover td { background: #f9fafb; }`}</style>

      <div style={s.header}>
        <Link href="/" style={{ display:"flex", alignItems:"center", color:"#6b7280", textDecoration:"none" }}><Icon d={icons.back} size={15}/></Link>
        <div style={{ width:1, height:20, background:"#e5e7eb" }}/>
        <div style={{ width:32, height:32, background:"#f0fdf4", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon d={icons.layers} size={16} color="#16a34a"/></div>
        <span style={{ fontSize:14, fontWeight:700 }}>Sections</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={fetchAll} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:5 }}><Icon d={icons.refresh} size={13} color="#374151"/></button>
          <button onClick={() => setShowAdd(true)} style={{ ...s.btn("purple"), display:"flex", alignItems:"center", gap:6 }}><Icon d={icons.plus} size={13} color="#fff"/> Add Section</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Total Sections",    value:sections.length,                                              color:"#6366f1", bg:"#eef2ff" },
            { label:"Bins",              value:sections.filter(s=>s.section_type==="bin").length,            color:"#1d4ed8", bg:"#dbeafe" },
            { label:"Shelves",           value:sections.filter(s=>s.section_type==="shelf").length,          color:"#065f46", bg:"#d1fae5" },
            { label:"Temp. Controlled",  value:sections.filter(s=>s.temperature_controlled).length,          color:"#0e7490", bg:"#cffafe" },
          ].map(m => (
            <div key={m.label} style={{ background:m.bg, borderRadius:10, padding:"14px 18px" }}>
              <div style={{ fontSize:11, fontWeight:600, color:m.color, marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:26, fontWeight:700, color:"#111827" }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" as const }}>
            <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
              <div style={{ position:"absolute", left:10, pointerEvents:"none" }}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
              <input placeholder="Search sections..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...s.input, width:220, paddingLeft:30 }}/>
            </div>
            <select style={{ ...s.input, width:200 }} value={whFilter} onChange={e => setWhFilter(e.target.value)}>
              <option value="all">All Warehouses</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <span style={{ marginLeft:"auto", fontSize:12, color:"#9ca3af" }}>{filtered.length} sections</span>
          </div>

          {loading ? <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Loading...</div>
          : filtered.length === 0 ? <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>No sections found</div>
          : <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>{["Section Name","Type","Warehouse","Bin Location","Shelf","Temp Controlled","Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(sec => {
                  const tc = TYPE_COLORS[sec.section_type] ?? { bg:"#f3f4f6", color:"#374151" };
                  const wh = warehouses.find(w => w.id === sec.warehouse_id);
                  return (
                    <tr key={sec.id}>
                      <td style={{ ...s.td, fontWeight:600 }}>{sec.section_name}</td>
                      <td style={s.td}><span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:tc.bg, color:tc.color }}>{sec.section_type}</span></td>
                      <td style={{ ...s.td, fontSize:12, color:"#6b7280" }}>{wh?.name ?? "—"}</td>
                      <td style={{ ...s.td, fontSize:12, color:"#6b7280" }}>{sec.bin_location ?? "—"}</td>
                      <td style={{ ...s.td, fontSize:12, color:"#6b7280" }}>{sec.shelf ?? "—"}</td>
                      <td style={s.td}>
                        <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:sec.temperature_controlled?"#cffafe":"#f3f4f6", color:sec.temperature_controlled?"#0e7490":"#6b7280" }}>
                          {sec.temperature_controlled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display:"flex", gap:5 }}>
                          <button onClick={() => setEditSec(sec)} style={{ background:"#eff6ff", border:"none", borderRadius:6, padding:"5px 8px", cursor:"pointer", display:"flex", alignItems:"center" }}><Icon d={icons.edit} size={12} color="#2563eb"/></button>
                          <button onClick={() => setDeleteSec(sec)} style={{ background:"#fee2e2", border:"none", borderRadius:6, padding:"5px 8px", cursor:"pointer", display:"flex", alignItems:"center" }}><Icon d={icons.trash} size={12} color="#dc2626"/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>}
        </div>
      </div>

      {showAdd  && <SectionModal warehouses={warehouses} onClose={() => setShowAdd(false)} onSuccess={() => { fetchAll(); showToast("Section added!"); }}/>}
      {editSec  && <SectionModal section={editSec} warehouses={warehouses} onClose={() => setEditSec(null)} onSuccess={() => { fetchAll(); showToast("Section updated!"); }}/>}
      {deleteSec && (
        <div style={s.overlay}><div style={{ ...s.modal, width:420 }}>
          <h3 style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>Delete Section</h3>
          <p style={{ fontSize:13, color:"#6b7280", marginBottom:20 }}>Delete <strong>{deleteSec.section_name}</strong>?</p>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={() => setDeleteSec(null)} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb" }}>Cancel</button>
            <button onClick={handleDelete} style={s.btn("red")}>Delete</button>
          </div>
        </div></div>
      )}
      {toast && <div style={{ position:"fixed", bottom:24, right:24, background:"#16a34a", color:"#fff", padding:"11px 18px", borderRadius:10, fontSize:13, fontWeight:600, zIndex:2000 }}>✓ {toast}</div>}
    </div>
  );
}
