"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const icons = {
  back:    "M19 12H5M12 5l-7 7 7 7",
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6L6 18M6 6l12 12",
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
};

const s: Record<string,any> = {
  page:    { fontFamily:"Inter,sans-serif", minHeight:"100vh", background:"#f8f9fa", color:"#111827" },
  header:  { background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 24px", height:56, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 },
  content: { padding:24, maxWidth:1000, margin:"0 auto" },
  card:    { background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:16 },
  th:      { padding:"10px 14px", textAlign:"left" as const, fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase" as const, background:"#f9fafb", borderBottom:"1px solid #e5e7eb" },
  td:      { padding:"12px 14px", borderBottom:"1px solid #f9fafb", fontSize:13, color:"#111827" },
  btn:     (c:string) => ({ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background:c==="purple"?"#6366f1":c==="red"?"#dc2626":"#f3f4f6", color:c==="ghost"?"#374151":"#fff" }),
  input:   { width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #d1d5db", fontSize:13, color:"#111827", boxSizing:"border-box" as const },
  label:   { fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:4 },
  overlay: { position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 },
  modal:   { background:"#fff", borderRadius:12, padding:28, width:480 },
  fgroup:  { marginBottom:12 },
};

const UOM_OPTIONS = ["tablet","capsule","strip","box","bottle","vial","ampoule","ml","mg","g","kg","l","piece","sachet","puff"];

const EMPTY_FORM = { item_id:"", from_uom:"", to_uom:"", factor:"" };

export default function UOMPage() {
  const [conversions, setConversions] = useState<any[]>([]);
  const [items, setItems]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalMode, setModalMode]     = useState<"add"|"edit"|"delete"|null>(null);
  const [activeRow, setActiveRow]     = useState<any>(null);
  const [toast, setToast]             = useState("");
  const [form, setForm]               = useState(EMPTY_FORM);

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const set = (k:string, v:string) => setForm(f => ({...f, [k]:v}));

  const closeModal = () => { setModalMode(null); setActiveRow(null); setForm(EMPTY_FORM); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [cRes, iRes] = await Promise.all([fetch("/api/uom"), fetch("/api/pharmacy/items")]);
    const cData = await cRes.json();
    const iData = await iRes.json();
    setConversions(Array.isArray(cData) ? cData : []);
    setItems(Array.isArray(iData) ? iData : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setActiveRow(null);
    setModalMode("add");
  };

  const openEdit = (row: any) => {
    setForm({ item_id: row.item_id ?? "", from_uom: row.from_uom, to_uom: row.to_uom, factor: String(row.factor) });
    setActiveRow(row);
    setModalMode("edit");
  };

  const openDelete = (row: any) => {
    setActiveRow(row);
    setModalMode("delete");
  };

  const handleSave = async () => {
    if (!form.from_uom || !form.to_uom || !form.factor) { showToast("All fields required"); return; }
    const isEdit = modalMode === "edit";
    const rowId  = isEdit ? activeRow?.id : null;
    const url    = rowId ? `/api/uom/${rowId}` : "/api/uom";
    const method = rowId ? "PATCH" : "POST";
    closeModal();
    const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, factor: parseFloat(form.factor)}) });
    if (res.ok) { fetchAll(); showToast(isEdit ? "Updated!" : "Added!"); }
  };

  const handleDelete = async () => {
    const rowId = activeRow?.id;
    closeModal();
    if (!rowId) return;
    await fetch(`/api/uom/${rowId}`, { method:"DELETE" });
    fetchAll();
    showToast("Deleted");
  };

  return (
    <div style={s.page}>
      <style>{`* { box-sizing:border-box; } input,select { color:#111827 !important; } tr:hover td { background:#f9fafb; }`}</style>

      <div style={s.header}>
        <Link href="/" style={{ display:"flex", alignItems:"center", color:"#6b7280", textDecoration:"none" }}><Icon d={icons.back} size={15}/></Link>
        <div style={{ width:1, height:20, background:"#e5e7eb" }}/>
        <span style={{ fontSize:14, fontWeight:700 }}>UOM Conversions</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={fetchAll} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:5 }}><Icon d={icons.refresh} size={13} color="#374151"/></button>
          <button onClick={openAdd} style={{ ...s.btn("purple"), display:"flex", alignItems:"center", gap:6 }}><Icon d={icons.plus} size={13} color="#fff"/> Add Conversion</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={{ padding:"10px 14px", background:"#eef2ff", borderRadius:8, marginBottom:16, fontSize:13, color:"#4338ca" }}>
          💡 Define how many of one unit equals another. Example: 1 box = 10 strips = 100 tablets. Factor = how many "to" units are in 1 "from" unit.
        </div>

        <div style={s.card}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Conversion Rules</span>
            <span style={{ fontSize:12, color:"#9ca3af" }}>{conversions.length} rules</span>
          </div>
          {loading
            ? <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Loading...</div>
            : conversions.length === 0
              ? <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>No conversions defined yet. <button onClick={openAdd} style={{ color:"#6366f1", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Add one →</button></div>
              : <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["Item","From UOM","Factor","To UOM","Example","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {conversions.map(c => (
                      <tr key={c.id}>
                        <td style={{ ...s.td, fontWeight:600 }}>{c.itemName || "Global"}</td>
                        <td style={s.td}><span style={{ fontSize:13, fontWeight:700, color:"#6366f1" }}>{c.from_uom}</span></td>
                        <td style={{ ...s.td, fontWeight:700, fontSize:16, textAlign:"center" as const }}>×{c.factor}</td>
                        <td style={s.td}><span style={{ fontSize:13, fontWeight:700, color:"#16a34a" }}>{c.to_uom}</span></td>
                        <td style={{ ...s.td, fontSize:12, color:"#6b7280" }}>1 {c.from_uom} = {c.factor} {c.to_uom}</td>
                        <td style={s.td}>
                          <div style={{ display:"flex", gap:5 }}>
                            <button onClick={() => openEdit(c)} style={{ background:"#eff6ff", border:"none", borderRadius:6, padding:"5px 8px", cursor:"pointer" }}><Icon d={icons.edit} size={12} color="#2563eb"/></button>
                            <button onClick={() => openDelete(c)} style={{ background:"#fee2e2", border:"none", borderRadius:6, padding:"5px 8px", cursor:"pointer" }}><Icon d={icons.trash} size={12} color="#dc2626"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          }
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div style={s.overlay}><div style={s.modal}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h3 style={{ fontSize:16, fontWeight:600, margin:0 }}>{modalMode === "edit" ? "Edit Conversion" : "Add UOM Conversion"}</h3>
            <button onClick={closeModal} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon d={icons.x} size={18} color="#6b7280"/></button>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Item (leave blank for global rule)</label>
            <select style={s.input} value={form.item_id} onChange={e => set("item_id", e.target.value)}>
              <option value="">Global — applies to all items</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:12, alignItems:"end" }}>
            <div style={s.fgroup}>
              <label style={s.label}>From UOM</label>
              <select style={s.input} value={form.from_uom} onChange={e => set("from_uom", e.target.value)}>
                <option value="">Select</option>
                {UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div style={{ textAlign:"center" as const, paddingBottom:14, fontSize:20, color:"#9ca3af" }}>→</div>
            <div style={s.fgroup}>
              <label style={s.label}>To UOM</label>
              <select style={s.input} value={form.to_uom} onChange={e => set("to_uom", e.target.value)}>
                <option value="">Select</option>
                {UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Factor — 1 {form.from_uom || "from"} = how many {form.to_uom || "to"}?</label>
            <input type="number" step="0.001" style={s.input} value={form.factor} onChange={e => set("factor", e.target.value)} placeholder="e.g. 10"/>
          </div>
          {form.from_uom && form.to_uom && form.factor && (
            <div style={{ padding:"8px 12px", background:"#eef2ff", borderRadius:6, fontSize:13, color:"#4338ca", marginBottom:12 }}>
              1 {form.from_uom} = {form.factor} {form.to_uom}
            </div>
          )}
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={closeModal} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb" }}>Cancel</button>
            <button onClick={handleSave} style={s.btn("purple")}>Save</button>
          </div>
        </div></div>
      )}

      {/* Delete Modal */}
      {modalMode === "delete" && activeRow && (
        <div style={s.overlay}><div style={{ ...s.modal, width:420 }}>
          <h3 style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>Delete Conversion</h3>
          <p style={{ fontSize:13, color:"#6b7280", marginBottom:20 }}>
            Delete rule: 1 {activeRow.from_uom} = {activeRow.factor} {activeRow.to_uom}?
          </p>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={closeModal} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb" }}>Cancel</button>
            <button onClick={handleDelete} style={s.btn("red")}>Delete</button>
          </div>
        </div></div>
      )}

      {toast && <div style={{ position:"fixed", bottom:24, right:24, background:"#16a34a", color:"#fff", padding:"11px 18px", borderRadius:10, fontSize:13, fontWeight:600, zIndex:2000 }}>✓ {toast}</div>}
    </div>
  );
}
