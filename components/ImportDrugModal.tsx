"use client";
import { useState, useEffect, useRef } from "react";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  x:       "M18 6L6 18M6 6l12 12",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  check:   "M20 6L9 17l-5-5",
  import:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  pill:    "M10.5 6.5L6.5 10.5M9 3l12 12-6 6L3 9l6-6z",
  box:     "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  update:  "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

const FORM_COLORS: Record<string, string> = {
  tablet: "#2563eb", capsule: "#16a34a", inhaler: "#d97706",
  syrup: "#7c3aed", injection: "#dc2626", cream: "#0891b2",
  drops: "#6b7280", suppository: "#92400e", patch: "#065f46", powder: "#9a3412",
};

interface ImportDrugModalProps {
  onClose: () => void;
  onImport: (drug: any) => void;
}

export function ImportDrugModal({ onClose, onImport }: ImportDrugModalProps) {
  const [search, setSearch]             = useState("");
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [selected, setSelected]         = useState<any>(null);
  const [selectedSource, setSelectedSource] = useState<"local"|"global"|null>(null);
  const [error, setError]               = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (search.length < 2) { setLocalResults([]); setGlobalResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        // Search BOTH simultaneously
        const [localRes, globalRes] = await Promise.all([
          fetch(`/api/pharmacy/items?search=${encodeURIComponent(search)}`),
          fetch(`/api/drugs/global?search=${encodeURIComponent(search)}`),
        ]);
        const [localData, globalData] = await Promise.all([localRes.json(), globalRes.json()]);
        setLocalResults(Array.isArray(localData) ? localData.slice(0, 8) : []);
        setGlobalResults(Array.isArray(globalData) ? globalData.slice(0, 15) : []);
      } catch (e: any) {
        setError("Search failed — check connection");
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const selectLocal = (item: any) => {
    setSelected(item);
    setSelectedSource("local");
  };

  const selectGlobal = (drug: any) => {
    setSelected(drug);
    setSelectedSource("global");
  };

  const handleImport = () => {
    if (!selected) return;
    if (selectedSource === "local") {
      // Pass local item — wizard will open in UPDATE mode
      onImport({ ...selected, _source: "local", _isUpdate: true });
    } else {
      // Pass global drug — wizard will open in ADD mode
      onImport({ ...selected, _source: "global", _isUpdate: false });
    }
  };

  const totalResults = localResults.length + globalResults.length;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing:border-box; } input { color:#111827 !important; } .drug-row:hover { background:#f0f9ff !important; cursor:pointer; }`}</style>

      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:700, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 25px 50px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#eff6ff", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon d={icons.import} size={18} color="#2563eb"/>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Search Drug Database</div>
              <div style={{ fontSize:12, color:"#6b7280" }}>Checks pharmacy inventory first, then global database</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#f3f4f6", border:"none", borderRadius:8, padding:8, cursor:"pointer", display:"flex" }}>
            <Icon d={icons.x} size={16} color="#6b7280"/>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding:"16px 24px", borderBottom:"1px solid #f3f4f6", flexShrink:0 }}>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}>
              <Icon d={icons.search} size={15} color="#9ca3af"/>
            </div>
            <input
              ref={inputRef}
              value={search}
              onChange={e => { setSearch(e.target.value); setSelected(null); setSelectedSource(null); }}
              placeholder="Search by drug name, generic name, or ATC code..."
              style={{ width:"100%", padding:"10px 36px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, outline:"none", background:"#f9fafb" }}
            />
            {search && (
              <button onClick={()=>{setSearch("");setLocalResults([]);setGlobalResults([]);setSelected(null);}}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                <Icon d={icons.x} size={14} color="#9ca3af"/>
              </button>
            )}
          </div>
          {error && <div style={{ marginTop:8, fontSize:12, color:"#dc2626" }}>{error}</div>}
        </div>

        {/* Body */}
        <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>

          {/* Results list */}
          <div style={{ width:320, borderRight:"1px solid #f3f4f6", overflowY:"auto", flexShrink:0 }}>
            {search.length < 2 ? (
              <div style={{ padding:32, textAlign:"center" }}>
                <Icon d={icons.search} size={32} color="#d1d5db"/>
                <div style={{ marginTop:12, fontSize:13, color:"#9ca3af" }}>Type at least 2 characters to search</div>
              </div>
            ) : loading && totalResults === 0 ? (
              <div style={{ padding:32, textAlign:"center", fontSize:13, color:"#9ca3af" }}>Searching pharmacy and global database...</div>
            ) : totalResults === 0 ? (
              <div style={{ padding:32, textAlign:"center", fontSize:13, color:"#9ca3af" }}>No drugs found for "{search}"</div>
            ) : (
              <>
                {/* LOCAL RESULTS */}
                {localResults.length > 0 && (
                  <>
                    <div style={{ padding:"8px 16px", fontSize:11, fontWeight:700, color:"#065f46", textTransform:"uppercase" as const, letterSpacing:"0.05em", background:"#f0fdf4", borderBottom:"1px solid #d1fae5", display:"flex", alignItems:"center", gap:6 }}>
                      <Icon d={icons.box} size={12} color="#16a34a"/>
                      In Pharmacy ({localResults.length})
                    </div>
                    {localResults.map(item => (
                      <div key={item.id} className="drug-row"
                        onClick={() => selectLocal(item)}
                        style={{ padding:"10px 16px", borderBottom:"1px solid #f9fafb", background: selected?.id === item.id ? "#f0fdf4" : "#fff", cursor:"pointer" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{item.name}</div>
                            <div style={{ fontSize:11, color:"#6b7280" }}>{item.genericName ?? "—"}</div>
                          </div>
                          <div style={{ flexShrink:0, textAlign:"right" as const }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#16a34a" }}>{item.totalStock} {item.uom}</div>
                            <span style={{ fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:10, background:"#d1fae5", color:"#065f46" }}>In stock</span>
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:"#9ca3af", marginTop:2, fontFamily:"monospace" }}>{item.itemcode}</div>
                        {selected?.id === item.id && (
                          <div style={{ marginTop:6, fontSize:11, color:"#16a34a", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                            <Icon d={icons.update} size={11} color="#16a34a"/> Will update stock
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* GLOBAL RESULTS */}
                {globalResults.length > 0 && (
                  <>
                    <div style={{ padding:"8px 16px", fontSize:11, fontWeight:700, color:"#1d4ed8", textTransform:"uppercase" as const, letterSpacing:"0.05em", background:"#eff6ff", borderBottom:"1px solid #bfdbfe", borderTop: localResults.length > 0 ? "2px solid #e5e7eb" : "none", display:"flex", alignItems:"center", gap:6 }}>
                      <Icon d={icons.import} size={12} color="#2563eb"/>
                      Global Database ({globalResults.length})
                    </div>
                    {globalResults.map(drug => {
                      const fc = FORM_COLORS[drug.form ?? ""] ?? "#6b7280";
                      const isSelected = selected?.drugid === drug.drugid && selectedSource === "global";
                      return (
                        <div key={drug.drugid} className="drug-row"
                          onClick={() => selectGlobal(drug)}
                          style={{ padding:"10px 16px", borderBottom:"1px solid #f9fafb", background: isSelected ? "#eff6ff" : "#fff", cursor:"pointer" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{drug.name}</div>
                              <div style={{ fontSize:11, color:"#6b7280" }}>{drug.genericname ?? "—"}</div>
                            </div>
                            <div style={{ display:"flex", gap:4, flexShrink:0, alignItems:"center" }}>
                              {drug.form && (
                                <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20, background:`${fc}18`, color:fc, whiteSpace:"nowrap" as const }}>
                                  {drug.form}
                                </span>
                              )}
                              {isSelected && <Icon d={icons.check} size={14} color="#2563eb"/>}
                            </div>
                          </div>
                          {drug.atccode && <div style={{ fontSize:10, color:"#9ca3af", marginTop:2, fontFamily:"monospace" }}>{drug.atccode}</div>}
                          {isSelected && (
                            <div style={{ marginTop:6, fontSize:11, color:"#2563eb", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                              <Icon d={icons.import} size={11} color="#2563eb"/> Will add as new drug
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {/* Preview panel */}
          <div style={{ flex:1, overflowY:"auto", padding:20 }}>
            {!selected ? (
              <div style={{ height:"100%", display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", gap:12, color:"#9ca3af" }}>
                <Icon d={icons.pill} size={40} color="#e5e7eb"/>
                <div style={{ fontSize:13, textAlign:"center" as const }}>
                  Select a drug from the list<br/>
                  <span style={{ fontSize:11 }}>Green = already in pharmacy · Blue = from global database</span>
                </div>
              </div>
            ) : selectedSource === "local" ? (
              // LOCAL PREVIEW
              <>
                <div style={{ padding:"12px 14px", background:"#f0fdf4", borderRadius:10, border:"1px solid #bbf7d0", marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#065f46", marginBottom:4 }}>✓ Already in Pharmacy Inventory</div>
                  <div style={{ fontSize:13, color:"#111827", fontWeight:600 }}>{selected.name}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{selected.genericName}</div>
                  <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      ["Item Code", selected.itemcode],
                      ["UOM", selected.uom],
                      ["Current Stock", `${selected.totalStock} ${selected.uom}`],
                      ["Reorder Level", selected.reorderLevel ?? "—"],
                      ["Purchase Price", selected.unitCost ? `$${parseFloat(selected.unitCost).toFixed(2)}` : "—"],
                      ["Selling Price", selected.sellingPrice ? `$${parseFloat(selected.sellingPrice).toFixed(2)}` : "—"],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background:"#fff", borderRadius:6, padding:"6px 10px", border:"1px solid #d1fae5" }}>
                        <div style={{ fontSize:10, color:"#6b7280" }}>{label}</div>
                        <div style={{ fontSize:12, fontWeight:600, color:"#111827" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding:"10px 14px", background:"#eef2ff", borderRadius:8, fontSize:12, color:"#4338ca", marginBottom:16 }}>
                  💡 Clicking Import will open the wizard where you can <strong>add stock quantity</strong> to this existing item. All other details are already set up.
                </div>
                <button onClick={handleImport}
                  style={{ width:"100%", padding:"12px", background:"#16a34a", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <Icon d={icons.update} size={16} color="#fff"/>
                  Update Stock for "{selected.name}"
                </button>
              </>
            ) : (
              // GLOBAL PREVIEW
              <>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${FORM_COLORS[selected.form??""]}18`, border:`1px solid ${FORM_COLORS[selected.form??""]}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon d={icons.pill} size={20} color={FORM_COLORS[selected.form??""] ?? "#6b7280"}/>
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>{selected.name}</div>
                    <div style={{ fontSize:12, color:"#6b7280" }}>{selected.genericname}</div>
                  </div>
                </div>

                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:8 }}>Fields that will be auto-filled</div>
                  <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"10px 14px", display:"flex", flexWrap:"wrap" as const, gap:6 }}>
                    {[
                      ["Name", selected.name], ["Generic", selected.genericname],
                      ["ATC", selected.atccode], ["Form", selected.form],
                      ["Strength", selected.strength], ["Unit", selected.unit],
                      ["Manufacturer", selected.manufacturer], ["Indication", selected.indication ? "✓" : null],
                      ["Warning", selected.warning ? "✓" : null], ["Storage", selected.storagetype],
                      ["Requires Rx", selected.requiresprescription ? "Yes" : null],
                    ].filter(([,v]) => v).map(([label, value]) => (
                      <div key={label as string} style={{ background:"#fff", border:"1px solid #bbf7d0", borderRadius:6, padding:"4px 10px" }}>
                        <span style={{ fontSize:10, color:"#6b7280" }}>{label}: </span>
                        <span style={{ fontSize:11, fontWeight:600, color:"#111827" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background:"#fef3c7", border:"1px solid #fde68a", borderRadius:8, padding:"10px 14px", marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#92400e", marginBottom:4 }}>You will still need to fill in:</div>
                  <div style={{ fontSize:12, color:"#92400e" }}>Unit cost · Selling price · Insurance % · Warehouse · Initial stock quantity</div>
                </div>

                <button onClick={handleImport}
                  style={{ width:"100%", padding:"12px", background:"#2563eb", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <Icon d={icons.import} size={16} color="#fff"/>
                  Import "{selected.name}" as New Drug
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
