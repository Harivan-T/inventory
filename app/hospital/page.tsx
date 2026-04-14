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
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  hospital:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
};
const s: Record<string,any> = {
  page:    { fontFamily:"Inter,sans-serif", minHeight:"100vh", background:"#f8f9fa", color:"#111827" },
  header:  { background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 24px", height:56, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 },
  content: { padding:24, maxWidth:1400, margin:"0 auto" },
  card:    { background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:16 },
  th:      { padding:"10px 12px", textAlign:"left" as const, fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase" as const, background:"#f9fafb", borderBottom:"1px solid #e5e7eb", whiteSpace:"nowrap" as const },
  td:      { padding:"10px 12px", borderBottom:"1px solid #f9fafb", fontSize:13, color:"#111827" },
  btn:     (c:string) => ({ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background:c==="blue"?"#2563eb":c==="red"?"#dc2626":"#f3f4f6", color:c==="ghost"?"#374151":"#fff" }),
  input:   { width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #d1d5db", fontSize:13, color:"#111827", boxSizing:"border-box" as const },
  label:   { fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:4 },
  overlay: { position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 },
  modal:   { background:"#fff", borderRadius:12, padding:28, width:600, maxHeight:"90vh", overflowY:"auto" as const },
  fgroup:  { marginBottom:12 },
  tab:     (a:boolean) => ({ padding:"10px 16px", fontSize:13, fontWeight:500, border:"none", background:"none", cursor:"pointer", borderBottom:a?"2px solid #2563eb":"2px solid transparent", color:a?"#2563eb":"#6b7280" }),
};

function ItemModal({ item, warehouses, onClose, onSuccess }: { item?: any; warehouses: any[]; onClose:()=>void; onSuccess:()=>void }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name??"", genericname: item?.genericName??"", itemcode: item?.itemcode??"",
    itemtype: item?.itemType??"supply", uom: item?.uom??"piece", manufacturer: item?.manufacturer??"",
    description: item?.description??"", barcode: item?.barcode??"",
    min_level: String(item?.minLevel??""), reorder_level: String(item?.reorderLevel??""),
    max_level: String(item?.maxLevel??""), warehouseid: "",
    unit_cost: String(item?.unitCost??""), single_use: item?.single_use??false,
    sterile: item?.sterile??false, hazardous: item?.hazardous??false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.name.trim()||!form.itemcode.trim()) { setError("Name and item code required"); return; }
    if (!isEdit&&!form.warehouseid) { setError("Warehouse required"); return; }
    setLoading(true);
    try {
      const payload = { ...form, inventorycategory:"hospital", min_level:parseInt(form.min_level)||0, reorder_level:parseInt(form.reorder_level)||0, max_level:parseInt(form.max_level)||null };
      const res = await fetch(isEdit?`/api/items/${item.id}`:"/api/items", { method:isEdit?"PATCH":"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error??"Failed");
      onSuccess(); onClose();
    } catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}><div style={s.modal}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h3 style={{ fontSize:16, fontWeight:600, margin:0 }}>{isEdit?"Edit Item":"Add Hospital Item"}</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      {error&&<div style={{ background:"#fee2e2", color:"#991b1b", borderRadius:8, padding:"8px 12px", fontSize:13, marginBottom:12 }}>{error}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[["Name *","name"],["Item Code *","itemcode"],["Manufacturer","manufacturer"],["Barcode","barcode"]].map(([l,k])=>(
          <div key={k} style={s.fgroup}><label style={s.label}>{l}</label><input style={s.input} value={(form as any)[k]} onChange={e=>set(k,e.target.value)}/></div>
        ))}
        <div style={s.fgroup}><label style={s.label}>Type</label>
          <select style={s.input} value={form.itemtype} onChange={e=>set("itemtype",e.target.value)}>
            {["supply","consumable","asset","equipment","linen","ot_supply","ward_supply"].map(t=><option key={t} value={t}>{t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
          </select>
        </div>
        <div style={s.fgroup}><label style={s.label}>UOM</label>
          <select style={s.input} value={form.uom} onChange={e=>set("uom",e.target.value)}>
            {["piece","box","pack","roll","set","pair","kg","l","ml","g"].map(u=><option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {!isEdit&&<div style={s.fgroup}><label style={s.label}>Warehouse *</label>
          <select style={s.input} value={form.warehouseid} onChange={e=>set("warehouseid",e.target.value)}>
            <option value="">Select warehouse</option>
            {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>}
        <div style={s.fgroup}><label style={s.label}>Unit Cost</label><input type="number" step="0.01" style={s.input} value={form.unit_cost} onChange={e=>set("unit_cost",e.target.value)}/></div>
        {[["Min Level","min_level"],["Reorder Level","reorder_level"],["Max Level","max_level"]].map(([l,k])=>(
          <div key={k} style={s.fgroup}><label style={s.label}>{l}</label><input type="number" style={s.input} value={(form as any)[k]} onChange={e=>set(k,e.target.value)}/></div>
        ))}
        <div style={{ gridColumn:"1/-1", display:"flex", gap:20, flexWrap:"wrap" as const }}>
          {[["single_use","Single Use"],["sterile","Sterile"],["hazardous","Hazardous"]].map(([k,l])=>(
            <label key={k} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
              <input type="checkbox" checked={(form as any)[k]} onChange={e=>set(k,e.target.checked)} style={{ width:15, height:15, accentColor:"#2563eb" }}/>
              {l}
            </label>
          ))}
        </div>
        <div style={{ gridColumn:"1/-1", ...s.fgroup }}><label style={s.label}>Description</label><input style={s.input} value={form.description} onChange={e=>set("description",e.target.value)}/></div>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
        <button onClick={onClose} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb" }}>Cancel</button>
        <button onClick={handleSave} disabled={loading} style={s.btn("blue")}>{loading?"Saving...":isEdit?"Save Changes":"Add Item"}</button>
      </div>
    </div></div>
  );
}

export default function HospitalInventoryPage() {
  const [tab, setTab]           = useState<"items"|"stock"|"stores">("items");
  const [items, setItems]       = useState<any[]>([]);
  const [stores, setStores]     = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage]         = useState(1);
  const PAGE_SIZE = 15;
  const [showAdd, setShowAdd]   = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [toast, setToast]       = useState("");

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [iRes, wRes, sRes] = await Promise.all([
      fetch(`/api/hospital/items?search=${encodeURIComponent(search)}`),
      fetch("/api/warehouses"),
      fetch("/api/stores"),
    ]);
    const iData = await iRes.json();
    const wData = await wRes.json();
    const sData = await sRes.json();
    setItems(Array.isArray(iData)?iData:[]);
    const allWh = Array.isArray(wData)?wData:(wData.warehouses??[]);
    setWarehouses(allWh.filter((w:any)=>w.warehousetype==="hospital"||w.warehouse_type==="hospital"));
    setStores(Array.isArray(sData)?sData:[]);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = items.filter(i=>typeFilter==="all"||i.itemType===typeFilter);

  const TYPES = ["all","supply","consumable","asset","equipment","linen","ot_supply","ward_supply"];

  return (
    <div style={s.page}>
      <style>{`* { box-sizing:border-box; } input,select { color:#111827 !important; } tr:hover td { background:#f9fafb; }`}</style>
      <div style={s.header}>
        <Link href="/" style={{ display:"flex", alignItems:"center", color:"#6b7280", textDecoration:"none" }}><Icon d={icons.back} size={15}/></Link>
        <div style={{ width:1, height:20, background:"#e5e7eb" }}/>
        <div style={{ width:32, height:32, background:"#dbeafe", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon d={icons.hospital} size={16} color="#2563eb"/></div>
        <span style={{ fontSize:14, fontWeight:700 }}>Hospital Inventory</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={fetchAll} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:5 }}><Icon d={icons.refresh} size={13} color="#374151"/></button>
          <button onClick={()=>setShowAdd(true)} style={{ ...s.btn("blue"), display:"flex", alignItems:"center", gap:6 }}><Icon d={icons.plus} size={13} color="#fff"/> Add Item</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Total Items",  value:items.length,                                         color:"#2563eb", bg:"#dbeafe" },
            { label:"Supplies",     value:items.filter(i=>i.itemType==="supply").length,        color:"#065f46", bg:"#d1fae5" },
            { label:"Consumables",  value:items.filter(i=>i.itemType==="consumable").length,    color:"#6d28d9", bg:"#ede9fe" },
            { label:"Out of Stock", value:items.filter(i=>parseInt(i.totalStock)===0).length,   color:"#dc2626", bg:"#fee2e2" },
          ].map(m=>(
            <div key={m.label} style={{ background:m.bg, borderRadius:10, padding:"14px 18px" }}>
              <div style={{ fontSize:11, fontWeight:600, color:m.color, marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:26, fontWeight:700, color:"#111827" }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:2, marginBottom:20, borderBottom:"1px solid #e5e7eb" }}>
          {(["items","stock","stores"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={s.tab(tab===t)}>
              {t==="items"?`Items (${items.length})`:t==="stock"?"Stock":t==="stores"?`Dept Stores (${stores.length})`:""}
            </button>
          ))}
        </div>

        {tab==="items" && (
          <div style={s.card}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" as const }}>
              <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                <div style={{ position:"absolute", left:10, pointerEvents:"none" }}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                <input placeholder="Search hospital items..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ ...s.input, width:220, paddingLeft:30 }}/>
              </div>
              <div style={{ width:1, height:20, background:"#e5e7eb" }}/>
              {TYPES.map(t=>(
                <button key={t} onClick={()=>{setTypeFilter(t);setPage(1);}} style={{ padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:600, border:`1px solid ${typeFilter===t?"#2563eb":"#e5e7eb"}`, background:typeFilter===t?"#2563eb":"#f9fafb", color:typeFilter===t?"#fff":"#374151", cursor:"pointer" }}>
                  {t==="all"?"All":t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                </button>
              ))}
            </div>
            {loading?<div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Loading...</div>
            :filtered.length===0?<div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>No items found</div>
            :<div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Item","Code","Type","UOM","Stock","Reorder","Flags","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(item=>{
                    const stock = parseInt(item.totalStock||0);
                    const reorder = parseInt(item.reorderLevel||0);
                    const st = stock===0?{bg:"#fee2e2",color:"#991b1b",label:"Out"}:stock<=reorder?{bg:"#fef3c7",color:"#92400e",label:"Low"}:{bg:"#d1fae5",color:"#065f46",label:"OK"};
                    return (
                      <tr key={item.id}>
                        <td style={{ ...s.td, fontWeight:600 }}>{item.name}</td>
                        <td style={{ ...s.td, fontFamily:"monospace", fontSize:11, color:"#6b7280" }}>{item.itemcode}</td>
                        <td style={s.td}><span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:"#dbeafe", color:"#1d4ed8" }}>{item.itemType?.replace(/_/g," ")}</span></td>
                        <td style={s.td}>{item.uom}</td>
                        <td style={{ ...s.td, fontWeight:700, fontSize:15 }}>{item.totalStock}</td>
                        <td style={{ ...s.td, color:"#6b7280" }}>{item.reorderLevel||0}</td>
                        <td style={s.td}>
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap" as const }}>
                            {item.single_use&&<span style={{ fontSize:10, fontWeight:600, padding:"1px 5px", borderRadius:10, background:"#fef3c7", color:"#92400e" }}>Single Use</span>}
                            {item.sterile&&<span style={{ fontSize:10, fontWeight:600, padding:"1px 5px", borderRadius:10, background:"#d1fae5", color:"#065f46" }}>Sterile</span>}
                            {item.hazardous&&<span style={{ fontSize:10, fontWeight:600, padding:"1px 5px", borderRadius:10, background:"#fee2e2", color:"#991b1b" }}>Hazardous</span>}
                          </div>
                        </td>
                        <td style={s.td}><span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:st.bg, color:st.color }}>{st.label}</span></td>
                        <td style={s.td}>
                          <button onClick={()=>setEditItem(item)} style={{ background:"#eff6ff", border:"none", borderRadius:6, padding:"5px 8px", cursor:"pointer" }}><Icon d={icons.edit} size={12} color="#2563eb"/></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>}
          </div>
        )}

        {tab==="stock" && (
          <div style={s.card}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6" }}><span style={{ fontSize:13, fontWeight:600 }}>Hospital Stock Overview</span></div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Item","Code","UOM","Stock","Reserved","Available","Reorder","Value","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {items.map(item=>{
                    const avail = parseInt(item.totalStock||0)-parseInt(item.reservedStock||0);
                    const isLow = avail<=parseInt(item.reorderLevel||0);
                    return (
                      <tr key={item.id}>
                        <td style={{ ...s.td, fontWeight:600 }}>{item.name}</td>
                        <td style={{ ...s.td, fontFamily:"monospace", fontSize:11, color:"#6b7280" }}>{item.itemcode}</td>
                        <td style={s.td}>{item.uom}</td>
                        <td style={{ ...s.td, fontWeight:700 }}>{item.totalStock}</td>
                        <td style={{ ...s.td, color:"#d97706" }}>{item.reservedStock||0}</td>
                        <td style={{ ...s.td, fontWeight:700, color:avail===0?"#dc2626":isLow?"#d97706":"#16a34a" }}>{avail}</td>
                        <td style={{ ...s.td, color:"#6b7280" }}>{item.reorderLevel||0}</td>
                        <td style={{ ...s.td, color:"#6366f1" }}>{item.unitCost?`$${(parseFloat(item.unitCost)*parseInt(item.totalStock||0)).toFixed(2)}`:"—"}</td>
                        <td style={s.td}><span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:avail===0?"#fee2e2":isLow?"#fef3c7":"#d1fae5", color:avail===0?"#991b1b":isLow?"#92400e":"#065f46" }}>{avail===0?"Out":isLow?"Low":"OK"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="stores" && (
          <div style={s.card}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6" }}><span style={{ fontSize:13, fontWeight:600 }}>Department Stores</span></div>
            {stores.length===0?<div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>No department stores found</div>
            :<div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Store","Type","Department","Manager","Location","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {stores.map((store:any)=>(
                    <tr key={store.id}>
                      <td style={{ ...s.td, fontWeight:600 }}>{store.name}</td>
                      <td style={s.td}><span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:"#dbeafe", color:"#1d4ed8" }}>{store.store_type}</span></td>
                      <td style={{ ...s.td, fontSize:12 }}>{store.department||"—"}</td>
                      <td style={s.td}>{store.manager||"—"}</td>
                      <td style={{ ...s.td, fontSize:12, color:"#6b7280" }}>{store.location||"—"}</td>
                      <td style={s.td}><span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:store.is_active?"#d1fae5":"#f3f4f6", color:store.is_active?"#065f46":"#6b7280" }}>{store.is_active?"Active":"Inactive"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
          </div>
        )}
      </div>

      {showAdd&&<ItemModal warehouses={warehouses} onClose={()=>setShowAdd(false)} onSuccess={()=>{fetchAll();showToast("Item added!");}}/>}
      {editItem&&<ItemModal item={editItem} warehouses={warehouses} onClose={()=>setEditItem(null)} onSuccess={()=>{fetchAll();showToast("Item updated!");}}/>}
      {toast&&<div style={{ position:"fixed", bottom:24, right:24, background:"#16a34a", color:"#fff", padding:"11px 18px", borderRadius:10, fontSize:13, fontWeight:600, zIndex:2000 }}>✓ {toast}</div>}
    </div>
  );
}
