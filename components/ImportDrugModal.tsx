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
  spin:    "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
};

const FORM_COLORS: Record<string, string> = {
  tablet: "#2563eb", capsule: "#16a34a", inhaler: "#d97706",
  syrup: "#7c3aed", injection: "#dc2626", cream: "#0891b2",
  drops: "#6b7280", suppository: "#92400e", patch: "#065f46", powder: "#9a3412",
};

interface GlobalDrug {
  drugid: string;
  name: string;
  genericname: string | null;
  atccode: string | null;
  nationalcode: string | null;
  form: string | null;
  strength: string | null;
  unit: string | null;
  manufacturer: string | null;
  description: string | null;
  indication: string | null;
  interaction: string | null;
  warning: string | null;
  sideeffect: string | null;
  storagetype: string | null;
  traffic: string | null;
  pregnancy: string | null;
  requiresprescription: boolean;
}

interface ImportDrugModalProps {
  onClose: () => void;
  onImport: (drug: GlobalDrug) => void;
}

export function ImportDrugModal({ onClose, onImport }: ImportDrugModalProps) {
  const [search, setSearch]       = useState("");
  const [results, setResults]     = useState<GlobalDrug[]>([]);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState<GlobalDrug | null>(null);
  const [error, setError]         = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const res  = await fetch(`/api/drugs/global?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setResults(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message);
        setResults([]);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formColor = selected ? (FORM_COLORS[selected.form ?? ""] ?? "#6b7280") : "#6b7280";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } input { color: #111827 !important; } .drug-row:hover { background: #f0f9ff !important; cursor: pointer; } .drug-row.selected { background: #eff6ff !important; }`}</style>

      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#eff6ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={icons.import} size={18} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Import from Drug Database</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Search the global drug registry and auto-fill fields</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}>
            <Icon d={icons.x} size={16} color="#6b7280" />
          </button>
        </div>

        {/* Search bar */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              {loading
                ? <Icon d={icons.spin} size={15} color="#9ca3af" />
                : <Icon d={icons.search} size={15} color="#9ca3af" />
              }
            </div>
            <input
              ref={inputRef}
              value={search}
              onChange={e => { setSearch(e.target.value); setSelected(null); }}
              placeholder="Search by drug name, generic name, or ATC code..."
              style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", background: "#f9fafb" }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setResults([]); setSelected(null); }}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Icon d={icons.x} size={14} color="#9ca3af" />
              </button>
            )}
          </div>
          {error && <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626" }}>{error}</div>}
        </div>

        {/* Body — results left, preview right */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

          {/* Results list */}
          <div style={{ width: 320, borderRight: "1px solid #f3f4f6", overflowY: "auto", flexShrink: 0 }}>
            {search.length < 2 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <Icon d={icons.search} size={32} color="#d1d5db" />
                <div style={{ marginTop: 12, fontSize: 13, color: "#9ca3af" }}>Type at least 2 characters to search</div>
              </div>
            ) : loading && results.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: "#9ca3af" }}>Searching...</div>
            ) : results.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>No drugs found for "{search}"</div>
              </div>
            ) : (
              <>
                <div style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f9fafb" }}>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </div>
                {results.map(drug => {
                  const fc = FORM_COLORS[drug.form ?? ""] ?? "#6b7280";
                  const isSelected = selected?.drugid === drug.drugid;
                  return (
                    <div key={drug.drugid} className={`drug-row${isSelected ? " selected" : ""}`}
                      onClick={() => setSelected(drug)}
                      style={{ padding: "12px 16px", borderBottom: "1px solid #f9fafb", background: isSelected ? "#eff6ff" : "#fff" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{drug.name}</div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{drug.genericname ?? "—"}</div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                          {drug.form && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: `${fc}18`, color: fc, whiteSpace: "nowrap" }}>
                              {drug.form}
                            </span>
                          )}
                          {isSelected && <Icon d={icons.check} size={14} color="#2563eb" />}
                        </div>
                      </div>
                      {drug.atccode && (
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3, fontFamily: "monospace" }}>{drug.atccode}</div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Preview panel */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {!selected ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#9ca3af" }}>
                <Icon d={icons.pill} size={40} color="#e5e7eb" />
                <div style={{ fontSize: 13, textAlign: "center" }}>Select a drug from the list to preview its details</div>
              </div>
            ) : (
              <>
                {/* Drug header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${formColor}18`, border: `1px solid ${formColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon d={icons.pill} size={20} color={formColor} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{selected.genericname}</div>
                  </div>
                </div>

                {/* Fields that will be auto-filled */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Fields that will be auto-filled
                  </div>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", display: "flex", flex: 1, flexWrap: "wrap", gap: 6 }}>
                    {[
                      { label: "Name",         value: selected.name },
                      { label: "Generic name", value: selected.genericname },
                      { label: "ATC code",     value: selected.atccode },
                      { label: "National code",value: selected.nationalcode },
                      { label: "Form",         value: selected.form },
                      { label: "Strength",     value: selected.strength },
                      { label: "Unit",         value: selected.unit },
                      { label: "Manufacturer", value: selected.manufacturer },
                      { label: "Indication",   value: selected.indication },
                      { label: "Interaction",  value: selected.interaction },
                      { label: "Warning",      value: selected.warning },
                      { label: "Side effects", value: selected.sideeffect },
                      { label: "Storage type", value: selected.storagetype },
                      { label: "Traffic",      value: selected.traffic },
                      { label: "Pregnancy cat",value: selected.pregnancy },
                      { label: "Requires Rx",  value: selected.requiresprescription ? "Yes" : "No" },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px" }}>
                        <span style={{ fontSize: 10, color: "#6b7280" }}>{f.label}: </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#111827" }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fields user still needs to fill */}
                <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>You will still need to fill in:</div>
                  <div style={{ fontSize: 12, color: "#92400e" }}>Unit cost · Selling price · Billing code · Min/max stock · Lead time · Supplier · Insurance approved</div>
                </div>

                {/* Import button */}
                <button onClick={() => onImport(selected)}
                  style={{ width: "100%", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon d={icons.import} size={16} color="#fff" />
                  Import "{selected.name}"
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
