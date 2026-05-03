"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const Icon = ({d,size=16,color="currentColor"}:{d:string;size?:number;color?:string})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const icons={
  back:"M19 12H5M12 5l-7 7 7 7", plus:"M12 5v14M5 12h14", x:"M18 6L6 18M6 6l12 12",
  search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  refresh:"M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6",
  arrow:"M5 12h14M12 5l7 7-7 7",
  transfer:"M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  cart:"M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  check:"M20 6L9 17l-5-5",
  doc:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
};

const s:Record<string,any>={
  page:{fontFamily:"Inter,sans-serif",minHeight:"100vh",background:"#f8f9fa",color:"#111827"},
  header:{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"0 24px",height:56,display:"flex",alignItems:"center",gap:12,position:"sticky" as const,top:0,zIndex:10},
  content:{padding:24,maxWidth:1400,margin:"0 auto"},
  tabs:{display:"flex",gap:2,marginBottom:16,background:"#f0f0ff",border:"1px solid #e0e0ff",flexWrap:"wrap" as const,borderRadius:12,padding:"5px",position:"sticky" as const,top:56,zIndex:9,boxShadow:"0 2px 8px rgba(99,102,241,0.08)"},
  tab:(a:boolean)=>({padding:"9px 16px",fontSize:12,fontWeight:a?700:500,border:"none",background:a?"#6366f1":"transparent",cursor:"pointer",color:a?"#fff":"#6366f1",borderRadius:8,margin:"2px",whiteSpace:"nowrap" as const,boxShadow:a?"0 2px 10px rgba(99,102,241,0.25)":"none"}),
  card:{background:"#fff",borderRadius:10,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:16},
  th:{padding:"10px 12px",textAlign:"left" as const,fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase" as const,background:"#f9fafb",borderBottom:"1px solid #e5e7eb",whiteSpace:"nowrap" as const},
  td:{padding:"10px 12px",borderBottom:"1px solid #f9fafb",fontSize:13,color:"#111827"},
  btn:(c:string)=>({padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",background:c==="purple"?"#6366f1":c==="green"?"#16a34a":c==="blue"?"#2563eb":c==="red"?"#dc2626":c==="orange"?"#d97706":"#f3f4f6",color:c==="ghost"?"#374151":"#fff"}),
  input:{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,color:"#111827",boxSizing:"border-box" as const},
  label:{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4},
  overlay:{position:"fixed" as const,inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50},
  modal:{background:"#fff",borderRadius:12,padding:28,width:680,maxHeight:"90vh",overflowY:"auto" as const},
  fgroup:{marginBottom:12},
  badge:(bg:string,color:string)=>({fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:bg,color}),
};

const SHOW_SHOP = false; // set to true to re-enable shop cart & orders

const DEPT_COLORS:Record<string,{bg:string,color:string,icon:string}>={
  radiology:{bg:"#dbeafe",color:"#1d4ed8",icon:"🔬"},
  ward:{bg:"#d1fae5",color:"#065f46",icon:"🛏️"},
  ot:{bg:"#fef3c7",color:"#92400e",icon:"🔪"},
  general:{bg:"#f3f4f6",color:"#374151",icon:"🏥"},
};
const statusColors:Record<string,{bg:string,color:string}>={
  DRAFT:{bg:"#f3f4f6",color:"#374151"},
  SUBMITTED:{bg:"#dbeafe",color:"#1d4ed8"},
  APPROVED:{bg:"#d1fae5",color:"#065f46"},
  REJECTED:{bg:"#fee2e2",color:"#991b1b"},
  SENT:{bg:"#ede9fe",color:"#5b21b6"},
  RECEIVED:{bg:"#d1fae5",color:"#065f46"},
  CANCELLED:{bg:"#fee2e2",color:"#991b1b"},
  PENDING:{bg:"#fef3c7",color:"#92400e"},
  PARTIAL:{bg:"#fed7aa",color:"#92400e"},
  COMPLETE:{bg:"#d1fae5",color:"#065f46"},
};
function sc(qty:number,reorder:number){
  if(qty===0)return{bg:"#fee2e2",color:"#991b1b",label:"Out"};
  if(qty<=reorder)return{bg:"#fef3c7",color:"#92400e",label:"Low"};
  return{bg:"#d1fae5",color:"#065f46",label:"OK"};
}

function StorageSearch({value,locations,onChange}:{value:string;locations:any[];onChange:(v:string)=>void}){
  const [q,setQ]=useState(value);const [open,setOpen]=useState(false);
  const DEFAULTS=["Shelf A-1","Shelf A-2","Shelf B-1","Fridge 1","Freezer 1","Cabinet 1","Storage Room","Controlled Cabinet"];
  const all=[...new Set([...DEFAULTS,...locations.map((l:any)=>l.name)])];
  const filtered=all.filter(s=>!q||s.toLowerCase().includes(q.toLowerCase()));
  const showCreate=q.trim()&&!all.find(s=>s.toLowerCase()===q.toLowerCase());
  return(
    <div style={{position:"relative"}}>
      <input style={s.input} value={q} placeholder="Search or type new shelf..." onChange={e=>{setQ(e.target.value);onChange(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),150)}/>
      {open&&(filtered.length>0||showCreate)&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #6366f1",borderRadius:8,zIndex:200,maxHeight:180,overflowY:"auto" as const}}>
          {filtered.slice(0,10).map(s=>(<div key={s} onMouseDown={()=>{setQ(s);onChange(s);setOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13}} onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>📍 {s}</div>))}
          {showCreate&&(<div onMouseDown={()=>{setQ(q);onChange(q);setOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",fontSize:13,color:"#6366f1",fontWeight:600}} onMouseEnter={e=>(e.currentTarget.style.background="#eef2ff")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>➕ Create "{q}"</div>)}
        </div>
      )}
    </div>
  );
}

// ── View Item Modal with batches ─────────────────────────────────────────────
function ViewItemModal({item,onClose,onAddToPR}:{item:any;onClose:()=>void;onAddToPR:(item:any)=>void}){
  const [batches,setBatches]=useState<any[]>([]);
  useEffect(()=>{
    if(item?.id) fetch(`/api/hospital/batches/${item.id}`).then(r=>r.json()).then(d=>setBatches(Array.isArray(d)?d:[]));
  },[item?.id]);
  if(!item)return null;
  const fields=[["Name",item.name],["Generic",item.generic_name??"—"],["Code",item.itemcode],["Type",item.itemtype],["UOM",item.uom],["Strength",item.strength??"—"],["Form",item.form??"—"],["Manufacturer",item.manufacturer??"—"],["Storage",item.storage_location??"—"],["Storage Type",item.storage_type??"—"],["Total Stock",item.total_stock??0],["Reorder Level",item.reorder_level??0],["Unit Cost",item.unit_cost?`$${parseFloat(item.unit_cost).toFixed(2)}`:"—"],["Selling Price",item.selling_price?`$${parseFloat(item.selling_price).toFixed(2)}`:"—"]];
  return(
    <div style={s.overlay}><div style={{...s.modal,width:720}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontSize:15,fontWeight:700}}>{item.name}</div><div style={{fontSize:12,color:"#6b7280"}}>{item.itemcode} · {item.itemtype}</div></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{onAddToPR(item);onClose();}} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.cart} size={13} color="#fff"/> Add to PR</button>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {fields.map(([l,v])=>(<div key={l as string} style={{background:"#f9fafb",borderRadius:8,padding:"8px 12px"}}><div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600}}>{String(v)}</div></div>))}
      </div>
      <div style={{borderTop:"1px solid #f3f4f6",paddingTop:16}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>📦 Batches</div>
        {batches.length===0?<div style={{color:"#9ca3af",fontSize:13}}>No batches recorded</div>:(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Batch","Lot","Department","Qty","Cost","Expiry","Manufacture"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {batches.map(b=>{
                const expired=b.expiry_date&&new Date(b.expiry_date)<new Date();
                const nearExpiry=b.expiry_date&&!expired&&new Date(b.expiry_date)<new Date(Date.now()+30*86400000);
                return(
                  <tr key={b.id}>
                    <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{b.batch_number??"—"}</td>
                    <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{b.lot_number??"—"}</td>
                    <td style={s.td}>{b.department_name??"Main"}</td>
                    <td style={{...s.td,fontWeight:700}}>{b.quantity}</td>
                    <td style={s.td}>{b.unit_cost?`$${parseFloat(b.unit_cost).toFixed(2)}`:"—"}</td>
                    <td style={{...s.td,color:expired?"#dc2626":nearExpiry?"#d97706":"#111827",fontWeight:expired||nearExpiry?700:400}}>{b.expiry_date?new Date(b.expiry_date).toLocaleDateString():"—"}{expired?" ⚠️":nearExpiry?" ⏰":""}</td>
                    <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{b.manufacture_date?new Date(b.manufacture_date).toLocaleDateString():"—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div></div>
  );
}

// ── Add Item Wizard ─────────────────────────────────────────────────────
function AddItemWizard({onClose,onSuccess,departments,storageLocations,manufacturers,suppliers}:{
  onClose:()=>void;onSuccess:()=>void;departments:any[];storageLocations:any[];manufacturers:any[];suppliers:any[];
}){
  const [form,setForm]=useState<Record<string,string>>({
    name:"",generic_name:"",itemtype:"supply",uom:"piece",
    manufacturer:"",supplier_id:"",supplier_name:"",
    barcode:"",storage_location:"",storage_type:"",strength:"",
    min_level:"5",max_level:"100",unit_cost:"",selling_price:"",notes:"",
    expiry_date:"",manufacture_date:"",
  });
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  // Search existing items
  const [searchQ,setSearchQ]=useState("");
  const [searchResults,setSearchResults]=useState<any[]>([]);
  const [searching,setSearching]=useState(false);
  const [itemSelected,setItemSelected]=useState(false);
  const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if(searchQ.length<2){setSearchResults([]);return;}
    const t=setTimeout(async()=>{
      setSearching(true);
      try{
        const r=await fetch(`/api/hospital/items?search=${encodeURIComponent(searchQ)}`);
        const d=await r.json();
        setSearchResults(Array.isArray(d)?d.slice(0,8):[]);
      }catch{setSearchResults([]);}
      finally{setSearching(false);}
    },250);
    return()=>clearTimeout(t);
  },[searchQ]);

  const selectExisting=(item:any)=>{
    // Pre-fill form with existing item data
    setForm({
      name:item.name||"",
      generic_name:item.generic_name||"",
      itemtype:item.itemtype||"supply",
      uom:item.uom||"piece",
      manufacturer:item.manufacturer||"",
      supplier_id:item.supplier_id||"",
      supplier_name:item.supplier_name||"",
      barcode:item.barcode||"",
      storage_location:item.storage_location||"",
      storage_type:item.storage_type||"",
      strength:item.strength||"",
      min_level:String(item.min_level||5),
      max_level:String(item.max_level||100),
      unit_cost:String(item.unit_cost||""),
      selling_price:String(item.selling_price||""),
      notes:item.notes||"",
    });
    setItemSelected(true);
    setSearchQ(item.name);
    setSearchResults([]);
    setErr("Item already exists — details loaded. You can update and save as a new entry or close.");
  };

  const save=async()=>{
    if(!form.name.trim()){setErr("Item name is required");return;}
    setSaving(true);setErr("");
    try{
      const res=await fetch("/api/hospital/items",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error??"Failed to save");return;}
      onSuccess();onClose();
    }catch(e:any){setErr(e?.message??"Network error");}
    finally{setSaving(false);}
  };

  const fl=(label:string,required=false)=>(
    <label style={{...s.label,color:required?"#dc2626":"#374151"}}>{label}{required?" *":""}</label>
  );

  return(
    <div style={s.overlay}>
      <div style={{...s.modal,width:700,padding:0,display:"flex",flexDirection:"column" as const,maxHeight:"94vh"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,background:"#dbeafe",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📦</div>
            <div><div style={{fontSize:15,fontWeight:700}}>Add Hospital Item</div><div style={{fontSize:12,color:"#6b7280"}}>Search first to avoid duplicates</div></div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
        </div>

        <div style={{padding:"20px 24px",overflowY:"auto" as const,flex:1}}>
          {/* Search bar — always visible at top */}
          <div style={{marginBottom:16,position:"relative"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Search Hospital Inventory First</div>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={icons.search} size={14} color={itemSelected?"#16a34a":"#9ca3af"}/></div>
              <input
                style={{...s.input,paddingLeft:34,border:`2px solid ${itemSelected?"#16a34a":"#e5e7eb"}`,background:itemSelected?"#f0fdf4":"#fff"}}
                value={searchQ}
                onChange={e=>{setSearchQ(e.target.value);setItemSelected(false);}}
                placeholder="Type item name to check if it already exists..."/>
              {searching&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af"}}>searching...</div>}
            </div>
            {searchResults.length>0&&(
              <div style={{position:"absolute",left:0,right:0,top:"100%",background:"#fff",border:"1px solid #6366f1",borderRadius:8,boxShadow:"0 8px 24px rgba(99,102,241,0.15)",zIndex:300,overflow:"hidden",marginTop:2}}>
                <div style={{padding:"6px 12px",background:"#fef3c7",fontSize:11,fontWeight:600,color:"#92400e"}}>⚠️ These items already exist — click to load details</div>
                {searchResults.map(item=>(
                  <div key={item.id} onClick={()=>selectExisting(item)}
                    style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                    onMouseEnter={e=>(e.currentTarget.style.background="#fef3c7")}
                    onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{item.name}</div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>{item.itemcode} · {item.itemtype} · {item.uom} · Stock: <strong style={{color:parseInt(item.total_stock||0)===0?"#dc2626":"#16a34a"}}>{item.total_stock??0}</strong></div>
                    </div>
                    <span style={{fontSize:11,color:"#d97706",fontWeight:600}}>Load →</span>
                  </div>
                ))}
                <div style={{padding:"8px 12px",background:"#f9fafb",fontSize:11,color:"#6b7280"}}>Don't see it? Fill the form below to add a new item.</div>
              </div>
            )}
            {searchQ.length>=2&&searchResults.length===0&&!searching&&(
              <div style={{marginTop:4,padding:"6px 10px",background:"#d1fae5",borderRadius:6,fontSize:11,color:"#065f46",fontWeight:600}}>✓ Not found in inventory — fill the form below to add it</div>
            )}
          </div>

          {err&&<div style={{background:itemSelected?"#fef3c7":"#fee2e2",color:itemSelected?"#92400e":"#991b1b",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16}}>{err}</div>}

          {/* Form */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{gridColumn:"1/-1",...s.fgroup}}>{fl("Item Name",true)}<input style={s.input} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Surgical Gloves Size 7"/></div>
            <div style={s.fgroup}>{fl("Generic / Common Name")}<input style={s.input} value={form.generic_name} onChange={e=>set("generic_name",e.target.value)}/></div>
            <div style={s.fgroup}>{fl("Item Type")}<select style={s.input} value={form.itemtype} onChange={e=>set("itemtype",e.target.value)}>{["supply","equipment","reagent","consumable","contrast","film","chemical","accessory","other"].map(t=>(<option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>))}</select></div>
            <div style={s.fgroup}>{fl("Unit of Measure")}<select style={s.input} value={form.uom} onChange={e=>set("uom",e.target.value)}>{["piece","ml","mg","g","kg","bottle","vial","ampoule","sachet","pack","box","pair","roll","set","tablet"].map(u=>(<option key={u} value={u}>{u}</option>))}</select></div>
            <div style={s.fgroup}>{fl("Barcode")}<input style={s.input} value={form.barcode} onChange={e=>set("barcode",e.target.value)} placeholder="Optional — scan or type"/></div>
            <div style={s.fgroup}>{fl("Strength / Concentration")}<input style={s.input} value={form.strength} onChange={e=>set("strength",e.target.value)} placeholder="e.g. 500mg"/></div>
            <div style={s.fgroup}>{fl("Manufacturer")}<select style={s.input} value={form.manufacturer} onChange={e=>set("manufacturer",e.target.value)}><option value="">— Select —</option>{manufacturers.map((m:any)=><option key={m.id} value={m.name}>{m.name}{m.country?` (${m.country})`:""}</option>)}</select></div>
            <div style={s.fgroup}>{fl("Supplier")}<select style={s.input} value={form.supplier_id} onChange={e=>{const sup=suppliers.find((sp:any)=>sp.id===e.target.value);set("supplier_id",e.target.value);set("supplier_name",sup?.name??"");}}><option value="">— Select —</option>{suppliers.map((sp:any)=>(<option key={sp.id} value={sp.id}>{sp.name}{sp.city?` · ${sp.city}`:""}</option>))}</select></div>
            <div style={s.fgroup}>{fl("Storage Location")}<StorageSearch value={form.storage_location} locations={storageLocations} onChange={v=>set("storage_location",v)}/></div>
            <div style={s.fgroup}>{fl("Storage Type")}<select style={s.input} value={form.storage_type} onChange={e=>set("storage_type",e.target.value)}><option value="">— Select —</option>{["shelf","fridge","freezer","cabinet","room","controlled"].map(t=>(<option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>))}</select></div>
            <div style={{gridColumn:"1/-1",borderTop:"1px solid #f3f4f6",paddingTop:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:10,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Pricing</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={s.fgroup}>{fl("Purchase Price",true)}<input type="number" step="0.01" min="0" style={s.input} value={form.unit_cost} onChange={e=>set("unit_cost",e.target.value)} placeholder="0.00"/></div>
                <div style={s.fgroup}>{fl("Selling Price")}<input type="number" step="0.01" min="0" style={s.input} value={form.selling_price} onChange={e=>set("selling_price",e.target.value)} placeholder="0.00"/></div>
              </div>
            </div>
            <div style={{gridColumn:"1/-1",borderTop:"1px solid #f3f4f6",paddingTop:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:10,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Stock Levels</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={s.fgroup}>{fl("Minimum Level")}<input type="number" min="0" style={s.input} value={form.min_level} onChange={e=>set("min_level",e.target.value)}/></div>
                <div style={s.fgroup}>{fl("Maximum Level")}<input type="number" min="0" style={s.input} value={form.max_level} onChange={e=>set("max_level",e.target.value)}/></div>
                <div style={s.fgroup}>{fl("Expiry Date")}<input type="date" style={s.input} value={form.expiry_date} onChange={e=>set("expiry_date",e.target.value)}/></div>
              </div>
            </div>
            <div style={{gridColumn:"1/-1",...s.fgroup}}>{fl("Notes")}<input style={s.input} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Optional notes..."/></div>
          </div>
        </div>

        <div style={{padding:"14px 24px",borderTop:"1px solid #e5e7eb",display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0}}>
          <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
          <button onClick={save} disabled={saving} style={{...s.btn("purple"),minWidth:100}}>{saving?"Saving...":"Add Item"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Transfer Modal ──────────────────────────────────────────────────────────
function TransferModal({items,departments,onClose,onSuccess}:{items:any[];departments:any[];onClose:()=>void;onSuccess:()=>void}){
  const [form,setForm]=useState({toDepartmentId:"",sentBy:"",notes:""});
  const [tItems,setTItems]=useState<{itemId:string;itemName:string;quantity:number}[]>([]);
  const [searchQ,setSearchQ]=useState("");const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const set=(k:string,v:any)=>setForm(f=>({...f,[k]:v}));
  const filtered=items.filter(i=>!searchQ||i.name.toLowerCase().includes(searchQ.toLowerCase()));

  return(
    <div style={s.overlay}><div style={{...s.modal,width:660}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:600,margin:0}}>🔄 Create Transfer</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      {error&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:12}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>To Department *</label>
          <select style={s.input} value={form.toDepartmentId} onChange={e=>set("toDepartmentId",e.target.value)}>
            <option value="">Select department</option>
            {departments.filter(d=>d.type!=="general").map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Sent By *</label><input style={s.input} value={form.sentBy} onChange={e=>set("sentBy",e.target.value)} placeholder="Your name"/></div>
        <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={e=>set("notes",e.target.value)}/></div>
      </div>
      <div style={{marginBottom:10,position:"relative"}}>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
          <input style={{...s.input,paddingLeft:30}} value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search items to add..."/>
        </div>
        {searchQ&&filtered.length>0&&(
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #6366f1",borderRadius:8,zIndex:100,maxHeight:180,overflowY:"auto" as const}}>
            {filtered.slice(0,8).map(item=>(<div key={item.id} onClick={()=>{if(!tItems.find(i=>i.itemId===item.id)){setTItems(t=>[...t,{itemId:item.id,itemName:item.name,quantity:1}]);}setSearchQ("");}} style={{padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}} onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}><span style={{fontWeight:600,fontSize:13}}>{item.name}</span><span style={{fontSize:11,color:"#6366f1",fontWeight:600}}>+ Add</span></div>))}
          </div>
        )}
      </div>
      {tItems.length>0&&(
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
          <thead><tr>{["Item","Quantity",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>{tItems.map(item=>(<tr key={item.itemId}><td style={{...s.td,fontWeight:600}}>{item.itemName}</td><td style={s.td}><input type="number" min={1} value={item.quantity} onChange={e=>setTItems(t=>t.map(i=>i.itemId===item.itemId?{...i,quantity:parseInt(e.target.value)||1}:i))} style={{...s.input,width:80,textAlign:"center" as const}}/></td><td style={s.td}><button onClick={()=>setTItems(t=>t.filter(i=>i.itemId!==item.itemId))} style={{background:"#fee2e2",border:"none",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:11,color:"#dc2626"}}>✕</button></td></tr>))}</tbody>
        </table>
      )}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
        <button disabled={loading} onClick={async()=>{if(!form.toDepartmentId||!form.sentBy||!tItems.length){setError("Department, sender and items required");return;}setLoading(true);try{const res=await fetch("/api/hospital/transfers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,items:tItems})});if(!res.ok)throw new Error("Failed");onSuccess();onClose();}catch(e:any){setError(e.message);}finally{setLoading(false);}}} style={s.btn("blue")}>{loading?"Sending...":"Send Transfer"}</button>
      </div>
    </div></div>
  );
}

// ── PR Modal ───────────────────────────────────────────────────────────────────────────
type PRLine={id:string;name:string;uom:string;qty:number;unitCost:string;};

function CreateOrderModal({items,suppliers,departments,initialCart,onClose,onSuccess}:{
  items:any[];suppliers:any[];departments:any[];initialCart?:any[];onClose:()=>void;onSuccess:()=>void;
}){
  const [lines,setLines]=useState<{itemId:string;itemName:string;uom:string;qty:number;unitCost:string;}[]>((initialCart||[]).map((i:any)=>({itemId:i.id,itemName:i.name,uom:i.uom||'piece',qty:i.qty||1,unitCost:String(i.unitCost||i.unit_cost||'')})));
  const [form,setForm]=useState({orderedBy:"",orderDate:new Date().toISOString().slice(0,10),expectedDate:"",supplierId:"",supplierName:"",supplierEmail:"",supplierPhone:"",notes:""});
  const [q,setQ]=useState("");const [results,setResults]=useState<any[]>([]);
  const [saving,setSaving]=useState(false);const [err,setErr]=useState("");
  const setF=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if(q.length<2){setResults([]);return;}
    const t=setTimeout(async()=>{try{const r=await fetch(`/api/hospital/items?search=${encodeURIComponent(q)}`);const d=await r.json();setResults(Array.isArray(d)?d.slice(0,8):[]);}catch{setResults([]);}},250);
    return()=>clearTimeout(t);
  },[q]);

  const addLine=(item:any)=>{if(lines.find(l=>l.itemId===item.id))return;setLines(p=>[...p,{itemId:item.id,itemName:item.name,uom:item.uom||"piece",qty:1,unitCost:String(item.unit_cost||"")}]);setQ("");setResults([]);};
  const updateLine=(id:string,field:"qty"|"unitCost",val:string)=>setLines(p=>p.map(l=>l.itemId===id?{...l,[field]:field==="qty"?String(Math.max(1,parseInt(val)||1)):val}:l));
  const removeLine=(id:string)=>setLines(p=>p.filter(l=>l.itemId!==id));
  const total=lines.reduce((s,l)=>s+(l.qty||0)*(parseFloat(l.unitCost)||0),0);

  const save=async()=>{
    if(!form.orderedBy.trim()){setErr("Ordered By is required");return;}
    if(!lines.length){setErr("Add at least one item");return;}
    setSaving(true);setErr("");
    try{
      const res=await fetch("/api/hospital/orders",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,items:lines.map(l=>({itemId:l.itemId,itemName:l.itemName,uom:l.uom,orderedQty:l.qty,unitCost:parseFloat(l.unitCost)||null}))})
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Failed");return;}
      onSuccess();onClose();
    }catch(e:any){setErr(e?.message||"Network error");}
    finally{setSaving(false);}
  };

  return(
    <div style={s.overlay}>
      <div style={{...s.modal,width:840,maxHeight:"94vh",padding:0,display:"flex",flexDirection:"column" as const}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div><div style={{fontSize:16,fontWeight:700}}>📋 Create Purchase Order</div><div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{lines.length} items · Est. ${total.toFixed(2)}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
        </div>
        <div style={{padding:"20px 24px",overflowY:"auto" as const,flex:1}}>
          {err&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16}}>{err}</div>}
          <div style={{background:"#f9fafb",borderRadius:10,padding:16,marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:12,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Order Details</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Ordered By *</label><input style={s.input} value={form.orderedBy} onChange={e=>setF("orderedBy",e.target.value)} placeholder="Full name"/></div>
              <div style={s.fgroup}><label style={s.label}>Order Date</label><input type="date" style={s.input} value={form.orderDate} onChange={e=>setF("orderDate",e.target.value)}/></div>
              <div style={s.fgroup}><label style={s.label}>Expected Delivery Date</label><input type="date" style={s.input} value={form.expectedDate} onChange={e=>setF("expectedDate",e.target.value)}/></div>
              <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Supplier</label>
                <select style={s.input} value={form.supplierId} onChange={e=>{const sp=suppliers.find((s:any)=>s.id===e.target.value);setF("supplierId",e.target.value);setF("supplierName",sp?.name||"");setF("supplierEmail",sp?.email||"");setF("supplierPhone",sp?.phone||"");}}>
                  <option value="">— Select supplier —</option>
                  {suppliers.map((sp:any)=><option key={sp.id} value={sp.id}>{sp.name}{sp.city?` · ${sp.city}`:""}</option>)}
                </select>
              </div>
              {form.supplierEmail&&<div style={{gridColumn:"1/-1",fontSize:12,color:"#6b7280",padding:"4px 0"}}>📧 {form.supplierEmail} {form.supplierPhone&&` · 📞 ${form.supplierPhone}`}</div>}
              <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Optional notes..."/></div>
            </div>
          </div>
          <div style={{marginBottom:14,position:"relative"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Add Items from Hospital Inventory</div>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={icons.search} size={14} color="#9ca3af"/></div>
              <input style={{...s.input,paddingLeft:34,border:"2px solid #6366f1"}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, code, type..."/>
            </div>
            {(results.length>0||(q.length>=2&&results.length===0))&&(
              <div style={{position:"absolute",left:0,right:0,top:"100%",background:"#fff",border:"1px solid #6366f1",borderRadius:10,boxShadow:"0 8px 24px rgba(99,102,241,0.15)",zIndex:500,overflow:"hidden",marginTop:2}}>
                {q.length>=2&&results.length===0&&(<div style={{padding:"12px 16px",fontSize:13,color:"#9ca3af",textAlign:"center" as const}}>No items found for "{q}"<br/><span style={{fontSize:11}}>Add the item first via the Add Item button, then search again.</span></div>)}
                {results.map((item:any)=>{
                  const added=lines.some(l=>l.itemId===item.id);
                  return(<div key={item.id} onClick={()=>!added&&addLine(item)} style={{padding:"10px 14px",cursor:added?"default":"pointer",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}} onMouseEnter={e=>{if(!added)(e.currentTarget as HTMLElement).style.background="#eef2ff";}} onMouseLeave={e=>{if(!added)(e.currentTarget as HTMLElement).style.background="#fff";}}>
                    <div><div style={{fontWeight:600,fontSize:13,color:added?"#9ca3af":"#111827"}}>{item.name}</div><div style={{fontSize:11,color:"#9ca3af"}}>{item.itemcode} · {item.uom} · Stock: <strong style={{color:parseInt(item.total_stock||0)===0?"#dc2626":"#16a34a"}}>{item.total_stock??0}</strong>{item.unit_cost?` · $${parseFloat(item.unit_cost).toFixed(2)}`:""}</div></div>
                    {added?<span style={{fontSize:11,color:"#9ca3af",fontStyle:"italic"}}>Added</span>:<span style={{background:"#6366f1",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:6}}>+ Add</span>}
                  </div>);
                })}
              </div>
            )}
          </div>
          {lines.length===0?(
            <div style={{background:"#f9fafb",borderRadius:10,padding:"28px",textAlign:"center",marginBottom:4}}><div style={{fontSize:28,marginBottom:6}}>📦</div><div style={{fontSize:13,fontWeight:600,color:"#374151"}}>No items yet</div><div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>Search above to add items to this order</div></div>
          ):(
            <div style={{border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["#","Item","Unit of Measure","Quantity","Unit Cost ($)","Total",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>{lines.map((l,i)=>(<tr key={l.itemId}><td style={{...s.td,color:"#9ca3af",fontSize:11,width:28}}>{i+1}</td><td style={{...s.td,fontWeight:600,minWidth:160}}>{l.itemName}</td><td style={{...s.td,color:"#6b7280"}}>{l.uom}</td><td style={s.td}><input type="number" min={1} value={l.qty} onChange={e=>updateLine(l.itemId,"qty",e.target.value)} style={{...s.input,width:80,textAlign:"center" as const,padding:"5px 8px"}}/></td><td style={s.td}><input type="number" step="0.01" min="0" value={l.unitCost} onChange={e=>updateLine(l.itemId,"unitCost",e.target.value)} placeholder="0.00" style={{...s.input,width:100,padding:"5px 8px"}}/></td><td style={{...s.td,fontWeight:700,color:"#6366f1"}}>${(l.qty*(parseFloat(l.unitCost)||0)).toFixed(2)}</td><td style={s.td}><button onClick={()=>removeLine(l.itemId)} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon d={icons.trash} size={13} color="#dc2626"/></button></td></tr>))}</tbody>
                <tfoot><tr style={{background:"#f9fafb"}}><td colSpan={5} style={{...s.td,fontWeight:700,textAlign:"right" as const,paddingRight:16}}>Total:</td><td style={{...s.td,fontWeight:700,color:"#6366f1",fontSize:14}}>${total.toFixed(2)}</td><td/></tr></tfoot>
              </table>
            </div>
          )}
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:12,color:"#9ca3af"}}>{lines.length} item{lines.length!==1?"s":""} · ${total.toFixed(2)}</span>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
            <button onClick={save} disabled={saving||!lines.length||!form.orderedBy.trim()} style={{...s.btn("purple"),minWidth:130,opacity:saving||!lines.length||!form.orderedBy.trim()?0.5:1}}>{saving?"Creating...":"✓ Create Order"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Receive Order Modal (Goods Receipt) ───────────────────────────────────────
function ReceiveOrderModal({orderDetail,departments,onClose,onSuccess}:{orderDetail:any;departments:any[];onClose:()=>void;onSuccess:(r:any)=>void}){
  const order=orderDetail?.order;
  const [lines,setLines]=useState<any[]>((orderDetail?.items||[]).map((i:any)=>({...i,receivedQty:String(i.ordered_qty||0),batchNumber:"",lotNumber:"",expiryDate:"",manufactureDate:""})));
  const [receivedBy,setReceivedBy]=useState("");
  const [receiptDate,setReceiptDate]=useState(new Date().toISOString().slice(0,10));
  const [departmentId,setDepartmentId]=useState("");
  const [notes,setNotes]=useState("");
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  const [extraItems,setExtraItems]=useState<any[]>([]);
  const [showExtraModal,setShowExtraModal]=useState(false);
  const [pendingResult,setPendingResult]=useState<any>(null);

  const updateLine=(id:string,field:string,val:string)=>setLines(p=>p.map(l=>l.id===id?{...l,[field]:val}:l));

  const hasExtra=lines.some(l=>parseInt(l.receivedQty||0)>parseInt(l.ordered_qty||0));
  const hasShort=lines.some(l=>parseInt(l.receivedQty||0)<parseInt(l.ordered_qty||0));

  const save=async(overrideLines?:any[])=>{
    if(!receivedBy.trim()){setErr("Received By is required");return;}
    if(!departmentId){setErr("Select department (store to receive into)");return;}
    const finalLines=overrideLines||lines;
    setSaving(true);setErr("");
    try{
      const res=await fetch("/api/hospital/goods-receipt",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({orderId:order?.id,orderNumber:order?.order_number,receivedBy,receiptDate,supplierName:order?.supplier_name,supplierEmail:order?.supplier_email,notes,departmentId,
          items:finalLines.map(l=>({itemId:l.item_id,itemName:l.item_name,uom:l.uom,orderedQty:parseInt(l.ordered_qty)||0,receivedQty:parseInt(l.receivedQty)||0,unitCost:parseFloat(l.unit_cost)||null,batchNumber:l.batchNumber||null,lotNumber:l.lotNumber||null,expiryDate:l.expiryDate||null,manufactureDate:l.manufactureDate||null}))
        })
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Failed");return;}
      onSuccess(data);
    }catch(e:any){setErr(e?.message||"Network error");}
    finally{setSaving(false);}
  };

  const handleSubmit=async()=>{
    if(hasExtra){
      const extra=lines.filter(l=>parseInt(l.receivedQty||0)>parseInt(l.ordered_qty||0)).map(l=>({...l,extraQty:parseInt(l.receivedQty||0)-parseInt(l.ordered_qty||0)}));
      setExtraItems(extra);setShowExtraModal(true);return;
    }
    await save();
    if(hasShort){
      // Auto email option handled after save
    }
  };

  return(
    <div style={s.overlay}>
      <div style={{...s.modal,width:900,maxHeight:"94vh",padding:0,display:"flex",flexDirection:"column" as const}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}>📥 Receive Order — {order?.order_number}</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Supplier: {order?.supplier_name||"—"} · Ordered by: {order?.ordered_by}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
        </div>

        {/* Extra items confirmation modal */}
        {showExtraModal&&(
          <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,borderRadius:12}}>
            <div style={{background:"#fff",borderRadius:12,padding:24,width:480,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
              <div style={{fontSize:18,marginBottom:4}}>⚠️ Extra Quantity Received</div>
              <div style={{fontSize:13,color:"#374151",marginBottom:16}}>You are receiving more than ordered for the following items. Do you want to add the extra quantities to stock?</div>
              {extraItems.map(item=>(
                <div key={item.id} style={{background:"#fef3c7",borderRadius:8,padding:"10px 14px",marginBottom:8}}>
                  <div style={{fontWeight:600,fontSize:13}}>{item.item_name}</div>
                  <div style={{fontSize:12,color:"#92400e"}}>Ordered: <strong>{item.ordered_qty}</strong> · Received: <strong>{item.receivedQty}</strong> · Extra: <strong style={{color:"#dc2626"}}>+{item.extraQty}</strong></div>
                </div>
              ))}
              <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
                <button onClick={()=>{setShowExtraModal(false);const capped=lines.map(l=>({...l,receivedQty:String(Math.min(parseInt(l.receivedQty||0),parseInt(l.ordered_qty||0)))}));save(capped);}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>No — Only add ordered quantity</button>
                <button onClick={()=>{setShowExtraModal(false);save();}} style={s.btn("green")}>Yes — Add all to stock</button>
              </div>
            </div>
          </div>
        )}

        <div style={{padding:"20px 24px",overflowY:"auto" as const,flex:1}}>
          {err&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16}}>{err}</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Received By *</label><input style={s.input} value={receivedBy} onChange={e=>setReceivedBy(e.target.value)} placeholder="Your name"/></div>
            <div style={s.fgroup}><label style={s.label}>Receipt Date</label><input type="date" style={s.input} value={receiptDate} onChange={e=>setReceiptDate(e.target.value)}/></div>
            <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Receive Into (Department) *</label>
              <select style={s.input} value={departmentId} onChange={e=>setDepartmentId(e.target.value)}>
                <option value="">— Select store —</option>
                {departments.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional notes..."/></div>
          </div>

          {/* Items comparison table */}
          <div style={{border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden",marginBottom:8}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#f9fafb"}}>
                  {["Item","Unit of Measure","Ordered Qty","Received Qty","Status","Unit Cost","Batch #","Lot #","Expiry Date","Manufacture Date"].map(h=><th key={h} style={{...s.th,fontSize:10}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {lines.map(l=>{
                  const ordered=parseInt(l.ordered_qty||0);
                  const received=parseInt(l.receivedQty||0);
                  const diff=received-ordered;
                  const rowBg=diff<0?"#fff7ed":diff>0?"#f0fdf4":"#fff";
                  return(
                    <tr key={l.id} style={{background:rowBg}}>
                      <td style={{...s.td,fontWeight:600,minWidth:140}}>{l.item_name}</td>
                      <td style={{...s.td,color:"#6b7280",fontSize:12}}>{l.uom}</td>
                      <td style={{...s.td,fontWeight:700,textAlign:"center" as const}}>{ordered}</td>
                      <td style={s.td}>
                        <input type="number" min={0} value={l.receivedQty??0}
                          onChange={e=>updateLine(l.id,"receivedQty",e.target.value)}
                          style={{...s.input,width:75,textAlign:"center" as const,padding:"5px 8px",borderColor:diff<0?"#f97316":diff>0?"#16a34a":"#d1d5db"}}/>
                      </td>
                      <td style={s.td}>
                        {diff===0&&<span style={{fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:10,background:"#d1fae5",color:"#065f46"}}>✓ Match</span>}
                        {diff<0&&<span style={{fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:10,background:"#fed7aa",color:"#92400e"}}>Short {diff}</span>}
                        {diff>0&&<span style={{fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:10,background:"#d1fae5",color:"#065f46"}}>+{diff} Extra</span>}
                      </td>
                      <td style={s.td}><input type="number" step="0.01" value={l.unit_cost||""} onChange={e=>updateLine(l.id,"unit_cost",e.target.value)} style={{...s.input,width:80,padding:"5px 8px"}} placeholder="0.00"/></td>
                      <td style={s.td}><input value={l.batchNumber||""} onChange={e=>updateLine(l.id,"batchNumber",e.target.value)} style={{...s.input,width:90,padding:"5px 8px"}} placeholder="BAT-..."/></td>
                      <td style={s.td}><input value={l.lotNumber||""} onChange={e=>updateLine(l.id,"lotNumber",e.target.value)} style={{...s.input,width:80,padding:"5px 8px"}} placeholder="LOT-..."/></td>
                      <td style={s.td}><input type="date" value={l.expiryDate||""} onChange={e=>updateLine(l.id,"expiryDate",e.target.value)} style={{...s.input,width:130,padding:"5px 8px"}}/></td>
                      <td style={s.td}><input type="date" value={l.manufactureDate||""} onChange={e=>updateLine(l.id,"manufactureDate",e.target.value)} style={{...s.input,width:130,padding:"5px 8px"}}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Short delivery warning */}
          {hasShort&&(
            <div style={{background:"#fff7ed",border:"1px solid #fb923c",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#9a3412"}}>⚠️ Partial Delivery Detected</div>
                <div style={{fontSize:12,color:"#c2410c",marginTop:2}}>Some items are less than ordered. This will be recorded as Partial delivery. You can email the supplier.</div>
              </div>
              <button onClick={()=>{
                if(!order?.supplier_email){alert("No supplier email on record");return;}
                const short=lines.filter(l=>parseInt(l.receivedQty||0)<parseInt(l.ordered_qty||0));
                const NL=String.fromCharCode(10);
                const body=[`Dear ${order?.supplier_name||"Supplier"},`,``,`Order ${order?.order_number} has been received with discrepancies:`,``,...short.map(l=>`- ${l.item_name}: Ordered ${l.ordered_qty}, Received ${l.receivedQty} (Short by ${parseInt(l.ordered_qty||0)-parseInt(l.receivedQty||0)})`),``,`Please arrange to deliver the remaining items or contact us.`,``,`Regards`].join(NL);
                window.location.href=`mailto:${order.supplier_email}?subject=${encodeURIComponent(`Order ${order.order_number} — Partial Delivery`)}&body=${encodeURIComponent(body)}`;
              }} style={{...s.btn("orange"),whiteSpace:"nowrap" as const,display:"flex",alignItems:"center",gap:6}}>✉️ Email Supplier</button>
            </div>
          )}
        </div>

        <div style={{padding:"14px 24px",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:12,color:"#9ca3af"}}>{lines.length} items · {hasShort?"⚠️ Partial":hasExtra?"⚠️ Extra quantities":"✓ Ready"}</span>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving||!receivedBy.trim()||!departmentId} style={{...s.btn("green"),minWidth:140,opacity:saving||!receivedBy.trim()||!departmentId?0.5:1}}>{saving?"Processing...":"✓ Confirm Receipt"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── View Order Detail Modal ───────────────────────────────────────────────────
function ViewOrderModal({detail,onClose,onReceive}:{detail:any;onClose:()=>void;onReceive:()=>void}){
  const order=detail?.order;const items=detail?.items||[];
  if(!order)return null;
  const total=items.reduce((s:number,i:any)=>s+(parseInt(i.ordered_qty||0)*parseFloat(i.unit_cost||0)),0);
  const sc=statusColors[order.status]??{bg:"#f3f4f6",color:"#374151"};
  return(
    <div style={s.overlay}><div style={{...s.modal,width:700}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontSize:15,fontWeight:700}}>📋 Order — {order.order_number}</div><div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Ordered by: {order.ordered_by} · {order.order_date?new Date(order.order_date).toLocaleDateString():"—"}</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[["Supplier",order.supplier_name||"—"],["Supplier Email",order.supplier_email||"—"],["Supplier Phone",order.supplier_phone||"—"],["Order Date",order.order_date?new Date(order.order_date).toLocaleDateString():"—"],["Expected Date",order.expected_date?new Date(order.expected_date).toLocaleDateString():"—"],["Status",""],["Notes",order.notes||"—"]].map(([l,v])=>(
          <div key={l as string} style={{background:"#f9fafb",borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>{l}</div>
            {l==="Status"?<span style={{fontSize:12,fontWeight:700,padding:"2px 8px",borderRadius:20,background:sc.bg,color:sc.color}}>{order.status}</span>:<div style={{fontSize:13,fontWeight:600}}>{v as string}</div>}
          </div>
        ))}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
        <thead><tr>{["Item","Unit of Measure","Ordered Qty","Unit Cost","Total"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>{items.map((i:any)=>(<tr key={i.id}><td style={{...s.td,fontWeight:600}}>{i.item_name}</td><td style={s.td}>{i.uom}</td><td style={{...s.td,fontWeight:700,textAlign:"center" as const}}>{i.ordered_qty}</td><td style={s.td}>{i.unit_cost?`$${parseFloat(i.unit_cost).toFixed(2)}`:"—"}</td><td style={{...s.td,fontWeight:600,color:"#6366f1"}}>${(parseInt(i.ordered_qty||0)*parseFloat(i.unit_cost||0)).toFixed(2)}</td></tr>))}</tbody>
        <tfoot><tr style={{background:"#f9fafb"}}><td colSpan={4} style={{...s.td,fontWeight:700,textAlign:"right" as const,paddingRight:12}}>Total:</td><td style={{...s.td,fontWeight:700,color:"#6366f1",fontSize:14}}>${total.toFixed(2)}</td></tr></tfoot>
      </table>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Close</button>
        {(order.status==="PENDING"||order.status==="PARTIALLY_DELIVERED")&&<button onClick={()=>{onClose();onReceive();}} style={s.btn("green")}>📥 Receive This Order</button>}
      </div>
    </div></div>
  );
}

// ── View Goods Receipt Modal ──────────────────────────────────────────────────
function ViewGRModal({detail,suppliers,onClose}:{detail:any;suppliers:any[];onClose:()=>void}){
  const gr=detail?.receipt;const items=detail?.items||[];
  if(!gr)return null;
  const supplier=suppliers.find((s:any)=>s.name===gr.supplier_name);
  const sc=statusColors[gr.status]??{bg:"#f3f4f6",color:"#374151"};
  return(
    <div style={s.overlay}><div style={{...s.modal,width:740}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontSize:15,fontWeight:700}}>📥 Receipt — {gr.receipt_number}</div><div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Order: {gr.order_number||"—"} · Received by: {gr.received_by}</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[["Supplier",gr.supplier_name||"—"],["Supplier Email",gr.supplier_email||supplier?.email||"—"],["Received By",gr.received_by],["Receipt Date",gr.receipt_date?new Date(gr.receipt_date).toLocaleDateString():"—"],["Status",""],["Notes",gr.notes||"—"]].map(([l,v])=>(
          <div key={l as string} style={{background:"#f9fafb",borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>{l}</div>
            {l==="Status"?<span style={{fontSize:12,fontWeight:700,padding:"2px 8px",borderRadius:20,background:sc.bg,color:sc.color}}>{gr.status}</span>:<div style={{fontSize:13,fontWeight:600}}>{v as string}</div>}
          </div>
        ))}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
        <thead><tr>{["Item","UOM","Ordered","Received","Diff","Batch","Lot","Expiry"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>{items.map((i:any)=>{const diff=parseInt(i.received_qty||0)-parseInt(i.ordered_qty||0);return(<tr key={i.id}><td style={{...s.td,fontWeight:600}}>{i.item_name}</td><td style={s.td}>{i.uom}</td><td style={{...s.td,textAlign:"center" as const,fontWeight:600}}>{i.ordered_qty}</td><td style={{...s.td,textAlign:"center" as const,fontWeight:700,color:diff<0?"#d97706":diff>0?"#16a34a":"#111827"}}>{i.received_qty}</td><td style={{...s.td,textAlign:"center" as const}}>{diff===0?"—":<span style={{fontSize:11,fontWeight:600,padding:"2px 6px",borderRadius:10,background:diff<0?"#fef3c7":diff>0?"#d1fae5":"#f3f4f6",color:diff<0?"#92400e":"#065f46"}}>{diff>0?"+":""}{diff}</span>}</td><td style={{...s.td,fontSize:11}}>{i.batch_number||"—"}</td><td style={{...s.td,fontSize:11}}>{i.lot_number||"—"}</td><td style={{...s.td,fontSize:11}}>{i.expiry_date?new Date(i.expiry_date).toLocaleDateString():"—"}</td></tr>);})}</tbody>
      </table>
      {gr.status==="PARTIAL"&&(
        <div style={{background:"#fff7ed",border:"1px solid #fb923c",borderRadius:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,color:"#9a3412",fontWeight:600}}>⚠️ Partial delivery — some items missing</div>
          <button onClick={()=>{const email=gr.supplier_email||supplier?.email||"";const NL=String.fromCharCode(10);const short=items.filter((i:any)=>parseInt(i.received_qty||0)<parseInt(i.ordered_qty||0));const body=[`Dear ${gr.supplier_name||"Supplier"},`,``,`Receipt ${gr.receipt_number} for Order ${gr.order_number||"N/A"} was partially delivered:`,``,...short.map((i:any)=>`- ${i.item_name}: Ordered ${i.ordered_qty}, Received ${i.received_qty} (Short by ${parseInt(i.ordered_qty||0)-parseInt(i.received_qty||0)})`),``,`Please deliver remaining items or contact us.`,``,`Regards`].join(NL);window.location.href=`mailto:${email}?subject=${encodeURIComponent(`Order ${gr.order_number} — Partial Delivery Notice`)}&body=${encodeURIComponent(body)}`;}} style={{...s.btn("orange"),display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" as const}}>✉️ Email Supplier</button>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Close</button></div>
    </div></div>
  );
}


// ── New Goods Receipt Modal ───────────────────────────────────────────────────
function NewGoodsReceiptModal({orders,departments,tibbnaSuppliers,purchaseNote,onClose,onSuccess}:{
  orders:any[];departments:any[];tibbnaSuppliers:any[];purchaseNote?:any;
  onClose:()=>void;onSuccess:(msg:string)=>void;
}){
  type GRLine={itemId:string;itemName:string;uom:string;orderedQty:number;receivedQty:number;deliveredTotal:string;};
  type Mode="order"|"standalone";
  const [mode,setMode]=useState<Mode>("order");
  const [step,setStep]=useState<"select"|"review">("select");
  const [selectedOrderId,setSelectedOrderId]=useState("");
  const [orderDetail,setOrderDetail]=useState<any>(null);
  const [loadingOrder,setLoadingOrder]=useState(false);
  const [lines,setLines]=useState<GRLine[]>([]);
  const [receivedBy,setReceivedBy]=useState("");
  const [receiptDate,setReceiptDate]=useState(new Date().toISOString().slice(0,10));
  const [departmentId,setDepartmentId]=useState("");
  const [supplierId,setSupplierId]=useState("");
  const [supplierName,setSupplierName]=useState("");
  const [notes,setNotes]=useState("");
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  const [extraItems,setExtraItems]=useState<GRLine[]>([]);
  const [showExtraConfirm,setShowExtraConfirm]=useState(false);
  const [shortItems,setShortItems]=useState<GRLine[]>([]);
  const [showShortNotif,setShowShortNotif]=useState(false);
  // Standalone item search
  const [itemQ,setItemQ]=useState("");
  const [itemResults,setItemResults]=useState<any[]>([]);

  const pendingOrders=orders.filter(o=>o.status==="PENDING"||o.status==="PARTIALLY_DELIVERED");

  // Pre-load from purchase note if provided
  useEffect(()=>{
    if(!purchaseNote?.note)return;
    const pn=purchaseNote.note;
    const pnItems=purchaseNote.items||[];
    setMode("order");
    setSelectedOrderId(pn.order_id||"");
    setSupplierName(pn.supplier_name||"");
    setLines(pnItems.map((i:any)=>({
      itemId:i.item_id||"",itemName:i.item_name||"",uom:i.uom||"piece",
      orderedQty:parseInt(i.ordered_qty)||0,
      receivedQty:parseInt(i.delivered_qty)||0,
      deliveredTotal:i.delivered_total!=null?String(i.delivered_total):"",
    })));
    // find and set order detail
    const matchOrder=orders.find(o=>o.id===pn.order_id);
    if(matchOrder){setOrderDetail({order:matchOrder,items:[]});setStep("review");}
  },[purchaseNote]);

  useEffect(()=>{
    if(itemQ.length<2){setItemResults([]);return;}
    const t=setTimeout(async()=>{
      try{const r=await fetch(`/api/hospital/items?search=${encodeURIComponent(itemQ)}`);const d=await r.json();setItemResults(Array.isArray(d)?d.slice(0,8):[]);}
      catch{setItemResults([]);}
    },250);
    return()=>clearTimeout(t);
  },[itemQ]);

  const addStandaloneLine=(item:any)=>{
    if(lines.find(l=>l.itemId===item.id))return;
    setLines(prev=>[...prev,{itemId:item.id,itemName:item.name,uom:item.uom||"piece",orderedQty:0,receivedQty:1,deliveredTotal:""}]);
    setItemQ("");setItemResults([]);
  };
  const removeLine=(idx:number)=>setLines(prev=>prev.filter((_,i)=>i!==idx));
  const updateLine=(idx:number,field:string,val:string)=>setLines(prev=>prev.map((l,i)=>i===idx?{...l,[field]:field==="receivedQty"?parseInt(val)||0:val}:l));

  const loadOrder=async(orderId:string)=>{
    setLoadingOrder(true);
    try{
      const [r,pnR]=await Promise.all([
        fetch(`/api/hospital/orders/${orderId}`),
        fetch(`/api/hospital/purchase-notes?order_id=${orderId}`),
      ]);
      const d=await r.json();
      const pnData=pnR.ok?await pnR.json():null;
      // Build a map of item_id → delivered_total from the linked PN (if any)
      const dnTotals:Record<string,string>={};
      if(pnData?.items){pnData.items.forEach((i:any)=>{if(i.item_id&&i.delivered_total!=null)dnTotals[i.item_id]=String(i.delivered_total);});}
      setOrderDetail(d);
      setLines((d.items||[]).map((i:any)=>({
        itemId:i.item_id||"",itemName:i.item_name||"",uom:i.uom||"piece",
        orderedQty:parseInt(i.ordered_qty)||0,receivedQty:parseInt(i.ordered_qty)||0,
        deliveredTotal:dnTotals[i.item_id]||"",
      })));
      setStep("review");
    }catch{setErr("Failed to load order");}
    finally{setLoadingOrder(false);}
  };

  const doSave=async(finalLines:GRLine[])=>{
    setSaving(true);setErr("");
    try{
      const order=orderDetail?.order;
      const purchaseNoteId=purchaseNote?.note?.id||null;
      const finalSupplierName=mode==="order"?order?.supplier_name:supplierName;
      const finalSupplierEmail=mode==="order"?order?.supplier_email:(tibbnaSuppliers.find((s:any)=>s.id===supplierId)?.email||"");
      const res=await fetch("/api/hospital/goods-receipt",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          orderId:order?.id||null,orderNumber:order?.order_number||null,purchaseNoteId,
          receivedBy,receiptDate,
          supplierName:finalSupplierName||null,supplierEmail:finalSupplierEmail||null,
          notes,departmentId,
          items:finalLines.map(l=>({
            itemId:l.itemId||null,itemName:l.itemName,uom:l.uom,
            orderedQty:l.orderedQty,receivedQty:l.receivedQty,
            deliveredTotal:parseFloat(l.deliveredTotal)||null,
          }))
        })
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Failed");setSaving(false);return;}
      const short=finalLines.filter(l=>l.orderedQty>0&&l.receivedQty<l.orderedQty);
      if(short.length>0){setShortItems(short);setShowShortNotif(true);}
      else{onSuccess("✓ Receipt confirmed! Stock updated.");}
    }catch(e:any){setErr(e?.message||"Network error");setSaving(false);}
    finally{setSaving(false);}
  };

  const handleConfirm=async()=>{
    if(!receivedBy.trim()){setErr("Received By is required");return;}

    if(!lines.length){setErr("Add at least one item");return;}
    const extra=lines.filter(l=>l.orderedQty>0&&l.receivedQty>l.orderedQty);
    if(extra.length>0){setExtraItems(extra);setShowExtraConfirm(true);return;}
    await doSave(lines);
  };

  const order=orderDetail?.order;
  const supplier=tibbnaSuppliers.find((s:any)=>s.name===order?.supplier_name);

  return(
    <div style={s.overlay}>
      <div style={{...s.modal,width:920,maxHeight:"95vh",padding:0,display:"flex",flexDirection:"column" as const}}>

        {/* Header */}
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}>📥 New Goods Receipt</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>
              {mode==="standalone"?"Standalone receipt — no purchase order required":
               step==="select"?"Select the order this delivery is against":
               "Reviewing order: "+order?.order_number+" · "+order?.supplier_name}
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {step==="review"&&<button onClick={()=>{setStep("select");setOrderDetail(null);setLines([]);}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",fontSize:12}}>← Back</button>}
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
          </div>
        </div>

        {/* Mode selector */}
        {step==="select"&&(
          <div style={{padding:"12px 24px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:8}}>
            <button onClick={()=>setMode("order")} style={{padding:"8px 18px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:`2px solid ${mode==="order"?"#6366f1":"#e5e7eb"}`,background:mode==="order"?"#eef2ff":"#fff",color:mode==="order"?"#6366f1":"#374151"}}>📋 Against a Purchase Order</button>
            <button onClick={()=>setMode("standalone")} style={{padding:"8px 18px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:`2px solid ${mode==="standalone"?"#6366f1":"#e5e7eb"}`,background:mode==="standalone"?"#eef2ff":"#fff",color:mode==="standalone"?"#6366f1":"#374151"}}>📦 Standalone (no order)</button>
          </div>
        )}

        {/* Extra confirm overlay */}
        {showExtraConfirm&&(
          <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20,borderRadius:12}}>
            <div style={{background:"#fff",borderRadius:12,padding:28,width:500,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
              <div style={{fontSize:18,marginBottom:8}}>⚠️ Extra Items Received</div>
              <div style={{fontSize:13,color:"#374151",marginBottom:16}}>You received <strong>more</strong> than ordered:</div>
              {extraItems.map((item,i)=>(
                <div key={i} style={{background:"#fef3c7",borderRadius:8,padding:"10px 14px",marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:13}}>{item.itemName}</div>
                  <div style={{fontSize:12,color:"#92400e",marginTop:2}}>Ordered: <strong>{item.orderedQty}</strong> · Received: <strong>{item.receivedQty}</strong> · Extra: <strong style={{color:"#dc2626"}}>+{item.receivedQty-item.orderedQty}</strong></div>
                </div>
              ))}
              <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
                <button onClick={()=>{setShowExtraConfirm(false);doSave(lines.map(l=>({...l,receivedQty:Math.min(l.receivedQty,l.orderedQty)})));}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Only add ordered qty</button>
                <button onClick={()=>{setShowExtraConfirm(false);doSave(lines);}} style={s.btn("green")}>✓ Add all to stock</button>
              </div>
            </div>
          </div>
        )}

        {/* Short items notification */}
        {showShortNotif&&(
          <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20,borderRadius:12}}>
            <div style={{background:"#fff",borderRadius:12,padding:28,width:520,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
              <div style={{fontSize:18,marginBottom:8}}>⚠️ Partial Delivery</div>
              <div style={{fontSize:13,color:"#374151",marginBottom:16}}>These items were short:</div>
              {shortItems.map((item,i)=>(
                <div key={i} style={{background:"#fee2e2",borderRadius:8,padding:"10px 14px",marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:13}}>{item.itemName}</div>
                  <div style={{fontSize:12,color:"#991b1b",marginTop:2}}>Ordered: <strong>{item.orderedQty}</strong> · Received: <strong>{item.receivedQty}</strong> · Missing: <strong>-{item.orderedQty-item.receivedQty}</strong></div>
                </div>
              ))}
              <div style={{fontSize:12,color:"#6b7280",marginBottom:16,marginTop:8}}>Stock updated with received quantities. Order remains PARTIAL.</div>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>{setShowShortNotif(false);onSuccess("Partial receipt saved. Stock updated.");}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Close</button>
                <button onClick={()=>{
                  const email=order?.supplier_email||tibbnaSuppliers.find((s:any)=>s.id===supplierId)?.email||"";
                  const NL=String.fromCharCode(10);
                  const body=[`Dear ${order?.supplier_name||supplierName||"Supplier"},`,``,`Order ${order?.order_number||"N/A"} was partially delivered on ${receiptDate}.`,``,`Short items:`,``,...shortItems.map(i=>`- ${i.itemName}: Ordered ${i.orderedQty}, Received ${i.receivedQty} (Short: ${i.orderedQty-i.receivedQty} ${i.uom})`),``,`Please deliver remaining items.`,``,`Regards`].join(NL);
                  window.location.href=`mailto:${email}?subject=${encodeURIComponent("Partial Delivery — "+(order?.order_number||"Receipt"))}&body=${encodeURIComponent(body)}`;
                  setShowShortNotif(false);onSuccess("Partial receipt saved. Email drafted.");
                }} style={{...s.btn("orange"),display:"flex",alignItems:"center",gap:6}}>✉️ Email Supplier</button>
              </div>
            </div>
          </div>
        )}

        <div style={{padding:"20px 24px",overflowY:"auto" as const,flex:1}}>
          {err&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16}}>{err}</div>}

          {/* STEP 1A: SELECT ORDER */}
          {step==="select"&&mode==="order"&&(
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:12}}>Select the order this delivery is for:</div>
              {pendingOrders.length===0?(
                <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}><div style={{fontSize:32,marginBottom:8}}>📋</div><div style={{fontWeight:600}}>No pending orders</div><div style={{fontSize:12,marginTop:4}}>Create an order first, or use "Standalone" mode</div></div>
              ):(
                <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
                  {pendingOrders.map(o=>(
                    <div key={o.id} onClick={()=>{setSelectedOrderId(o.id);loadOrder(o.id);}}
                      style={{border:`2px solid ${selectedOrderId===o.id?"#6366f1":"#e5e7eb"}`,borderRadius:10,padding:"14px 18px",cursor:"pointer",background:selectedOrderId===o.id?"#eef2ff":"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                      onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")}
                      onMouseLeave={e=>(e.currentTarget.style.background=selectedOrderId===o.id?"#eef2ff":"#fff")}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#6366f1"}}>{o.order_number}</span>
                          <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:o.status==="PARTIALLY_DELIVERED"?"#fef3c7":"#dbeafe",color:o.status==="PARTIALLY_DELIVERED"?"#92400e":"#1d4ed8"}}>{o.status}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:600,marginTop:4}}>{o.supplier_name||"No supplier"}</div>
                        <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{o.item_count} items · ${parseFloat(o.total_amount||0).toFixed(2)} · By {o.ordered_by} · {o.order_date?new Date(o.order_date).toLocaleDateString():""}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {loadingOrder&&selectedOrderId===o.id&&<span style={{fontSize:12,color:"#9ca3af"}}>Loading...</span>}
                        <span style={{fontSize:20}}>→</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 1B: STANDALONE SETUP */}
          {step==="select"&&mode==="standalone"&&(
            <div>
              <div style={{background:"#f9fafb",borderRadius:10,padding:16,marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:12,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Receipt Details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Received By *</label><input style={s.input} value={receivedBy} onChange={e=>setReceivedBy(e.target.value)} placeholder="Your name"/></div>
                  <div style={s.fgroup}><label style={s.label}>Supplier</label>
                    <select style={s.input} value={supplierId} onChange={e=>{const sp=tibbnaSuppliers.find((s:any)=>s.id===e.target.value);setSupplierId(e.target.value);setSupplierName(sp?.name||"");}}>
                      <option value="">— Select supplier (optional) —</option>
                      {tibbnaSuppliers.map((sp:any)=><option key={sp.id} value={sp.id}>{sp.name}{sp.city?` · ${sp.city}`:""}</option>)}
                    </select>
                  </div>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional..."/></div>
                </div>
              </div>

              {/* Add items search */}
              <div style={{marginBottom:12,position:"relative"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Add Items from Hospital Inventory</div>
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={icons.search} size={14} color="#9ca3af"/></div>
                  <input style={{...s.input,paddingLeft:34,border:"2px solid #6366f1"}} value={itemQ} onChange={e=>setItemQ(e.target.value)} placeholder="Search items to add..."/>
                </div>
                {itemResults.length>0&&(
                  <div style={{position:"absolute",left:0,right:0,top:"100%",background:"#fff",border:"1px solid #6366f1",borderRadius:10,boxShadow:"0 8px 24px rgba(99,102,241,0.15)",zIndex:500,overflow:"hidden",marginTop:2}}>
                    {itemResults.map((item:any)=>{
                      const added=lines.some(l=>l.itemId===item.id);
                      return(
                        <div key={item.id} onClick={()=>!added&&addStandaloneLine(item)}
                          style={{padding:"10px 14px",cursor:added?"default":"pointer",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                          onMouseEnter={e=>{if(!added)(e.currentTarget as HTMLElement).style.background="#eef2ff";}}
                          onMouseLeave={e=>{if(!added)(e.currentTarget as HTMLElement).style.background="#fff";}}>
                          <div>
                            <div style={{fontWeight:600,fontSize:13,color:added?"#9ca3af":"#111827"}}>{item.name}</div>
                            <div style={{fontSize:11,color:"#9ca3af"}}>{item.itemcode} · {item.uom} · Stock: <strong style={{color:parseInt(item.total_stock||0)===0?"#dc2626":"#16a34a"}}>{item.total_stock??0}</strong></div>
                          </div>
                          {added?<span style={{fontSize:11,color:"#9ca3af",fontStyle:"italic"}}>Added</span>:<span style={{background:"#6366f1",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:6}}>+ Add</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {lines.length>0&&(
                <div style={{border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden",marginBottom:8}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Item","UOM","Qty Received","Delivered Total",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {lines.map((l,i)=>(
                        <tr key={i}>
                          <td style={{...s.td,fontWeight:600}}>{l.itemName}</td>
                          <td style={{...s.td,color:"#6b7280"}}>{l.uom}</td>
                          <td style={s.td}><input type="number" min={1} value={l.receivedQty??0} onChange={e=>updateLine(i,"receivedQty",e.target.value)} style={{...s.input,width:80,textAlign:"center" as const,padding:"5px 6px"}}/></td>
                          <td style={s.td}><input type="number" step="0.01" value={l.deliveredTotal??""} onChange={e=>updateLine(i,"deliveredTotal",e.target.value)} style={{...s.input,width:110,padding:"5px 6px"}} placeholder="Total from DN"/></td>
                          <td style={s.td}><button onClick={()=>removeLine(i)} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"5px 7px",cursor:"pointer"}}><Icon d={icons.trash} size={12} color="#dc2626"/></button></td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {lines.length===0&&<div style={{padding:"20px",textAlign:"center",color:"#9ca3af",background:"#f9fafb",borderRadius:8}}>Search above to add items</div>}

              <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
                <button onClick={handleConfirm} disabled={saving||!receivedBy.trim()||!lines.length}
                  style={{...s.btn("green"),minWidth:160,opacity:saving||!receivedBy.trim()||!lines.length?0.5:1}}>
                  {saving?"Processing...":"✓ Confirm Receipt"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW ORDER (same as before) */}
          {step==="review"&&order&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                <div style={{background:"#f9fafb",borderRadius:10,padding:"12px 16px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Order Info</div>
                  {[["Order #",order.order_number],["Ordered By",order.ordered_by],["Date",order.order_date?new Date(order.order_date).toLocaleDateString():"—"],["Expected",order.expected_date?new Date(order.expected_date).toLocaleDateString():"—"],["Status",order.status]].map(([l,v])=>(
                    <div key={l as string} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,color:"#6b7280"}}>{l}</span><span style={{fontSize:12,fontWeight:600}}>{v as string}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:"#f0fdf4",borderRadius:10,padding:"12px 16px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#065f46",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Supplier Info</div>
                  {[["Name",order.supplier_name||"—"],["Email",order.supplier_email||supplier?.email||"—"],["Phone",order.supplier_phone||supplier?.phone||"—"]].map(([l,v])=>(
                    <div key={l as string} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,color:"#6b7280"}}>{l}</span><span style={{fontSize:12,fontWeight:600}}>{v as string}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Received By *</label><input style={s.input} value={receivedBy} onChange={e=>setReceivedBy(e.target.value)} placeholder="Your name"/></div>
                <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes..."/></div>
              </div>
              <div style={{display:"flex",gap:12,marginBottom:10,fontSize:11}}>
                <span style={{background:"#fff",border:"1px solid #e5e7eb",padding:"3px 10px",borderRadius:20}}>⬜ Match</span>
                <span style={{background:"#fff7ed",border:"1px solid #fb923c",padding:"3px 10px",borderRadius:20,color:"#9a3412"}}>🟠 Short</span>
                <span style={{background:"#f0fdf4",border:"1px solid #86efac",padding:"3px 10px",borderRadius:20,color:"#166534"}}>🟢 Extra</span>
              </div>
              <div style={{border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden",marginBottom:8}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#f9fafb"}}>{["Item","UOM","Ordered","Received","Diff","Delivered Total"].map(h=><th key={h} style={{...s.th,fontSize:10}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {lines.map((l,i)=>{
                      const diff=l.receivedQty-l.orderedQty;
                      return(
                        <tr key={i} style={{background:diff<0?"#fff7ed":diff>0?"#f0fdf4":"#fff"}}>
                          <td style={{...s.td,fontWeight:600,minWidth:140}}>{l.itemName}</td>
                          <td style={{...s.td,color:"#6b7280",fontSize:12}}>{l.uom}</td>
                          <td style={{...s.td,fontWeight:700,textAlign:"center" as const}}>{l.orderedQty}</td>
                          <td style={s.td}><input type="number" min={0} value={l.receivedQty??0} onChange={e=>updateLine(i,"receivedQty",e.target.value)} style={{...s.input,width:75,textAlign:"center" as const,padding:"5px 6px",borderColor:diff<0?"#f97316":diff>0?"#22c55e":"#d1d5db",borderWidth:diff!==0?"2px":"1px"}}/></td>
                          <td style={{...s.td,textAlign:"center" as const}}>
                            {diff===0&&<span style={{fontSize:11,color:"#6b7280"}}>—</span>}
                            {diff<0&&<span style={{fontSize:11,fontWeight:700,padding:"2px 6px",borderRadius:10,background:"#fed7aa",color:"#9a3412"}}>{diff}</span>}
                            {diff>0&&<span style={{fontSize:11,fontWeight:700,padding:"2px 6px",borderRadius:10,background:"#bbf7d0",color:"#166534"}}>+{diff}</span>}
                          </td>
                          <td style={s.td}>
                            {purchaseNote
                              ?<span style={{fontWeight:700,color:"#374151"}}>{l.deliveredTotal?parseFloat(l.deliveredTotal).toLocaleString():"—"}</span>
                              :<input type="number" step="0.01" value={l.deliveredTotal??""} onChange={e=>updateLine(i,"deliveredTotal",e.target.value)} style={{...s.input,width:110,padding:"5px 6px"}} placeholder="Total from DN"/>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{display:"flex",gap:12,fontSize:12,marginTop:8}}>
                {lines.filter(l=>l.receivedQty<l.orderedQty).length>0&&<div style={{background:"#fff7ed",border:"1px solid #fb923c",borderRadius:8,padding:"8px 14px",color:"#9a3412",fontWeight:600}}>⚠️ {lines.filter(l=>l.receivedQty<l.orderedQty).length} item{lines.filter(l=>l.receivedQty<l.orderedQty).length!==1?"s":""} short</div>}
                {lines.filter(l=>l.receivedQty>l.orderedQty).length>0&&<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"8px 14px",color:"#166534",fontWeight:600}}>⚡ {lines.filter(l=>l.receivedQty>l.orderedQty).length} extra</div>}
                {lines.length>0&&lines.every(l=>l.receivedQty===l.orderedQty)&&<div style={{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:8,padding:"8px 14px",color:"#065f46",fontWeight:600}}>✓ All match</div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer for order mode review */}
        {step==="review"&&(
          <div style={{padding:"14px 24px",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:12,color:"#9ca3af"}}>{lines.length} items · Received by: {receivedBy||"—"}</span>
            <div style={{display:"flex",gap:10}}>
              <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
              <button onClick={handleConfirm} disabled={saving||!receivedBy.trim()}
                style={{...s.btn("green"),minWidth:160,opacity:saving||!receivedBy.trim()?0.5:1}}>
                {saving?"Processing...":"✓ Confirm Receipt"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// ── Create Purchase Note Modal ────────────────────────────────────────────────
function CreatePurchaseNoteModal({orders,tibbnaSuppliers,onClose,onSuccess}:{
  orders:any[];tibbnaSuppliers:any[];onClose:()=>void;onSuccess:()=>void;
}){
  const [selectedOrder,setSelectedOrder]=useState<any>(null);
  const [orderItems,setOrderItems]=useState<any[]>([]);
  const [loadingOrder,setLoadingOrder]=useState(false);
  const [deliveredQtys,setDeliveredQtys]=useState<Record<string,number>>({});
  const [deliveredTotals,setDeliveredTotals]=useState<Record<string,string>>({});
  const [createdBy,setCreatedBy]=useState("");
  const [supplierRef,setSupplierRef]=useState("");
  const [deliveryDate,setDeliveryDate]=useState(new Date().toISOString().slice(0,10));
  const [notes,setNotes]=useState("");
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");

  const loadOrder=async(order:any)=>{
    setSelectedOrder(order);setLoadingOrder(true);
    try{
      const r=await fetch(`/api/hospital/orders/${order.id}`);
      const d=await r.json();
      const items=d.items||[];
      setOrderItems(items);
      // Pre-fill delivered qty = ordered qty (assume full delivery as default)
      const qtys:Record<string,number>={};
      items.forEach((i:any)=>{qtys[i.id]=parseInt(i.ordered_qty)||0;});
      setDeliveredQtys(qtys);setDeliveredTotals({});
    }catch{setErr("Failed to load order items");}
    finally{setLoadingOrder(false);}
  };

  const save=async()=>{
    if(!selectedOrder){setErr("Select an order");return;}
    if(!createdBy.trim()){setErr("Created By is required");return;}
    setSaving(true);setErr("");
    try{
      const res=await fetch("/api/hospital/purchase-notes",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          orderId:selectedOrder.id,orderNumber:selectedOrder.order_number,
          supplierName:selectedOrder.supplier_name,supplierRef,
          deliveryDate,createdBy,notes,
          items:orderItems.map(i=>({
            itemId:i.item_id||null,itemName:i.item_name,uom:i.uom,
            orderedQty:parseInt(i.ordered_qty)||0,
            deliveredQty:deliveredQtys[i.id]||0,
            deliveredTotal:parseFloat(deliveredTotals[i.id])||null,
          }))
        })
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Failed");return;}
      onSuccess();onClose();
    }catch(e:any){setErr(e?.message||"Network error");}
    finally{setSaving(false);}
  };

  const sentOrders=orders.filter(o=>o.status==="PENDING"||o.status==="PARTIALLY_DELIVERED");

  return(
    <div style={s.overlay}>
      <div style={{...s.modal,width:680,maxHeight:"95vh",padding:0,display:"flex",flexDirection:"column" as const}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}>📄 New Purchase Note</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Simulate what the supplier delivered — enter actual delivered quantities</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
        </div>

        <div style={{padding:"20px 24px",overflowY:"auto" as const,flex:1}}>
          {err&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16}}>{err}</div>}

          {/* Step 1: Select order */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:10,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Select Order</div>
            {sentOrders.length===0?(
              <div style={{padding:20,textAlign:"center",color:"#9ca3af",background:"#f9fafb",borderRadius:8}}>No pending orders. Create an order first.</div>
            ):(
              <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
                {sentOrders.map(o=>(
                  <div key={o.id} onClick={()=>loadOrder(o)}
                    style={{border:`2px solid ${selectedOrder?.id===o.id?"#16a34a":"#e5e7eb"}`,borderRadius:8,padding:"12px 16px",cursor:"pointer",background:selectedOrder?.id===o.id?"#f0fdf4":"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                    onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")}
                    onMouseLeave={e=>(e.currentTarget.style.background=selectedOrder?.id===o.id?"#f0fdf4":"#fff")}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#16a34a"}}>{o.order_number}</span>
                        <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#dbeafe",color:"#1d4ed8"}}>{o.status}</span>
                      </div>
                      <div style={{fontSize:12,color:"#374151",fontWeight:600,marginTop:2}}>{o.supplier_name||"No supplier"}</div>
                      <div style={{fontSize:11,color:"#6b7280"}}>{o.item_count} items · ${parseFloat(o.total_amount||0).toFixed(2)} · By {o.ordered_by}</div>
                    </div>
                    {selectedOrder?.id===o.id&&<span style={{color:"#16a34a",fontWeight:700,fontSize:12}}>✓ Selected</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Note details */}
          {selectedOrder&&(
            <>
              <div style={{background:"#f9fafb",borderRadius:10,padding:16,marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:12,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>Note Details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Created By *</label><input style={s.input} value={createdBy} onChange={e=>setCreatedBy(e.target.value)} placeholder="Your name"/></div>
                  <div style={s.fgroup}><label style={s.label}>Delivery Date</label><input type="date" style={s.input} value={deliveryDate} onChange={e=>setDeliveryDate(e.target.value)}/></div>
                  <div style={s.fgroup}><label style={s.label}>Supplier Invoice / Ref #</label><input style={s.input} value={supplierRef} onChange={e=>setSupplierRef(e.target.value)} placeholder="e.g. INV-2024-001"/></div>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional..."/></div>
                </div>
              </div>

              {/* Step 3: Enter delivered quantities */}
              {loadingOrder?(
                <div style={{padding:20,textAlign:"center",color:"#9ca3af"}}>Loading order items...</div>
              ):(
                <>
                  <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.05em"}}>
                    Delivered Quantities — enter what the supplier actually sent
                  </div>
                  <div style={{border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{background:"#f9fafb"}}>
                          {["Item","UOM","Ordered Qty","Delivered Qty","Delivered Total (DN)"].map(h=><th key={h} style={{...s.th,fontSize:10}}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item:any)=>{
                          const ordered=parseInt(item.ordered_qty||0);
                          const delivered=deliveredQtys[item.id]||0;
                          const diff=delivered-ordered;
                          const rowBg=diff<0?"#fff7ed":diff>0?"#f0fdf4":"#fff";
                          return(
                            <tr key={item.id} style={{background:rowBg}}>
                              <td style={{...s.td,fontWeight:600,minWidth:140}}>{item.item_name}</td>
                              <td style={{...s.td,color:"#6b7280",fontSize:12}}>{item.uom}</td>
                              <td style={{...s.td,fontWeight:700,textAlign:"center" as const,color:"#374151"}}>{ordered}</td>
                              <td style={s.td}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <input type="number" min={0} value={delivered}
                                    onChange={e=>setDeliveredQtys(p=>({...p,[item.id]:parseInt(e.target.value)||0}))}
                                    style={{...s.input,width:80,textAlign:"center" as const,padding:"5px 6px",
                                      borderColor:diff<0?"#f97316":diff>0?"#22c55e":"#d1d5db",
                                      borderWidth:diff!==0?"2px":"1px"}}/>
                                  {diff!==0&&<span style={{fontSize:11,fontWeight:700,padding:"2px 6px",borderRadius:10,background:diff<0?"#fed7aa":"#bbf7d0",color:diff<0?"#9a3412":"#166534"}}>{diff>0?"+":""}{diff}</span>}
                                </div>
                              </td>
                              <td style={s.td}><input type="number" step="0.01" value={deliveredTotals[item.id]||""} onChange={e=>setDeliveredTotals(p=>({...p,[item.id]:e.target.value}))} style={{...s.input,width:120,padding:"5px 6px"}} placeholder="Total from DN"/></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div style={{display:"flex",gap:10,marginTop:10,fontSize:12,flexWrap:"wrap" as const}}>
                    {orderItems.some(i=>(deliveredQtys[i.id]||0)<parseInt(i.ordered_qty||0))&&(
                      <div style={{background:"#fff7ed",border:"1px solid #fb923c",borderRadius:8,padding:"6px 12px",color:"#9a3412",fontWeight:600}}>
                        🟠 {orderItems.filter(i=>(deliveredQtys[i.id]||0)<parseInt(i.ordered_qty||0)).length} item{orderItems.filter(i=>(deliveredQtys[i.id]||0)<parseInt(i.ordered_qty||0)).length!==1?"s":""} short — will trigger partial delivery warning in GR
                      </div>
                    )}
                    {orderItems.some(i=>(deliveredQtys[i.id]||0)>parseInt(i.ordered_qty||0))&&(
                      <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"6px 12px",color:"#166534",fontWeight:600}}>
                        🟢 {orderItems.filter(i=>(deliveredQtys[i.id]||0)>parseInt(i.ordered_qty||0)).length} item{orderItems.filter(i=>(deliveredQtys[i.id]||0)>parseInt(i.ordered_qty||0)).length!==1?"s":""} extra — will trigger extra qty confirmation in GR
                      </div>
                    )}
                    {orderItems.length>0&&orderItems.every(i=>(deliveredQtys[i.id]||0)===parseInt(i.ordered_qty||0))&&(
                      <div style={{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:8,padding:"6px 12px",color:"#065f46",fontWeight:600}}>
                        ✓ All quantities match
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div style={{padding:"14px 24px",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:12,color:"#9ca3af"}}>{selectedOrder?`Order: ${selectedOrder.order_number} · ${orderItems.length} items`:"No order selected"}</span>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
            <button onClick={save} disabled={saving||!selectedOrder||!createdBy.trim()}
              style={{...s.btn("green"),minWidth:160,opacity:saving||!selectedOrder||!createdBy.trim()?0.5:1}}>
              {saving?"Saving...":"✓ Create Purchase Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fulfill Requests Section ──────────────────────────────────────────────
function FulfillRequestsSection({departments,onRefresh}:{departments:any[];onRefresh:()=>void}){
  const [requests,setRequests]=useState<any[]>([]);
  const [expandedId,setExpandedId]=useState<string|null>(null);
  const [itemsMap,setItemsMap]=useState<Record<string,any[]>>({});
  const [sentByMap,setSentByMap]=useState<Record<string,string>>({});
  const [saving,setSaving]=useState<string|null>(null);

  const fetchRequests=useCallback(async()=>{
    const r=await fetch("/api/hospital/transfers?status=REQUESTED");
    const d=await r.json();
    setRequests(Array.isArray(d)?d:[]);
  },[]);

  useEffect(()=>{fetchRequests();},[fetchRequests]);

  const loadItems=async(transferId:string)=>{
    if(itemsMap[transferId])return;
    const r=await fetch(`/api/hospital/transfers/${transferId}`);
    const d=await r.json();
    setItemsMap(m=>({...m,[transferId]:Array.isArray(d)?d:[]}));
  };

  const toggleExpand=async(transferId:string)=>{
    if(expandedId===transferId){setExpandedId(null);return;}
    setExpandedId(transferId);
    await loadItems(transferId);
  };

  const updateQty=(transferId:string,itemId:string,qty:number)=>{
    setItemsMap(m=>({...m,[transferId]:(m[transferId]||[]).map(i=>i.id===itemId?{...i,quantity:Math.max(1,qty)}:i)}));
  };

  const fulfill=async(transfer:any)=>{
    const sentBy=sentByMap[transfer.id]||"";
    if(!sentBy.trim()){alert("Enter your name (Sent By)");return;}
    const items=itemsMap[transfer.id]||[];
    setSaving(transfer.id);
    try{
      await fetch(`/api/hospital/transfers/${transfer.id}`,{
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          status:"PENDING",
          sentBy,
          items:items.map(i=>({id:i.id,quantity:i.quantity})),
        })
      });
      fetchRequests();
      onRefresh();
      setExpandedId(null);
    }finally{setSaving(null);}
  };

  if(!requests.length)return null;

  return(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <span style={{fontSize:13,fontWeight:700,color:"#d97706"}}>📦 Stock Requests from Departments</span>
        <span style={{fontSize:11,fontWeight:600,background:"#fef3c7",color:"#92400e",padding:"2px 8px",borderRadius:20}}>{requests.length} pending</span>
      </div>
      {requests.map(t=>{
        const isExpanded=expandedId===t.id;
        const items=itemsMap[t.id]||[];
        const requester=(t.sent_by||"").replace("REQUEST by ","");
        return(
          <div key={t.id} style={{border:"2px solid #fcd34d",borderRadius:10,marginBottom:10,overflow:"hidden",background:"#fffbeb"}}>
            {/* Request header */}
            <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>toggleExpand(t.id)}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:20}}>📦</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#92400e"}}>
                    {t.department_name} requests {t.item_count??0} item{(t.item_count??0)!==1?"s":""}
                  </div>
                  <div style={{fontSize:12,color:"#b45309",marginTop:1}}>
                    Requested by: <strong>{requester}</strong> · {new Date(t.createdat).toLocaleDateString()}
                    {t.notes&&` · "${t.notes}"`}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:600,background:"#fef3c7",color:"#92400e",padding:"3px 10px",borderRadius:20}}>REQUESTED</span>
                <span style={{fontSize:12,color:"#d97706"}}>{isExpanded?"▲ Hide":"▼ Fulfill"}</span>
              </div>
            </div>

            {/* Expandable fulfill section */}
            {isExpanded&&(
              <div style={{borderTop:"1px solid #fcd34d",padding:"16px"}}>
                {/* Items table with editable quantities */}
                {items.length===0?(
                  <div style={{color:"#9ca3af",fontSize:13,padding:"8px 0"}}>Loading items...</div>
                ):(
                  <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden",marginBottom:14}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{background:"#f9fafb"}}>
                          <th style={{...{padding:"8px 12px",textAlign:"left" as const,fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase" as const}}}>Item</th>
                          <th style={{...{padding:"8px 12px",textAlign:"left" as const,fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase" as const}}}>Requested Qty</th>
                          <th style={{...{padding:"8px 12px",textAlign:"left" as const,fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase" as const}}}>Send Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item=>(
                          <tr key={item.id} style={{borderTop:"1px solid #f3f4f6"}}>
                            <td style={{padding:"10px 12px",fontWeight:600,fontSize:13}}>{item.item_name}</td>
                            <td style={{padding:"10px 12px",color:"#6b7280",fontSize:13}}>{item.quantity}</td>
                            <td style={{padding:"10px 12px"}}>
                              <input
                                type="number" min={1} value={item.quantity}
                                onChange={e=>updateQty(t.id,item.id,parseInt(e.target.value)||1)}
                                style={{width:90,padding:"6px 8px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,textAlign:"center" as const,color:"#111827"}}/>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sent By + Send button */}
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4}}>Sent By (your name) *</label>
                    <input
                      style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,color:"#111827",boxSizing:"border-box" as const}}
                      value={sentByMap[t.id]||""}
                      onChange={e=>setSentByMap(m=>({...m,[t.id]:e.target.value}))}
                      placeholder="Enter your name before sending"/>
                  </div>
                  <div style={{marginTop:20}}>
                    <button
                      disabled={saving===t.id||!items.length}
                      onClick={()=>fulfill(t)}
                      style={{padding:"9px 20px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",border:"none",background:"#16a34a",color:"#fff",opacity:saving===t.id?0.6:1,whiteSpace:"nowrap" as const}}>
                      {saving===t.id?"Sending...":"✓ Send Transfer to "+t.department_name}
                    </button>
                  </div>
                </div>
                <div style={{fontSize:11,color:"#9ca3af",marginTop:8}}>
                  ℹ️ Once sent, the department will see this in their <strong>Receive tab</strong> and can confirm receipt to update their stock.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HospitalPage(){
  type Tab="items"|"stock"|"history"|"manufacturers"|"storage"|"departments"|"transfers"|"uom"|"orders"|"pn"|"gr"|"reports"|"wastage";
  const [tab,setTab]=useState<Tab>("items");
  const [items,setItems]=useState<any[]>([]);
  const [stock,setStock]=useState<any[]>([]);
  const [departments,setDepartments]=useState<any[]>([]);
  const [manufacturers,setManufacturers]=useState<any[]>([]);
  const [storageLocations,setStorageLocations]=useState<any[]>([]);
  const [transfers,setTransfers]=useState<any[]>([]);
  const [history,setHistory]=useState<any[]>([]);
  const [historyTotal,setHistoryTotal]=useState(0);
  const [historyPage,setHistoryPage]=useState(1);
  const [historySearchType,setHistorySearchType]=useState<"item_name"|"item_number"|"order_number">("item_name");
  const [historyQuery,setHistoryQuery]=useState("");
  const [historySearchResults,setHistorySearchResults]=useState<{type:string;results:any[]}|null>(null);
  const [historySearching,setHistorySearching]=useState(false);
  const [historySelectedItem,setHistorySelectedItem]=useState<any|null>(null);
  const [historyItemOrders,setHistoryItemOrders]=useState<any[]>([]);
  const [historyItemOrdersLoading,setHistoryItemOrdersLoading]=useState(false);
  const [historySelectedOrder,setHistorySelectedOrder]=useState<any|null>(null);
  const [historyOrderDetail,setHistoryOrderDetail]=useState<{receipt:any;items:any[]}|null>(null);
  const [historyOrderDetailLoading,setHistoryOrderDetailLoading]=useState(false);
  const [reports,setReports]=useState<any[]>([]);
  const [reportType,setReportType]=useState<"stock"|"consumption">("stock");
  const [hospitalOrders,setHospitalOrders]=useState<any[]>([]);
  const [goodsReceipts,setGoodsReceipts]=useState<any[]>([]);
  const [purchaseNotes,setPurchaseNotes]=useState<any[]>([]);
  const [showPurchaseNoteModal,setShowPurchaseNoteModal]=useState(false);
  const [pnStatusFilter,setPnStatusFilter]=useState('ALL');
  const [orderStatusFilter,setOrderStatusFilter]=useState('ALL');
  const [orderSearch,setOrderSearch]=useState('');
  const [grStatusFilter,setGrStatusFilter]=useState('ALL');
  const [showOrderModal,setShowOrderModal]=useState(false);
  const [preselectedItem,setPreselectedItem]=useState<any>(null);
  const [orderCart,setOrderCart]=useState<any[]>([]);
  const [showGRModal,setShowGRModal]=useState(false);
  const [showNewGRModal,setShowNewGRModal]=useState(false);
  const [pNForGR,setPNForGR]=useState<any>(null);
  const [viewPNDetail,setViewPNDetail]=useState<any>(null);
  const [viewOrderId,setViewOrderId]=useState<string|null>(null);
  const [viewOrderDetail,setViewOrderDetail]=useState<any>(null);
  const [viewGRId,setViewGRId]=useState<string|null>(null);
  const [viewGRDetail,setViewGRDetail]=useState<any>(null);
  const [tibbnaSuppliers,setTibbnaSuppliers]=useState<any[]>([]);
  const [showAddItem,setShowAddItem]=useState(false);
  const [uomConversions,setUomConversions]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [itemSearch,setItemSearch]=useState('');
  const [search,setSearch]=useState("");
  const [page,setPage]=useState(1); const PAGE_SIZE=15;
  const [transferStatus,setTransferStatus]=useState("ALL");
  const [toast,setToast]=useState("");
  // Modals
  const [showTransfer,setShowTransfer]=useState(false);
  const [viewItem,setViewItem]=useState<any>(null);
  const [editItem,setEditItem]=useState<any>(null);
  // PR cart
  // Shop cart
  // Manufacturers CRUD
  const [mfrForm,setMfrForm]=useState({name:"",code:"",country:"",contact_name:"",email:"",phone:"",product_types:""});
  const [editMfr,setEditMfr]=useState<any>(null);
  const [showAddMfr,setShowAddMfr]=useState(false);
  // Storage CRUD
  const [storageForm,setStorageForm]=useState({name:"",department_id:"",location:"",type:"shelf",temperature:"",notes:""});
  const [editStorage,setEditStorage]=useState<any>(null);
  const [storageSearch,setStorageSearch]=useState("");
  // Departments CRUD
  const [deptForm,setDeptForm]=useState({name:"",type:"general",location:"",manager:"",notes:""});
  const [editDept,setEditDept]=useState<any>(null);
  const [deptSearch,setDeptSearch]=useState("");
  // UOM
  const [uomModal,setUomModal]=useState<"add"|"edit"|null>(null);
  const [uomRow,setUomRow]=useState<any>(null);
  const [uomForm,setUomForm]=useState({from_uom:"",to_uom:"",factor:""});
  // Stock edit
  const [editStockItem,setEditStockItem]=useState<any>(null);
  const [editStockForm,setEditStockForm]=useState({name:"",generic_name:"",uom:"",unit_cost:"",selling_price:"",reorder_level:"",quantity:""});

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(""),3000);};

  const fetchItems=useCallback(async()=>{setLoading(true);try{const r=await fetch(`/api/hospital/items?search=${encodeURIComponent(search)}`);const d=await r.json();setItems(Array.isArray(d)?d:[]);}catch(e){console.error('fetchItems error:',e);}finally{setLoading(false);}},[search]);
  const fetchStock=useCallback(async()=>{try{const r=await fetch("/api/hospital/stock");const d=await r.json();setStock(Array.isArray(d)?d:[]);}catch(e){console.error('fetchStock:',e);}},[]);
  const fetchDepartments=useCallback(async()=>{try{const r=await fetch("/api/hospital/departments");const d=await r.json();setDepartments(Array.isArray(d)?d:[]);}catch(e){console.error("fetchDepartments:",e);}},[]);
  const fetchManufacturers=useCallback(async()=>{try{const r=await fetch("/api/hospital/manufacturers");const d=await r.json();setManufacturers(Array.isArray(d)?d:[]);}catch(e){console.error('fetchMfr:',e);}},[]);
  const fetchStorage=useCallback(async()=>{const r=await fetch("/api/hospital/storage");const d=await r.json();setStorageLocations(Array.isArray(d)?d:[]);},[]);
  const fetchTransfers=useCallback(async()=>{const r=await fetch(`/api/hospital/transfers?status=${transferStatus==="ALL"?"":transferStatus}`);const d=await r.json();setTransfers(Array.isArray(d)?d:[]);},[transferStatus]);
  const fetchHistory=useCallback(async()=>{const r=await fetch(`/api/hospital/history?page=${historyPage}`);const d=await r.json();setHistory(d.rows??[]);setHistoryTotal(d.total??0);},[historyPage]);
  const searchHistoryOrders=useCallback(async()=>{if(!historyQuery.trim())return;setHistorySearching(true);setHistorySearchResults(null);setHistorySelectedItem(null);setHistoryItemOrders([]);try{const r=await fetch(`/api/hospital/history/search?type=${historySearchType}&q=${encodeURIComponent(historyQuery)}`);const d=await r.json();setHistorySearchResults(d);}finally{setHistorySearching(false);}},[historyQuery,historySearchType]);
  const fetchItemOrders=useCallback(async(itemId:string)=>{setHistoryItemOrdersLoading(true);try{const r=await fetch(`/api/hospital/history/item-orders?item_id=${itemId}`);const d=await r.json();setHistoryItemOrders(Array.isArray(d)?d:[]);}finally{setHistoryItemOrdersLoading(false);}},[]);
  const fetchOrderDetail=useCallback(async(receiptId:string)=>{setHistoryOrderDetailLoading(true);try{const r=await fetch(`/api/hospital/goods-receipt/${receiptId}`);const d=await r.json();setHistoryOrderDetail(d);}finally{setHistoryOrderDetailLoading(false);}},[]);
  const fetchReports=useCallback(async()=>{const r=await fetch(`/api/hospital/reports?type=${reportType}`);const d=await r.json();setReports(Array.isArray(d)?d:[]);},[reportType]);
  const fetchTibbnaSuppliers=useCallback(async()=>{try{const r=await fetch("/api/tibbna/suppliers");const d=await r.json();setTibbnaSuppliers(Array.isArray(d)?d:[]);}catch(e){console.error('fetchSuppliers:',e);}},[]);
  const fetchTibbnaDepartments=useCallback(async()=>{try{const r=await fetch("/api/hospital/departments");const d=await r.json();setDepartments(Array.isArray(d)?d:[]);}catch(e){console.error("fetchDepts:",e);}},[]);
  const addToOrderCart=(item:any)=>{setOrderCart(c=>{if(c.find((i:any)=>i.id===item.id)){showToast(`${item.name} already in cart`);return c;}showToast(`${item.name} added to order cart`);return[...c,{...item,qty:1,unitCost:String(item.unit_cost||'')}];});};
  const fetchHospitalOrders=useCallback(async()=>{try{const r=await fetch(`/api/hospital/orders?status=${orderStatusFilter==="ALL"?"":orderStatusFilter}`);const d=await r.json();setHospitalOrders(Array.isArray(d)?d:[]);}catch(e){console.error(e);}},[orderStatusFilter]);
  const fetchPurchaseNotes=useCallback(async()=>{try{const r=await fetch(`/api/hospital/purchase-notes?status=${pnStatusFilter==="ALL"?"":pnStatusFilter}`);const d=await r.json();setPurchaseNotes(Array.isArray(d)?d:[]);}catch(e){console.error(e);}},[pnStatusFilter]);
  const fetchGoodsReceipts=useCallback(async()=>{try{const r=await fetch(`/api/hospital/goods-receipt?status=${grStatusFilter==="ALL"?"":grStatusFilter}`);const d=await r.json();setGoodsReceipts(Array.isArray(d)?d:[]);}catch(e){console.error(e);}},[grStatusFilter]);
  const fetchUom=useCallback(async()=>{const r=await fetch("/api/uom");const d=await r.json();setUomConversions(Array.isArray(d)?d:[]);},[]);

  useEffect(()=>{fetchItems();},[fetchItems]);
  useEffect(()=>{fetchManufacturers();},[fetchManufacturers]);
  useEffect(()=>{fetchTibbnaSuppliers();},[fetchTibbnaSuppliers]);
  useEffect(()=>{fetchTibbnaDepartments();},[fetchTibbnaDepartments]);
  useEffect(()=>{if(tab==="stock")fetchStock();},[tab,fetchStock]);
  useEffect(()=>{if(tab==="storage")fetchStorage();},[tab,fetchStorage]);
  useEffect(()=>{if(tab==="transfers")fetchTransfers();},[tab,transferStatus,fetchTransfers]);
  useEffect(()=>{if(tab==="history")fetchHistory();},[tab,historyPage,fetchHistory]);
  useEffect(()=>{if(tab==="reports")fetchReports();},[tab,reportType,fetchReports]);
  useEffect(()=>{if(tab==="uom")fetchUom();},[tab,fetchUom]);
  useEffect(()=>{if(tab==="orders")fetchHospitalOrders();},[tab,orderStatusFilter,fetchHospitalOrders]);
  useEffect(()=>{if(tab==="gr")fetchGoodsReceipts();},[tab,grStatusFilter,fetchGoodsReceipts]);
  useEffect(()=>{if(tab==="gr")fetchPurchaseNotes();},[tab,pnStatusFilter,fetchPurchaseNotes]);
  // Wastage
  const [wastageRecords,setWastageRecords]=useState<any[]>([]);
  const [wastageLoading,setWastageLoading]=useState(false);
  const [showWastageModal,setShowWastageModal]=useState(false);
  const [wastageForm,setWastageForm]=useState({itemId:"",itemName:"",departmentId:"",quantity:"",type:"WASTAGE",reason:"",batchNumber:"",recordedBy:"",notes:""});
  const [wastageSearch,setWastageSearch]=useState("");
  const fetchWastage=useCallback(async()=>{setWastageLoading(true);try{const r=await fetch("/api/hospital/wastage");const d=await r.json();setWastageRecords(Array.isArray(d)?d:[]);}catch(e){console.error(e);}finally{setWastageLoading(false);}},[]);
  useEffect(()=>{if(tab==="wastage")fetchWastage();},[tab,fetchWastage]);



  const totalItems=items.length;
  const lowStock=items.filter(i=>parseInt(i.total_stock||0)>0&&parseInt(i.total_stock||0)<=parseInt(i.reorder_level||0)).length;
  const outOfStock=items.filter(i=>parseInt(i.total_stock||0)===0).length;
  const totalDepts=departments.length;
  const pendingOrders=hospitalOrders.filter((o:any)=>o.status==="PENDING").length;

  const tabLabels:Record<Tab,string>={
    items:`Items (${totalItems})`,stock:"Stock",history:"History",
    manufacturers:"🏭 Manufacturers",storage:"📍 Storage",
    departments:`🏥 Depts (${totalDepts})`,
    transfers:`🔄 Transfers${transfers.filter(t=>t.status==="PENDING").length>0?` (${transfers.filter(t=>t.status==="PENDING").length})`:""}`,
    uom:"UOM",
    orders:`📋 Create Order${orderCart.length>0?" ("+orderCart.length+")":""}`,
    pn:"📄 Purchase Notes",gr:"📥 Goods Receipt",reports:"📊 Reports",wastage:"🗑️ Wastage",
  };

  return(
    <div style={s.page}>
      <style>{`* { box-sizing: border-box; } input, select, textarea { color: #111827 !important; } tr:hover td { background: #f9fafb; }`}</style>

      {/* Header */}
      <div style={s.header}>
        <Link href="/" style={{display:"flex",alignItems:"center",color:"#6b7280",textDecoration:"none"}}><Icon d={icons.back} size={15}/></Link>
        <div style={{width:1,height:20,background:"#e5e7eb"}}/>
        <div style={{width:32,height:32,background:"#dbeafe",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>🏥</div>
        <span style={{fontSize:14,fontWeight:700}}>Hospital Inventory</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={()=>{fetchItems();fetchDepartments();}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:5}}><Icon d={icons.refresh} size={13} color="#374151"/></button>
          <button onClick={()=>setShowTransfer(true)} style={{...s.btn("blue"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.transfer} size={13} color="#fff"/> Transfer</button>
          <button onClick={()=>setShowAddItem(true)} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Add Item</button>

        </div>
      </div>

      <div style={{...s.content,marginTop:8}}>
        {/* Summary Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[{label:"Total Items",value:totalItems,color:"#6366f1",bg:"#eef2ff"},{label:"Low Stock",value:lowStock,color:"#d97706",bg:"#fef3c7"},{label:"Out of Stock",value:outOfStock,color:"#dc2626",bg:"#fee2e2"},{label:"Departments",value:totalDepts,color:"#0891b2",bg:"#e0f2fe"}].map(m=>(
            <div key={m.label} style={{background:m.bg,borderRadius:10,padding:"14px 18px"}}>
              <div style={{fontSize:11,fontWeight:600,color:m.color,marginBottom:4}}>{m.label}</div>
              <div style={{fontSize:28,fontWeight:700}}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Dept quick nav */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" as const}}>
          {departments.map(dept=>{
            const dc=DEPT_COLORS[dept.type]??DEPT_COLORS.general;
            return(
              <Link key={dept.id} href={`/hospital/${dept.id}`} style={{textDecoration:"none"}}>
                <div style={{background:dc.bg,color:dc.color,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",border:`1px solid ${dc.bg}`}} onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.1)")} onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>
                  <span style={{fontSize:18}}>{dc.icon}</span>
                  <div><div style={{fontWeight:700,fontSize:13}}>{dept.name}</div><div style={{fontSize:11,opacity:0.8}}>{dept.item_count??0} items · {dept.type}</div></div>
                  <Icon d={icons.arrow} size={14} color={dc.color}/>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {(Object.keys(tabLabels) as Tab[]).map(t=>(<button key={t} style={s.tab(tab===t)} onClick={()=>setTab(t)}>{tabLabels[t]}</button>))}
        </div>

        {/* ── ITEMS TAB ──────────────────────────────────────────────────── */}
        {tab==="items"&&(
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:8,alignItems:"center"}}>
              <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                <div style={{position:"absolute",left:10,pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                <input placeholder="Search items..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{...s.input,width:260,paddingLeft:30}}/>
              </div>
              <div style={{position:"relative",display:"flex",alignItems:"center",marginLeft:8}}>
                <div style={{position:"absolute",left:10,pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                <input placeholder="Filter by type, storage..." value={itemSearch} onChange={e=>setItemSearch(e.target.value)} style={{...s.input,width:200,paddingLeft:30,fontSize:12}}/>
              </div>
              <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{items.length} items</span>
            </div>
            {loading?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>
            :items.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No items. <button onClick={()=>setShowAddItem(true)} style={{color:"#6366f1",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Add one →</button></div>
            :<>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","Type","UOM","Stock","Unit Cost","Storage","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {items.filter((item:any)=>!itemSearch||(item.itemtype||'').toLowerCase().includes(itemSearch.toLowerCase())||(item.storage_location||'').toLowerCase().includes(itemSearch.toLowerCase())||(item.manufacturer||'').toLowerCase().includes(itemSearch.toLowerCase())).slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(item=>{
                      const stc=sc(parseInt(item.total_stock||0),parseInt(item.reorder_level||0));
                      return(
                        <tr key={item.id}>
                          <td style={{...s.td,minWidth:160}}><div style={{fontWeight:600}}>{item.name}</div>{item.generic_name&&<div style={{fontSize:11,color:"#9ca3af"}}>{item.generic_name}</div>}</td>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{item.itemcode}</td>
                          <td style={s.td}><span style={s.badge("#f3f4f6","#374151")}>{item.itemtype}</span></td>
                          <td style={s.td}>{item.uom}</td>
                          <td style={s.td}><span style={s.badge(stc.bg,stc.color)}>{item.total_stock??0} · {stc.label}</span></td>
                          <td style={s.td}>{item.unit_cost?`$${parseFloat(item.unit_cost).toFixed(2)}`:"—"}</td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{item.storage_location||"—"}</td>
                          <td style={s.td}>
                            <div style={{display:"flex",gap:4}}>
                              <button onClick={()=>setViewItem(item)} style={{background:"#eff6ff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}} title="View + Batches"><Icon d={icons.eye} size={12} color="#2563eb"/></button>
                              <button onClick={()=>addToOrderCart(item)} style={{background:"#fef3c7",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:11,fontWeight:700,color:"#92400e"}} title="Add to order cart">🛒+</button>
                              <button onClick={()=>{setEditItem(item);setEditStockForm({name:item.name,generic_name:item.generic_name??"",uom:item.uom,unit_cost:item.unit_cost??"",selling_price:item.selling_price??"",reorder_level:item.reorder_level??"",quantity:item.total_stock??""});}} style={{background:"#f0fdf4",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}} title="Edit"><Icon d={icons.edit} size={12} color="#16a34a"/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {items.length>PAGE_SIZE&&(<div style={{padding:"12px 16px",borderTop:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:"#6b7280"}}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,items.length)} of {items.length}</span><div style={{display:"flex",gap:4}}><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:12,cursor:"pointer",background:"#fff"}}>← Prev</button><button onClick={()=>setPage(p=>p+1)} disabled={page*PAGE_SIZE>=items.length} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #e5e7eb",fontSize:12,cursor:"pointer",background:"#fff"}}>Next →</button></div></div>)}
            </>}
          </div>
        )}

        {/* ── STOCK TAB ─────────────────────────────────────────────────── */}
        {tab==="stock"&&(
          <>
            {editItem&&(
              <div style={s.overlay}><div style={{...s.modal,width:520}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <h3 style={{fontSize:16,fontWeight:600,margin:0}}>Edit Item — {editItem.name}</h3>
                  <button onClick={()=>setEditItem(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Name</label><input style={s.input} value={editStockForm.name} onChange={e=>setEditStockForm(f=>({...f,name:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Generic Name</label><input style={s.input} value={editStockForm.generic_name} onChange={e=>setEditStockForm(f=>({...f,generic_name:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>UOM</label><input style={s.input} value={editStockForm.uom} onChange={e=>setEditStockForm(f=>({...f,uom:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Unit Cost</label><input type="number" step="0.01" style={s.input} value={editStockForm.unit_cost} onChange={e=>setEditStockForm(f=>({...f,unit_cost:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Selling Price</label><input type="number" step="0.01" style={s.input} value={editStockForm.selling_price} onChange={e=>setEditStockForm(f=>({...f,selling_price:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Reorder Level</label><input type="number" style={s.input} value={editStockForm.reorder_level} onChange={e=>setEditStockForm(f=>({...f,reorder_level:e.target.value}))}/></div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
                  <button onClick={()=>setEditItem(null)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                  <button onClick={async()=>{await fetch(`/api/hospital/items/${editItem.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...editItem,...editStockForm})});setEditItem(null);fetchItems();fetchStock();showToast("Updated!");}} style={s.btn("purple")}>Save</button>
                </div>
              </div></div>
            )}
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:13,fontWeight:600}}>Stock Overview — All Departments</span>
                <button onClick={fetchStock} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",fontSize:12}}>Refresh</button>
              </div>
              {stock.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No stock data yet</div>:(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Item","Code","Department","Stock","Available","Reorder","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {stock.map((row:any,i:number)=>{
                        const avail=parseInt(row.quantity||0)-parseInt(row.reserved_quantity||0);
                        const stc=sc(avail,parseInt(row.reorder_level||0));
                        return(
                          <tr key={i}>
                            <td style={{...s.td,fontWeight:600}}>{row.name}</td>
                            <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{row.itemcode}</td>
                            <td style={s.td}><span style={s.badge(row.department_name?"#eef2ff":"#f0fdf4",row.department_name?"#6366f1":"#16a34a")}>{row.department_name??"🏥 Central Store"}</span></td>
                            <td style={{...s.td,fontWeight:700}}>{row.quantity||0}</td>
                            <td style={{...s.td,fontWeight:700,color:stc.color}}>{avail}</td>
                            <td style={{...s.td,color:"#6b7280"}}>{row.reorder_level||0}</td>
                            <td style={s.td}><span style={s.badge(stc.bg,stc.color)}>{stc.label}</span></td>
                            <td style={s.td}><div style={{display:"flex",gap:4}}>
                              <button onClick={()=>{setEditItem(row);setEditStockForm({name:row.name,generic_name:row.generic_name??"",uom:row.uom,unit_cost:row.unit_cost??"",selling_price:row.selling_price??"",reorder_level:row.reorder_level??"",quantity:row.quantity??""});}} style={{background:"#f0fdf4",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}><Icon d={icons.edit} size={12} color="#16a34a"/></button>
                              <button onClick={()=>addToOrderCart(row)} style={{background:"#fef3c7",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:10,fontWeight:700,color:"#92400e"}}>🛒+</button>
                            </div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── HISTORY TAB ───────────────────────────────────────────────── */}
        {tab==="history"&&(<>
          {/* ── Order History Search ────────────────────────────────────── */}
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" as const}}>
              <span style={{fontSize:13,fontWeight:600}}>Order History Search</span>
            </div>
            <div style={{padding:16}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                <select style={{...s.input,width:160,flexShrink:0}} value={historySearchType} onChange={e=>setHistorySearchType(e.target.value as any)}>
                  <option value="item_name">Item Name</option>
                  <option value="item_number">Item Code</option>
                  <option value="order_number">Order Number</option>
                </select>
                <input style={{...s.input,flex:1,minWidth:200}} placeholder={historySearchType==="order_number"?"e.g. ORD-12345678":historySearchType==="item_number"?"e.g. HSP-0001":"e.g. Amoxicillin"} value={historyQuery} onChange={e=>setHistoryQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")searchHistoryOrders();}}/>
                <button style={s.btn("purple")} onClick={searchHistoryOrders} disabled={historySearching}>{historySearching?"Searching…":"Search"}</button>
                {(historySearchResults||historySelectedItem)&&(<button style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}} onClick={()=>{setHistorySearchResults(null);setHistorySelectedItem(null);setHistoryItemOrders([]);setHistoryQuery("");}}>Clear</button>)}
              </div>
            </div>

            {/* Search results: list of items */}
            {historySearchResults?.type==="item"&&!historySelectedItem&&(
              <div style={{padding:"0 16px 16px"}}>
                {historySearchResults.results.length===0?<div style={{color:"#9ca3af",fontSize:13}}>No items found.</div>:(
                  <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
                    {historySearchResults.results.map((item:any)=>(
                      <div key={item.id} onClick={()=>{setHistorySelectedItem(item);fetchItemOrders(item.id);}} style={{padding:"10px 14px",borderRadius:8,border:"1px solid #e5e7eb",cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:"#fafafa"}} onMouseEnter={e=>(e.currentTarget.style.background="#eef2ff")} onMouseLeave={e=>(e.currentTarget.style.background="#fafafa")}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13}}>{item.name}</div>
                          {item.generic_name&&<div style={{fontSize:12,color:"#6b7280"}}>{item.generic_name}</div>}
                        </div>
                        <span style={s.badge("#eef2ff","#6366f1")}>{item.itemcode??"-"}</span>
                        <span style={s.badge("#f3f4f6","#374151")}>{item.itemtype}</span>
                        <span style={{fontSize:12,color:"#9ca3af"}}>→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search results: direct order match */}
            {historySearchResults?.type==="order"&&(
              <div style={{padding:"0 16px 16px"}}>
                {historySearchResults.results.length===0?<div style={{color:"#9ca3af",fontSize:13}}>No orders found.</div>:(
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>{["Order No","Date","Supplier","Ordered By","Status","Items",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {historySearchResults.results.map((o:any)=>(
                          <tr key={o.id} style={{cursor:"pointer"}} onClick={()=>setHistorySelectedOrder(o)} onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                            <td style={{...s.td,fontFamily:"monospace",fontWeight:600}}>{o.order_number}</td>
                            <td style={{...s.td,fontSize:12}}>{o.order_date?new Date(o.order_date).toLocaleDateString():"—"}</td>
                            <td style={s.td}>{o.supplier_name??"—"}</td>
                            <td style={s.td}>{o.ordered_by??"—"}</td>
                            <td style={s.td}><span style={s.badge(statusColors[o.status]?.bg??"#f3f4f6",statusColors[o.status]?.color??"#374151")}>{o.status}</span></td>
                            <td style={{...s.td,color:"#6b7280"}}>{o.item_count??0} items</td>
                            <td style={s.td}><button style={s.btn("purple")} onClick={e=>{e.stopPropagation();setHistorySelectedOrder(o);}}>View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Item orders table */}
            {historySelectedItem&&(
              <div style={{padding:"0 16px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <button style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:4}} onClick={()=>{setHistorySelectedItem(null);setHistoryItemOrders([]);}}>← Back</button>
                  <div>
                    <span style={{fontWeight:600,fontSize:13}}>{historySelectedItem.name}</span>
                    {historySelectedItem.itemcode&&<span style={{...s.badge("#eef2ff","#6366f1"),marginLeft:8}}>{historySelectedItem.itemcode}</span>}
                  </div>
                </div>
                {historyItemOrdersLoading?<div style={{padding:24,textAlign:"center",color:"#9ca3af"}}>Loading orders…</div>:historyItemOrders.length===0?<div style={{padding:24,textAlign:"center",color:"#9ca3af"}}>No orders found for this item.</div>:(
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>{["Order No","Order Date","Receiving Date","Registered By","Qty Ordered","Qty Received","Store","Supplier",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {historyItemOrders.map((row:any,i:number)=>(
                          <tr key={i} style={{cursor:row.receipt_id?"pointer":"default"}} onMouseEnter={e=>{if(row.receipt_id)e.currentTarget.style.background="#f9fafb";}} onMouseLeave={e=>(e.currentTarget.style.background="")} onClick={()=>{if(row.receipt_id){setHistorySelectedOrder(row);fetchOrderDetail(row.receipt_id);}}}>
                            <td style={{...s.td,fontFamily:"monospace",fontWeight:600}}>{row.order_number??"—"}</td>
                            <td style={{...s.td,fontSize:12}}>{row.order_date?new Date(row.order_date).toLocaleDateString():"—"}</td>
                            <td style={{...s.td,fontSize:12}}>{row.receipt_date?new Date(row.receipt_date).toLocaleDateString():"Not received"}</td>
                            <td style={s.td}>{row.ordered_by??"—"}</td>
                            <td style={{...s.td,fontWeight:700}}>{row.ordered_qty??0} {row.uom}</td>
                            <td style={{...s.td,fontWeight:700,color:row.received_qty>0?"#16a34a":"#9ca3af"}}>{row.received_qty??0}</td>
                            <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{row.store_name??"—"}</td>
                            <td style={s.td}>{row.supplier_name??"—"}</td>
                            <td style={s.td}>{row.receipt_id&&<button style={s.btn("purple")} onClick={e=>{e.stopPropagation();setHistorySelectedOrder(row);fetchOrderDetail(row.receipt_id);}}>View GRN</button>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Order / GRN Detail Modal ────────────────────────────────── */}
          {historySelectedOrder&&(
            <div style={s.overlay} onClick={()=>{setHistorySelectedOrder(null);setHistoryOrderDetail(null);}}>
              <div style={{...s.modal,width:780,maxHeight:"88vh",overflowY:"auto" as const,padding:0}} onClick={e=>e.stopPropagation()}>
                <div style={{padding:"16px 20px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:15,fontWeight:700}}>Order Detail</span>
                    <span style={{...s.badge("#eef2ff","#6366f1"),marginLeft:10,fontFamily:"monospace"}}>{historySelectedOrder.order_number}</span>
                  </div>
                  <button onClick={()=>{setHistorySelectedOrder(null);setHistoryOrderDetail(null);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#6b7280"}}>✕</button>
                </div>

                {/* Order info */}
                <div style={{padding:"16px 20px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,borderBottom:"1px solid #f3f4f6"}}>
                  <div><div style={s.label}>Ordered By</div><div style={{fontSize:13}}>{historySelectedOrder.ordered_by??historySelectedOrder.receipt_received_by??"—"}</div></div>
                  <div><div style={s.label}>Order Date</div><div style={{fontSize:13}}>{historySelectedOrder.order_date?new Date(historySelectedOrder.order_date).toLocaleDateString():"—"}</div></div>
                  <div><div style={s.label}>Supplier</div><div style={{fontSize:13}}>{historySelectedOrder.supplier_name??"—"}</div></div>
                  <div><div style={s.label}>Status</div><div><span style={s.badge(statusColors[historySelectedOrder.order_status??historySelectedOrder.status]?.bg??"#f3f4f6",statusColors[historySelectedOrder.order_status??historySelectedOrder.status]?.color??"#374151")}>{historySelectedOrder.order_status??historySelectedOrder.status??"—"}</span></div></div>
                  <div><div style={s.label}>Store</div><div style={{fontSize:13}}>{historySelectedOrder.store_name??"—"}</div></div>
                  {historySelectedOrder.receipt_number&&<div><div style={s.label}>Receipt No</div><div style={{fontFamily:"monospace",fontSize:13}}>{historySelectedOrder.receipt_number}</div></div>}
                  {historySelectedOrder.receipt_date&&<div><div style={s.label}>Received Date</div><div style={{fontSize:13}}>{new Date(historySelectedOrder.receipt_date).toLocaleDateString()}</div></div>}
                  {historySelectedOrder.receipt_received_by&&<div><div style={s.label}>Received By</div><div style={{fontSize:13}}>{historySelectedOrder.receipt_received_by}</div></div>}
                </div>

                {/* GRN delivery details */}
                {historyOrderDetailLoading&&<div style={{padding:32,textAlign:"center",color:"#9ca3af"}}>Loading delivery details…</div>}
                {historyOrderDetail&&(
                  <div style={{padding:"16px 20px"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:"#374151"}}>Delivery Details (Goods Receipt)</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14,background:"#f9fafb",borderRadius:8,padding:12}}>
                      <div><div style={s.label}>Receipt Number</div><div style={{fontFamily:"monospace",fontSize:13}}>{historyOrderDetail.receipt?.receipt_number??"—"}</div></div>
                      <div><div style={s.label}>Supplier</div><div style={{fontSize:13}}>{historyOrderDetail.receipt?.supplier_name??"—"}</div></div>
                      <div><div style={s.label}>Received By</div><div style={{fontSize:13}}>{historyOrderDetail.receipt?.received_by??"—"}</div></div>
                      <div><div style={s.label}>Receipt Date</div><div style={{fontSize:13}}>{historyOrderDetail.receipt?.receipt_date?new Date(historyOrderDetail.receipt.receipt_date).toLocaleDateString():"—"}</div></div>
                      <div><div style={s.label}>Status</div><div><span style={s.badge(statusColors[historyOrderDetail.receipt?.status]?.bg??"#f3f4f6",statusColors[historyOrderDetail.receipt?.status]?.color??"#374151")}>{historyOrderDetail.receipt?.status??"—"}</span></div></div>
                      {historyOrderDetail.receipt?.notes&&<div style={{gridColumn:"1/-1"}}><div style={s.label}>Notes</div><div style={{fontSize:13,color:"#6b7280"}}>{historyOrderDetail.receipt.notes}</div></div>}
                    </div>
                    {historyOrderDetail.items?.length>0&&(<>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:8,color:"#374151"}}>Items Received</div>
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse"}}>
                          <thead><tr>{["Item","UOM","Ordered","Received","Unit Cost","Batch","Lot","Expiry"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                          <tbody>
                            {historyOrderDetail.items.map((it:any,i:number)=>(
                              <tr key={i}>
                                <td style={{...s.td,fontWeight:600}}>{it.item_name??"—"}</td>
                                <td style={s.td}>{it.uom??"—"}</td>
                                <td style={s.td}>{it.ordered_qty??0}</td>
                                <td style={{...s.td,fontWeight:700,color:it.received_qty>0?"#16a34a":"#9ca3af"}}>{it.received_qty??0}</td>
                                <td style={s.td}>{it.unit_cost?`$${parseFloat(it.unit_cost).toFixed(2)}`:"—"}</td>
                                <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{it.batch_number??"—"}</td>
                                <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{it.lot_number??"—"}</td>
                                <td style={{...s.td,fontSize:12}}>{it.expiry_date?new Date(it.expiry_date).toLocaleDateString():"—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>)}
                  </div>
                )}
                {!historyOrderDetailLoading&&!historyOrderDetail&&historySelectedOrder.receipt_id===undefined&&(
                  <div style={{padding:24,textAlign:"center",color:"#9ca3af",fontSize:13}}>No goods receipt recorded for this order yet.</div>
                )}
              </div>
            </div>
          )}

          {/* ── Stock Transaction Log ───────────────────────────────────── */}
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" as const}}>
              <span style={{fontSize:13,fontWeight:600}}>Stock Transaction Log</span>
              <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{historyTotal} total</span>
            </div>
            {history.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No history yet</div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Action","Qty","Department","Reference","By","Date"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {history.map((h:any)=>{
                      const colorMap:Record<string,[string,string]>={STOCK_IN:["#d1fae5","#065f46"],STOCK_OUT:["#fee2e2","#991b1b"],TRANSFER:["#dbeafe","#1d4ed8"],DISPENSE:["#ede9fe","#5b21b6"]};
                      const [bg,color]=colorMap[h.action_type]??["#f3f4f6","#374151"];
                      return(<tr key={h.id}><td style={{...s.td,fontWeight:600}}>{h.item_name??"—"}</td><td style={s.td}><span style={s.badge(bg,color)}>{h.action_type}</span></td><td style={{...s.td,fontWeight:700,color:h.action_type==="STOCK_IN"||h.action_type==="TRANSFER"?"#16a34a":"#dc2626"}}>{h.action_type==="STOCK_IN"||h.action_type==="TRANSFER"?"+":"-"}{h.quantity}</td><td style={{...s.td,fontSize:12,color:"#6b7280"}}>{h.department_name??"—"}</td><td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{h.reference_id??"—"}</td><td style={s.td}>{h.created_by??"—"}</td><td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(h.createdat).toLocaleDateString()}</td></tr>);
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>)}

        {/* ── MANUFACTURERS TAB ─────────────────────────────────────────── */}
        {tab==="manufacturers"&&(
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600}}>Hospital Manufacturers</span>
              <span style={{fontSize:12,color:"#9ca3af"}}>{manufacturers.length} manufacturers</span>
              <div style={{marginLeft:"auto"}}><button onClick={()=>setShowAddMfr(v=>!v)} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Add</button></div>
            </div>
            {showAddMfr&&(
              <div style={{padding:16,background:"#f9fafb",borderBottom:"1px solid #f3f4f6"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  <div><label style={s.label}>Name *</label><input style={s.input} value={mfrForm.name} onChange={e=>setMfrForm(f=>({...f,name:e.target.value}))}/></div>
                  <div><label style={s.label}>Code</label><input style={s.input} value={mfrForm.code} onChange={e=>setMfrForm(f=>({...f,code:e.target.value}))}/></div>
                  <div><label style={s.label}>Country</label><input style={s.input} value={mfrForm.country} onChange={e=>setMfrForm(f=>({...f,country:e.target.value}))}/></div>
                  <div><label style={s.label}>Contact</label><input style={s.input} value={mfrForm.contact_name} onChange={e=>setMfrForm(f=>({...f,contact_name:e.target.value}))}/></div>
                  <div><label style={s.label}>Email</label><input style={s.input} value={mfrForm.email} onChange={e=>setMfrForm(f=>({...f,email:e.target.value}))}/></div>
                  <div><label style={s.label}>Product Types</label><input style={s.input} value={mfrForm.product_types} onChange={e=>setMfrForm(f=>({...f,product_types:e.target.value}))}/></div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button onClick={async()=>{if(!mfrForm.name.trim())return;const res=await fetch("/api/hospital/manufacturers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mfrForm)});if(res.ok){setShowAddMfr(false);setMfrForm({name:"",code:"",country:"",contact_name:"",email:"",phone:"",product_types:""});fetchManufacturers();showToast("Added!");}}} style={s.btn("purple")}>Save</button>
                  <button onClick={()=>setShowAddMfr(false)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                </div>
              </div>
            )}
            {editMfr&&(
              <div style={s.overlay}><div style={{...s.modal,width:520}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h3 style={{fontSize:16,fontWeight:600,margin:0}}>Edit Manufacturer</h3><button onClick={()=>setEditMfr(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={s.label}>Name</label><input style={s.input} value={editMfr.name} onChange={e=>setEditMfr((f:any)=>({...f,name:e.target.value}))}/></div>
                  <div><label style={s.label}>Code</label><input style={s.input} value={editMfr.code??""} onChange={e=>setEditMfr((f:any)=>({...f,code:e.target.value}))}/></div>
                  <div><label style={s.label}>Country</label><input style={s.input} value={editMfr.country??""} onChange={e=>setEditMfr((f:any)=>({...f,country:e.target.value}))}/></div>
                  <div><label style={s.label}>Contact</label><input style={s.input} value={editMfr.contact_name??""} onChange={e=>setEditMfr((f:any)=>({...f,contact_name:e.target.value}))}/></div>
                  <div><label style={s.label}>Email</label><input style={s.input} value={editMfr.email??""} onChange={e=>setEditMfr((f:any)=>({...f,email:e.target.value}))}/></div>
                  <div><label style={s.label}>Product Types</label><input style={s.input} value={editMfr.product_types??""} onChange={e=>setEditMfr((f:any)=>({...f,product_types:e.target.value}))}/></div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
                  <button onClick={()=>setEditMfr(null)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                  <button onClick={async()=>{await fetch("/api/hospital/manufacturers",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(editMfr)});setEditMfr(null);fetchManufacturers();showToast("Updated!");}} style={s.btn("purple")}>Save</button>
                </div>
              </div></div>
            )}
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Name","Code","Country","Contact","Email","Products","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {manufacturers.length===0&&<tr><td colSpan={7} style={{...s.td,textAlign:"center",padding:40,color:"#9ca3af"}}>No manufacturers yet</td></tr>}
                {manufacturers.map(m=>(<tr key={m.id}><td style={{...s.td,fontWeight:600}}>{m.name}</td><td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{m.code||"—"}</td><td style={s.td}>{m.country||"—"}</td><td style={s.td}>{m.contact_name||"—"}</td><td style={{...s.td,color:"#6366f1",fontSize:12}}>{m.email||"—"}</td><td style={{...s.td,fontSize:12,color:"#6b7280"}}>{m.product_types||"—"}</td><td style={s.td}><div style={{display:"flex",gap:4}}><button onClick={()=>setEditMfr({...m})} style={{background:"#eff6ff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}><Icon d={icons.edit} size={12} color="#2563eb"/></button><button onClick={async()=>{if(confirm(`Delete ${m.name}?`)){await fetch("/api/hospital/manufacturers",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:m.id})});fetchManufacturers();showToast("Deleted");}}} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}><Icon d={icons.trash} size={12} color="#dc2626"/></button></div></td></tr>))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── STORAGE TAB ───────────────────────────────────────────────── */}
        {tab==="storage"&&(
          <div>
            <div style={{...s.card}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center"}}>
                <div style={{position:"relative",flex:1,maxWidth:300}}>
                  <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                  <input placeholder="Search storage..." value={storageSearch} onChange={e=>setStorageSearch(e.target.value)} style={{...s.input,paddingLeft:30}}/>
                </div>
                <span style={{fontSize:12,color:"#9ca3af"}}>{storageLocations.length} locations</span>
                <div style={{marginLeft:"auto"}}><button onClick={()=>{setStorageForm({name:"",department_id:"",location:"",type:"shelf",temperature:"",notes:""});setEditStorage({});}} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Add</button></div>
              </div>

              {editStorage!==null&&(<div style={s.overlay}><div style={{...s.modal,width:500}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:16,fontWeight:600,margin:0}}>{editStorage?.id?"Edit":"Add"} Storage</h3><button onClick={()=>setEditStorage(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={{...s.label,color:"#dc2626"}}>Name *</label><input style={s.input} value={storageForm.name} onChange={e=>setStorageForm(f=>({...f,name:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Type</label><select style={s.input} value={storageForm.type} onChange={e=>setStorageForm(f=>({...f,type:e.target.value}))}>{["shelf","fridge","freezer","cabinet","room","controlled","drawer"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                  <div style={s.fgroup}><label style={s.label}>Department</label><select style={s.input} value={storageForm.department_id} onChange={e=>setStorageForm(f=>({...f,department_id:e.target.value}))}><option value="">General / All</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                  <div style={s.fgroup}><label style={s.label}>Location</label><input style={s.input} value={storageForm.location} onChange={e=>setStorageForm(f=>({...f,location:e.target.value}))}/></div>
                  <div style={s.fgroup}><label style={s.label}>Temperature</label><input style={s.input} value={storageForm.temperature} onChange={e=>setStorageForm(f=>({...f,temperature:e.target.value}))} placeholder="e.g. 2-8°C"/></div>
                  <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={storageForm.notes} onChange={e=>setStorageForm(f=>({...f,notes:e.target.value}))}/></div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
                  <button onClick={()=>setEditStorage(null)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                  <button onClick={async()=>{if(!storageForm.name.trim()){showToast("Name required");return;}const isEdit=!!editStorage?.id;await fetch("/api/hospital/storage",{method:isEdit?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(isEdit?{id:editStorage.id,...storageForm}:storageForm)});setEditStorage(null);setStorageForm({name:"",department_id:"",location:"",type:"shelf",temperature:"",notes:""});fetchStorage();showToast(isEdit?"Updated!":"Added!");}} style={s.btn("purple")}>Save</button>
                </div>
              </div></div>)}

              {/* Storage locations list with items */}
              {storageLocations.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No storage locations yet</div>:(
                <div style={{padding:16,display:"flex",flexDirection:"column" as const,gap:12}}>
                  {storageLocations
                    .filter(l=>!storageSearch||(l.name??"").toLowerCase().includes(storageSearch.toLowerCase()))
                    .map(loc=>{
                      const locItems=items.filter(i=>i.storage_location===loc.name);
                      const typeColors:Record<string,{bg:string,color:string}>={
                        fridge:{bg:"#dbeafe",color:"#1d4ed8"},
                        freezer:{bg:"#e0f2fe",color:"#0369a1"},
                        controlled:{bg:"#fef3c7",color:"#92400e"},
                        shelf:{bg:"#f3f4f6",color:"#374151"},
                        cabinet:{bg:"#ede9fe",color:"#5b21b6"},
                        room:{bg:"#d1fae5",color:"#065f46"},
                        drawer:{bg:"#fce7f3",color:"#9d174d"},
                      };
                      const tc=typeColors[loc.type]??typeColors.shelf;
                      return(
                        <div key={loc.id} style={{border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
                          {/* Location header */}
                          <div style={{background:tc.bg,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <span style={{fontSize:20}}>{loc.type==="fridge"?"❄️":loc.type==="freezer"?"🧊":loc.type==="controlled"?"🔐":loc.type==="cabinet"?"🗄️":loc.type==="room"?"🏠":"📦"}</span>
                              <div>
                                <div style={{fontWeight:700,fontSize:14,color:tc.color}}>{loc.name}</div>
                                <div style={{fontSize:11,color:tc.color,opacity:0.8}}>
                                  {loc.department_name??"General"}{loc.location?` · ${loc.location}`:""}{loc.temperature?` · ${loc.temperature}`:""}
                                </div>
                              </div>
                              <span style={s.badge(tc.bg,tc.color)}>{loc.type}</span>
                            </div>
                            <div style={{display:"flex",gap:6,alignItems:"center"}}>
                              <span style={{fontSize:12,fontWeight:600,color:tc.color,background:"rgba(255,255,255,0.6)",padding:"3px 10px",borderRadius:20}}>{locItems.length} item{locItems.length!==1?"s":""}</span>
                              <button onClick={()=>{setStorageForm({name:loc.name,department_id:loc.department_id??"",location:loc.location??"",type:loc.type??"shelf",temperature:loc.temperature??"",notes:loc.notes??""});setEditStorage(loc);}} style={{background:"rgba(255,255,255,0.6)",border:"none",borderRadius:6,padding:"4px 6px",cursor:"pointer"}}><Icon d={icons.edit} size={12} color={tc.color}/></button>
                              <button onClick={async()=>{await fetch("/api/hospital/storage",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:loc.id})});fetchStorage();showToast("Removed");}} style={{background:"rgba(255,255,255,0.6)",border:"none",borderRadius:6,padding:"4px 6px",cursor:"pointer"}}><Icon d={icons.trash} size={12} color="#dc2626"/></button>
                            </div>
                          </div>

                          {/* Items in this location */}
                          {locItems.length===0?(
                            <div style={{padding:"10px 16px",fontSize:12,color:"#9ca3af",fontStyle:"italic"}}>No items assigned to this location</div>
                          ):(
                            <table style={{width:"100%",borderCollapse:"collapse"}}>
                              <thead><tr>{["Item","Code","Type","UOM","Stock","Unit Cost","Status"].map(h=><th key={h} style={{...s.th,fontSize:10}}>{h}</th>)}</tr></thead>
                              <tbody>
                                {locItems.map(item=>{
                                  const stc=sc(parseInt(item.total_stock||0),parseInt(item.reorder_level||0));
                                  return(
                                    <tr key={item.id}>
                                      <td style={{...s.td,fontWeight:600,fontSize:12}}>{item.name}{item.generic_name&&<div style={{fontSize:10,color:"#9ca3af"}}>{item.generic_name}</div>}</td>
                                      <td style={{...s.td,fontFamily:"monospace",fontSize:10,color:"#6b7280"}}>{item.itemcode}</td>
                                      <td style={s.td}><span style={{...s.badge("#f3f4f6","#374151"),fontSize:10}}>{item.itemtype}</span></td>
                                      <td style={{...s.td,fontSize:12}}>{item.uom}</td>
                                      <td style={{...s.td,fontWeight:700,fontSize:12}}>{item.total_stock??0}</td>
                                      <td style={{...s.td,fontSize:12}}>{item.unit_cost?`$${parseFloat(item.unit_cost).toFixed(2)}`:"—"}</td>
                                      <td style={s.td}><span style={s.badge(stc.bg,stc.color)}>{stc.label}</span></td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DEPARTMENTS TAB ───────────────────────────────────────────── */}
        {tab==="departments"&&(
          <div>
            {editDept!==null&&(<div style={s.overlay}><div style={{...s.modal,width:500}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:16,fontWeight:600,margin:0}}>{editDept?.id?"Edit":"Add"} Department</h3><button onClick={()=>setEditDept(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={{...s.label,color:"#dc2626"}}>Name *</label><input style={s.input} value={deptForm.name} onChange={e=>setDeptForm(f=>({...f,name:e.target.value}))}/></div>
                <div style={s.fgroup}><label style={s.label}>Type</label><select style={s.input} value={deptForm.type} onChange={e=>setDeptForm(f=>({...f,type:e.target.value}))}>{["general","radiology","ward","ot"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                <div style={s.fgroup}><label style={s.label}>Location</label><input style={s.input} value={deptForm.location} onChange={e=>setDeptForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Floor 2"/></div>
                <div style={s.fgroup}><label style={s.label}>Manager</label><input style={s.input} value={deptForm.manager} onChange={e=>setDeptForm(f=>({...f,manager:e.target.value}))}/></div>
                <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={deptForm.notes} onChange={e=>setDeptForm(f=>({...f,notes:e.target.value}))}/></div>
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
                <button onClick={()=>setEditDept(null)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                <button onClick={async()=>{if(!deptForm.name.trim()){showToast("Name required");return;}const isEdit=!!editDept?.id;const url=isEdit?`/api/hospital/departments/${editDept.id}`:"/api/hospital/departments";await fetch(url,{method:isEdit?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(deptForm)});setEditDept(null);setDeptForm({name:"",type:"general",location:"",manager:"",notes:""});fetchDepartments();showToast(isEdit?"Updated!":"Added!");}} style={s.btn("purple")}>Save</button>
              </div>
            </div></div>)}
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center"}}>
                <div style={{position:"relative",flex:1,maxWidth:300}}><div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div><input placeholder="Search departments..." value={deptSearch} onChange={e=>setDeptSearch(e.target.value)} style={{...s.input,paddingLeft:30}}/></div>
                <span style={{fontSize:12,color:"#9ca3af"}}>{departments.length} departments</span>
                <div style={{marginLeft:"auto"}}><button onClick={()=>{setDeptForm({name:"",type:"general",location:"",manager:"",notes:""});setEditDept({});}} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Add</button></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16,padding:16}}>
                {departments.filter(d=>!deptSearch||d.name.toLowerCase().includes(deptSearch.toLowerCase())).map(dept=>{
                  const dc=DEPT_COLORS[dept.type]??DEPT_COLORS.general;
                  return(<div key={dept.id} style={{background:dc.bg,borderRadius:12,padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:24}}>{dc.icon}</span><div><div style={{fontWeight:700,fontSize:14,color:dc.color}}>{dept.name}</div><div style={{fontSize:11,color:dc.color,opacity:0.8}}>{dept.type} · {dept.location||"No location"}</div></div></div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>{setDeptForm({name:dept.name,type:dept.type,location:dept.location??"",manager:dept.manager??"",notes:dept.notes??""});setEditDept(dept);}} style={{background:"rgba(255,255,255,0.7)",border:"none",borderRadius:6,padding:"4px 6px",cursor:"pointer"}}><Icon d={icons.edit} size={12} color={dc.color}/></button>
                        <button onClick={async()=>{if(confirm(`Delete ${dept.name}?`)){await fetch(`/api/hospital/departments/${dept.id}`,{method:"DELETE"});fetchDepartments();showToast("Deleted");}}} style={{background:"rgba(255,255,255,0.7)",border:"none",borderRadius:6,padding:"4px 6px",cursor:"pointer"}}><Icon d={icons.trash} size={12} color="#dc2626"/></button>
                      </div>
                    </div>
                    {dept.manager&&<div style={{fontSize:12,color:dc.color,opacity:0.8,marginBottom:8}}>👤 {dept.manager}</div>}
                    <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,fontWeight:600,color:dc.color}}>{dept.item_count??0} items</span><Link href={`/hospital/${dept.id}`} style={{textDecoration:"none",marginLeft:"auto"}}><span style={{fontSize:11,fontWeight:600,color:dc.color,background:"rgba(255,255,255,0.7)",padding:"4px 10px",borderRadius:6}}>Open →</span></Link></div>
                  </div>);
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSFERS TAB ─────────────────────────────────────────────── */}
        {tab==="transfers"&&(
          <div>
            <FulfillRequestsSection departments={departments} onRefresh={()=>{fetchTransfers();fetchStock();showToast("Transfer dispatched! Department can now receive it.");}}/>

            {/* Regular (non-request) transfers */}
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" as const}}>
                <span style={{fontSize:13,fontWeight:600}}>All Transfers</span>
                <div style={{display:"flex",gap:5}}>
                  {["ALL","PENDING","RECEIVED","CANCELLED"].map(st=>(
                    <button key={st} onClick={()=>setTransferStatus(st)} style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${transferStatus===st?"#6366f1":"#e5e7eb"}`,background:transferStatus===st?"#6366f1":"#f9fafb",color:transferStatus===st?"#fff":"#374151"}}>{st}</button>
                  ))}
                </div>
                <button onClick={fetchTransfers} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:5}}><Icon d={icons.refresh} size={13}/></button>
                <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{transfers.length} transfers</span>
              </div>
              {transfers.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No transfers yet. Click "Transfer" button to create one.</div>:(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Transfer #","To Department","Items","Sent By","Created","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {transfers.filter(t=>transferStatus==="ALL"||t.status===transferStatus).map(t=>{
                        const isReq=(t.sent_by||"").startsWith("REQUEST by");
                        const stc=statusColors[t.status]??{bg:"#f3f4f6",color:"#374151"};
                        return(
                          <tr key={t.id} style={{opacity:isReq?0.5:1}}>
                            <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6366f1"}}>{t.transfer_number}</td>
                            <td style={{...s.td,fontWeight:600}}>{t.department_name??"—"}</td>
                            <td style={{...s.td,fontWeight:600}}>{t.item_count??0} items</td>
                            <td style={s.td}>{isReq?<span style={{fontSize:11,color:"#d97706",fontWeight:600}}>⏳ Pending fulfillment</span>:t.sent_by}</td>
                            <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(t.createdat).toLocaleDateString()}</td>
                            <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:stc.bg,color:stc.color}}>{isReq?"REQUESTED":t.status}</span></td>
                            <td style={s.td}>
                              {t.status==="PENDING"&&!isReq&&(
                                <button onClick={async()=>{await fetch(`/api/hospital/transfers/${t.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"CANCELLED"})});fetchTransfers();showToast("Cancelled");}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",fontSize:11,padding:"3px 8px"}}>Cancel</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CREATE ORDER TAB ──────────────────────────────────────────── */}
        {tab==="orders"&&(
          <div>
            {/* Cart summary */}
            {orderCart.length>0&&(
              <div style={{background:"#fef3c7",border:"2px solid #fcd34d",borderRadius:10,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>🛒</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"#92400e"}}>{orderCart.length} item{orderCart.length!==1?"s":""} in cart ready to order</div>
                    <div style={{fontSize:11,color:"#b45309",marginTop:1}}>{orderCart.map((i:any)=>i.name).join(", ")}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setOrderCart([])} style={{...s.btn("ghost"),border:"1px solid #d97706",fontSize:11,color:"#92400e"}}>Clear Cart</button>
                  <button onClick={()=>setShowOrderModal(true)} style={{...s.btn("orange"),display:"flex",alignItems:"center",gap:6,fontSize:12}}>📋 Create Order from Cart</button>
                </div>
              </div>
            )}
            <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" as const}}>
              <span style={{fontSize:13,fontWeight:600}}>Purchase Orders</span>
              <div style={{display:"flex",gap:5}}>
                {["ALL","PENDING","PARTIALLY_DELIVERED","DELIVERED","CANCELLED"].map(st=>(
                  <button key={st} onClick={()=>setOrderStatusFilter(st)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${orderStatusFilter===st?"#6366f1":"#e5e7eb"}`,background:orderStatusFilter===st?"#6366f1":"#f9fafb",color:orderStatusFilter===st?"#fff":"#374151"}}>{st==="PARTIALLY_DELIVERED"?"PARTIAL":st}</button>
                ))}
              </div>
              <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                <div style={{position:"absolute",left:8,pointerEvents:"none"}}><Icon d={icons.search} size={13} color="#9ca3af"/></div>
                <input placeholder="Search order #, supplier, by..." value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} style={{...s.input,width:200,paddingLeft:26,fontSize:12}}/>
              </div>
              <button onClick={fetchHospitalOrders} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:4}}><Icon d={icons.refresh} size={13}/></button>
              <button onClick={()=>setShowOrderModal(true)} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}><Icon d={icons.plus} size={13} color="#fff"/> Create Order</button>
            </div>
            {hospitalOrders.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}><div style={{fontSize:32,marginBottom:8}}>📋</div><div style={{fontSize:14,fontWeight:600}}>No orders yet</div><div style={{fontSize:12,marginTop:4}}>Click "Create Order" to place your first order</div></div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Order #","Ordered By","Supplier","Items","Total","Order Date","Expected","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {hospitalOrders.filter((o:any)=>(orderStatusFilter==="ALL"||o.status===orderStatusFilter)&&(!orderSearch||(o.order_number||'').toLowerCase().includes(orderSearch.toLowerCase())||(o.supplier_name||'').toLowerCase().includes(orderSearch.toLowerCase())||(o.ordered_by||'').toLowerCase().includes(orderSearch.toLowerCase()))).map((order:any)=>{
                      const sc=statusColors[order.status]??{bg:"#f3f4f6",color:"#374151"};
                      return(
                        <tr key={order.id}>
                          <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6366f1",fontWeight:600}}>{order.order_number}</td>
                          <td style={{...s.td,fontWeight:600}}>{order.ordered_by}</td>
                          <td style={s.td}>{order.supplier_name??"—"}</td>
                          <td style={{...s.td,fontWeight:600}}>{order.item_count??0} items</td>
                          <td style={{...s.td,color:"#16a34a",fontWeight:600}}>{order.total_amount?`$${parseFloat(order.total_amount).toFixed(2)}`:"—"}</td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{order.order_date?new Date(order.order_date).toLocaleDateString():"—"}</td>
                          <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{order.expected_date?new Date(order.expected_date).toLocaleDateString():"—"}</td>
                          <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.color}}>{order.status==="PARTIALLY_DELIVERED"?"PARTIAL":order.status}</span></td>
                          <td style={s.td}>
                            <div style={{display:"flex",gap:4}}>
                              <button onClick={async()=>{const r=await fetch(`/api/hospital/orders/${order.id}`);const d=await r.json();setViewOrderDetail(d);setViewOrderId(order.id);}} style={{background:"#eff6ff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}} title="View Details"><Icon d={icons.eye} size={12} color="#2563eb"/></button>

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </div>
        )}

        {/* ── PURCHASE NOTES TAB ───────────────────────────────────────── */}
        {tab==="pn"&&(
          <div>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#166534"}}>📄 Purchase Notes</div>
                <div style={{fontSize:12,color:"#16a34a",marginTop:2}}>Create a purchase note to simulate what the supplier delivered. This is then compared against the original order in Goods Receipt.</div>
              </div>
              <button onClick={()=>setShowPurchaseNoteModal(true)} style={{...s.btn("green"),display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" as const}}>+ New Purchase Note</button>
            </div>
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" as const}}>
                <span style={{fontSize:13,fontWeight:600}}>Purchase Notes</span>
                <div style={{display:"flex",gap:5}}>
                  {["ALL","PENDING","PROCESSED"].map(st=>(
                    <button key={st} onClick={()=>setPnStatusFilter(st)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${pnStatusFilter===st?"#6366f1":"#e5e7eb"}`,background:pnStatusFilter===st?"#6366f1":"#f9fafb",color:pnStatusFilter===st?"#fff":"#374151"}}>{st}</button>
                  ))}
                </div>
                <button onClick={fetchPurchaseNotes} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:4}}><Icon d={icons.refresh} size={13}/></button>
                <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{purchaseNotes.length} notes</span>
              </div>
              {purchaseNotes.length===0?(
                <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>
                  <div style={{fontSize:32,marginBottom:8}}>📄</div>
                  <div style={{fontSize:14,fontWeight:600}}>No purchase notes yet</div>
                  <div style={{fontSize:12,marginTop:4}}>Create a purchase note to simulate a supplier delivery, then process it in Goods Receipt</div>
                </div>
              ):(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Note #","Order #","Supplier","Supplier Ref","Delivery Date","Items","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {purchaseNotes.filter((pn:any)=>pnStatusFilter==="ALL"||pn.status===pnStatusFilter).map((pn:any)=>{
                        const stColors:Record<string,{bg:string,color:string}>={
                          PENDING:{bg:"#fef3c7",color:"#92400e"},
                          PROCESSED:{bg:"#d1fae5",color:"#065f46"},
                        };
                        const sc=stColors[pn.status]??{bg:"#f3f4f6",color:"#374151"};
                        return(
                          <tr key={pn.id}>
                            <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#16a34a",fontWeight:600}}>{pn.note_number}</td>
                            <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>{pn.order_number??"—"}</td>
                            <td style={{...s.td,fontWeight:600}}>{pn.supplier_name??"—"}</td>
                            <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{pn.supplier_ref??"—"}</td>
                            <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{pn.delivery_date?new Date(pn.delivery_date).toLocaleDateString():"—"}</td>
                            <td style={{...s.td,fontWeight:600}}>{pn.item_count??0} items</td>
                            <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.color}}>{pn.status}</span></td>
                            <td style={s.td}>
                              <div style={{display:"flex",gap:4}}>
                                <button onClick={async()=>{const r=await fetch(`/api/hospital/purchase-notes/${pn.id}`);const d=await r.json();setViewPNDetail(d);}} style={{background:"#eff6ff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}} title="View"><Icon d={icons.eye} size={12} color="#2563eb"/></button>
                                {pn.status==="PENDING"&&(
                                  <button onClick={async()=>{const r=await fetch(`/api/hospital/purchase-notes/${pn.id}`);const d=await r.json();setPNForGR(d);setShowNewGRModal(true);setTab("gr");}} style={{...s.btn("blue"),padding:"4px 10px",fontSize:11}}>📥 Process in GR</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GOODS RECEIPT TAB ─────────────────────────────────────────── */}
        {tab==="gr"&&(
          <div>
            {/* New Receipt button + instructions */}
            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#1d4ed8"}}>📥 Goods Receipt</div>
                <div style={{fontSize:12,color:"#3b82f6",marginTop:2}}>When a supplier delivers items, create a receipt here. Compare ordered vs delivered and update stock.</div>
              </div>
              <button onClick={()=>setShowNewGRModal(true)} style={{...s.btn("blue"),display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" as const}}>+ New Receipt</button>
            </div>

            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" as const}}>
                <span style={{fontSize:13,fontWeight:600}}>Goods Receipts</span>
                <div style={{display:"flex",gap:5}}>
                  {["ALL","PENDING","PARTIAL","COMPLETE"].map(st=>(
                    <button key={st} onClick={()=>setGrStatusFilter(st)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${grStatusFilter===st?"#6366f1":"#e5e7eb"}`,background:grStatusFilter===st?"#6366f1":"#f9fafb",color:grStatusFilter===st?"#fff":"#374151"}}>{st}</button>
                  ))}
                </div>
                <button onClick={fetchGoodsReceipts} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:4}}><Icon d={icons.refresh} size={13}/></button>
                <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{goodsReceipts.length} receipts</span>
              </div>
              {goodsReceipts.length===0?(
                <div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>
                  <div style={{fontSize:32,marginBottom:8}}>📭</div>
                  <div style={{fontSize:14,fontWeight:600}}>No receipts yet</div>
                  <div style={{fontSize:12,marginTop:4}}>Click "+ New Receipt" when a supplier delivers items</div>
                </div>
              ):(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Receipt #","Order #","Supplier","Received By","Date","Items","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {goodsReceipts.filter((g:any)=>grStatusFilter==="ALL"||g.status===grStatusFilter).map((gr:any)=>{
                        const stColors:Record<string,{bg:string,color:string}>={
                          COMPLETE:{bg:"#d1fae5",color:"#065f46"},
                          PARTIAL:{bg:"#fef3c7",color:"#92400e"},
                          PENDING:{bg:"#dbeafe",color:"#1d4ed8"},
                        };
                        const sc=stColors[gr.status]??{bg:"#f3f4f6",color:"#374151"};
                        return(
                          <tr key={gr.id}>
                            <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6366f1",fontWeight:600}}>{gr.receipt_number}</td>
                            <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>{gr.order_number??"—"}</td>
                            <td style={{...s.td,fontWeight:600}}>{gr.supplier_name??"—"}</td>
                            <td style={s.td}>{gr.received_by}</td>
                            <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{gr.receipt_date?new Date(gr.receipt_date).toLocaleDateString():"—"}</td>
                            <td style={{...s.td,fontWeight:600}}>{gr.item_count??0} items</td>
                            <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.color}}>{gr.status}</span></td>
                            <td style={s.td}>
                              <button onClick={async()=>{const r=await fetch(`/api/hospital/goods-receipt/${gr.id}`);const d=await r.json();setViewGRDetail(d);setViewGRId(gr.id);}} style={{background:"#eff6ff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}} title="View Details"><Icon d={icons.eye} size={12} color="#2563eb"/></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── UOM TAB ───────────────────────────────────────────────────── */}
        {tab==="uom"&&(
          <div>
            {uomModal&&(<div style={s.overlay}><div style={{...s.modal,width:480}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:16,fontWeight:600,margin:0}}>{uomModal==="edit"?"Edit":"Add"} UOM</h3><button onClick={()=>{setUomModal(null);setUomRow(null);}} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,alignItems:"end"}}>
                <div style={s.fgroup}><label style={s.label}>From UOM</label><select style={s.input} value={uomForm.from_uom} onChange={e=>setUomForm(f=>({...f,from_uom:e.target.value}))}><option value="">Select</option>{["tablet","capsule","strip","box","bottle","vial","ampoule","ml","mg","g","kg","l","piece","sachet","pack"].map(u=><option key={u} value={u}>{u}</option>)}</select></div>
                <div style={{textAlign:"center" as const,paddingBottom:14,fontSize:20,color:"#9ca3af"}}>→</div>
                <div style={s.fgroup}><label style={s.label}>To UOM</label><select style={s.input} value={uomForm.to_uom} onChange={e=>setUomForm(f=>({...f,to_uom:e.target.value}))}><option value="">Select</option>{["tablet","capsule","strip","box","bottle","vial","ampoule","ml","mg","g","kg","l","piece","sachet","pack"].map(u=><option key={u} value={u}>{u}</option>)}</select></div>
              </div>
              <div style={s.fgroup}><label style={s.label}>Factor</label><input type="number" step="0.001" style={s.input} value={uomForm.factor} onChange={e=>setUomForm(f=>({...f,factor:e.target.value}))} placeholder="e.g. 10"/></div>
              {uomForm.from_uom&&uomForm.to_uom&&uomForm.factor&&<div style={{padding:"8px 12px",background:"#eef2ff",borderRadius:6,fontSize:13,color:"#4338ca",marginBottom:12}}>1 {uomForm.from_uom} = {uomForm.factor} {uomForm.to_uom}</div>}
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={()=>setUomModal(null)} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
                <button onClick={async()=>{if(!uomForm.from_uom||!uomForm.to_uom||!uomForm.factor){showToast("All fields required");return;}const url=uomModal==="edit"?`/api/uom/${uomRow.id}`:"/api/uom";await fetch(url,{method:uomModal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...uomForm,factor:parseFloat(uomForm.factor)})});setUomModal(null);fetchUom();showToast("Saved!");}} style={s.btn("purple")}>Save</button>
              </div>
            </div></div>)}
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600}}>UOM Conversions <span style={{fontSize:11,color:"#6b7280",fontWeight:400}}>Shared with pharmacy</span></span>
                <button onClick={()=>{setUomForm({from_uom:"",to_uom:"",factor:""});setUomRow(null);setUomModal("add");}} style={{...s.btn("purple"),display:"flex",alignItems:"center",gap:6}}><Icon d={icons.plus} size={13} color="#fff"/> Add</button>
              </div>
              {uomConversions.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No conversions yet</div>:(
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["From","Factor","To","Example","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>{uomConversions.map(c=>(<tr key={c.id}><td style={s.td}><span style={{fontWeight:700,color:"#6366f1"}}>{c.from_uom}</span></td><td style={{...s.td,fontWeight:700,textAlign:"center" as const}}>×{c.factor}</td><td style={s.td}><span style={{fontWeight:700,color:"#16a34a"}}>{c.to_uom}</span></td><td style={{...s.td,fontSize:12,color:"#6b7280"}}>1 {c.from_uom} = {c.factor} {c.to_uom}</td><td style={s.td}><div style={{display:"flex",gap:4}}><button onClick={()=>{setUomForm({from_uom:c.from_uom,to_uom:c.to_uom,factor:String(c.factor)});setUomRow(c);setUomModal("edit");}} style={{background:"#eff6ff",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}><Icon d={icons.edit} size={12} color="#2563eb"/></button><button onClick={async()=>{await fetch(`/api/uom/${c.id}`,{method:"DELETE"});fetchUom();showToast("Deleted");}} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}><Icon d={icons.trash} size={12} color="#dc2626"/></button></div></td></tr>))}</tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ───────────────────────────────────────────────── */}
        {tab==="reports"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {(["stock","consumption"] as const).map(type=>(<button key={type} onClick={()=>setReportType(type)} style={{padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",border:`1px solid ${reportType===type?"#6366f1":"#e5e7eb"}`,background:reportType===type?"#6366f1":"#fff",color:reportType===type?"#fff":"#374151"}}>{type==="stock"?"📦 Stock on Hand":"📈 Consumption"}</button>))}
              <button onClick={()=>{const NL=String.fromCharCode(10);const headers=reports.length>0?Object.keys(reports[0]).join(","):"";const rows=reports.map(r=>Object.values(r).map(v=>String(v??"").replace(/\n/g," ")).join(","));const csv=[headers,...rows].join(NL);const blob=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`hospital-${reportType}-${new Date().toISOString().slice(0,10)}.csv`;a.click();}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",marginLeft:"auto"}}>📥 Export CSV</button>
            </div>
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:600}}>{reportType==="stock"?"Stock on Hand":"Consumption Log"}</span><span style={{fontSize:12,color:"#9ca3af"}}>{reports.length} records</span></div>
              {reports.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No data</div>:(
                <div style={{overflowX:"auto"}}>
                  {reportType==="stock"&&(<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Item","Code","Department","UOM","Stock","Available","Reorder","Unit Cost","Value","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead><tbody>{reports.map((r:any,i:number)=>{const avail=parseInt(r.available||r.total_stock||0);const stc=sc(avail,parseInt(r.reorder_level||0));return(<tr key={i}><td style={{...s.td,fontWeight:600}}>{r.name}</td><td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{r.itemcode}</td><td style={s.td}><span style={s.badge("#eef2ff","#6366f1")}>{r.department_name??"All"}</span></td><td style={s.td}>{r.uom}</td><td style={{...s.td,fontWeight:700}}>{r.total_stock||0}</td><td style={{...s.td,fontWeight:700,color:stc.color}}>{avail}</td><td style={{...s.td,color:"#6b7280"}}>{r.reorder_level||0}</td><td style={s.td}>{r.unit_cost?`$${parseFloat(r.unit_cost).toFixed(2)}`:"—"}</td><td style={{...s.td,fontWeight:600,color:"#6366f1"}}>${(avail*parseFloat(r.unit_cost||0)).toFixed(2)}</td><td style={s.td}><span style={s.badge(stc.bg,stc.color)}>{stc.label}</span></td></tr>);})}</tbody></table>)}
                  {reportType==="consumption"&&(<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Item","Action","Department","Total Qty","Transactions","Last Movement"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead><tbody>{reports.map((r:any,i:number)=>(<tr key={i}><td style={{...s.td,fontWeight:600}}>{r.item_name}</td><td style={s.td}><span style={s.badge("#ede9fe","#5b21b6")}>{r.action_type}</span></td><td style={s.td}>{r.department_name??"—"}</td><td style={{...s.td,fontWeight:700}}>{r.total_qty}</td><td style={s.td}>{r.tx_count}</td><td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.last_moved?new Date(r.last_moved).toLocaleDateString():"—"}</td></tr>))}</tbody></table>)}
                </div>
              )}
            </div>
          </div>
        )}
        {tab==="wastage"&&(
          <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap" as const,gap:8}}>
              <div style={{display:"flex",gap:8,flex:1,flexWrap:"wrap" as const}}>
                <input style={{...s.input,maxWidth:260}} placeholder="Search item name..." value={wastageSearch} onChange={e=>setWastageSearch(e.target.value)}/>
              </div>
              <button style={s.btn("purple")} onClick={()=>{setWastageForm({itemId:"",itemName:"",departmentId:"",quantity:"",type:"WASTAGE",reason:"",batchNumber:"",recordedBy:"",notes:""});setShowWastageModal(true);}}>+ Record Wastage / Return</button>
            </div>
            <div style={s.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:13,fontWeight:600}}>Wastage & Returns Log</span>
                <span style={{fontSize:12,color:"#9ca3af"}}>{wastageRecords.length} records</span>
              </div>
              {wastageLoading?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading…</div>:wastageRecords.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No records yet.</div>:(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Item","Type","Department","Qty","Reason","Batch","Recorded By","Date"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {wastageRecords.filter(w=>!wastageSearch||w.item_name?.toLowerCase().includes(wastageSearch.toLowerCase())).map((w:any,i:number)=>{
                        const typeColors:Record<string,[string,string]>={WASTAGE:["#fef2f2","#dc2626"],RETURN:["#f0fdf4","#16a34a"],DAMAGE:["#fff7ed","#ea580c"],EXPIRED:["#fdf4ff","#9333ea"]};
                        const [bg,col]=typeColors[w.type]??["#f3f4f6","#374151"];
                        return(
                          <tr key={i} onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                            <td style={{...s.td,fontWeight:600}}>{w.item_name??"—"}</td>
                            <td style={s.td}><span style={s.badge(bg,col)}>{w.type}</span></td>
                            <td style={s.td}>{w.department_name??"—"}</td>
                            <td style={{...s.td,fontWeight:700,color:"#dc2626"}}>-{w.quantity}</td>
                            <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{w.reason??"—"}</td>
                            <td style={{...s.td,fontSize:11,fontFamily:"monospace"}}>{w.batch_number??"—"}</td>
                            <td style={s.td}>{w.recorded_by??"—"}</td>
                            <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{w.createdat?new Date(w.createdat).toLocaleDateString():"—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wastage Modal */}
      {showWastageModal&&(
        <div style={s.overlay} onClick={()=>setShowWastageModal(false)}>
          <div style={{...s.modal,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:15,fontWeight:700}}>Record Wastage / Return</span>
              <button onClick={()=>setShowWastageModal(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#6b7280"}}>✕</button>
            </div>
            <div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{...s.fgroup,gridColumn:"1/-1"}}>
                <label style={s.label}>Item *</label>
                <select style={s.input} value={wastageForm.itemId} onChange={e=>{const item=items.find((i:any)=>i.id===e.target.value);setWastageForm(f=>({...f,itemId:e.target.value,itemName:item?.name||""}));}}>
                  <option value="">Select item…</option>
                  {items.map((i:any)=><option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Type *</label>
                <select style={s.input} value={wastageForm.type} onChange={e=>setWastageForm(f=>({...f,type:e.target.value}))}>
                  <option value="WASTAGE">Wastage</option>
                  <option value="RETURN">Return</option>
                  <option value="DAMAGE">Damage</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Quantity *</label>
                <input type="number" min="1" style={s.input} value={wastageForm.quantity} onChange={e=>setWastageForm(f=>({...f,quantity:e.target.value}))} placeholder="0"/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Department</label>
                <select style={s.input} value={wastageForm.departmentId} onChange={e=>setWastageForm(f=>({...f,departmentId:e.target.value}))}>
                  <option value="">Hospital Central Store</option>
                  {departments.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Batch Number</label>
                <input style={s.input} value={wastageForm.batchNumber} onChange={e=>setWastageForm(f=>({...f,batchNumber:e.target.value}))} placeholder="Optional"/>
              </div>
              <div style={s.fgroup}>
                <label style={s.label}>Recorded By</label>
                <input style={s.input} value={wastageForm.recordedBy} onChange={e=>setWastageForm(f=>({...f,recordedBy:e.target.value}))} placeholder="Name"/>
              </div>
              <div style={{...s.fgroup,gridColumn:"1/-1"}}>
                <label style={s.label}>Reason</label>
                <input style={s.input} value={wastageForm.reason} onChange={e=>setWastageForm(f=>({...f,reason:e.target.value}))} placeholder="e.g. Expired, Damaged in storage…"/>
              </div>
              <div style={{...s.fgroup,gridColumn:"1/-1"}}>
                <label style={s.label}>Notes</label>
                <input style={s.input} value={wastageForm.notes} onChange={e=>setWastageForm(f=>({...f,notes:e.target.value}))} placeholder="Optional"/>
              </div>
            </div>
            <div style={{padding:"12px 20px",borderTop:"1px solid #e5e7eb",display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}} onClick={()=>setShowWastageModal(false)}>Cancel</button>
              <button style={s.btn("purple")} onClick={async()=>{
                if(!wastageForm.itemId||!wastageForm.quantity){showToast("Item and quantity required");return;}
                const res=await fetch("/api/hospital/wastage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...wastageForm,departmentId:wastageForm.departmentId||null})});
                if(!res.ok){const d=await res.json();showToast(d.error||"Failed");return;}
                setShowWastageModal(false);fetchWastage();fetchStock();showToast("Recorded successfully");
              }}>Save Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {viewItem&&<ViewItemModal item={viewItem} onClose={()=>setViewItem(null)} onAddToPR={()=>addToOrderCart(viewItem)}/>}
      {showOrderModal&&(
        <CreateOrderModal
          items={items}
          suppliers={tibbnaSuppliers}
          departments={departments}
          initialCart={orderCart}
          onClose={()=>{setShowOrderModal(false);}}
          onSuccess={()=>{setOrderCart([]);fetchHospitalOrders();setTab("orders");showToast("Order created!");}}
        />
      )}
      {showPurchaseNoteModal&&<CreatePurchaseNoteModal orders={hospitalOrders} tibbnaSuppliers={tibbnaSuppliers} onClose={()=>setShowPurchaseNoteModal(false)} onSuccess={()=>{fetchPurchaseNotes();showToast("Purchase note created! Go to Goods Receipt to process it.");}}/> }
      {showNewGRModal&&<NewGoodsReceiptModal orders={hospitalOrders} departments={departments} tibbnaSuppliers={tibbnaSuppliers} purchaseNote={pNForGR} onClose={()=>{setShowNewGRModal(false);setPNForGR(null);}} onSuccess={(msg)=>{fetchGoodsReceipts();fetchHospitalOrders();fetchStock();fetchPurchaseNotes();showToast(msg);setShowNewGRModal(false);setPNForGR(null);}}/> }
      {showGRModal&&viewOrderDetail&&(
        <ReceiveOrderModal
          orderDetail={viewOrderDetail}
          departments={departments}
          onClose={()=>{setShowGRModal(false);setViewOrderDetail(null);}}
          onSuccess={(result)=>{
            fetchGoodsReceipts();fetchHospitalOrders();fetchStock();
            setShowGRModal(false);setViewOrderDetail(null);
            setTab("gr");
            showToast(result.status==="PARTIAL"?"Partially received — partial delivery recorded":"Order fully received! Stock updated.");
          }}
        />
      )}
      {viewOrderId&&viewOrderDetail&&!showGRModal&&(
        <ViewOrderModal detail={viewOrderDetail} onClose={()=>{setViewOrderId(null);setViewOrderDetail(null);}} onReceive={()=>{setShowGRModal(true);}}/>
      )}
      {viewGRId&&viewGRDetail&&(
        <ViewGRModal detail={viewGRDetail} suppliers={tibbnaSuppliers} onClose={()=>{setViewGRId(null);setViewGRDetail(null);}}/>
      )}
            {showAddItem&&<AddItemWizard onClose={()=>setShowAddItem(false)} onSuccess={()=>{fetchItems();showToast("Item added!");}} departments={departments} storageLocations={storageLocations} manufacturers={manufacturers} suppliers={tibbnaSuppliers}/>}
      {showTransfer&&<TransferModal items={items} departments={departments} onClose={()=>setShowTransfer(false)} onSuccess={()=>{fetchTransfers();showToast("Transfer created!");}}/>}

      {toast&&<div style={{position:"fixed",bottom:24,right:24,background:"#16a34a",color:"#fff",padding:"11px 18px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:2000}}>✓ {toast}</div>}
    </div>
  );
}
