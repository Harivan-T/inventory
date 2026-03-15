"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Icon = ({ d, size = 20, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  back:  "M19 12H5M12 5l-7 7 7 7",
  check: "M20 6L9 17l-5-5",
  x:     "M18 6L6 18M6 6l12 12",
};

export default function TransferStockPage() {
  const router = useRouter();
  const [drugs, setDrugs] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [form, setForm] = useState({
    itemid: "", sourcewarehouseid: "", destinationwarehouseid: "",
    batchid: "", quantity: "", reason: "", createdby: "",
  });

  useEffect(() => {
    Promise.all([fetch("/api/drugs"), fetch("/api/warehouses"), fetch("/api/stock")])
      .then(([d, w, s]) => Promise.all([d.json(), w.json(), s.json()]))
      .then(([d, w, s]) => {
        setDrugs(Array.isArray(d) ? d : []);
        setWarehouses(Array.isArray(w) ? w : []);
        setStock(Array.isArray(s) ? s : []);
      });
  }, []);

  const availableBatches = stock.filter(s => s.itemid === form.itemid && s.warehouseid === form.sourcewarehouseid);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleSubmit = async () => {
    if (!form.itemid || !form.sourcewarehouseid || !form.destinationwarehouseid || !form.quantity) {
      showToast("Please fill all required fields", "error"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stock/transfer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Stock transferred successfully!");
      setForm({ itemid: "", sourcewarehouseid: "", destinationwarehouseid: "", batchid: "", quantity: "", reason: "", createdby: "" });
    } catch (e: any) { showToast(e.message || "Failed", "error"); }
    finally { setLoading(false); }
  };

  const sel = (label: string, key: keyof typeof form, required = false, options: { value: string; label: string }[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label} {required && <span style={{ color: "#dc2626" }}>*</span>}</label>
      <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#f9fafb", outline: "none", color: "#111827" }}>
        <option value="">Select {label}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const inp = (label: string, key: keyof typeof form, type = "text", required = false) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label} {required && <span style={{ color: "#dc2626" }}>*</span>}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#f9fafb", outline: "none", color: "#111827" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } input:focus, select:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }`}</style>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.push("/stock")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, fontWeight: 500 }}>
          <Icon d={icons.back} size={16} color="#6b7280" /> Back to Stock
        </button>
        <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Transfer Stock</div>
      </div>
      <div style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Transfer Stock</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Move items between warehouses</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f3f4f6", padding: "28px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {sel("Item", "itemid", true, drugs.map(d => ({ value: d.drugid, label: d.name })))}
            {sel("Source Warehouse", "sourcewarehouseid", true, warehouses.map(w => ({ value: w.id, label: w.name })))}
            {sel("Destination Warehouse", "destinationwarehouseid", true, warehouses.filter(w => w.id !== form.sourcewarehouseid).map(w => ({ value: w.id, label: w.name })))}
            {sel("Batch", "batchid", false, availableBatches.map(b => ({ value: b.batchid ?? "", label: `${b.batchnumber ?? "No batch"} (Qty: ${b.quantity})` })))}
            {inp("Quantity", "quantity", "number", true)}
            {inp("Transferred By", "createdby")}
            <div style={{ gridColumn: "1/-1" }}>{inp("Reason", "reason")}</div>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => router.push("/stock")} style={{ padding: "10px 20px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 24px", border: "none", borderRadius: 8, background: loading ? "#93c5fd" : "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Saving..." : "Transfer Stock"}
            </button>
          </div>
        </div>
      </div>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "error" ? "#dc2626" : "#16a34a", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon d={toast.type === "error" ? icons.x : icons.check} size={15} color="#fff" />{toast.msg}
        </div>
      )}
    </div>
  );
}
