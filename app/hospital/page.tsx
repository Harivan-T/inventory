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
    manufacturer:"",supplier_id:"",supplier_name:"",barcode:"",
    storage_location:"",storage_type:"",strength:"",
    min_level:"5",reorder_level:"10",max_level:"100",
    unit_cost:"",selling_price:"",initial_qty:"0",department_id:""
  });
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));

  const save=async()=>{
    if(!form.name.trim()){setErr("Item name is required");return;}
    setSaving(true);setErr("");
    try{
      const payload=JSON.stringify(form);
      console.log("Sending to /api/hospital/items:", payload);
      const res=await fetch("/api/hospital/items",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:payload
      });
      let data:any={};
      try{data=await res.json();}catch(je){console.error("JSON parse error:",je);}
      console.log("Response status:",res.status,"data:",data);
      if(!res.ok){setErr((data.error||data.message||"Server error: "+res.status));return;}
      if(parseInt(form.initial_qty)>0&&form.department_id){
        await fetch("/api/hospital/stock",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({itemId:data.id,departmentId:form.department_id,quantity:parseInt(form.initial_qty)})
        });
      }
      onSuccess();onClose();
    }catch(e:any){setErr(e?.message??"Network error");}
    finally{setSaving(false);}
  };

  return(
    <div style={s.overlay}>
      <div style={{...s.modal,width:680}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,background:"#dbeafe",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📦</div>
            <div>
              <div style={{fontSize:15,fontWeight:700}}>Add Hospital Item</div>
              <div style={{fontSize:12,color:"#6b7280"}}>Supply, equipment, reagent, consumable</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
        </div>

        {err&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16,fontWeight:500}}>{err}</div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {/* Name - full width */}
          <div style={{gridColumn:"1/-1",...s.fgroup}}>
            <label style={{...s.label,color:"#dc2626"}}>Item Name *</label>
            <input style={s.input} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Surgical Gloves Size 7"/>
          </div>

          <div style={s.fgroup}>
            <label style={s.label}>Generic / Common Name</label>
            <input style={s.input} value={form.generic_name} onChange={e=>set("generic_name",e.target.value)}/>
          </div>

          <div style={s.fgroup}>
            <label style={s.label}>Item Type</label>
            <select style={s.input} value={form.itemtype} onChange={e=>set("itemtype",e.target.value)}>
              {["supply","equipment","reagent","consumable","contrast","film","chemical","accessory","other"].map(t=>(
                <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div style={s.fgroup}>
            <label style={s.label}>UOM</label>
            <select style={s.input} value={form.uom} onChange={e=>set("uom",e.target.value)}>
              {["piece","ml","mg","g","kg","bottle","vial","ampoule","sachet","pack","box","pair","roll","set","tablet"].map(u=>(
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div style={s.fgroup}>
            <label style={s.label}>Manufacturer</label>
            <select style={s.input} value={form.manufacturer} onChange={e=>set("manufacturer",e.target.value)}>
              <option value="">— Select manufacturer —</option>
              {manufacturers.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          <div style={s.fgroup}>
            <label style={s.label}>Supplier</label>
            <select style={s.input} value={form.supplier_id}
              onChange={e=>{
                const sup=suppliers.find((sp:any)=>sp.id===e.target.value);
                set("supplier_id",e.target.value);
                set("supplier_name",sup?.name??"");
              }}>
              <option value="">— Select supplier —</option>
              {suppliers.map((sp:any)=>(
                <option key={sp.id} value={sp.id}>{sp.name}{sp.city?` · ${sp.city}`:""}</option>
              ))}
            </select>
          </div>

          <div style={s.fgroup}>
            <label style={s.label}>Storage Location</label>
            <StorageSearch value={form.storage_location} locations={storageLocations} onChange={v=>set("storage_location",v)}/>
          </div>

          <div style={s.fgroup}>
            <label style={s.label}>Storage Type</label>
            <select style={s.input} value={form.storage_type} onChange={e=>set("storage_type",e.target.value)}>
              <option value="">— Select —</option>
              {["shelf","fridge","freezer","cabinet","room","controlled"].map(t=>(
                <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div style={s.fgroup}>
            <label style={{...s.label,color:"#dc2626"}}>Purchase Price *</label>
            <input type="number" step="0.01" min="0" style={s.input} value={form.unit_cost} onChange={e=>set("unit_cost",e.target.value)} placeholder="0.00"/>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Selling Price</label>
            <input type="number" step="0.01" min="0" style={s.input} value={form.selling_price} onChange={e=>set("selling_price",e.target.value)} placeholder="0.00"/>
          </div>

          {/* Levels */}
          <div style={s.fgroup}><label style={s.label}>Min Level</label><input type="number" min="0" style={s.input} value={form.min_level} onChange={e=>set("min_level",e.target.value)}/></div>
          <div style={s.fgroup}><label style={s.label}>Reorder Level</label><input type="number" min="0" style={s.input} value={form.reorder_level} onChange={e=>set("reorder_level",e.target.value)}/></div>
          <div style={s.fgroup}><label style={s.label}>Initial Qty</label><input type="number" min="0" style={s.input} value={form.initial_qty} onChange={e=>set("initial_qty",e.target.value)}/></div>
          <div style={s.fgroup}>
            <label style={s.label}>Initial Stock Department</label>
            <select style={s.input} value={form.department_id} onChange={e=>set("department_id",e.target.value)}>
              <option value="">— Select —</option>
              {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:"1px solid #f3f4f6"}}>
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

function PRModal({initialCart,departments,suppliers,onClose,onSuccess}:{
  initialCart:any[];departments:any[];suppliers:any[];onClose:()=>void;onSuccess:()=>void;
}){
  const [lines,setLines]=useState<PRLine[]>(
    (initialCart||[]).map((i:any)=>({id:i.id,name:i.name,uom:i.uom||"piece",qty:i.qty||1,unitCost:String(i.unit_cost||"")}))
  );
  const [form,setForm]=useState({requestedBy:"",departmentId:"",supplierName:"",priority:"NORMAL",prDate:new Date().toISOString().slice(0,10),notes:""});
  const [q,setQ]=useState("");
  const [results,setResults]=useState<any[]>([]);
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  const setF=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if(q.length<2){setResults([]);return;}
    const t=setTimeout(async()=>{
      try{const r=await fetch(`/api/hospital/items?search=${encodeURIComponent(q)}`);const d=await r.json();setResults(Array.isArray(d)?d.slice(0,8):[]);}
      catch{setResults([]);}
    },250);
    return()=>clearTimeout(t);
  },[q]);

  const addLine=(item:any)=>{
    if(lines.find(l=>l.id===item.id))return;
    setLines(prev=>[...prev,{id:item.id,name:item.name,uom:item.uom||"piece",qty:1,unitCost:String(item.unit_cost||"")}]);
    setQ("");setResults([]);
  };
  const updateLine=(id:string,field:"qty"|"unitCost",val:string)=>{
    setLines(prev=>prev.map(l=>l.id===id?{...l,[field]:field==="qty"?String(Math.max(1,parseInt(val)||1)):val}:l));
  };
  const removeLine=(id:string)=>setLines(prev=>prev.filter(l=>l.id!==id));
  const total=lines.reduce((s,l)=>s+(l.qty||0)*(parseFloat(l.unitCost)||0),0);

  const save=async()=>{
    if(!form.requestedBy.trim()){setErr("Requested By is required");return;}
    if(!lines.length){setErr("Add at least one item");return;}
    setSaving(true);setErr("");
    try{
      const res=await fetch("/api/hospital/pr",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({requestedBy:form.requestedBy,departmentId:form.departmentId||null,
          supplierName:form.supplierName||null,priority:form.priority,prDate:form.prDate,notes:form.notes||null,
          items:lines.map(l=>({itemId:l.id,itemName:l.name,uom:l.uom,quantity:l.qty,unitCost:parseFloat(l.unitCost)||null}))})
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Failed");return;}
      onSuccess();onClose();
    }catch(e:any){setErr(e?.message||"Network error");}
    finally{setSaving(false);}
  };

  return(
    <div style={s.overlay}>
      <div style={{...s.modal,width:820,maxHeight:"94vh",padding:0,display:"flex",flexDirection:"column" as const}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}>📋 Create Purchase Requisition</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{lines.length} item{lines.length!==1?"s":""} · Est: <strong style={{color:"#6366f1"}}>${total.toFixed(2)}</strong></div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:6}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
        </div>
        <div style={{padding:"20px 24px",overflowY:"auto" as const,flex:1}}>
          {err&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16}}>{err}</div>}
          <div style={{background:"#f9fafb",borderRadius:10,padding:16,marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:12,textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>PR Details</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Requested By *</label><input style={s.input} value={form.requestedBy} onChange={e=>setF("requestedBy",e.target.value)} placeholder="Full name"/></div>
              <div style={s.fgroup}><label style={s.label}>Department</label>
                <select style={s.input} value={form.departmentId} onChange={e=>setF("departmentId",e.target.value)}>
                  <option value="">— General / All —</option>
                  {departments.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={s.fgroup}><label style={s.label}>Priority</label>
                <select style={s.input} value={form.priority} onChange={e=>setF("priority",e.target.value)}>
                  <option value="URGENT">🔴 Urgent</option>
                  <option value="NORMAL">🔵 Normal</option>
                  <option value="LOW">⚪ Low</option>
                </select>
              </div>
              <div style={s.fgroup}><label style={s.label}>Supplier</label>
                <select style={s.input} value={form.supplierName} onChange={e=>setF("supplierName",e.target.value)}>
                  <option value="">— Select supplier —</option>
                  {suppliers.length===0&&<option disabled value="">Loading...</option>}
                  {suppliers.map((sp:any)=><option key={sp.id} value={sp.name}>{sp.name}{sp.city?" · "+sp.city:""}</option>)}
                </select>
              </div>
              <div style={s.fgroup}><label style={s.label}>PR Date</label><input type="date" style={s.input} value={form.prDate} onChange={e=>setF("prDate",e.target.value)}/></div>
              <div style={s.fgroup}><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Optional..."/></div>
            </div>
          </div>
          <div style={{marginBottom:14,position:"relative"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>Search & Add Items</div>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={icons.search} size={14} color="#9ca3af"/></div>
              <input style={{...s.input,paddingLeft:34,border:"2px solid #6366f1"}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Type to search hospital inventory..."/>
            </div>
            {results.length>0&&(
              <div style={{position:"absolute",left:0,right:0,top:"100%",background:"#fff",border:"1px solid #6366f1",borderRadius:10,boxShadow:"0 8px 24px rgba(99,102,241,0.15)",zIndex:500,overflow:"hidden",marginTop:2}}>
                {results.map((item:any)=>{
                  const added=lines.some(l=>l.id===item.id);
                  return(
                    <div key={item.id} onClick={()=>!added&&addLine(item)}
                      style={{padding:"10px 14px",cursor:added?"default":"pointer",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                      onMouseEnter={e=>{if(!added)(e.currentTarget as HTMLElement).style.background="#eef2ff";}}
                      onMouseLeave={e=>{if(!added)(e.currentTarget as HTMLElement).style.background="#fff";}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,color:added?"#9ca3af":"#111827"}}>{item.name}</div>
                        <div style={{fontSize:11,color:"#9ca3af"}}>{item.itemcode} · {item.uom} · Stock: <strong style={{color:parseInt(item.total_stock||0)===0?"#dc2626":"#16a34a"}}>{item.total_stock??0}</strong>{item.unit_cost?" · $"+parseFloat(item.unit_cost).toFixed(2):""}</div>
                      </div>
                      {added?<span style={{fontSize:11,color:"#9ca3af",fontStyle:"italic"}}>Added</span>:<span style={{background:"#6366f1",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:6}}>+ Add</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {lines.length===0?(
            <div style={{background:"#f9fafb",borderRadius:10,padding:"28px",textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:28,marginBottom:6}}>📦</div>
              <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>No items yet</div>
              <div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>Click PR+ on items in the table, or search above</div>
            </div>
          ):(
            <div style={{border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden",marginBottom:4}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["#","Item","UOM","Qty","Unit Cost ($)","Total",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {lines.map((l,i)=>(
                    <tr key={l.id}>
                      <td style={{...s.td,color:"#9ca3af",fontSize:11,width:28}}>{i+1}</td>
                      <td style={{...s.td,fontWeight:600,minWidth:160}}>{l.name}</td>
                      <td style={{...s.td,color:"#6b7280",fontSize:12}}>{l.uom}</td>
                      <td style={s.td}><input type="number" min={1} value={l.qty} onChange={e=>updateLine(l.id,"qty",e.target.value)} style={{...s.input,width:80,textAlign:"center" as const,padding:"6px 8px"}}/></td>
                      <td style={s.td}><input type="number" step="0.01" min="0" value={l.unitCost} onChange={e=>updateLine(l.id,"unitCost",e.target.value)} placeholder="0.00" style={{...s.input,width:100,padding:"6px 8px"}}/></td>
                      <td style={{...s.td,fontWeight:700,color:"#6366f1"}}>${(l.qty*(parseFloat(l.unitCost)||0)).toFixed(2)}</td>
                      <td style={s.td}><button onClick={()=>removeLine(l.id)} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}} title="Remove"><Icon d={icons.trash} size={13} color="#dc2626"/></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{background:"#f9fafb"}}><td colSpan={5} style={{...s.td,fontWeight:700,textAlign:"right" as const,paddingRight:16}}>Est. Total:</td><td style={{...s.td,fontWeight:700,color:"#6366f1",fontSize:14}}>${total.toFixed(2)}</td><td/></tr></tfoot>
              </table>
            </div>
          )}
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:12,color:"#9ca3af"}}>{lines.length} item{lines.length!==1?"s":""} · ${total.toFixed(2)}</span>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
            <button onClick={save} disabled={saving||!lines.length||!form.requestedBy.trim()}
              style={{...s.btn("purple"),minWidth:130,opacity:saving||!lines.length||!form.requestedBy.trim()?0.5:1}}>
              {saving?"Creating...":"✓ Create PR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PO Modal ─────────────────────────────────────────────────────────────────
function POModal({pr,prItems,tibbnaSuppliers,departments,onClose,onSuccess}:{pr:any;prItems:any[];tibbnaSuppliers:any[];departments:any[];onClose:()=>void;onSuccess:()=>void}){
  const [form,setForm]=useState({supplierId:"",supplierName:"",createdBy:"",expectedDate:"",notes:""});
  const [items,setItems]=useState(prItems.map(i=>({...i,unitCost:i.unit_cost||""})));
  const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const set=(k:string,v:any)=>setForm(f=>({...f,[k]:v}));
  const total=items.reduce((s,i)=>(parseInt(i.quantity)||0)*(parseFloat(i.unitCost)||0)+s,0);

  return(
    <div style={s.overlay}><div style={{...s.modal,width:720}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h3 style={{fontSize:16,fontWeight:600,margin:0}}>🛍️ Create Purchase Order</h3><div style={{fontSize:12,color:"#6b7280"}}>From PR: {pr?.pr_number}</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      {error&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:12}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={{...s.label,color:"#dc2626"}}>Supplier (from Tibbna) *</label>
          <select style={s.input} value={form.supplierId} onChange={e=>{const sup=tibbnaSuppliers.find((s:any)=>s.id===e.target.value);set("supplierId",e.target.value);set("supplierName",sup?.name||"");}}>
            <option value="">Select supplier</option>
            {tibbnaSuppliers.map((s:any)=><option key={s.id} value={s.id}>{s.name} {s.city?`· ${s.city}`:""}</option>)}
          </select>
        </div>
        <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Created By *</label><input style={s.input} value={form.createdBy} onChange={e=>set("createdBy",e.target.value)} placeholder="Your name"/></div>
        <div style={s.fgroup}><label style={s.label}>Expected Delivery Date</label><input type="date" style={s.input} value={form.expectedDate} onChange={e=>set("expectedDate",e.target.value)}/></div>
        <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={e=>set("notes",e.target.value)}/></div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
        <thead><tr>{["Item","UOM","Quantity","Unit Cost","Total"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>
          {items.map((item,i)=>(
            <tr key={item.id}>
              <td style={{...s.td,fontWeight:600}}>{item.item_name||item.name}</td>
              <td style={s.td}>{item.uom}</td>
              <td style={{...s.td,fontWeight:700}}>{item.quantity}</td>
              <td style={s.td}><input type="number" step="0.01" value={item.unitCost} onChange={e=>setItems(it=>it.map((it2,j)=>j===i?{...it2,unitCost:e.target.value}:it2))} style={{...s.input,width:100}} placeholder="0.00"/></td>
              <td style={{...s.td,fontWeight:600,color:"#6366f1"}}>${((parseInt(item.quantity)||0)*(parseFloat(item.unitCost)||0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr style={{background:"#f9fafb"}}><td colSpan={4} style={{...s.td,fontWeight:700,textAlign:"right" as const}}>Total:</td><td style={{...s.td,fontWeight:700,color:"#6366f1"}}>${total.toFixed(2)}</td></tr></tfoot>
      </table>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
        <button disabled={loading||!form.supplierId||!form.createdBy} onClick={async()=>{setLoading(true);try{const res=await fetch("/api/hospital/po",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prId:pr?.id,...form,items:items.map(i=>({itemId:i.item_id,itemName:i.item_name||i.name,uom:i.uom,quantity:parseInt(i.quantity)||0,unitCost:parseFloat(i.unitCost)||0}))})});if(!res.ok)throw new Error("Failed");onSuccess();onClose();}catch(e:any){setError(e.message);}finally{setLoading(false);}}} style={s.btn("blue")}>{loading?"Creating...":"Create PO"}</button>
      </div>
    </div></div>
  );
}

// ── GRN Modal ─────────────────────────────────────────────────────────────────
function GRNModal({po,poItems,departments,onClose,onSuccess}:{po:any;poItems:any[];departments:any[];onClose:()=>void;onSuccess:()=>void}){
  const [form,setForm]=useState({receivedBy:"",departmentId:"",invoiceNumber:"",notes:""});
  const [items,setItems]=useState(poItems.map(i=>({...i,receivedQty:i.quantity,unitCost:i.unit_cost||"",batchNumber:"",lotNumber:"",expiryDate:"",manufactureDate:""})));
  const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const set=(k:string,v:any)=>setForm(f=>({...f,[k]:v}));

  return(
    <div style={s.overlay}><div style={{...s.modal,width:800}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h3 style={{fontSize:16,fontWeight:600,margin:0}}>📥 Goods Receipt Note</h3><div style={{fontSize:12,color:"#6b7280"}}>PO: {po?.po_number} · Supplier: {po?.supplier_name}</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon d={icons.x} size={18} color="#6b7280"/></button>
      </div>
      {error&&<div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:12}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Received By *</label><input style={s.input} value={form.receivedBy} onChange={e=>set("receivedBy",e.target.value)} placeholder="Your name"/></div>
        <div style={s.fgroup}><label style={{...s.label,color:"#dc2626"}}>Store / Department *</label>
          <select style={s.input} value={form.departmentId} onChange={e=>set("departmentId",e.target.value)}>
            <option value="">Select store</option>
            {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={s.fgroup}><label style={s.label}>Invoice Number</label><input style={s.input} value={form.invoiceNumber} onChange={e=>set("invoiceNumber",e.target.value)}/></div>
        <div style={{gridColumn:"1/-1",...s.fgroup}}><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={e=>set("notes",e.target.value)}/></div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
          <thead><tr>{["Item","Ordered","Received","Unit Cost","Batch","Lot","Expiry","Mfg Date"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {items.map((item,i)=>(
              <tr key={item.id}>
                <td style={{...s.td,fontWeight:600,minWidth:140}}>{item.item_name}</td>
                <td style={{...s.td,fontWeight:700,color:"#6b7280"}}>{item.quantity}</td>
                <td style={s.td}><input type="number" min={0} max={item.quantity} value={item.receivedQty} onChange={e=>setItems(it=>it.map((it2,j)=>j===i?{...it2,receivedQty:e.target.value}:it2))} style={{...s.input,width:70,textAlign:"center" as const,borderColor:parseInt(item.receivedQty)<item.quantity?"#f59e0b":"#d1d5db"}}/></td>
                <td style={s.td}><input type="number" step="0.01" value={item.unitCost} onChange={e=>setItems(it=>it.map((it2,j)=>j===i?{...it2,unitCost:e.target.value}:it2))} style={{...s.input,width:80}} placeholder="0.00"/></td>
                <td style={s.td}><input value={item.batchNumber} onChange={e=>setItems(it=>it.map((it2,j)=>j===i?{...it2,batchNumber:e.target.value}:it2))} style={{...s.input,width:100}} placeholder="BAT-..."/></td>
                <td style={s.td}><input value={item.lotNumber} onChange={e=>setItems(it=>it.map((it2,j)=>j===i?{...it2,lotNumber:e.target.value}:it2))} style={{...s.input,width:90}} placeholder="LOT-..."/></td>
                <td style={s.td}><input type="date" value={item.expiryDate} onChange={e=>setItems(it=>it.map((it2,j)=>j===i?{...it2,expiryDate:e.target.value}:it2))} style={{...s.input,width:130}}/></td>
                <td style={s.td}><input type="date" value={item.manufactureDate} onChange={e=>setItems(it=>it.map((it2,j)=>j===i?{...it2,manufactureDate:e.target.value}:it2))} style={{...s.input,width:130}}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...s.btn("ghost"),border:"1px solid #e5e7eb"}}>Cancel</button>
        <button disabled={loading||!form.receivedBy||!form.departmentId} onClick={async()=>{setLoading(true);try{const res=await fetch("/api/hospital/grn",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({poId:po?.id,...form,supplierName:po?.supplier_name,items:items.map(i=>({itemId:i.item_id,itemName:i.item_name,uom:i.uom,orderedQty:i.quantity,receivedQty:parseInt(i.receivedQty)||0,unitCost:parseFloat(i.unitCost)||0,batchNumber:i.batchNumber,lotNumber:i.lotNumber,expiryDate:i.expiryDate||null,manufactureDate:i.manufactureDate||null}))})});if(!res.ok)throw new Error("Failed");onSuccess();onClose();}catch(e:any){setError(e.message);}finally{setLoading(false);}}} style={s.btn("green")}>{loading?"Saving...":"Confirm Receipt"}</button>
      </div>
    </div></div>
  );
}


// ── Fulfill Requests Section ──────────────────────────────────────────────
function FulfillRequestsSection({transfers,departments,onRefresh}:{transfers:any[];departments:any[];onRefresh:()=>void}){
  const requests=transfers.filter(t=>(t.sent_by||"").startsWith("REQUEST by"));
  const [expandedId,setExpandedId]=useState<string|null>(null);
  const [itemsMap,setItemsMap]=useState<Record<string,any[]>>({});
  const [sentByMap,setSentByMap]=useState<Record<string,string>>({});
  const [saving,setSaving]=useState<string|null>(null);

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
          sentBy,
          items:items.map(i=>({id:i.id,quantity:i.quantity})),
        })
      });
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
  type Tab="items"|"stock"|"history"|"manufacturers"|"storage"|"departments"|"transfers"|"uom"|"pr"|"po"|"grn"|"reports";
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
  const [reports,setReports]=useState<any[]>([]);
  const [reportType,setReportType]=useState<"stock"|"consumption">("stock");
  const [prs,setPrs]=useState<any[]>([]);
  const [pos,setPos]=useState<any[]>([]);
  const [grns,setGrns]=useState<any[]>([]);
  const [tibbnaSuppliers,setTibbnaSuppliers]=useState<any[]>([]);
  const [showAddItem,setShowAddItem]=useState(false);
  const [uomConversions,setUomConversions]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  const [page,setPage]=useState(1); const PAGE_SIZE=15;
  const [transferStatus,setTransferStatus]=useState("ALL");
  const [prStatus,setPrStatus]=useState("ALL");
  const [poStatus,setPoStatus]=useState("ALL");
  const [grnStatus,setGrnStatus]=useState("ALL");
  const [toast,setToast]=useState("");
  // Modals
  const [showTransfer,setShowTransfer]=useState(false);
  const [viewItem,setViewItem]=useState<any>(null);
  const [editItem,setEditItem]=useState<any>(null);
  const [showPRModal,setShowPRModal]=useState(false);
  const [prCart,setPrCart]=useState<any[]>([]);
  const [showPOModal,setShowPOModal]=useState(false);
  const [showGRNModal,setShowGRNModal]=useState(false);
  const [selectedPR,setSelectedPR]=useState<any>(null);
  const [selectedPRItems,setSelectedPRItems]=useState<any[]>([]);
  const [selectedPO,setSelectedPO]=useState<any>(null);
  const [selectedPOItems,setSelectedPOItems]=useState<any[]>([]);
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
  const fetchDepartments=useCallback(async()=>{try{const r=await fetch("/api/hospital/departments");const d=await r.json();setDepartments(Array.isArray(d)?d:[]);}catch(e){console.error('fetchDepartments:',e);}},[]);
  const fetchManufacturers=useCallback(async()=>{try{const r=await fetch("/api/hospital/manufacturers");const d=await r.json();setManufacturers(Array.isArray(d)?d:[]);}catch(e){console.error('fetchMfr:',e);}},[]);
  const fetchStorage=useCallback(async()=>{const r=await fetch("/api/hospital/storage");const d=await r.json();setStorageLocations(Array.isArray(d)?d:[]);},[]);
  const fetchTransfers=useCallback(async()=>{const r=await fetch(`/api/hospital/transfers?status=${transferStatus==="ALL"?"":transferStatus}`);const d=await r.json();setTransfers(Array.isArray(d)?d:[]);},[transferStatus]);
  const fetchHistory=useCallback(async()=>{const r=await fetch(`/api/hospital/history?page=${historyPage}`);const d=await r.json();setHistory(d.rows??[]);setHistoryTotal(d.total??0);},[historyPage]);
  const fetchReports=useCallback(async()=>{const r=await fetch(`/api/hospital/reports?type=${reportType}`);const d=await r.json();setReports(Array.isArray(d)?d:[]);},[reportType]);
  const fetchPRs=useCallback(async()=>{const r=await fetch(`/api/hospital/pr?status=${prStatus==="ALL"?"":prStatus}`);const d=await r.json();setPrs(Array.isArray(d)?d:[]);},[prStatus]);
  const fetchPOs=useCallback(async()=>{const r=await fetch(`/api/hospital/po?status=${poStatus==="ALL"?"":poStatus}`);const d=await r.json();setPos(Array.isArray(d)?d:[]);},[poStatus]);
  const fetchGRNs=useCallback(async()=>{const r=await fetch(`/api/hospital/grn?status=${grnStatus==="ALL"?"":grnStatus}`);const d=await r.json();setGrns(Array.isArray(d)?d:[]);},[grnStatus]);
  const fetchTibbnaSuppliers=useCallback(async()=>{try{const r=await fetch("/api/tibbna/suppliers");const d=await r.json();setTibbnaSuppliers(Array.isArray(d)?d:[]);}catch(e){console.error('fetchSuppliers:',e);}},[]);
  const fetchUom=useCallback(async()=>{const r=await fetch("/api/uom");const d=await r.json();setUomConversions(Array.isArray(d)?d:[]);},[]);

  useEffect(()=>{fetchItems();},[fetchItems]);
  useEffect(()=>{fetchDepartments();},[fetchDepartments]);
  useEffect(()=>{fetchManufacturers();},[fetchManufacturers]);
  useEffect(()=>{fetchTibbnaSuppliers();},[fetchTibbnaSuppliers]);
  useEffect(()=>{if(tab==="stock")fetchStock();},[tab,fetchStock]);
  useEffect(()=>{if(tab==="storage")fetchStorage();},[tab,fetchStorage]);
  useEffect(()=>{if(tab==="transfers")fetchTransfers();},[tab,transferStatus,fetchTransfers]);
  useEffect(()=>{if(tab==="history")fetchHistory();},[tab,historyPage,fetchHistory]);
  useEffect(()=>{if(tab==="reports")fetchReports();},[tab,reportType,fetchReports]);
  useEffect(()=>{if(tab==="pr")fetchPRs();},[tab,prStatus,fetchPRs]);
  useEffect(()=>{if(tab==="po")fetchPOs();},[tab,poStatus,fetchPOs]);
  useEffect(()=>{if(tab==="grn")fetchGRNs();},[tab,grnStatus,fetchGRNs]);
  useEffect(()=>{if(tab==="uom")fetchUom();},[tab,fetchUom]);


  const addToPRCart=(item:any)=>{setPrCart(c=>{if(c.find((i:any)=>i.id===item.id))return c;return[...c,{...item,qty:1}];});showToast(`${item.name} added to PR cart`);};
  const openPOFromPR=async(pr:any)=>{setSelectedPR(pr);const r=await fetch(`/api/hospital/pr/${pr.id}`);const d=await r.json();setSelectedPRItems(Array.isArray(d)?d:[]);setShowPOModal(true);};
  const openGRNFromPO=async(po:any)=>{setSelectedPO(po);const r=await fetch(`/api/hospital/po/${po.id}`);const d=await r.json();setSelectedPOItems(Array.isArray(d)?d:[]);setShowGRNModal(true);};

  const totalItems=items.length;
  const lowStock=items.filter(i=>parseInt(i.total_stock||0)>0&&parseInt(i.total_stock||0)<=parseInt(i.reorder_level||0)).length;
  const outOfStock=items.filter(i=>parseInt(i.total_stock||0)===0).length;
  const totalDepts=departments.length;
  const pendingPRs=prs.filter((p:any)=>p.status==="SUBMITTED").length;

  const tabLabels:Record<Tab,string>={
    items:`Items (${totalItems})`,stock:"Stock",history:"History",
    manufacturers:"🏭 Manufacturers",storage:"📍 Storage",
    departments:`🏥 Depts (${totalDepts})`,
    transfers:`🔄 Transfers${transfers.filter(t=>t.status==="PENDING").length>0?` (${transfers.filter(t=>t.status==="PENDING").length})`:""}`,
    uom:"UOM",
    pr:`📋 PR${pendingPRs>0?` (${pendingPRs})`:""}`,
    po:"🛍️ PO",grn:"📥 GRN",reports:"📊 Reports",
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
          <button onClick={()=>setShowPRModal(true)} style={{...s.btn("orange"),display:"flex",alignItems:"center",gap:6}}>📋 New PR {prCart.length>0&&<span style={{background:"#fff",color:"#d97706",borderRadius:20,fontSize:10,fontWeight:700,padding:"1px 6px"}}>{prCart.length}</span>}</button>
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
              <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{items.length} items</span>
            </div>
            {loading?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>Loading...</div>
            :items.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}>No items. <button onClick={()=>setShowAddItem(true)} style={{color:"#6366f1",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Add one →</button></div>
            :<>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Code","Type","UOM","Stock","Unit Cost","Storage","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {items.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(item=>{
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
                              <button onClick={()=>addToPRCart(item)} style={{background:"#fef3c7",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:11,fontWeight:700,color:"#92400e"}} title="Add to PR cart">PR+</button>
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
                            <td style={s.td}><span style={s.badge("#eef2ff","#6366f1")}>{row.department_name??"Main"}</span></td>
                            <td style={{...s.td,fontWeight:700}}>{row.quantity||0}</td>
                            <td style={{...s.td,fontWeight:700,color:stc.color}}>{avail}</td>
                            <td style={{...s.td,color:"#6b7280"}}>{row.reorder_level||0}</td>
                            <td style={s.td}><span style={s.badge(stc.bg,stc.color)}>{stc.label}</span></td>
                            <td style={s.td}><div style={{display:"flex",gap:4}}>
                              <button onClick={()=>{setEditItem(row);setEditStockForm({name:row.name,generic_name:row.generic_name??"",uom:row.uom,unit_cost:row.unit_cost??"",selling_price:row.selling_price??"",reorder_level:row.reorder_level??"",quantity:row.quantity??""});}} style={{background:"#f0fdf4",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}><Icon d={icons.edit} size={12} color="#16a34a"/></button>
                              <button onClick={()=>addToPRCart(row)} style={{background:"#fef3c7",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:10,fontWeight:700,color:"#92400e"}}>PR+</button>
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
        {tab==="history"&&(
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" as const}}>
              <span style={{fontSize:13,fontWeight:600}}>Transaction History</span>
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
        )}

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
            <FulfillRequestsSection transfers={transfers} departments={departments} onRefresh={()=>{fetchTransfers();fetchStock();showToast("Transfer sent! Department can now receive it.");}}/>

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

        {/* ── PR TAB ────────────────────────────────────────────────────── */}
        {tab==="pr"&&(
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" as const}}>
              <span style={{fontSize:13,fontWeight:600}}>Purchase Requisitions</span>
              <div style={{display:"flex",gap:5}}>{["ALL","DRAFT","SUBMITTED","APPROVED","REJECTED"].map(st=>(<button key={st} onClick={()=>setPrStatus(st)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${prStatus===st?"#6366f1":"#e5e7eb"}`,background:prStatus===st?"#6366f1":"#f9fafb",color:prStatus===st?"#fff":"#374151"}}>{st}</button>))}</div>
              <button onClick={fetchPRs} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:5}}><Icon d={icons.refresh} size={13}/></button>
              <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{prs.length} PRs</span>
            </div>
            {prs.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}><div style={{fontSize:32,marginBottom:8}}>📋</div><div style={{fontSize:14,fontWeight:600}}>No PRs yet</div><div style={{fontSize:12,marginTop:4}}>Add items to PR Cart from Items tab, then click PR button</div></div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["PR #","Department","Requested By","Items","Priority","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {prs.filter(p=>prStatus==="ALL"||p.status===prStatus).map(pr=>{
                      const stc=statusColors[pr.status]??{bg:"#f3f4f6",color:"#374151"};
                      const pcolor=pr.priority==="URGENT"?{bg:"#fee2e2",color:"#991b1b"}:pr.priority==="LOW"?{bg:"#f3f4f6",color:"#374151"}:{bg:"#dbeafe",color:"#1d4ed8"};
                      return(<tr key={pr.id}>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6366f1"}}>{pr.pr_number}</td>
                        <td style={s.td}>{pr.department_name??"Main Store"}</td>
                        <td style={{...s.td,fontWeight:600}}>{pr.requested_by??"—"}</td>
                        <td style={{...s.td,fontWeight:600}}>{pr.item_count??0} items</td>
                        <td style={s.td}><span style={s.badge(pcolor.bg,pcolor.color)}>{pr.priority}</span></td>
                        <td style={s.td}><span style={s.badge(stc.bg,stc.color)}>{pr.status}</span></td>
                        <td style={s.td}>
                          <div style={{display:"flex",gap:4}}>
                            {pr.status==="DRAFT"&&<button onClick={async()=>{await fetch(`/api/hospital/pr/${pr.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"SUBMITTED"})});fetchPRs();showToast("Submitted!");}} style={{...s.btn("blue"),padding:"3px 8px",fontSize:11}}>Submit</button>}
                            {pr.status==="SUBMITTED"&&<>
                              <button onClick={async()=>{await fetch(`/api/hospital/pr/${pr.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"APPROVED"})});fetchPRs();showToast("Approved!");}} style={{...s.btn("green"),padding:"3px 8px",fontSize:11}}>Approve</button>
                              <button onClick={async()=>{await fetch(`/api/hospital/pr/${pr.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"REJECTED"})});fetchPRs();showToast("Rejected");}} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",padding:"3px 8px",fontSize:11}}>Reject</button>
                            </>}
                            {pr.status==="APPROVED"&&<button onClick={()=>openPOFromPR(pr)} style={{...s.btn("purple"),padding:"3px 8px",fontSize:11,display:"flex",alignItems:"center",gap:4}}><Icon d={icons.doc} size={11} color="#fff"/> Create PO</button>}
                          </div>
                        </td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PO TAB ────────────────────────────────────────────────────── */}
        {tab==="po"&&(
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" as const}}>
              <span style={{fontSize:13,fontWeight:600}}>Purchase Orders</span>
              <div style={{display:"flex",gap:5}}>{["ALL","DRAFT","SENT","RECEIVED","CANCELLED"].map(st=>(<button key={st} onClick={()=>setPoStatus(st)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${poStatus===st?"#6366f1":"#e5e7eb"}`,background:poStatus===st?"#6366f1":"#f9fafb",color:poStatus===st?"#fff":"#374151"}}>{st}</button>))}</div>
              <button onClick={fetchPOs} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:5}}><Icon d={icons.refresh} size={13}/></button>
              <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{pos.length} POs</span>
            </div>
            {pos.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}><div style={{fontSize:32,marginBottom:8}}>🛍️</div><div style={{fontSize:14,fontWeight:600}}>No POs yet</div><div style={{fontSize:12,marginTop:4}}>Create from an approved PR → "Create PO"</div></div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["PO #","PR #","Supplier","Created By","Items","Total","Expected","Status","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {pos.filter(p=>poStatus==="ALL"||p.status===poStatus).map(po=>{
                      const stc=statusColors[po.status]??{bg:"#f3f4f6",color:"#374151"};
                      return(<tr key={po.id}>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6366f1"}}>{po.po_number}</td>
                        <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>{po.pr_number??"—"}</td>
                        <td style={{...s.td,fontWeight:600}}>{po.supplier_name??"—"}</td>
                        <td style={s.td}>{po.created_by??"—"}</td>
                        <td style={{...s.td,fontWeight:600}}>{po.item_count??0} items</td>
                        <td style={{...s.td,color:"#16a34a",fontWeight:600}}>{po.total_amount?`$${parseFloat(po.total_amount).toFixed(2)}`:"—"}</td>
                        <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{po.expected_date?new Date(po.expected_date).toLocaleDateString():"—"}</td>
                        <td style={s.td}><span style={s.badge(stc.bg,stc.color)}>{po.status}</span></td>
                        <td style={s.td}>
                          <div style={{display:"flex",gap:4}}>
                            {po.status==="DRAFT"&&<button onClick={async()=>{await fetch(`/api/hospital/po/${po.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"SENT"})});fetchPOs();showToast("Marked as Sent!");}} style={{...s.btn("blue"),padding:"3px 8px",fontSize:11}}>Mark Sent</button>}
                            {(po.status==="SENT"||po.status==="DRAFT")&&<button onClick={()=>openGRNFromPO(po)} style={{...s.btn("green"),padding:"3px 8px",fontSize:11,display:"flex",alignItems:"center",gap:4}}><Icon d={icons.check} size={11} color="#fff"/> Receive (GRN)</button>}
                          </div>
                        </td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── GRN TAB ───────────────────────────────────────────────────── */}
        {tab==="grn"&&(
          <div style={s.card}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" as const}}>
              <span style={{fontSize:13,fontWeight:600}}>Goods Receipt Notes</span>
              <div style={{display:"flex",gap:5}}>{["ALL","PENDING","PARTIAL","COMPLETE"].map(st=>(<button key={st} onClick={()=>setGrnStatus(st)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${grnStatus===st?"#6366f1":"#e5e7eb"}`,background:grnStatus===st?"#6366f1":"#f9fafb",color:grnStatus===st?"#fff":"#374151"}}>{st}</button>))}</div>
              <button onClick={fetchGRNs} style={{...s.btn("ghost"),border:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:5}}><Icon d={icons.refresh} size={13}/></button>
              <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{grns.length} GRNs</span>
            </div>
            {grns.length===0?<div style={{padding:40,textAlign:"center",color:"#9ca3af"}}><div style={{fontSize:32,marginBottom:8}}>📥</div><div style={{fontSize:14,fontWeight:600}}>No GRNs yet</div><div style={{fontSize:12,marginTop:4}}>Create from a PO → "Receive (GRN)"</div></div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["GRN #","PO #","Supplier","Department","Received By","Invoice","Items","Created","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {grns.filter(g=>grnStatus==="ALL"||g.status===grnStatus).map(grn=>{
                      const stc=statusColors[grn.status]??{bg:"#f3f4f6",color:"#374151"};
                      return(<tr key={grn.id}><td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6366f1"}}>{grn.grn_number}</td><td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>{grn.po_number??"—"}</td><td style={{...s.td,fontWeight:600}}>{grn.supplier_name??"—"}</td><td style={s.td}>{grn.department_name??"Main"}</td><td style={s.td}>{grn.received_by??"—"}</td><td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{grn.invoice_number??"—"}</td><td style={{...s.td,fontWeight:600}}>{grn.item_count??0} items</td><td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(grn.createdat).toLocaleDateString()}</td><td style={s.td}><span style={s.badge(stc.bg,stc.color)}>{grn.status}</span></td></tr>);
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
      </div>

      {/* Modals */}
      <ViewItemModal item={viewItem} onClose={()=>setViewItem(null)} onAddToPR={()=>setShowPRModal(true)}/>
      {showAddItem&&<AddItemWizard onClose={()=>setShowAddItem(false)} onSuccess={()=>{fetchItems();showToast("Item added!");}} departments={departments} storageLocations={storageLocations} manufacturers={manufacturers} suppliers={tibbnaSuppliers}/>}
      {showTransfer&&<TransferModal items={items} departments={departments} onClose={()=>setShowTransfer(false)} onSuccess={()=>{fetchTransfers();showToast("Transfer created!");}}/>}
      {showPRModal&&<PRModal initialCart={prCart} departments={departments} suppliers={tibbnaSuppliers} onClose={()=>setShowPRModal(false)} onSuccess={()=>{setPrCart([]);fetchPRs();setTab("pr");showToast("PR created!");}}/>}
      {showPOModal&&selectedPR&&<POModal pr={selectedPR} prItems={selectedPRItems} tibbnaSuppliers={tibbnaSuppliers} departments={departments} onClose={()=>setShowPOModal(false)} onSuccess={()=>{fetchPOs();setTab("po");showToast("PO created!");}}/>}
      {showGRNModal&&selectedPO&&<GRNModal po={selectedPO} poItems={selectedPOItems} departments={departments} onClose={()=>setShowGRNModal(false)} onSuccess={()=>{fetchGRNs();fetchStock();setTab("grn");showToast("GRN saved! Stock updated.");}}/>}

      {toast&&<div style={{position:"fixed",bottom:24,right:24,background:"#16a34a",color:"#fff",padding:"11px 18px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:2000}}>✓ {toast}</div>}
    </div>
  );
}
