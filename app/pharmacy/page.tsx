"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ImportDrugModal } from "@/components/ImportDrugModal";

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
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  pill:    "M10.5 6.5L6.5 10.5M9 3l12 12-6 6L3 9l6-6z",
  import:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  lock:    "M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V9a6 6 0 10-12 0v2H4v13h16V11h-2z",
  layers:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
};

const s: Record<string, any> = {
  page:    { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:  { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 },
  content: { padding: 24, maxWidth: 1400, margin: "0 auto" },
  tabs:    { display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid #e5e7eb", flexWrap: "wrap" as const },
  tab:     (a: boolean) => ({ padding: "10px 16px", fontSize: 13, fontWeight: 500, border: "none", background: "none", cursor: "pointer", borderBottom: a ? "2px solid #6366f1" : "2px solid transparent", color: a ? "#6366f1" : "#6b7280" }),
  card:    { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 16 },
  th:      { padding: "10px 12px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" as const, background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" as const },
  td:      { padding: "10px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#111827" },
  btn:     (c: string) => ({ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: c === "purple" ? "#6366f1" : c === "green" ? "#16a34a" : c === "blue" ? "#2563eb" : c === "red" ? "#dc2626" : "#f3f4f6", color: c === "ghost" ? "#374151" : "#fff" }),
  input:   { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, color: "#111827", boxSizing: "border-box" as const },
  label:   { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal:   { background: "#fff", borderRadius: 12, padding: 28, width: 600, maxHeight: "90vh", overflowY: "auto" as const },
  fgroup:  { marginBottom: 14 },
};

function stockColor(qty: number, reorder: number) {
  if (qty === 0) return { bg: "#fee2e2", color: "#991b1b", label: "Out of stock" };
  if (qty <= reorder) return { bg: "#fef3c7", color: "#92400e", label: "Low stock" };
  return { bg: "#d1fae5", color: "#065f46", label: "In stock" };
}

function expiryAlert(date: string | null) {
  if (!date) return null;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (days <= 0) return { label: "Expired", bg: "#fee2e2", color: "#991b1b" };
  if (days <= 90) return { label: `Expires ${days}d`, bg: "#fef3c7", color: "#92400e" };
  return null;
}

function Pagination({ page, total, pageSize, setPage }: { page: number; total: number; pageSize: number; setPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (total <= pageSize) return null;
  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 12, color: "#6b7280" }}>Showing {(page-1)*pageSize+1}–{Math.min(page*pageSize, total)} of {total}</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => setPage(Math.max(1, page-1))} disabled={page===1}
          style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: page===1?"#f9fafb":"#fff", fontSize: 12, cursor: page===1?"default":"pointer", color: page===1?"#d1d5db":"#374151" }}>← Prev</button>
        {Array.from({length: totalPages}, (_,i)=>i+1)
          .filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1)
          .reduce((acc:(number|string)[],p,idx,arr)=>{ if(idx>0&&(p as number)-(arr[idx-1] as number)>1) acc.push("..."); acc.push(p); return acc; },[])
          .map((p,idx) => typeof p==="string"
            ? <span key={`d${idx}`} style={{padding:"5px 8px",fontSize:12,color:"#9ca3af"}}>…</span>
            : <button key={p} onClick={()=>setPage(p as number)} style={{padding:"5px 10px",borderRadius:6,border:"1px solid",fontSize:12,cursor:"pointer",background:page===p?"#6366f1":"#fff",borderColor:page===p?"#6366f1":"#e5e7eb",color:page===p?"#fff":"#374151",fontWeight:page===p?600:400}}>{p}</button>
          )}
        <button onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page===totalPages}
          style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: page===totalPages?"#f9fafb":"#fff", fontSize: 12, cursor: page===totalPages?"default":"pointer", color: page===totalPages?"#d1d5db":"#374151" }}>Next →</button>
      </div>
    </div>
  );
}

// ── Item Modal ─────────────────────────────────────────────────────────────────
function ItemModal({ item, warehouses, onClose, onSuccess }: { item?: any; warehouses: any[]; onClose: ()=>void; onSuccess: ()=>void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name ?? "", genericname: item?.genericName ?? item?.generic_Name ?? "",
    itemcode: item?.itemcode ?? "", itemtype: item?.itemType ?? "drug",
    uom: item?.uom ?? "tablet", manufacturer: item?.manufacturer ?? "",
    description: item?.description ?? "", barcode: item?.barcode ?? "",
    min_level: String(item?.minLevel ?? ""), reorder_level: String(item?.reorderLevel ?? ""),
    max_level: String(item?.maxLevel ?? ""), controlled: item?.controlled ?? false,
    warehouseid: "", unitcost: String(item?.unitCost ?? ""), sellingprice: String(item?.sellingPrice ?? ""),
    price_type: item?.price_type ?? "fixed",
    insurance_coverage_pct: String(item?.insurance_coverage_pct ?? "0"),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.itemcode.trim()) { setError("Name and item code are required"); return; }
    if (!isEdit && !form.warehouseid) { setError("Warehouse is required"); return; }
    setLoading(true);
    try {
const payload = { ...form, inventorycategory: "pharmacy", min_level: parseInt(form.min_level)||0, reorder_level: parseInt(form.reorder_level)||0, max_level: parseInt(form.max_level)||null, insurance_coverage_pct: parseFloat(form.insurance_coverage_pct)||0 };      const res = await fetch(isEdit ? `/api/items/${item.id}` : "/api/items", { method: isEdit?"PATCH":"POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      onSuccess(); onClose();
    } catch(e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}><div style={s.modal}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:600}}>{isEdit?"Edit Item":"Add Pharmacy Item"}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      {error && <div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:12}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[["Item Name *","name","text"],["Generic Name","genericname","text"],["Item Code *","itemcode","text"],["Barcode","barcode","text"],["Manufacturer","manufacturer","text"]].map(([lbl,key,type])=>(
          <div key={key} style={s.fgroup}><label style={s.label}>{lbl}</label><input type={type} style={s.input} value={(form as any)[key]} onChange={e=>set(key,e.target.value)}/></div>
        ))}
        <div style={s.fgroup}><label style={s.label}>Item Type</label>
          <select style={s.input} value={form.itemtype} onChange={e=>set("itemtype",e.target.value)}>
            {["drug","supply","consumable","asset"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
        </div>
        <div style={s.fgroup}><label style={s.label}>Unit of Measure</label>
          <select style={s.input} value={form.uom} onChange={e=>set("uom",e.target.value)}>
            {["tablet","capsule","ampoule","vial","bag","bottle","sachet","strip","piece","ml","mg","g"].map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {!isEdit && <div style={s.fgroup}><label style={s.label}>Pharmacy Warehouse *</label>
          <select style={s.input} value={form.warehouseid} onChange={e=>set("warehouseid",e.target.value)}>
            <option value="">Select warehouse</option>
            {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>}
       {/* Pricing section */}
        <div style={{gridColumn:"1/-1",borderTop:"1px solid #f3f4f6",paddingTop:12,marginTop:4}}>
          <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:10}}>💰 Pricing</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={s.fgroup}>
              <label style={s.label}>Price Type</label>
              <select style={s.input} value={form.price_type} onChange={e=>set("price_type",e.target.value)}>
                <option value="fixed">Fixed Price — patient pays full price</option>
                <option value="insurance">Insurance — patient pays % only</option>
              </select>
            </div>
            <div style={s.fgroup}>
              <label style={s.label}>Purchase Price (Unit Cost)</label>
              <input type="number" step="0.01" style={s.input} value={form.unitcost} onChange={e=>set("unitcost",e.target.value)} placeholder="0.00"/>
            </div>
            <div style={s.fgroup}>
              <label style={s.label}>Selling Price</label>
              <input type="number" step="0.01" style={s.input} value={form.sellingprice} onChange={e=>set("sellingprice",e.target.value)} placeholder="0.00"/>
            </div>
            {form.price_type === "insurance" && (
              <div style={s.fgroup}>
                <label style={s.label}>Insurance Coverage %</label>
                <input type="number" min="0" max="100" step="1" style={s.input} value={form.insurance_coverage_pct} onChange={e=>set("insurance_coverage_pct",e.target.value)} placeholder="0"/>
              </div>
            )}
          </div>
          {/* Live calculator */}
          {form.sellingprice && parseFloat(form.sellingprice) > 0 && (
            <div style={{marginTop:8,padding:"10px 14px",background: form.price_type==="insurance" ? "#eef2ff" : "#f0fdf4",borderRadius:8,display:"flex",gap:20,fontSize:12}}>
              {form.price_type === "fixed" ? (
                <>
                  <span>💊 Selling Price: <strong style={{color:"#16a34a"}}>${parseFloat(form.sellingprice||"0").toFixed(2)}</strong></span>
                  <span style={{color:"#6b7280"}}>Patient pays full price</span>
                </>
              ) : (
                <>
                  <span>💊 Selling Price: <strong>${parseFloat(form.sellingprice||"0").toFixed(2)}</strong></span>
                  <span style={{color:"#6366f1"}}>🏥 Insurance pays: <strong>${(parseFloat(form.sellingprice||"0") * parseFloat(form.insurance_coverage_pct||"0") / 100).toFixed(2)}</strong> ({form.insurance_coverage_pct}%)</span>
                  <span style={{color:"#16a34a"}}>👤 Patient pays: <strong>${(parseFloat(form.sellingprice||"0") * (1 - parseFloat(form.insurance_coverage_pct||"0") / 100)).toFixed(2)}</strong></span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Stock levels */}
        {[["Min Level","min_level"],["Reorder Level","reorder_level"],["Max Level","max_level"]].map(([lbl,key])=>(
          <div key={key} style={s.fgroup}><label style={s.label}>{lbl}</label><input type="number" style={s.input} value={(form as any)[key]} onChange={e=>set(key,e.target.value)}/></div>
        ))}
        <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Description</label><input style={s.input} value={form.description} onChange={e=>set("description",e.target.value)}/></div>
        <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:8}}>
          <input type="checkbox" id="ctrl" checked={form.controlled} onChange={e=>set("controlled",e.target.checked)} style={{width:15,height:15,accentColor:"#6366f1"}}/>
          <label htmlFor="ctrl" style={{fontSize:13,color:"#374151",cursor:"pointer"}}>Controlled substance</label>
        </div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}>
        <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
        <button onClick={handleSave} disabled={loading} style={s.btn("purple")}>{loading?"Saving...":isEdit?"Save Changes":"Add Item"}</button>
      </div>
    </div></div>
  );
}

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ item, onClose, onSuccess }: { item: any; onClose: ()=>void; onSuccess: ()=>void }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => { setLoading(true); await fetch(`/api/items/${item.id}`,{method:"DELETE"}); onSuccess(); onClose(); };
  return (
    <div style={s.overlay}><div style={{...s.modal,width:420}}>
      <h3 style={{fontSize:15,fontWeight:600,marginBottom:8}}>Deactivate Item</h3>
      <p style={{fontSize:13,color:"#6b7280",marginBottom:20}}>Deactivate <strong>{item.name}</strong>? It will no longer appear in stock operations.</p>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
        <button onClick={handleDelete} disabled={loading} style={s.btn("red")}>{loading?"Deactivating...":"Deactivate"}</button>
      </div>
    </div></div>
  );
}

