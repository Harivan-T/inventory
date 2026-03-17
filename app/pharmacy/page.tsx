"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  back:    "M19 12H5M12 5l-7 7 7 7",
  pill:    "M10.5 6h3M7 12h10M7 12a5 5 0 01-5-5V5h20v2a5 5 0 01-5 5M7 12v7a2 2 0 002 2h6a2 2 0 002-2v-7",
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6L6 18M6 6l12 12",
  alert:   "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  check:   "M20 6L9 17l-5-5",
  lock:    "M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V9a6 6 0 10-12 0v2H4v13h16V11h-2z",
  swap:    "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  flask:   "M9 3h6l1 7H8L9 3zM5 21h14a1 1 0 001-1 7 7 0 00-3.48-6.07L15 10H9l-1.52 3.93A7 7 0 005 20a1 1 0 001 1z",
};

const WORKSPACE = "cec4d702-6dae-4ea5-9a30-ef17842c00fd";

const s: Record<string, any> = {
  page:      { fontFamily: "Inter,sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#111827" },
  header:    { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56,
               display: "flex", alignItems: "center", gap: 16 },
  title:     { fontSize: 16, fontWeight: 600, color: "#111827" },
  content:   { padding: 24, maxWidth: 1100, margin: "0 auto" },
  tabs:      { display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e5e7eb", paddingBottom: 0 },
  tab:       (active: boolean) => ({
    padding: "10px 18px", fontSize: 13, fontWeight: 500, border: "none", background: "none",
    cursor: "pointer", borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
    color: active ? "#6366f1" : "#6b7280",
  }),
  card:      { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20, marginBottom: 16 },
  table:     { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th:        { padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12,
               color: "#6b7280", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  td:        { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#111827" },
  badge:     (c: string) => {
    const m: Record<string, [string,string]> = {
      DISPENSE: ["#dbeafe","#1d4ed8"], RETURN: ["#d1fae5","#065f46"],
      DESTROY:  ["#fee2e2","#991b1b"], AUDIT:  ["#fef3c7","#92400e"],
      active:   ["#d1fae5","#065f46"], resolved: ["#f3f4f6","#374151"],
    };
    const [bg, color] = m[c] || ["#f3f4f6","#374151"];
    return { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: bg, color };
  },
  btn:       (v: "primary"|"ghost") => ({
    padding: v === "primary" ? "8px 16px" : "7px 14px",
    borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
    background: v === "primary" ? "#6366f1" : "#f3f4f6",
    color:      v === "primary" ? "#fff"    : "#374151",
  }),
  overlay:   { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)",
               display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal:     { background: "#fff", borderRadius: 12, padding: 28, width: 520, maxHeight: "90vh",
               overflowY: "auto" as const },
  label:     { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  input:     { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db",
               fontSize: 13, color: "#111827", boxSizing: "border-box" as const },
  row2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  errorBox:  { background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 },
  successBox:{ background: "#d1fae5", color: "#065f46", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 },
  fgroup:    { marginBottom: 14 },
};

// ── Dispense Modal ────────────────────────────────────────────────────────────
function DispenseModal({ stores, onClose, onSuccess }: { stores: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    storeid: "", itemid: "", batchid: "", quantity: "",
    patientref: "", prescriptionref: "", dispensedby: "", witnessedby: "",
    actiontype: "DISPENSE", notes: "",
  });
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [isControlled, setIsControlled] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!form.storeid) { setStoreItems([]); return; }
    fetch(`/api/stores/${form.storeid}`)
      .then(r => r.json())
      .then(d => {
        setStoreItems(d.stock || []);
        set("itemid", ""); set("batchid", "");
      });
  }, [form.storeid]);

  useEffect(() => {
    if (!form.itemid) { setIsControlled(false); return; }
    const found = storeItems.find((s: any) => s.itemid === form.itemid);
    setIsControlled(found?.controlled || false);
  }, [form.itemid, storeItems]);

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.storeid || !form.itemid || !form.quantity) {
      setError("Store, item, and quantity are required"); return;
    }
    setLoading(true);
    const res = await fetch("/api/pharmacy/dispense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quantity: parseInt(form.quantity) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setSuccess(`Dispensed successfully. New stock: ${data.newQty}`);
    setTimeout(() => { onSuccess(); onClose(); }, 1200);
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Dispense Item</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icon d={icons.x} size={18} />
          </button>
        </div>
        {error   && <div style={s.errorBox}>{error}</div>}
        {success && <div style={s.successBox}>{success}</div>}

        <div style={s.fgroup}>
          <label style={s.label}>Store</label>
          <select style={s.input} value={form.storeid} onChange={e => set("storeid", e.target.value)}>
            <option value="">Select store…</option>
            {stores.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
          </select>
        </div>

        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Item</label>
            <select style={s.input} value={form.itemid} onChange={e => set("itemid", e.target.value)} disabled={!form.storeid}>
              <option value="">Select item…</option>
              {storeItems.map((si: any) => (
                <option key={si.itemid} value={si.itemid}>{si.itemname} (qty: {si.quantity})</option>
              ))}
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Quantity</label>
            <input style={s.input} type="number" min="1" value={form.quantity}
              onChange={e => set("quantity", e.target.value)} placeholder="0" />
          </div>
        </div>

        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Patient Ref / MRN</label>
            <input style={s.input} value={form.patientref} onChange={e => set("patientref", e.target.value)} placeholder="MRN-XXXX" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Prescription Ref</label>
            <input style={s.input} value={form.prescriptionref} onChange={e => set("prescriptionref", e.target.value)} placeholder="Rx-XXXX" />
          </div>
        </div>

        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Dispensed By</label>
            <input style={s.input} value={form.dispensedby} onChange={e => set("dispensedby", e.target.value)} placeholder="Pharmacist name" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>
              Witness {isControlled && <span style={{ color: "#dc2626" }}>*required</span>}
            </label>
            <input style={{ ...s.input, borderColor: isControlled && !form.witnessedby ? "#dc2626" : undefined }}
              value={form.witnessedby} onChange={e => set("witnessedby", e.target.value)}
              placeholder={isControlled ? "Required for controlled" : "Optional"} />
          </div>
        </div>

        {isControlled && (
          <div style={s.fgroup}>
            <label style={s.label}>Action Type</label>
            <select style={s.input} value={form.actiontype} onChange={e => set("actiontype", e.target.value)}>
              <option value="DISPENSE">Dispense to Patient</option>
              <option value="RETURN">Return to Store</option>
              <option value="DESTROY">Destroy / Waste</option>
              <option value="AUDIT">Audit Count</option>
            </select>
          </div>
        )}

        <div style={s.fgroup}>
          <label style={s.label}>Notes</label>
          <input style={s.input} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes" />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button style={s.btn("ghost")} onClick={onClose}>Cancel</button>
          <button style={s.btn("primary")} onClick={handleSave} disabled={loading}>
            {loading ? "Dispensing…" : "Dispense"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Controlled Log Modal ──────────────────────────────────────────────────
function AddControlledModal({ stores, onClose, onSuccess }: { stores: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    storeid: "", itemid: "", quantity: "", actiontype: "DISPENSE",
    patientref: "", prescriptionref: "", dispensedby: "", witnessedby: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.storeid || !form.itemid || !form.quantity) { setError("Store, item, quantity required"); return; }
    setLoading(true);
    const res = await fetch("/api/pharmacy/controlled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quantity: parseInt(form.quantity) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    onSuccess(); onClose();
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Add Controlled Drug Entry</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} /></button>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <div style={s.fgroup}>
          <label style={s.label}>Store</label>
          <select style={s.input} value={form.storeid} onChange={e => set("storeid", e.target.value)}>
            <option value="">Select store…</option>
            {stores.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
          </select>
        </div>
        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Item ID</label>
            <input style={s.input} value={form.itemid} onChange={e => set("itemid", e.target.value)} placeholder="Item UUID" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Quantity</label>
            <input style={s.input} type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
          </div>
        </div>
        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Action</label>
            <select style={s.input} value={form.actiontype} onChange={e => set("actiontype", e.target.value)}>
              <option value="DISPENSE">Dispense</option>
              <option value="RETURN">Return</option>
              <option value="DESTROY">Destroy</option>
              <option value="AUDIT">Audit</option>
            </select>
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Patient Ref</label>
            <input style={s.input} value={form.patientref} onChange={e => set("patientref", e.target.value)} />
          </div>
        </div>
        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>Dispensed By</label>
            <input style={s.input} value={form.dispensedby} onChange={e => set("dispensedby", e.target.value)} />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>Witnessed By *</label>
            <input style={s.input} value={form.witnessedby} onChange={e => set("witnessedby", e.target.value)} />
          </div>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Prescription Ref</label>
          <input style={s.input} value={form.prescriptionref} onChange={e => set("prescriptionref", e.target.value)} />
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Notes</label>
          <input style={s.input} value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button style={s.btn("ghost")} onClick={onClose}>Cancel</button>
          <button style={s.btn("primary")} onClick={handleSave} disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Conversion Modal ──────────────────────────────────────────────────────
function AddConversionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ itemid: "", fromuom: "", touom: "", factor: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.itemid || !form.fromuom || !form.touom || !form.factor) { setError("All fields required"); return; }
    setLoading(true);
    const res = await fetch("/api/pharmacy/conversions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, factor: parseFloat(form.factor) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    onSuccess(); onClose();
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Add Unit Conversion</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} /></button>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <div style={s.fgroup}>
          <label style={s.label}>Item ID</label>
          <input style={s.input} value={form.itemid} onChange={e => set("itemid", e.target.value)} placeholder="Item UUID" />
        </div>
        <div style={s.row2}>
          <div style={s.fgroup}>
            <label style={s.label}>From UOM</label>
            <input style={s.input} value={form.fromuom} onChange={e => set("fromuom", e.target.value)} placeholder="box" />
          </div>
          <div style={s.fgroup}>
            <label style={s.label}>To UOM</label>
            <input style={s.input} value={form.touom} onChange={e => set("touom", e.target.value)} placeholder="strip" />
          </div>
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Conversion Factor</label>
          <input style={s.input} type="number" step="0.0001" value={form.factor} onChange={e => set("factor", e.target.value)} placeholder="e.g. 10 (1 box = 10 strips)" />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button style={s.btn("ghost")} onClick={onClose}>Cancel</button>
          <button style={s.btn("primary")} onClick={handleSave} disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Recall Modal ──────────────────────────────────────────────────────────
function AddRecallModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ batchid: "", itemid: "", reason: "", quarantinedby: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.batchid || !form.reason) { setError("Batch ID and reason required"); return; }
    setLoading(true);
    const res = await fetch("/api/pharmacy/recalls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    onSuccess(); onClose();
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Quarantine / Recall Batch</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={icons.x} size={18} /></button>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <div style={s.fgroup}>
          <label style={s.label}>Batch ID</label>
          <input style={s.input} value={form.batchid} onChange={e => set("batchid", e.target.value)} placeholder="Batch UUID" />
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Item ID (optional)</label>
          <input style={s.input} value={form.itemid} onChange={e => set("itemid", e.target.value)} placeholder="Item UUID" />
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Reason *</label>
          <input style={s.input} value={form.reason} onChange={e => set("reason", e.target.value)} placeholder="Contamination, recall notice, quality issue..." />
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Quarantined By</label>
          <input style={s.input} value={form.quarantinedby} onChange={e => set("quarantinedby", e.target.value)} />
        </div>
        <div style={s.fgroup}>
          <label style={s.label}>Notes</label>
          <input style={s.input} value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button style={s.btn("ghost")} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btn("primary"), background: "#dc2626" }} onClick={handleSave} disabled={loading}>{loading ? "Quarantining…" : "Quarantine"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PharmacyPage() {
  const [tab, setTab]             = useState<"dispense"|"controlled"|"conversions"|"recalls">("dispense");
  const [controlled, setControlled] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [recalls, setRecalls]     = useState<any[]>([]);
  const [dispenseLog, setDispenseLog] = useState<any[]>([]);
  const [stores, setStores]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [showDispenseModal, setShowDispenseModal]     = useState(false);
  const [showControlledModal, setShowControlledModal] = useState(false);
  const [showConvModal, setShowConvModal]             = useState(false);
  const [showRecallModal, setShowRecallModal]         = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, convRes, recRes, stRes] = await Promise.all([
        fetch("/api/pharmacy/controlled"),
        fetch("/api/pharmacy/conversions"),
        fetch("/api/pharmacy/recalls"),
        fetch("/api/stores"),
      ]);
      const [cData, convData, recData, stData] = await Promise.all([
        cRes.json(), convRes.json(), recRes.json(), stRes.json(),
      ]);
      setControlled(cData.logs || []);
      setConversions(convData.conversions || []);
      setRecalls(recData.quarantines || []);
      setStores(stData.stores || []);

      // Fetch dispense log for first store if available
      if (stData.stores?.length) {
        const dRes = await fetch(`/api/pharmacy/dispense?storeid=${stData.stores[0].id}`);
        const dData = await dRes.json();
        setDispenseLog(dData.logs || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmt = (d: any) => d ? new Date(d).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "—";

  return (
    <div style={s.page}>
      <style>{`input,select,textarea{color:#111827 !important;}`}</style>
      <div style={s.header}>
        <Link href="/" style={{ color: "#6b7280", display: "flex" }}><Icon d={icons.back} size={18} /></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon d={icons.pill} size={18} />
          <span style={s.title}>Pharmacy Hub</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={fetchAll} style={s.btn("ghost")}><Icon d={icons.refresh} size={14} /></button>
          {tab === "dispense"    && <button style={s.btn("primary")} onClick={() => setShowDispenseModal(true)}>Dispense Item</button>}
          {tab === "controlled"  && <button style={s.btn("primary")} onClick={() => setShowControlledModal(true)}>Add Entry</button>}
          {tab === "conversions" && <button style={s.btn("primary")} onClick={() => setShowConvModal(true)}>Add Conversion</button>}
          {tab === "recalls"     && <button style={{ ...s.btn("primary"), background: "#dc2626" }} onClick={() => setShowRecallModal(true)}>Quarantine Batch</button>}
        </div>
      </div>

      <div style={s.content}>
        <div style={s.tabs}>
          {(["dispense","controlled","conversions","recalls"] as const).map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "dispense" ? "Dispense" : t === "controlled" ? "Controlled Drugs" : t === "conversions" ? "Unit Conversions" : "Recalls & Quarantine"}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: "#6b7280", fontSize: 13 }}>Loading…</p>}

        {/* ── Dispense Tab ── */}
        {tab === "dispense" && (
          <div style={s.card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
              Dispense History
            </h3>
            {dispenseLog.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>No dispense records yet. Use "Dispense Item" to record a dispense event.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Item</th>
                    <th style={s.th}>Action</th>
                    <th style={s.th}>Qty</th>
                    <th style={s.th}>Patient</th>
                    <th style={s.th}>Prescription</th>
                    <th style={s.th}>Dispensed By</th>
                    <th style={s.th}>Witness</th>
                  </tr>
                </thead>
                <tbody>
                  {dispenseLog.map((l: any) => (
                    <tr key={l.id}>
                      <td style={s.td}>{fmt(l.createdat)}</td>
                      <td style={{ ...s.td, fontWeight: 500 }}>{l.itemname || "—"}</td>
                      <td style={s.td}><span style={s.badge(l.actiontype)}>{l.actiontype}</span></td>
                      <td style={s.td}>{l.quantity}</td>
                      <td style={s.td}>{l.patientref || "—"}</td>
                      <td style={s.td}>{l.prescriptionref || "—"}</td>
                      <td style={s.td}>{l.dispensedby || "—"}</td>
                      <td style={s.td}>{l.witnessedby || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Controlled Drugs Tab ── */}
        {tab === "controlled" && (
          <div style={s.card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
              Controlled Drug Register
            </h3>
            {controlled.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>No controlled drug entries yet.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Action</th>
                    <th style={s.th}>Item ID</th>
                    <th style={s.th}>Qty</th>
                    <th style={s.th}>Patient</th>
                    <th style={s.th}>Prescription</th>
                    <th style={s.th}>Dispensed By</th>
                    <th style={s.th}>Witnessed By</th>
                  </tr>
                </thead>
                <tbody>
                  {controlled.map((l: any) => (
                    <tr key={l.id}>
                      <td style={s.td}>{fmt(l.createdat)}</td>
                      <td style={s.td}><span style={s.badge(l.actiontype)}>{l.actiontype}</span></td>
                      <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11 }}>{l.itemid?.slice(0,8)}…</td>
                      <td style={s.td}>{l.quantity}</td>
                      <td style={s.td}>{l.patientref || "—"}</td>
                      <td style={s.td}>{l.prescriptionref || "—"}</td>
                      <td style={s.td}>{l.dispensedby || "—"}</td>
                      <td style={{ ...s.td, color: l.witnessedby ? "#065f46" : "#dc2626", fontWeight: 500 }}>
                        {l.witnessedby || "MISSING"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Unit Conversions Tab ── */}
        {tab === "conversions" && (
          <div style={s.card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
              Unit Conversion Rules
            </h3>
            {conversions.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>No conversion rules yet. Add rules like "1 box = 10 strips".</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Item ID</th>
                    <th style={s.th}>From</th>
                    <th style={s.th}>To</th>
                    <th style={s.th}>Factor</th>
                    <th style={s.th}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11 }}>{c.itemid?.slice(0,8)}…</td>
                      <td style={{ ...s.td, fontWeight: 500 }}>{c.fromuom}</td>
                      <td style={s.td}>{c.touom}</td>
                      <td style={{ ...s.td, color: "#6366f1", fontWeight: 600 }}>×{parseFloat(c.factor)}</td>
                      <td style={s.td}>{fmt(c.createdat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Recalls Tab ── */}
        {tab === "recalls" && (
          <div style={s.card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
              Recall & Quarantine Register
            </h3>
            {recalls.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>No quarantine records. All batches are clear.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Batch ID</th>
                    <th style={s.th}>Reason</th>
                    <th style={s.th}>By</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Resolved By</th>
                  </tr>
                </thead>
                <tbody>
                  {recalls.map((r: any) => (
                    <tr key={r.id}>
                      <td style={s.td}>{fmt(r.createdat)}</td>
                      <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11 }}>{r.batchid?.slice(0,8)}…</td>
                      <td style={s.td}>{r.reason}</td>
                      <td style={s.td}>{r.quarantinedby || "—"}</td>
                      <td style={s.td}>
                        <span style={s.badge(r.isresolved ? "resolved" : "DESTROY")}>
                          {r.isresolved ? "Resolved" : "Quarantined"}
                        </span>
                      </td>
                      <td style={s.td}>{r.resolvedby || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showDispenseModal    && <DispenseModal    stores={stores} onClose={() => setShowDispenseModal(false)}    onSuccess={fetchAll} />}
      {showControlledModal  && <AddControlledModal stores={stores} onClose={() => setShowControlledModal(false)} onSuccess={fetchAll} />}
      {showConvModal        && <AddConversionModal onClose={() => setShowConvModal(false)}     onSuccess={fetchAll} />}
      {showRecallModal      && <AddRecallModal     onClose={() => setShowRecallModal(false)}    onSuccess={fetchAll} />}
    </div>
  );
}
