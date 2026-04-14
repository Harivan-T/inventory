"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const icons = {
  back:     "M19 12H5M12 5l-7 7 7 7",
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  box:      "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  warning:  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  file:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
};

const s: Record<string,any> = {
  page:    { fontFamily:"Inter,sans-serif", minHeight:"100vh", background:"#f8f9fa", color:"#111827" },
  header:  { background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 24px", height:56, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 },
  content: { padding:24, maxWidth:1400, margin:"0 auto" },
  card:    { background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden", marginBottom:16 },
  th:      { padding:"10px 14px", textAlign:"left" as const, fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase" as const, background:"#f9fafb", borderBottom:"1px solid #e5e7eb", whiteSpace:"nowrap" as const },
  td:      { padding:"10px 14px", borderBottom:"1px solid #f9fafb", fontSize:13, color:"#111827" },
  btn:     (c:string) => ({ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background:c==="purple"?"#6366f1":c==="green"?"#16a34a":"#f3f4f6", color:c==="ghost"?"#374151":"#fff" }),
  input:   { padding:"8px 10px", borderRadius:8, border:"1px solid #d1d5db", fontSize:13, color:"#111827" },
  tab:     (a:boolean) => ({ padding:"10px 20px", fontSize:13, fontWeight:500, border:"none", background:"none", cursor:"pointer", borderBottom:a?"2px solid #6366f1":"2px solid transparent", color:a?"#6366f1":"#6b7280" }),
};

type ReportTab = "stock"|"consumption"|"expiry"|"pr"|"po"|"grn";

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("stock");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setMonth(d.getMonth()-1); return d.toISOString().slice(0,10); });
  const [dateTo, setDateTo]   = useState(() => new Date().toISOString().slice(0,10));
  const [category, setCategory] = useState("all");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ tab, dateFrom, dateTo, category });
    const res  = await fetch(`/api/reports?${params}`);
    const json = await res.json();
    setData(Array.isArray(json) ? json : []);
    setLoading(false);
  }, [tab, dateFrom, dateTo, category]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const tabs: { key: ReportTab; label: string; icon: string }[] = [
    { key:"stock",       label:"Stock on Hand",    icon:icons.box },
    { key:"consumption", label:"Consumption",       icon:icons.activity },
    { key:"expiry",      label:"Expiry Report",     icon:icons.warning },
    { key:"pr",          label:"Purchase Requests", icon:icons.file },
    { key:"po",          label:"Purchase Orders",   icon:icons.file },
    { key:"grn",         label:"GRN / Receipts",    icon:icons.file },
  ];

  const exportCSV = () => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const rows = [keys.join(","), ...data.map(r => keys.map(k => `"${r[k]??""}""`).join(","))];
    const blob = new Blob([rows.join("\n")], { type:"text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${tab}-report-${dateFrom}-${dateTo}.csv`; a.click();
  };

  return (
    <div style={s.page}>
      <style>{`* { box-sizing:border-box; } input,select { color:#111827 !important; } tr:hover td { background:#f9fafb; }`}</style>
      <div style={s.header}>
        <Link href="/" style={{ display:"flex", alignItems:"center", color:"#6b7280", textDecoration:"none" }}><Icon d={icons.back} size={15}/></Link>
        <div style={{ width:1, height:20, background:"#e5e7eb" }}/>
        <div style={{ width:32, height:32, background:"#f0fdf4", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon d={icons.activity} size={16} color="#16a34a"/></div>
        <span style={{ fontSize:14, fontWeight:700 }}>Reports</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={fetchReport} style={{ ...s.btn("ghost"), border:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:5 }}><Icon d={icons.refresh} size={13} color="#374151"/></button>
          <button onClick={exportCSV} style={{ ...s.btn("green"), display:"flex", alignItems:"center", gap:6 }}><Icon d={icons.download} size={13} color="#fff"/> Export CSV</button>
        </div>
      </div>

      <div style={s.content}>
        {/* Tabs */}
        <div style={{ display:"flex", gap:2, marginBottom:20, borderBottom:"1px solid #e5e7eb", background:"#fff", borderRadius:"10px 10px 0 0", padding:"0 8px" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={s.tab(tab===t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ ...s.card, padding:"12px 16px", display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" as const }}>
          {(tab==="consumption"||tab==="expiry"||tab==="pr"||tab==="po"||tab==="grn") && <>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>From</label>
              <input type="date" style={s.input} value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>To</label>
              <input type="date" style={s.input} value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
            </div>
          </>}
          {tab==="stock" && (
            <select style={s.input} value={category} onChange={e=>setCategory(e.target.value)}>
              {["all","pharmacy","lab","hospital","radiology"].map(c=><option key={c} value={c}>{c==="all"?"All Categories":c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          )}
          <span style={{ marginLeft:"auto", fontSize:12, color:"#9ca3af" }}>{data.length} records</span>
        </div>

        {/* Table */}
        <div style={s.card}>
          {loading ? <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Loading report...</div>
          : data.length===0 ? <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>No data found</div>
          : <div style={{ overflowX:"auto" }}>
            {/* STOCK ON HAND */}
            {tab==="stock" && (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Item","Code","Category","UOM","Total Stock","Reserved","Available","Reorder","Status","Unit Cost","Total Value"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.map((r:any,i:number)=>{
                    const avail = (r.totalStock||0)-(r.reservedStock||0);
                    const isLow = avail <= (r.reorderLevel||0);
                    return <tr key={i}>
                      <td style={{...s.td,fontWeight:600}}>{r.name}<div style={{fontSize:11,color:"#9ca3af"}}>{r.genericName}</div></td>
                      <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{r.itemcode}</td>
                      <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#f3f4f6",color:"#374151"}}>{r.category}</span></td>
                      <td style={s.td}>{r.uom}</td>
                      <td style={{...s.td,fontWeight:700}}>{r.totalStock}</td>
                      <td style={{...s.td,color:"#d97706"}}>{r.reservedStock||0}</td>
                      <td style={{...s.td,fontWeight:700,color:avail===0?"#dc2626":isLow?"#d97706":"#16a34a"}}>{avail}</td>
                      <td style={{...s.td,color:"#6b7280"}}>{r.reorderLevel||0}</td>
                      <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:avail===0?"#fee2e2":isLow?"#fef3c7":"#d1fae5",color:avail===0?"#991b1b":isLow?"#92400e":"#065f46"}}>{avail===0?"Out of Stock":isLow?"Low Stock":"In Stock"}</span></td>
                      <td style={s.td}>{r.unitCost?`$${parseFloat(r.unitCost).toFixed(2)}`:"—"}</td>
                      <td style={{...s.td,fontWeight:600,color:"#6366f1"}}>{r.unitCost?`$${(parseFloat(r.unitCost)*parseInt(r.totalStock||0)).toFixed(2)}`:"—"}</td>
                    </tr>;
                  })}
                </tbody>
                <tfoot>
                  <tr style={{background:"#f9fafb"}}>
                    <td colSpan={10} style={{...s.td,fontWeight:700,textAlign:"right" as const}}>Total Inventory Value:</td>
                    <td style={{...s.td,fontWeight:700,color:"#6366f1",fontSize:15}}>${data.reduce((sum:number,r:any)=>sum+(r.unitCost?(parseFloat(r.unitCost)*parseInt(r.totalStock||0)):0),0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* CONSUMPTION */}
            {tab==="consumption" && (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Item","Code","Type","Qty Consumed","Transactions","Warehouse","Last Activity"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.map((r:any,i:number)=>(
                    <tr key={i}>
                      <td style={{...s.td,fontWeight:600}}>{r.itemName}</td>
                      <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{r.itemcode}</td>
                      <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#fee2e2",color:"#991b1b"}}>{r.transactionType}</span></td>
                      <td style={{...s.td,fontWeight:700,color:"#dc2626"}}>{r.totalQty}</td>
                      <td style={s.td}>{r.txCount}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.warehouseName||"—"}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.lastActivity?new Date(r.lastActivity).toLocaleDateString():"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* EXPIRY */}
            {tab==="expiry" && (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Item","Code","Batch","Qty","Expiry Date","Days Left","Warehouse","Status"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.map((r:any,i:number)=>{
                    const days = Math.ceil((new Date(r.expiryDate).getTime()-Date.now())/86400000);
                    const st = days<=0?{bg:"#fee2e2",color:"#991b1b",label:"Expired"}:days<=30?{bg:"#fee2e2",color:"#991b1b",label:"Critical"}:days<=90?{bg:"#fef3c7",color:"#92400e",label:"Warning"}:{bg:"#d1fae5",color:"#065f46",label:"OK"};
                    return <tr key={i}>
                      <td style={{...s.td,fontWeight:600}}>{r.itemName}</td>
                      <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{r.itemcode}</td>
                      <td style={{...s.td,fontFamily:"monospace",fontSize:11}}>{r.batchNumber||"—"}</td>
                      <td style={{...s.td,fontWeight:700}}>{r.quantity}</td>
                      <td style={s.td}>{new Date(r.expiryDate).toLocaleDateString()}</td>
                      <td style={{...s.td,fontWeight:700,color:days<=30?"#dc2626":days<=90?"#d97706":"#374151"}}>{days<=0?"Expired":`${days}d`}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.warehouseName||"—"}</td>
                      <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:st.bg,color:st.color}}>{st.label}</span></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            )}

            {/* PR */}
            {tab==="pr" && (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["PR Number","Requested By","Warehouse","Status","Priority","Items","Created"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.map((r:any,i:number)=>{
                    const sc:Record<string,{bg:string,color:string}>={PENDING:{bg:"#fef3c7",color:"#92400e"},APPROVED:{bg:"#d1fae5",color:"#065f46"},REJECTED:{bg:"#fee2e2",color:"#991b1b"},ORDERED:{bg:"#dbeafe",color:"#1d4ed8"}};
                    const c=sc[r.status]??{bg:"#f3f4f6",color:"#374151"};
                    return <tr key={i}>
                      <td style={{...s.td,fontFamily:"monospace",fontWeight:600}}>{r.prnumber}</td>
                      <td style={s.td}>{r.requestedby||"—"}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.warehouseName||"—"}</td>
                      <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:c.bg,color:c.color}}>{r.status}</span></td>
                      <td style={s.td}>{r.priority||"—"}</td>
                      <td style={{...s.td,fontWeight:600}}>{r.itemCount}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{new Date(r.createdat).toLocaleDateString()}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            )}

            {/* PO */}
            {tab==="po" && (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["PO Number","Vendor","Warehouse","Status","Total Amount","Order Date","Expected"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.map((r:any,i:number)=>{
                    const sc:Record<string,{bg:string,color:string}>={DRAFT:{bg:"#f3f4f6",color:"#374151"},SENT:{bg:"#dbeafe",color:"#1d4ed8"},RECEIVED:{bg:"#d1fae5",color:"#065f46"},CANCELLED:{bg:"#fee2e2",color:"#991b1b"}};
                    const c=sc[r.status]??{bg:"#f3f4f6",color:"#374151"};
                    return <tr key={i}>
                      <td style={{...s.td,fontFamily:"monospace",fontWeight:600}}>{r.ponumber}</td>
                      <td style={s.td}>{r.vendorName||"—"}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.warehouseName||"—"}</td>
                      <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:c.bg,color:c.color}}>{r.status}</span></td>
                      <td style={{...s.td,fontWeight:600,color:"#6366f1"}}>{r.totalamount?`$${parseFloat(r.totalamount).toFixed(2)}`:"—"}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.orderdate?new Date(r.orderdate).toLocaleDateString():"—"}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.expecteddate?new Date(r.expecteddate).toLocaleDateString():"—"}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            )}

            {/* GRN */}
            {tab==="grn" && (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["GRN Number","Vendor","Warehouse","Status","Invoice","Received By","Receipt Date"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.map((r:any,i:number)=>{
                    const sc:Record<string,{bg:string,color:string}>={DRAFT:{bg:"#f3f4f6",color:"#374151"},COMPLETED:{bg:"#d1fae5",color:"#065f46"},PARTIAL:{bg:"#fef3c7",color:"#92400e"}};
                    const c=sc[r.status]??{bg:"#f3f4f6",color:"#374151"};
                    return <tr key={i}>
                      <td style={{...s.td,fontFamily:"monospace",fontWeight:600}}>{r.grnnumber}</td>
                      <td style={s.td}>{r.vendorName||"—"}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.warehouseName||"—"}</td>
                      <td style={s.td}><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:c.bg,color:c.color}}>{r.status}</span></td>
                      <td style={{...s.td,fontFamily:"monospace",fontSize:12}}>{r.invoicenumber||"—"}</td>
                      <td style={s.td}>{r.receivedby||"—"}</td>
                      <td style={{...s.td,fontSize:12,color:"#6b7280"}}>{r.receiptdate?new Date(r.receiptdate).toLocaleDateString():"—"}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            )}
          </div>}
        </div>
      </div>
    </div>
  );
}