// ── Dispense Modal ─────────────────────────────────────────────────────────────
function DispenseModal({ stores, onClose, onSuccess }: { stores: any[]; onClose: ()=>void; onSuccess: ()=>void }) {
  const [form, setForm] = useState({ storeid:"", itemid:"", quantity:"", patientref:"", prescriptionref:"", dispensedby:"", witnessedby:"", notes:"" });
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  useEffect(() => { if (!form.storeid) return; fetch(`/api/stores/${form.storeid}`).then(r=>r.json()).then(d=>setStoreItems(d.stock??[])); }, [form.storeid]);
  const handleSave = async () => {
    if (!form.storeid||!form.itemid||!form.quantity) { setError("Store, item and quantity are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/pharmacy/dispense",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,quantity:parseInt(form.quantity),actiontype:"DISPENSE"})});
      if (!res.ok) throw new Error((await res.json()).error);
      onSuccess(); onClose();
    } catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <div style={s.overlay}><div style={s.modal}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:600}}>Dispense Drug</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      {error && <div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:12}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={s.fgroup}><label style={s.label}>Store *</label>
          <select style={s.input} value={form.storeid} onChange={e=>set("storeid",e.target.value)}>
            <option value="">Select store</option>{stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={s.fgroup}><label style={s.label}>Item *</label>
          <select style={s.input} value={form.itemid} onChange={e=>set("itemid",e.target.value)}>
            <option value="">Select item</option>{storeItems.map(i=><option key={i.itemid} value={i.itemid}>{i.itemname}</option>)}
          </select>
        </div>
        <div style={s.fgroup}><label style={s.label}>Quantity *</label><input type="number" style={s.input} value={form.quantity} onChange={e=>set("quantity",e.target.value)}/></div>
        <div style={s.fgroup}><label style={s.label}>Patient Ref</label><input style={s.input} value={form.patientref} onChange={e=>set("patientref",e.target.value)}/></div>
        <div style={s.fgroup}><label style={s.label}>Prescription Ref</label><input style={s.input} value={form.prescriptionref} onChange={e=>set("prescriptionref",e.target.value)}/></div>
        <div style={s.fgroup}><label style={s.label}>Dispensed By</label><input style={s.input} value={form.dispensedby} onChange={e=>set("dispensedby",e.target.value)}/></div>
        <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Witness</label><input style={s.input} value={form.witnessedby} onChange={e=>set("witnessedby",e.target.value)}/></div>
        <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={e=>set("notes",e.target.value)}/></div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
        <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
        <button onClick={handleSave} disabled={loading} style={s.btn("purple")}>{loading?"Dispensing...":"Dispense"}</button>
      </div>
    </div></div>
  );
}

// ── Batch Modal ────────────────────────────────────────────────────────────────
function BatchModal({ item, onClose }: { item: any; onClose: ()=>void }) {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch(`/api/pharmacy/items/${item.id}/batches`).then(r=>r.json()).then(d=>{setBatches(Array.isArray(d)?d:[]);setLoading(false);}); }, [item.id]);
  function batchStatus(b: any) {
    if (!b.expiryDate) return { label:"No Expiry", bg:"#f3f4f6", color:"#374151" };
    const days = Math.ceil((new Date(b.expiryDate).getTime()-Date.now())/86400000);
    if (days<=0) return {label:"Expired",bg:"#fee2e2",color:"#991b1b"};
    if (days<=30) return {label:`${days}d`,bg:"#fee2e2",color:"#991b1b"};
    if (days<=90) return {label:`${days}d`,bg:"#fef3c7",color:"#92400e"};
    return {label:"OK",bg:"#d1fae5",color:"#065f46"};
  }
  return (
    <div style={s.overlay}><div style={{...s.modal,width:780}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <h3 style={{fontSize:16,fontWeight:600,margin:0}}>{item.name}</h3>
          <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{item.itemcode} · {item.uom} · Batch Viewer (FEFO order)</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      {loading ? <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading batches...</div>
      : batches.length===0 ? <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No batches found</div>
      : <>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Batch No","Qty","Purchase Price","Selling Price","Expiry","Warehouse","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {batches.map(b=>{const st=batchStatus(b); return (
              <tr key={b.id}>
                <td style={{...s.td,fontFamily:"monospace",fontWeight:600}}>{b.batchNumber??"—"}</td>
                <td style={{...s.td,fontWeight:700,fontSize:15}}>{b.quantity}</td>
                <td style={s.td}>{b.unitCost?`$${parseFloat(b.unitCost).toFixed(2)}`:"—"}</td>
                <td style={{...s.td,color:"#16a34a",fontWeight:600}}>{b.sellingPrice?`$${parseFloat(b.sellingPrice).toFixed(2)}`:"—"}</td>
                <td style={s.td}>{b.expiryDate?new Date(b.expiryDate).toLocaleDateString():"—"}</td>
                <td style={{...s.td,fontSize:12}}>{b.warehouseName??"—"}</td>
                <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:st.bg,color:st.color}}>{st.label}</span></td>
              </tr>
            );})}
          </tbody>
        </table>
        <div style={{marginTop:16,padding:"12px 16px",background:"#f9fafb",borderRadius:8,display:"flex",gap:24}}>
          <div><span style={{fontSize:11,color:"#6b7280"}}>Total Qty</span><div style={{fontWeight:700,fontSize:16}}>{batches.reduce((s,b)=>s+(b.quantity||0),0)}</div></div>
          <div><span style={{fontSize:11,color:"#6b7280"}}>Batches</span><div style={{fontWeight:700,fontSize:16}}>{batches.length}</div></div>
          <div><span style={{fontSize:11,color:"#6b7280"}}>Expired</span><div style={{fontWeight:700,fontSize:16,color:"#dc2626"}}>{batches.filter(b=>b.expiryDate&&new Date(b.expiryDate)<new Date()).length}</div></div>
          <div><span style={{fontSize:11,color:"#6b7280"}}>Expiring &lt;90d</span><div style={{fontWeight:700,fontSize:16,color:"#d97706"}}>{batches.filter(b=>{if(!b.expiryDate)return false;const d=Math.ceil((new Date(b.expiryDate).getTime()-Date.now())/86400000);return d>0&&d<=90;}).length}</div></div>
        </div>
      </>}
    </div></div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PharmacyPage() {
type Tab = "items"|"stock"|"dispense"|"controlled"|"history"|"shoplist"|"suppliers"|"expiry"|"adjustments"|"quarantine"|"orders";
  const [tab, setTab] = useState<Tab>("items");
  const [items, setItems] = useState<any[]>([]);
  const [dispenses, setDispenses] = useState<any[]>([]);
  const [controlled, setControlled] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [pharmaWh, setPharmaWh] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [history, setHistory] = useState<any[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_SIZE = 15;
  const [showDispense, setShowDispense] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [batchItem, setBatchItem] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toast, setToast] = useState("");
  // Shop list
  const [shopList, setShopList] = useState<any[]>([]);
  const [shopQtys, setShopQtys] = useState<Record<string,number>>({});
  const [shopLoading, setShopLoading] = useState(false);
  const [shopSaving, setShopSaving] = useState(false);
  const [shopSearch, setShopSearch] = useState("");
  const [shopSearchResults, setShopSearchResults] = useState<any[]>([]);
  const [shopSearching, setShopSearching] = useState(false);
  const [manualShopItems, setManualShopItems] = useState<any[]>([]);
  // Suppliers
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name:"", contactPerson:"", email:"", phone:"", address:"" });
  const [editSupplier, setEditSupplier] = useState<any>(null);
  const [viewSupplier, setViewSupplier] = useState<any>(null);
  const [supplierItems, setSupplierItems] = useState<any[]>([]);
  const [supplierItemsLoading, setSupplierItemsLoading] = useState(false);
  // Expiry alerts
  const [expiry, setExpiry]               = useState<any[]>([]);
  const [expiryDays, setExpiryDays]       = useState(90);
  const [expiryLoading, setExpiryLoading] = useState(false);
  // Adjustments
  const [adjustments, setAdjustments]     = useState<any[]>([]);
  const [adjLoading, setAdjLoading]       = useState(false);
  const [showAdjModal, setShowAdjModal]   = useState(false);
  const [adjForm, setAdjForm]             = useState({ itemId:"", warehouseId:"", batchId:"", adjustmentQty:"", reason:"", createdBy:"" });
  const [adjBatches, setAdjBatches]       = useState<any[]>([]);
  // Quarantine
  const [quarantine, setQuarantine]       = useState<any[]>([]);
  const [quarLoading, setQuarLoading]     = useState(false);
  const [showQuarModal, setShowQuarModal] = useState(false);
  const [quarForm, setQuarForm]           = useState({ batchId:"", itemId:"", itemName:"", batchNumber:"", reason:"", notes:"", quarantinedBy:"" });
  const [quarBatchSearch, setQuarBatchSearch] = useState("");
  const [quarBatchResults, setQuarBatchResults] = useState<any[]>([]);
  // Orders / Prescriptions
const [orders, setOrders]               = useState<any[]>([]);
const [ordersLoading, setOrdersLoading] = useState(false);
const [orderSearch, setOrderSearch]     = useState("");
const [orderStatus, setOrderStatus]     = useState("PENDING");
const [selectedOrder, setSelectedOrder] = useState<any>(null);
const [orderItems, setOrderItems]       = useState<any[]>([]);
const [orderItemsLoading, setOrderItemsLoading] = useState(false);
const [dispensingOrder, setDispensingOrder] = useState(false);
  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes,dRes,cRes,sRes,wRes] = await Promise.all([
        fetch(`/api/pharmacy/items?search=${encodeURIComponent(search)}`),
        fetch("/api/pharmacy/dispense"),
        fetch("/api/pharmacy/controlled"),
        fetch("/api/stores"),
        fetch("/api/warehouses"),
      ]);
      const [iData,dData,cData,sData,wData] = await Promise.all([iRes.json(),dRes.json(),cRes.json(),sRes.json(),wRes.json()]);
      setItems(Array.isArray(iData)?iData:[]);
      setDispenses(Array.isArray(dData)?dData:[]);
      setControlled(Array.isArray(cData)?cData:[]);
      setStores(Array.isArray(sData)?sData:[]);
      const allWh = Array.isArray(wData)?wData:(wData.warehouses??[]);
      setPharmaWh(allWh.filter((w:any)=>w.warehousetype==="pharmacy"||w.warehouse_type==="pharmacy"));
    } finally { setLoading(false); }
    if (tab==="history") {
      fetch(`/api/pharmacy/history?page=${historyPage}&limit=${HISTORY_SIZE}`).then(r=>r.json()).then(d=>{setHistory(d.rows??[]);setHistoryTotal(d.total??0);});
    }
  }, [search, tab, historyPage]);

  const fetchShopList = useCallback(async () => {
    setShopLoading(true);
    const res = await fetch("/api/pharmacy/shoplist");
    const data = await res.json();
    const list = Array.isArray(data)?data:[];
    setShopList(list);
    const qtys: Record<string,number> = {};
    list.forEach((i:any)=>{ qtys[i.id]=(i.maxLevel??i.reorderLevel*2)-i.currentStock; });
    setShopQtys(q=>({...qtys,...q}));
    setShopLoading(false);
  }, []);

  const fetchSuppliers = useCallback(async () => {
    const res = await fetch(`/api/pharmacy/suppliers?search=${encodeURIComponent(supplierSearch)}`);
    const data = await res.json();
    setSuppliers(Array.isArray(data)?data:[]);
  }, [supplierSearch]);

  const fetchExpiry = useCallback(async () => {
    setExpiryLoading(true);
    const res = await fetch(`/api/pharmacy/expiry?days=${expiryDays}`);
    const data = await res.json();
    setExpiry(Array.isArray(data)?data:[]);
    setExpiryLoading(false);
  }, [expiryDays]);

  const fetchAdjustments = useCallback(async () => {
    setAdjLoading(true);
    const res = await fetch("/api/pharmacy/adjustments");
    const data = await res.json();
    setAdjustments(Array.isArray(data)?data:[]);
    setAdjLoading(false);
  }, []);

  const fetchQuarantine = useCallback(async () => {
    setQuarLoading(true);
    const res = await fetch("/api/pharmacy/quarantine");
    const data = await res.json();
    setQuarantine(Array.isArray(data)?data:[]);
    setQuarLoading(false);
  }, []);

  const searchQuarBatches = async (q: string) => {
    setQuarBatchSearch(q);
    if (!q.trim()) { setQuarBatchResults([]); return; }
    const res = await fetch(`/api/pharmacy/items?search=${encodeURIComponent(q)}`);
    const data = await res.json();
    setQuarBatchResults(Array.isArray(data)?data.slice(0,6):[]);
  };

  const saveAdjustment = async () => {
    if (!adjForm.itemId||!adjForm.warehouseId||!adjForm.adjustmentQty||!adjForm.reason) { showToast("All fields required"); return; }
    const res = await fetch("/api/pharmacy/adjustments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(adjForm)});
    if (res.ok) { setShowAdjModal(false); setAdjForm({itemId:"",warehouseId:"",batchId:"",adjustmentQty:"",reason:"",createdBy:""}); fetchAdjustments(); fetchAll(); showToast("Adjustment saved!"); }
    else { const d=await res.json(); showToast(d.error??"Failed"); }
  };

  const saveQuarantine = async () => {
    if (!quarForm.batchId||!quarForm.itemId||!quarForm.reason) { showToast("Batch and reason required"); return; }
    const res = await fetch("/api/pharmacy/quarantine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(quarForm)});
    if (res.ok) { setShowQuarModal(false); setQuarForm({batchId:"",itemId:"",itemName:"",batchNumber:"",reason:"",notes:"",quarantinedBy:""}); setQuarBatchSearch(""); setQuarBatchResults([]); fetchQuarantine(); showToast("Batch quarantined!"); }
    else { const d=await res.json(); showToast(d.error??"Failed"); }
  };

  const resolveQuarantine = async (id: string) => {
    await fetch("/api/pharmacy/quarantine",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,resolvedBy:"Pharmacy"})});
    fetchQuarantine(); showToast("Quarantine resolved!");
  };
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    const res = await fetch(`/api/pharmacy/orders?search=${encodeURIComponent(orderSearch)}&status=${orderStatus}`);
    const data = await res.json();
    setOrders(Array.isArray(data)?data:[]);
    setOrdersLoading(false);
  }, [orderSearch, orderStatus]);

  const loadOrderItems = async (order: any) => {
    setSelectedOrder(order);
    setOrderItemsLoading(true);
    const res = await fetch("/api/pharmacy/orders", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({orderId: order.orderId}),
    });
    const data = await res.json();
    setOrderItems(Array.isArray(data)?data:[]);
    setOrderItemsLoading(false);
  };

  const dispenseItems = async (itemsToDispense: any[], dispenseAll: boolean) => {
    setDispensingOrder(true);
    const payload = itemsToDispense.filter(i=>i.inventoryItem).map(i=>({
      inventoryItemId: i.inventoryItem.id, quantity: i.quantity,
      drugName: i.drugName, batchId: null,
    }));
    const res = await fetch("/api/pharmacy/orders/dispense", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({orderId: selectedOrder.orderId, items: payload, dispensedBy: "Pharmacy", dispenseAll}),
    });
    const data = await res.json();
    showToast(data.message ?? "Done");
    setDispensingOrder(false);
    if (data.success) { setSelectedOrder(null); setOrderItems([]); fetchOrders(); fetchAll(); }
    else if (data.dispensed?.length > 0) { fetchOrders(); fetchAll(); loadOrderItems(selectedOrder); }
  };

  useEffect(()=>{fetchAll();},[fetchAll]);
  useEffect(()=>{if(tab==="shoplist")fetchShopList();},[tab,fetchShopList]);
  useEffect(()=>{if(tab==="suppliers")fetchSuppliers();},[tab,supplierSearch,fetchSuppliers]);
  useEffect(()=>{if(tab==="expiry")fetchExpiry();},[tab,expiryDays,fetchExpiry]);
  useEffect(()=>{if(tab==="adjustments")fetchAdjustments();},[tab,fetchAdjustments]);
  useEffect(()=>{if(tab==="quarantine")fetchQuarantine();},[tab,fetchQuarantine]);
  useEffect(()=>{if(tab==="orders")fetchOrders();},[tab,orderSearch,orderStatus,fetchOrders]);
  const searchShopItems = async (q: string) => {
    setShopSearch(q);
    if (!q.trim()) { setShopSearchResults([]); return; }
    setShopSearching(true);
    const res = await fetch(`/api/pharmacy/items?search=${encodeURIComponent(q)}`);
    const data = await res.json();
    setShopSearchResults(Array.isArray(data)?data.slice(0,8):[]);
    setShopSearching(false);
  };

  const addToShopList = (item: any) => {
    if (shopList.find(i=>i.id===item.id)||manualShopItems.find(i=>i.id===item.id)) { showToast("Already in list"); return; }
    setManualShopItems(m=>[...m,{ id:item.id, name:item.name, genericName:item.genericName??item.generic_Name, itemcode:item.itemcode, uom:item.uom, currentStock:item.totalStock, reorderLevel:item.reorderLevel, maxLevel:item.maxLevel, lastUnitCost:item.unitCost }]);
    setShopQtys(q=>({...q,[item.id]:1}));
    setShopSearch(""); setShopSearchResults([]);
  };

  const removeFromShopList = (id: string) => {
    setManualShopItems(m=>m.filter(i=>i.id!==id));
    setShopQtys(q=>{const n={...q};delete n[id];return n;});
  };

  const saveShopList = async () => {
    setShopSaving(true);
    const allItems = [...shopList,...manualShopItems];
    const items = allItems.filter(i=>(shopQtys[i.id]??0)>0).map(i=>({itemId:i.id,quantity:shopQtys[i.id],unitCost:i.lastUnitCost}));
    if (!items.length) { showToast("No items to save"); setShopSaving(false); return; }
    const res = await fetch("/api/pharmacy/shoplist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items})});
    const data = await res.json();
    if (data.prNumber) { showToast(`PR created: ${data.prNumber}`); setManualShopItems([]); }
    setShopSaving(false);
  };

  const saveSupplier = async () => {
    if (!supplierForm.name.trim()) return;
    const res = await fetch("/api/pharmacy/suppliers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(supplierForm)});
    if (res.ok) { setShowAddSupplier(false); setSupplierForm({name:"",contactPerson:"",email:"",phone:"",address:""}); fetchSuppliers(); showToast("Supplier added!"); }
  };

  const updateSupplier = async () => {
    if (!editSupplier) return;
    await fetch("/api/pharmacy/suppliers",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(editSupplier)});
    setEditSupplier(null); fetchSuppliers(); showToast("Supplier updated!");
  };

  const deleteSupplier = async (id: string) => {
    await fetch("/api/pharmacy/suppliers",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    fetchSuppliers(); showToast("Supplier deactivated");
  };

  const loadSupplierItems = async (supplier: any) => {
    setViewSupplier(supplier); setSupplierItemsLoading(true);
    const res = await fetch(`/api/pharmacy/suppliers/${supplier.id}/items`);
    const data = await res.json();
    setSupplierItems(Array.isArray(data)?data:[]); setSupplierItemsLoading(false);
  };

  const filteredItems = items.filter(i=>typeFilter==="all"||i.itemType===typeFilter);
  const totalItems = items.length;
  const lowStock = items.filter(i=>parseInt(i.totalStock)>0&&parseInt(i.totalStock)<=parseInt(i.reorderLevel??0)).length;
  const outOfStock = items.filter(i=>parseInt(i.totalStock)===0).length;
  const controlledCt = items.filter(i=>i.controlled).length;

  const tabLabels: Record<Tab,string> = {
    items:`Items (${items.length})`, stock:"Stock", dispense:"Dispense Log",
    controlled:"Controlled", history:"History",
    shoplist:`🛒 Shop List${shopList.length+manualShopItems.length>0?` (${shopList.length+manualShopItems.length})`:""}`,
    suppliers:"Suppliers",
    expiry:`⚠️ Expiry${expiry.filter(e=>e.status!=="ok").length>0?` (${expiry.filter(e=>e.status!=="ok").length})`:""}`,
    adjustments:"Adjustments",
    quarantine:`🔒 Quarantine${quarantine.filter(q=>!q.isResolved).length>0?` (${quarantine.filter(q=>!q.isResolved).length})`:""}`,
    orders:`📋 Orders${orders.filter(o=>o.status==="PENDING").length>0?` (${orders.filter(o=>o.status==="PENDING").length})`:""}`,
  };

  return (
    <div style={s.page}>
      <style>{`* { box-sizing: border-box; } input, select { color: #111827 !important; } tr:hover td { background: #f9fafb; }`}</style>

      {/* Header */}
      <div style={s.header}>
        <Link href="/" style={{display:"flex",alignItems:"center",color:"#6b7280",textDecoration:"none"}}><Icon d={icons.back} size={15}/></Link>
        <div style={{width:1,height:20,background:"#e5e7eb"}}/>
        <div style={{width:32,height:32,background:"#ede9fe",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon d={icons.pill} size={16} color="#6366f1"/></div>
        <span style={{fontSize:14,fontWeight:700,color:"#111827"}}>Pharmacy Inventory</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={fetchAll} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:5}}><Icon d={icons.refresh} size={13} color="#374151"/></button>
          <button onClick={()=>setShowImportModal(true)} style={{...s.btn("ghost"),border:"1px solid #bbf7d0",color:"#16a34a",background:"#f0fdf4",display:"flex",alignItems:"center",gap:6}}><Icon d={icons.import} size={13} color="#16a34a"/> Import from DB</button>
          <button onClick={()=>setShowAddItem(true)} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Add Item</button>
        </div>
      </div>

      <div style={s.content}>
        {/* Summary cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
          {[{label:"Total Items",value:totalItems,color:"#6366f1",bg:"#eef2ff"},{label:"Low Stock",value:lowStock,color:"#d97706",bg:"#fef3c7"},{label:"Out of Stock",value:outOfStock,color:"#dc2626",bg:"#fee2e2"},{label:"Controlled",value:controlledCt,color:"#7c3aed",bg:"#f5f3ff"}].map(m=>(
            <div key={m.label} style={{background:m.bg,borderRadius:10,padding:"14px 18px"}}>
              <div style={{fontSize:11,fontWeight:600,color:m.color,marginBottom:4}}>{m.label}</div>
              <div style={{fontSize:28,fontWeight:700,color:"#111827"}}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {(Object.keys(tabLabels) as Tab[]).map(t=>(
            <button key={t} style={s.tab(tab===t)} onClick={()=>setTab(t)}>{tabLabels[t]}</button>
          ))}
        </div>

        {/* ITEMS TAB */}
        {tab==="items" && (
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" as const}}>
              <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                <div style={{position:"absolute",left:10,pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                <input placeholder="Search items..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{...s.input,width:200,paddingLeft:30}}/>
              </div>
              <div style={{width:1,height:20,background:"#e5e7eb"}}/>
              {[{key:"all",label:"All",count:items.length},{key:"drug",label:"Drug",count:items.filter(i=>i.itemType==="drug").length},{key:"supply",label:"Supply",count:items.filter(i=>i.itemType==="supply").length},{key:"consumable",label:"Consumable",count:items.filter(i=>i.itemType==="consumable").length},{key:"asset",label:"Asset",count:items.filter(i=>i.itemType==="asset").length}].map(t=>(
                <button key={t.key} onClick={()=>{setTypeFilter(t.key);setPage(1);}} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,border:`1px solid ${typeFilter===t.key?"#6366f1":"#e5e7eb"}`,background:typeFilter===t.key?"#6366f1":"#f9fafb",color:typeFilter===t.key?"#fff":"#374151",cursor:"pointer",whiteSpace:"nowrap" as const}}>
                  {t.label} ({t.count})
                </button>
              ))}
              <span style={{marginLeft:"auto",fontSize:12,color:"#9ca3af"}}>{filteredItems.length} items</span>
            </div>
            {loading ? <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>
            : filteredItems.length===0 ? <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No items found. <button onClick={()=>setShowAddItem(true)} style={{color:"#6366f1",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Add one →</button></div>
            : <>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","Type","UOM","Stock","Reorder","Purchase Price","Selling Price","Expiry","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredItems.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(item=>{
                      const sc=stockColor(parseInt(item.totalStock),parseInt(item.reorderLevel??0));
                      const exp=expiryAlert(item.nearestExpiry);
                      return (
                        <tr key={item.id}>
                          <td style={{...s.td,minWidth:160}}>
                            <div style={{fontWeight:600}}>{item.name}</div>
                            {(item.genericName??item.generic_Name)&&<div style={{fontSize:11,color:"#9ca3af"}}>{item.genericName??item.generic_Name}</div>}
                            {item.controlled&&<span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:10,background:"#f5f3ff",color:"#7c3aed",display:"inline-block",marginTop:2}}>Controlled</span>}
                          </td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{item.itemcode}</td>
                          <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#f3f4f6",color:"#374151"}}>{item.itemType}</span></td>
                          <td style={s.td}>{item.uom}</td>
                          <td style={{...s.td,fontWeight:700,fontSize:15}}>{item.totalStock}</td>
                          <td style={{...s.td,color:"#6b7280"}}>{item.reorderLevel??0}</td>
                          <td style={s.td}>{item.unitCost?<span style={{fontWeight:600}}>${parseFloat(item.unitCost).toFixed(2)}</span>:<span style={{color:"#d1d5db"}}>—</span>}</td>
                          <td style={s.td}>{item.sellingPrice?<span style={{fontWeight:600,color:"#16a34a"}}>${parseFloat(item.sellingPrice).toFixed(2)}</span>:<span style={{color:"#d1d5db"}}>—</span>}</td>
                          <td style={s.td}>{exp?<span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:exp.bg,color:exp.color}}>{exp.label}</span>:item.nearestExpiry?<span style={{fontSize:11,color:"#6b7280"}}>{new Date(item.nearestExpiry).toLocaleDateString()}</span>:<span style={{color:"#d1d5db"}}>—</span>}</td>
                          <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:sc.bg,color:sc.color}}>{sc.label}</span></td>
                          <td style={s.td}>
                            <div style={{display:"flex",gap:5}}>
                              <button onClick={()=>setBatchItem(item)} title="View batches" style={{background:"#f0fdf4",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon d={icons.layers} size={12} color="#16a34a"/></button>
                              <button onClick={()=>setEditItem(item)} style={{background:"#eff6ff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon d={icons.edit} size={12} color="#2563eb"/></button>
                              <button onClick={()=>setDeleteItem(item)} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon d={icons.trash} size={12} color="#dc2626"/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={filteredItems.length} pageSize={PAGE_SIZE} setPage={setPage}/>
            </>}
          </div>
        )}

        {/* STOCK TAB */}
        {tab==="stock" && (
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600}}>Stock Overview</span>
              <Link href="/stock/receive" style={{...s.btn("purple"),textDecoration:"none",display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Receive Stock</Link>
            </div>
            {items.length===0 ? <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No stock data</div> : <>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","UOM","Total Stock","Reserved","Available","Batches","Purchase Price","Selling Price","Reorder","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {items.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(item=>{
                      const avail=parseInt(item.totalStock)-parseInt(item.reservedStock??0);
                      const sc=stockColor(avail,parseInt(item.reorderLevel??0));
                      return (
                        <tr key={item.id}>
                          <td style={{...s.td,fontWeight:600}}>{item.name}</td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{item.itemcode}</td>
                          <td style={s.td}>{item.uom}</td>
                          <td style={{...s.td,fontWeight:700,fontSize:15}}>{item.totalStock}</td>
                          <td style={{...s.td,color:"#d97706"}}>{item.reservedStock??0}</td>
                          <td style={{...s.td,fontWeight:700,color:sc.color,fontSize:15}}>{avail}</td>
                          <td style={s.td}>{item.batchCount}</td>
                          <td style={s.td}>{item.unitCost?`$${parseFloat(item.unitCost).toFixed(2)}`:"—"}</td>
                          <td style={{...s.td,color:"#16a34a",fontWeight:600}}>{item.sellingPrice?`$${parseFloat(item.sellingPrice).toFixed(2)}`:"—"}</td>
                          <td style={{...s.td,color:"#6b7280"}}>{item.reorderLevel??0}</td>
                          <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:sc.bg,color:sc.color}}>{sc.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={items.length} pageSize={PAGE_SIZE} setPage={setPage}/>
            </>}
          </div>
        )}

        {/* DISPENSE TAB */}
        {tab==="dispense" && (
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600}}>Dispense Log</span>
              <button onClick={()=>setShowDispense(true)} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Dispense Drug</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Drug","Qty","Patient","Prescription","Dispensed By","Date"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {dispenses.length===0&&<tr><td colSpan={6} style={{...s.td,textAlign:"center",padding:40,color:"#9ca3af"}}>No dispense records yet</td></tr>}
                  {dispenses.map((d:any)=>(
                    <tr key={d.logid??d.id}>
                      <td style={{...s.td,fontWeight:600}}>{d.drugname??d.itemname??"—"}</td>
                      <td style={{...s.td,fontWeight:700}}>{d.quantity}</td>
                      <td style={s.td}>{d.patientref??"—"}</td>
                      <td style={{...s.td,fontFamily:"monospace",fontSize:12}}>{d.prescriptionref??"—"}</td>
                      <td style={s.td}>{d.dispensedby??"—"}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(d.createdat).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTROLLED TAB */}
        {tab==="controlled" && (
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6"}}><span style={{fontSize:13,fontWeight:600}}>Controlled Drug Register</span></div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Item","Action","Qty","Patient","Dispensed By","Witness","Date"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {controlled.length===0&&<tr><td colSpan={7} style={{...s.td,textAlign:"center",padding:40,color:"#9ca3af"}}>No controlled drug records</td></tr>}
                  {controlled.map((c:any)=>{
                    const colors:Record<string,[string,string]>={DISPENSE:["#dbeafe","#1e40af"],RETURN:["#d1fae5","#065f46"],DESTROY:["#fee2e2","#991b1b"],AUDIT:["#fef3c7","#92400e"]};
                    const [bg,color]=colors[c.actiontype]??["#f3f4f6","#374151"];
                    return (
                      <tr key={c.id}>
                        <td style={{...s.td,fontWeight:600}}>{c.itemname??"—"}</td>
                        <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:bg,color}}>{c.actiontype}</span></td>
                        <td style={{...s.td,fontWeight:700}}>{c.quantity}</td>
                        <td style={s.td}>{c.patientref??"—"}</td>
                        <td style={s.td}>{c.dispensedby??"—"}</td>
                        <td style={{...s.td,color:c.witnessedby?"#111827":"#d1d5db"}}>{c.witnessedby??"No witness"}</td>
                        <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(c.createdat).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab==="history" && (
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600}}>Transaction History</span>
              <span style={{fontSize:12,color:"#9ca3af"}}>{historyTotal} total records</span>
            </div>
            {history.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No transactions yet</div>:<>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","Type","Qty","Warehouse","Batch","Patient","Reference","By","Date"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {history.map((tx:any)=>{
                      const tc:Record<string,[string,string]>={STOCK_IN:["#d1fae5","#065f46"],STOCK_OUT:["#fee2e2","#991b1b"],TRANSFER:["#dbeafe","#1e40af"],ADJUSTMENT:["#fef3c7","#92400e"],WASTAGE:["#f3f4f6","#374151"],DISPENSE:["#ede9fe","#5b21b6"]};
                      const [tbg,tcol]=tc[tx.transactionType]??["#f3f4f6","#374151"];
                      return (
                        <tr key={tx.id}>
                          <td style={{...s.td,fontWeight:600}}>{tx.itemName??"—"}</td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{tx.itemcode??"—"}</td>
                          <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:tbg,color:tcol}}>{tx.transactionType}</span></td>
                          <td style={{...s.td,fontWeight:700,color:tx.transactionType==="STOCK_IN"?"#16a34a":"#dc2626"}}>{tx.transactionType==="STOCK_IN"?"+":"-"}{tx.quantity}</td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{tx.warehouseName??"—"}</td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{tx.batchNumber??"—"}</td>
                          <td style={{...s.td,fontSize:12}}>{tx.patientRef??"—"}</td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{tx.referenceId??"—"}</td>
                          <td style={{...s.td,fontSize:12}}>{tx.createdBy??"—"}</td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{padding:"12px 16px",borderTop:"1px solid #f3f4f6",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:"#6b7280"}}>Showing {(historyPage-1)*HISTORY_SIZE+1}–{Math.min(historyPage*HISTORY_SIZE,historyTotal)} of {historyTotal}</span>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>setHistoryPage(p=>Math.max(1,p-1))} disabled={historyPage===1} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:12,cursor:historyPage===1?"default":"pointer",color:historyPage===1?"#d1d5db":"#374151",background:"#fff"}}>← Prev</button>
                  <span style={{padding:"5px 12px",fontSize:12,color:"#374151"}}>Page {historyPage} of {Math.ceil(historyTotal/HISTORY_SIZE)||1}</span>
                  <button onClick={()=>setHistoryPage(p=>Math.min(Math.ceil(historyTotal/HISTORY_SIZE),p+1))} disabled={historyPage>=Math.ceil(historyTotal/HISTORY_SIZE)} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:12,cursor:historyPage>=Math.ceil(historyTotal/HISTORY_SIZE)?"default":"pointer",color:historyPage>=Math.ceil(historyTotal/HISTORY_SIZE)?"#d1d5db":"#374151",background:"#fff"}}>Next →</button>
                </div>
              </div>
            </>}
          </div>
        )}

        {/* SHOP LIST TAB */}
        {tab==="shoplist" && (
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <span style={{fontSize:13,fontWeight:600}}>Shop List</span>
                <span style={{fontSize:12,color:"#6b7280",marginLeft:8}}>Low stock items + manually added</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={fetchShopList} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:5}}><Icon d={icons.refresh} size={13} color="#374151"/> Refresh</button>
                <button onClick={saveShopList} disabled={shopSaving||(shopList.length===0&&manualShopItems.length===0)} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.check} size={13} color="#fff"/>{shopSaving?"Saving...":"Save as PR"}</button>
              </div>
            </div>

            {/* Search to add items */}
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",background:"#f9fafb",position:"relative"}}>
              <div style={{position:"relative",display:"flex",alignItems:"center",maxWidth:440}}>
                <div style={{position:"absolute",left:10,pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                <input placeholder="Search and add any drug or item to list..." value={shopSearch} onChange={e=>searchShopItems(e.target.value)} style={{...s.input,paddingLeft:30}}/>
                {shopSearching&&<span style={{position:"absolute",right:10,fontSize:11,color:"#9ca3af"}}>...</span>}
              </div>
              {shopSearchResults.length>0&&(
                <div style={{position:"absolute",top:52,left:16,width:440,background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:100}}>
                  {shopSearchResults.map(item=>(
                    <div key={item.id} onClick={()=>addToShopList(item)}
                      style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                      onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")}
                      onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{item.name}</div>
                        <div style={{fontSize:11,color:"#9ca3af"}}>{item.itemcode} · {item.uom} · Stock: {item.totalStock}</div>
                      </div>
                      <span style={{fontSize:11,color:"#6366f1",fontWeight:600}}>+ Add</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {shopLoading?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>
            :(shopList.length===0&&manualShopItems.length===0)?
              <div style={{padding:40,textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>✅</div>
                <div style={{fontSize:14,fontWeight:600,color:"#16a34a"}}>All items are sufficiently stocked!</div>
                <div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>Use the search above to manually add items to the list.</div>
              </div>
            :<>
              {shopList.length>0&&<div style={{padding:"8px 16px",background:"#fef3c7",borderBottom:"1px solid #fde68a",fontSize:12,color:"#92400e"}}>⚠️ {shopList.length} item{shopList.length>1?"s":""} at or below reorder level</div>}
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","UOM","Current Stock","Reorder","Max","Last Price","Order Qty","Est. Cost",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {shopList.map(item=>{
                      const qty=shopQtys[item.id]??0;
                      const cost=qty*parseFloat(item.lastUnitCost??0);
                      return (
                        <tr key={item.id}>
                          <td style={s.td}><div style={{fontWeight:600}}>{item.name}</div>{item.genericName&&<div style={{fontSize:11,color:"#9ca3af"}}>{item.genericName}</div>}</td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{item.itemcode}</td>
                          <td style={s.td}>{item.uom}</td>
                          <td style={{...s.td,fontWeight:700,color:item.currentStock===0?"#dc2626":"#d97706"}}>{item.currentStock}</td>
                          <td style={{...s.td,color:"#6b7280"}}>{item.reorderLevel}</td>
                          <td style={{...s.td,color:"#6b7280"}}>{item.maxLevel??"—"}</td>
                          <td style={s.td}>{item.lastUnitCost?`$${parseFloat(item.lastUnitCost).toFixed(2)}`:"—"}</td>
                          <td style={s.td}><input type="number" min={0} value={qty} onChange={e=>setShopQtys(q=>({...q,[item.id]:parseInt(e.target.value)||0}))} style={{...s.input,width:80,textAlign:"center" as const}}/></td>
                          <td style={{...s.td,fontWeight:600,color:"#6366f1"}}>{item.lastUnitCost?`$${cost.toFixed(2)}`:"—"}</td>
                          <td style={s.td}></td>
                        </tr>
                      );
                    })}
                    {manualShopItems.length>0&&<>
                      <tr><td colSpan={10} style={{...s.td,background:"#eef2ff",fontWeight:600,fontSize:11,color:"#6366f1",padding:"6px 12px"}}>MANUALLY ADDED ITEMS</td></tr>
                      {manualShopItems.map(item=>{
                        const qty=shopQtys[item.id]??1;
                        const cost=qty*parseFloat(item.lastUnitCost??0);
                        return (
                          <tr key={item.id}>
                            <td style={s.td}><div style={{fontWeight:600}}>{item.name}</div>{item.genericName&&<div style={{fontSize:11,color:"#9ca3af"}}>{item.genericName}</div>}</td>
                            <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{item.itemcode}</td>
                            <td style={s.td}>{item.uom}</td>
                            <td style={{...s.td,fontWeight:700}}>{item.currentStock}</td>
                            <td style={{...s.td,color:"#6b7280"}}>{item.reorderLevel??"—"}</td>
                            <td style={{...s.td,color:"#6b7280"}}>{item.maxLevel??"—"}</td>
                            <td style={s.td}>{item.lastUnitCost?`$${parseFloat(item.lastUnitCost).toFixed(2)}`:"—"}</td>
                            <td style={s.td}><input type="number" min={1} value={qty} onChange={e=>setShopQtys(q=>({...q,[item.id]:parseInt(e.target.value)||1}))} style={{...s.input,width:80,textAlign:"center" as const}}/></td>
                            <td style={{...s.td,fontWeight:600,color:"#6366f1"}}>{item.lastUnitCost?`$${cost.toFixed(2)}`:"—"}</td>
                            <td style={s.td}><button onClick={()=>removeFromShopList(item.id)} style={{background:"#fee2e2",border:"none",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:11,color:"#dc2626"}}>✕</button></td>
                          </tr>
                        );
                      })}
                    </>}
                  </tbody>
                </table>
              </div>
              <div style={{padding:"12px 16px",borderTop:"1px solid #f3f4f6",display:"flex",justifyContent:"flex-end"}}>
                <span style={{fontSize:13,color:"#6b7280"}}>Total estimated cost: <strong style={{color:"#6366f1"}}>${[...shopList,...manualShopItems].reduce((sum,item)=>sum+(shopQtys[item.id]??0)*parseFloat(item.lastUnitCost??0),0).toFixed(2)}</strong></span>
              </div>
            </>}
          </div>
        )}

        {/* SUPPLIERS TAB */}
        {tab==="suppliers" && (
          <div>
            {viewSupplier&&(
              <div style={s.overlay}><div style={{...s.modal,width:820}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div><h3 style={{fontSize:16,fontWeight:600,margin:0}}>{viewSupplier.name}</h3><div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Supplied Items</div></div>
                  <button onClick={()=>setViewSupplier(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
                </div>
                {supplierItemsLoading?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>
                :supplierItems.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No items linked to this supplier yet</div>
                :<table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","Type","UOM","Unit Cost","Selling Price","Last Batch","Last Supplied"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {supplierItems.map(i=>(
                      <tr key={i.id}>
                        <td style={{...s.td,fontWeight:600}}>{i.name}{i.genericName&&<div style={{fontSize:11,color:"#9ca3af"}}>{i.genericName}</div>}</td>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{i.itemcode}</td>
                        <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#f3f4f6",color:"#374151"}}>{i.itemType}</span></td>
                        <td style={s.td}>{i.uom}</td>
                        <td style={s.td}>{i.unitCost?`$${parseFloat(i.unitCost).toFixed(2)}`:"—"}</td>
                        <td style={{...s.td,color:"#16a34a",fontWeight:600}}>{i.sellingPrice?`$${parseFloat(i.sellingPrice).toFixed(2)}`:"—"}</td>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{i.lastBatch??"—"}</td>
                        <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{i.lastSupplied?new Date(i.lastSupplied).toLocaleDateString():"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
              </div></div>
            )}

            {editSupplier&&(
              <div style={s.overlay}><div style={{...s.modal,width:500}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <h3 style={{fontSize:16,fontWeight:600,margin:0}}>Edit Supplier</h3>
                  <button onClick={()=>setEditSupplier(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={s.fgroup}><label style={s.label}>Name *</label><input style={s.input} value={editSupplier.name} onChange={e=>setEditSupplier((f:any)=>({...f,name:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Contact Person</label><input style={s.input} value={editSupplier.contactPerson??""} onChange={e=>setEditSupplier((f:any)=>({...f,contactPerson:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Email</label><input style={s.input} value={editSupplier.email??""} onChange={e=>setEditSupplier((f:any)=>({...f,email:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Phone</label><input style={s.input} value={editSupplier.phone??""} onChange={e=>setEditSupplier((f:any)=>({...f,phone:e.target.value}))}/></div>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Address</label><input style={s.input} value={editSupplier.address??""} onChange={e=>setEditSupplier((f:any)=>({...f,address:e.target.value}))}/></div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
                  <button onClick={()=>setEditSupplier(null)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                  <button onClick={updateSupplier} style={s.btn("purple")}>Save Changes</button>
                </div>
              </div></div>
            )}

            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center"}}>
                <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                  <div style={{position:"absolute",left:10,pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                  <input placeholder="Search suppliers..." value={supplierSearch} onChange={e=>setSupplierSearch(e.target.value)} style={{...s.input,width:240,paddingLeft:30}}/>
                </div>
                <span style={{fontSize:12,color:"#9ca3af"}}>{suppliers.length} suppliers</span>
                <div style={{marginLeft:"auto"}}>
                  <button onClick={()=>setShowAddSupplier(v=>!v)} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Add Supplier</button>
                </div>
              </div>

              {showAddSupplier&&(
                <div style={{padding:16,borderBottom:"1px solid #f3f4f6",background:"#f9fafb"}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>New Supplier</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    <div><label style={s.label}>Name *</label><input style={s.input} value={supplierForm.name} onChange={e=>setSupplierForm(f=>({...f,name:e.target.value}))}/></div>
                    <div><label style={s.label}>Contact Person</label><input style={s.input} value={supplierForm.contactPerson} onChange={e=>setSupplierForm(f=>({...f,contactPerson:e.target.value}))}/></div>
                    <div><label style={s.label}>Email</label><input style={s.input} value={supplierForm.email} onChange={e=>setSupplierForm(f=>({...f,email:e.target.value}))}/></div>
                    <div><label style={s.label}>Phone</label><input style={s.input} value={supplierForm.phone} onChange={e=>setSupplierForm(f=>({...f,phone:e.target.value}))}/></div>
                    <div style={{gridColumn:"1/-1"}}><label style={s.label}>Address</label><input style={s.input} value={supplierForm.address} onChange={e=>setSupplierForm(f=>({...f,address:e.target.value}))}/></div>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    <button onClick={saveSupplier} style={s.btn("purple")}>Save Supplier</button>
                    <button onClick={()=>setShowAddSupplier(false)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Supplier","Contact","Email","Phone","Address","Items","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {suppliers.length===0&&<tr><td colSpan={7} style={{...s.td,textAlign:"center",padding:40,color:"#9ca3af"}}>{supplierSearch?"No suppliers match your search":"No suppliers yet"}</td></tr>}
                    {suppliers.map((v:any)=>(
                      <tr key={v.id}>
                        <td style={{...s.td,fontWeight:600}}>{v.name}</td>
                        <td style={s.td}>{v.contactPerson??"—"}</td>
                        <td style={{...s.td,color:"#6366f1",fontSize:12}}>{v.email??"—"}</td>
                        <td style={s.td}>{v.phone??"—"}</td>
                        <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{v.address??"—"}</td>
                        <td style={s.td}>
                          <button onClick={()=>loadSupplierItems(v)} style={{fontSize:11,fontWeight:600,padding:"2px 10px",borderRadius:20,background:"#eef2ff",color:"#6366f1",border:"none",cursor:"pointer"}}>
                            {v.drugCount??0} items →
                          </button>
                        </td>
                        <td style={s.td}>
                          <div style={{display:"flex",gap:5}}>
                            <button onClick={()=>setEditSupplier({id:v.id,name:v.name,contactPerson:v.contactPerson,email:v.email,phone:v.phone,address:v.address})} style={{background:"#eff6ff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon d={icons.edit} size={12} color="#2563eb"/></button>
                            <button onClick={()=>{if(confirm(`Deactivate ${v.name}?`))deleteSupplier(v.id);}} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon d={icons.trash} size={12} color="#dc2626"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EXPIRY ALERTS TAB */}
        {tab==="expiry" && (
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600}}>Expiry Alerts</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#6b7280"}}>Show items expiring within:</span>
                {[30,60,90,180].map(d=>(
                  <button key={d} onClick={()=>setExpiryDays(d)}
                    style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,border:`1px solid ${expiryDays===d?"#6366f1":"#e5e7eb"}`,background:expiryDays===d?"#6366f1":"#f9fafb",color:expiryDays===d?"#fff":"#374151",cursor:"pointer"}}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            {expiryLoading?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>
            :expiry.length===0?<div style={{padding:40,textAlign:"center"}}><div style={{fontSize:32,marginBottom:8}}>✅</div><div style={{fontSize:14,fontWeight:600,color:"#16a34a"}}>No items expiring within {expiryDays} days!</div></div>
            :<>
              <div style={{padding:"8px 16px",background:"#fef3c7",borderBottom:"1px solid #fde68a",fontSize:12,color:"#92400e",display:"flex",gap:16}}>
                <span>🔴 Expired: <strong>{expiry.filter(e=>e.status==="expired").length}</strong></span>
                <span>🟠 Critical (&lt;30d): <strong>{expiry.filter(e=>e.status==="critical").length}</strong></span>
                <span>🟡 Warning (&lt;90d): <strong>{expiry.filter(e=>e.status==="warning").length}</strong></span>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","Batch","Qty","UOM","Expiry Date","Days Left","Warehouse","Status","Action"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {expiry.map(e=>{
                      const statusStyles:Record<string,{bg:string,color:string,label:string}>={
                        expired:{bg:"#fee2e2",color:"#991b1b",label:"Expired"},
                        critical:{bg:"#fee2e2",color:"#991b1b",label:"Critical"},
                        warning:{bg:"#fef3c7",color:"#92400e",label:"Warning"},
                        ok:{bg:"#d1fae5",color:"#065f46",label:"OK"},
                      };
                      const st=statusStyles[e.status]??statusStyles.ok;
                      return (
                        <tr key={e.batchId}>
                          <td style={{...s.td,fontWeight:600}}>{e.itemName}{e.controlled&&<span style={{fontSize:10,fontWeight:600,padding:"1px 5px",borderRadius:10,background:"#f5f3ff",color:"#7c3aed",marginLeft:4}}>Ctrl</span>}</td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{e.itemcode}</td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{e.batchNumber??"—"}</td>
                          <td style={{...s.td,fontWeight:700}}>{e.quantity}</td>
                          <td style={s.td}>{e.uom}</td>
                          <td style={s.td}>{new Date(e.expiryDate).toLocaleDateString()}</td>
                          <td style={{...s.td,fontWeight:700,color:e.daysLeft<=0?"#dc2626":e.daysLeft<=30?"#dc2626":e.daysLeft<=90?"#d97706":"#374151"}}>
                            {e.daysLeft<=0?"Expired":`${e.daysLeft}d`}
                          </td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{e.warehouseName}</td>
                          <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:st.bg,color:st.color}}>{st.label}</span></td>
                          <td style={s.td}>
                            <button onClick={()=>{setQuarForm({batchId:e.batchId,itemId:e.itemId,itemName:e.itemName,batchNumber:e.batchNumber??"",reason:"Expiry - batch expired or near expiry",notes:"",quarantinedBy:""});setShowQuarModal(true);}}
                              style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:6,background:"#fef3c7",color:"#92400e",border:"1px solid #fde68a",cursor:"pointer"}}>
                              Quarantine
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>}
          </div>
        )}

        {/* ADJUSTMENTS TAB */}
        {tab==="adjustments" && (
          <div>
            {showAdjModal&&(
              <div style={s.overlay}><div style={{...s.modal,width:500}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <h3 style={{fontSize:16,fontWeight:600,margin:0}}>Stock Adjustment / Wastage</h3>
                  <button onClick={()=>setShowAdjModal(false)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}>
                    <label style={s.label}>Item *</label>
                    <select style={s.input} value={adjForm.itemId} onChange={async e=>{
                      const id=e.target.value;
                      setAdjForm(f=>({...f,itemId:id,batchId:""}));
                      if (id) {
                        const res=await fetch(`/api/pharmacy/items/${id}/batches`);
                        const d=await res.json();
                        setAdjBatches(Array.isArray(d)?d:[]);
                      }
                    }}>
                      <option value="">Select item</option>
                      {items.map(i=><option key={i.id} value={i.id}>{i.name} ({i.itemcode})</option>)}
                    </select>
                  </div>
                  <div style={s.fgroup}>
                    <label style={s.label}>Warehouse *</label>
                    <select style={s.input} value={adjForm.warehouseId} onChange={e=>setAdjForm(f=>({...f,warehouseId:e.target.value}))}>
                      <option value="">Select warehouse</option>
                      {pharmaWh.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div style={s.fgroup}>
                    <label style={s.label}>Batch (optional)</label>
                    <select style={s.input} value={adjForm.batchId} onChange={e=>setAdjForm(f=>({...f,batchId:e.target.value}))}>
                      <option value="">All batches</option>
                      {adjBatches.map(b=><option key={b.id} value={b.id}>{b.batchNumber??"No batch"} — Qty: {b.quantity}</option>)}
                    </select>
                  </div>
                  <div style={s.fgroup}>
                    <label style={s.label}>Adjustment Qty *</label>
                    <input type="number" style={s.input} value={adjForm.adjustmentQty} onChange={e=>setAdjForm(f=>({...f,adjustmentQty:e.target.value}))} placeholder="Use - for decrease e.g. -10"/>
                  </div>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}>
                    <label style={s.label}>Reason *</label>
                    <select style={s.input} value={adjForm.reason} onChange={e=>setAdjForm(f=>({...f,reason:e.target.value}))}>
                      <option value="">Select reason</option>
                      {["Wastage","Damage","Expiry removal","Stock count correction","Theft/Loss","Lab use","Returned to supplier","Other"].map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={s.fgroup}>
                    <label style={s.label}>Done By</label>
                    <input style={s.input} value={adjForm.createdBy} onChange={e=>setAdjForm(f=>({...f,createdBy:e.target.value}))} placeholder="Your name"/>
                  </div>
                </div>
                <div style={{marginTop:8,padding:"8px 12px",background:"#fef3c7",borderRadius:6,fontSize:12,color:"#92400e"}}>
                  ⚠️ Use negative numbers to decrease stock (e.g. -10 for wastage). Use positive numbers to increase (e.g. +5 for found items).
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
                  <button onClick={()=>setShowAdjModal(false)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                  <button onClick={saveAdjustment} style={s.btn("purple")}>Save Adjustment</button>
                </div>
              </div></div>
            )}
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600}}>Stock Adjustments & Wastage Log</span>
                <button onClick={()=>setShowAdjModal(true)} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> New Adjustment</button>
              </div>
              {adjLoading?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>
              :adjustments.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No adjustments recorded yet</div>
              :<div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","Batch","Adjustment","Reason","Done By","Date"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {adjustments.map(a=>(
                      <tr key={a.id}>
                        <td style={{...s.td,fontWeight:600}}>{a.itemName??"—"}</td>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{a.itemcode??"—"}</td>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{a.batchNumber??"—"}</td>
                        <td style={{...s.td,fontWeight:700,color:a.adjustmentQty>0?"#16a34a":"#dc2626",fontSize:15}}>
                          {a.adjustmentQty>0?"+":""}{a.adjustmentQty} {a.uom}
                        </td>
                        <td style={s.td}>{a.reason}</td>
                        <td style={{...s.td,fontSize:12}}>{a.createdBy??"—"}</td>
                        <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(a.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
            </div>
          </div>
        )}
        {/* ORDERS TAB */}
        {tab==="orders" && (
          <div>
            {/* Order Items Modal */}
            {selectedOrder && (
              <div style={s.overlay}>
                <div style={{...s.modal, width: 860}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div>
                      <h3 style={{fontSize:16,fontWeight:600,margin:0}}>
                        Prescription — {selectedOrder.firstName ?? "Unknown"} {selectedOrder.lastName ?? "Patient"}
                      </h3>
                      <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>
                        Order ID: {selectedOrder.orderId.slice(0,8)}... · Status: {selectedOrder.status} · {new Date(selectedOrder.createdAt).toLocaleString()}
                      </div>
                      {selectedOrder.notes && <div style={{fontSize:12,color:"#374151",marginTop:4,fontStyle:"italic"}}>"{selectedOrder.notes}"</div>}
                    </div>
                    <button onClick={()=>{setSelectedOrder(null);setOrderItems([]);}} style={{background:"none",border:"none",cursor:"pointer"}}>
                      <Icon d={icons.x} size={18} color="#6b7280"/>
                    </button>
                  </div>

                  {orderItemsLoading ? (
                    <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading order items...</div>
                  ) : orderItems.length === 0 ? (
                    <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No items in this order</div>
                  ) : (
                    <>
                      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
                        <thead>
                          <tr>{["Drug Name","Dosage","Qty Prescribed","Matched Item","Stock","Unit Cost","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {orderItems.map(item => (
                            <tr key={item.itemId}>
                              <td style={{...s.td,fontWeight:600}}>{item.drugName ?? "—"}</td>
                              <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{item.dosage ?? "—"}</td>
                              <td style={{...s.td,fontWeight:700,fontSize:15}}>{item.quantity}</td>
                              <td style={s.td}>
                                {item.inventoryItem ? (
                                  <div>
                                    <div style={{fontWeight:600,fontSize:12,color:"#16a34a"}}>✓ {item.inventoryItem.name}</div>
                                    <div style={{fontSize:11,color:"#9ca3af"}}>{item.inventoryItem.itemcode} · {item.inventoryItem.uom}</div>
                                  </div>
                                ) : (
                                  <span style={{fontSize:12,color:"#dc2626"}}>⚠ Not found in inventory</span>
                                )}
                              </td>
                              <td style={{...s.td,fontWeight:700,color:item.inventoryItem?.stockQty >= item.quantity ? "#16a34a" : "#dc2626"}}>
                                {item.inventoryItem ? item.inventoryItem.stockQty : "—"}
                              </td>
                              <td style={s.td}>
                                {item.inventoryItem?.unitCost ? `$${parseFloat(item.inventoryItem.unitCost).toFixed(2)}` : "—"}
                              </td>
                              <td style={s.td}>
                                <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,
                                  background:item.status==="dispensed"?"#d1fae5":item.inventoryItem?"#fef3c7":"#fee2e2",
                                  color:item.status==="dispensed"?"#065f46":item.inventoryItem?"#92400e":"#991b1b"}}>
                                  {item.status==="dispensed"?"Dispensed":item.inventoryItem?"Ready":"Not matched"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Summary */}
                      <div style={{padding:"10px 14px",background:"#f9fafb",borderRadius:8,marginBottom:12,display:"flex",gap:20,fontSize:13}}>
                        <span>Total items: <strong>{orderItems.length}</strong></span>
                        <span style={{color:"#16a34a"}}>Matched: <strong>{orderItems.filter(i=>i.inventoryItem).length}</strong></span>
                        <span style={{color:"#dc2626"}}>Not found: <strong>{orderItems.filter(i=>!i.inventoryItem).length}</strong></span>
                        <span style={{color:"#6366f1"}}>
                          Est. total: <strong>${orderItems.reduce((sum,i)=>sum+(i.quantity*(parseFloat(i.inventoryItem?.unitCost??0))),0).toFixed(2)}</strong>
                        </span>
                      </div>

                      {selectedOrder.status !== "DISPENSED" && (
                        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                          <button
                            onClick={()=>dispenseItems(orderItems.filter(i=>i.inventoryItem&&i.status!=="dispensed"),false)}
                            disabled={dispensingOrder||orderItems.filter(i=>i.inventoryItem&&i.status!=="dispensed").length===0}
                            style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}>
                            {dispensingOrder?"Dispensing...":"Dispense All Available"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Orders list */}
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" as const}}>
                <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                  <div style={{position:"absolute",left:10,pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                  <input
                    placeholder="Search by patient name or ID..."
                    value={orderSearch}
                    onChange={e=>setOrderSearch(e.target.value)}
                    style={{...s.input,width:260,paddingLeft:30}}
                  />
                </div>
                <div style={{width:1,height:20,background:"#e5e7eb"}}/>
                {["PENDING","DISPENSED","ALL"].map(st=>(
                  <button key={st} onClick={()=>setOrderStatus(st)}
                    style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:600,
                      border:`1px solid ${orderStatus===st?"#6366f1":"#e5e7eb"}`,
                      background:orderStatus===st?"#6366f1":"#f9fafb",
                      color:orderStatus===st?"#fff":"#374151",cursor:"pointer"}}>
                    {st==="ALL"?"All":st==="PENDING"?"⏳ Pending":"✓ Dispensed"}
                  </button>
                ))}
                <span style={{marginLeft:"auto",fontSize:12,color:"#9ca3af"}}>{orders.length} orders</span>
                <button onClick={fetchOrders} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:5}}>
                  <Icon d={icons.refresh} size={13} color="#374151"/>
                </button>
              </div>

              {ordersLoading ? (
                <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>
                  No {orderStatus.toLowerCase()} orders found
                </div>
              ) : (
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr>{["Patient","National ID","Gender","Priority","Source","Notes","Created","Status","Action"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {orders.map(order=>(
                        <tr key={order.orderId}>
                          <td style={{...s.td,fontWeight:600}}>
                            {order.firstName||order.lastName ? `${order.firstName??""} ${order.lastName??""}`.trim() : <span style={{color:"#9ca3af"}}>Unknown Patient</span>}
                          </td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:12}}>{order.nationalId??"—"}</td>
                          <td style={s.td}>{order.gender??"—"}</td>
                          <td style={s.td}>
                            <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,
                              background:order.priority==="urgent"?"#fee2e2":order.priority==="stat"?"#fee2e2":"#f3f4f6",
                              color:order.priority==="urgent"||order.priority==="stat"?"#991b1b":"#374151"}}>
                              {order.priority??"routine"}
                            </span>
                          </td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{order.source??"—"}</td>
                          <td style={{...s.td,fontSize:11,color:"#6b7280",maxWidth:200}}>
                            <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>{order.notes??"—"}</div>
                          </td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td style={s.td}>
                            <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,
                              background:order.status==="DISPENSED"?"#d1fae5":order.status==="PENDING"?"#fef3c7":"#f3f4f6",
                              color:order.status==="DISPENSED"?"#065f46":order.status==="PENDING"?"#92400e":"#374151"}}>
                              {order.status}
                            </span>
                          </td>
                          <td style={s.td}>
                            <button onClick={()=>loadOrderItems(order)}
                              style={{...s.btn(order.status==="PENDING"?"purple":"ghost"),border:order.status!=="PENDING"?"1px solid #e5e7eb":"none",fontSize:11,padding:"5px 12px"}}>
                              {order.status==="PENDING"?"Dispense →":"View"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUARANTINE TAB */}
        {tab==="quarantine" && (
          <div>
            {showQuarModal&&(
              <div style={s.overlay}><div style={{...s.modal,width:500}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <h3 style={{fontSize:16,fontWeight:600,margin:0}}>Quarantine Batch</h3>
                  <button onClick={()=>{setShowQuarModal(false);setQuarBatchSearch("");setQuarBatchResults([]);}} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
                </div>
                {quarForm.batchId?(
                  <div style={{padding:"10px 12px",background:"#f9fafb",borderRadius:8,marginBottom:12,fontSize:13}}>
                    <strong>{quarForm.itemName}</strong> — Batch: {quarForm.batchNumber||"N/A"}
                    <button onClick={()=>setQuarForm(f=>({...f,batchId:"",itemId:"",itemName:"",batchNumber:""}))} style={{marginLeft:8,fontSize:11,color:"#dc2626",background:"none",border:"none",cursor:"pointer"}}>✕ Clear</button>
                  </div>
                ):(
                  <div style={{...s.fgroup,position:"relative"}}>
                    <label style={s.label}>Search Item / Batch *</label>
                    <input style={s.input} value={quarBatchSearch} onChange={e=>searchQuarBatches(e.target.value)} placeholder="Type item name..."/>
                    {quarBatchResults.length>0&&(
                      <div style={{position:"absolute",top:62,left:0,right:0,background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:100}}>
                        {quarBatchResults.map(item=>(
                          <div key={item.id} style={{padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid #f3f4f6",fontSize:13}}
                            onClick={async()=>{
                              const res=await fetch(`/api/pharmacy/items/${item.id}/batches`);
                              const batches=await res.json();
                              if (batches.length>0) {
                                const b=batches[0];
                                setQuarForm(f=>({...f,itemId:item.id,itemName:item.name,batchId:b.id,batchNumber:b.batchNumber??""}));
                              } else {
                                setQuarForm(f=>({...f,itemId:item.id,itemName:item.name}));
                              }
                              setQuarBatchSearch(""); setQuarBatchResults([]);
                            }}
                            onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")}
                            onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                            <strong>{item.name}</strong> <span style={{fontSize:11,color:"#9ca3af"}}>{item.itemcode}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}>
                    <label style={s.label}>Reason *</label>
                    <select style={s.input} value={quarForm.reason} onChange={e=>setQuarForm(f=>({...f,reason:e.target.value}))}>
                      <option value="">Select reason</option>
                      {["Recall by manufacturer","Expiry/Near expiry","Quality issue","Contamination","Damaged packaging","Regulatory hold","Other"].map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}>
                    <label style={s.label}>Notes</label>
                    <input style={s.input} value={quarForm.notes} onChange={e=>setQuarForm(f=>({...f,notes:e.target.value}))} placeholder="Additional details..."/>
                  </div>
                  <div style={s.fgroup}>
                    <label style={s.label}>Quarantined By</label>
                    <input style={s.input} value={quarForm.quarantinedBy} onChange={e=>setQuarForm(f=>({...f,quarantinedBy:e.target.value}))} placeholder="Your name"/>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
                  <button onClick={()=>{setShowQuarModal(false);setQuarBatchSearch("");setQuarBatchResults([]);}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                  <button onClick={saveQuarantine} style={s.btn("red")}>Quarantine Batch</button>
                </div>
              </div></div>
            )}
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600}}>Batch Quarantine Register</span>
                <button onClick={()=>setShowQuarModal(true)} style={{...s.btn("red"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.lock} size={13} color="#fff"/> Quarantine Batch</button>
              </div>
              {quarLoading?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>
              :quarantine.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No quarantined batches</div>
              :<div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","Batch","Qty","Reason","Quarantined By","Date","Status","Action"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {quarantine.map(q=>(
                      <tr key={q.id}>
                        <td style={{...s.td,fontWeight:600}}>{q.itemName??"—"}</td>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{q.itemcode??"—"}</td>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{q.batchNumber??"—"}</td>
                        <td style={{...s.td,fontWeight:700}}>{q.quantity}</td>
                        <td style={s.td}>{q.reason}</td>
                        <td style={{...s.td,fontSize:12}}>{q.quarantinedBy??"—"}</td>
                        <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(q.createdAt).toLocaleDateString()}</td>
                        <td style={s.td}>
                          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:q.isResolved?"#d1fae5":"#fee2e2",color:q.isResolved?"#065f46":"#991b1b"}}>
                            {q.isResolved?"Resolved":"Quarantined"}
                          </span>
                        </td>
                        <td style={s.td}>
                          {!q.isResolved&&<button onClick={()=>resolveQuarantine(q.id)} style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:6,background:"#d1fae5",color:"#065f46",border:"1px solid #a7f3d0",cursor:"pointer"}}>Resolve</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
            </div>
          </div>
        )}


      </div>

      {/* Modals */}
      {showDispense&&<DispenseModal stores={stores} onClose={()=>setShowDispense(false)} onSuccess={()=>{fetchAll();showToast("Drug dispensed!");}}/>}
      {showAddItem&&<ItemModal warehouses={pharmaWh} onClose={()=>setShowAddItem(false)} onSuccess={()=>{fetchAll();showToast("Item added!");}}/>}
      {editItem&&<ItemModal item={editItem} warehouses={pharmaWh} onClose={()=>setEditItem(null)} onSuccess={()=>{fetchAll();showToast("Item updated!");}}/>}
      {deleteItem&&<ConfirmModal item={deleteItem} onClose={()=>setDeleteItem(null)} onSuccess={()=>{fetchAll();showToast("Item deactivated");}}/>}
      {batchItem&&<BatchModal item={batchItem} onClose={()=>setBatchItem(null)}/>}
      {showImportModal&&<ImportDrugModal onClose={()=>setShowImportModal(false)} onImport={()=>{setShowImportModal(false);setShowAddItem(true);}}/>}
      {toast&&<div style={{position:"fixed",bottom:24,right:24,background:"#16a34a",color:"#fff",padding:"11px 18px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:2000}}>✓ {toast}</div>}
    </div>
  );
}
