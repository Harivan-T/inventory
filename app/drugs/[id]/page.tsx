"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  back:    "M19 12H5M12 5l-7 7 7 7",
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  box:     "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  alert:   "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  clock:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  pill:    "M10.5 6h3M7 12h10M7 16h10M4 4l16 16",
  info:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8h.01M12 12v4",
  dollar:  "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  layers:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
};

const FORM_COLORS: Record<string, string> = {
  tablet:      "#2563eb",
  capsule:     "#16a34a",
  inhaler:     "#d97706",
  syrup:       "#7c3aed",
  injection:   "#dc2626",
  cream:       "#0891b2",
  drops:       "#6b7280",
  suppository: "#92400e",
  patch:       "#065f46",
  powder:      "#9a3412",
};

const TX_COLORS: Record<string, { bg: string; color: string }> = {
  STOCK_IN:   { bg: "#dcfce7", color: "#16a34a" },
  STOCK_OUT:  { bg: "#dbeafe", color: "#2563eb" },
  TRANSFER:   { bg: "#ede9fe", color: "#7c3aed" },
  ADJUSTMENT: { bg: "#fef3c7", color: "#d97706" },
  WASTAGE:    { bg: "#fee2e2", color: "#dc2626" },
  RETURN:     { bg: "#cffafe", color: "#0891b2" },
};

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: bg, color, display: "inline-block" }}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 13, color: value ? "#111827" : "#d1d5db", fontWeight: value ? 500 : 400 }}>
        {value || "—"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon d={icon} size={15} color="#6b7280" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
      </div>
      <div style={{ padding: "4px 20px 16px" }}>{children}</div>
    </div>
  );
}

export default function DrugDetailPage() {
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();
  const [data,  setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,   setTab]     = useState<"overview" | "stock" | "transactions">("overview");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/drugs/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <span style={{ fontSize: 13, color: "#9ca3af" }}>Loading...</span>
      </div>
    );
  }

  if (!data?.drug) {
    return (
      <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <span style={{ fontSize: 13, color: "#9ca3af" }}>Drug not found.</span>
      </div>
    );
  }

  const { drug, stock = [], transactions = [], totalStock, nearExpiry, expired } = data;
  const meta      = drug.metadata ?? {};
  const formColor = FORM_COLORS[drug.form] ?? "#6b7280";

  const batchStatus = (expirydate: string | null) => {
    if (!expirydate) return { label: "No expiry", bg: "#f3f4f6", color: "#6b7280" };
    const d = new Date(expirydate);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    if (diff < 0)                           return { label: "Expired",     bg: "#fee2e2", color: "#dc2626" };
    if (diff < 90 * 24 * 60 * 60 * 1000)  return { label: "Near expiry",  bg: "#fef3c7", color: "#d97706" };
    return                                         { label: "OK",           bg: "#dcfce7", color: "#16a34a" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, fontWeight: 500, padding: 0 }}>
          <Icon d={icons.back} size={15} color="#6b7280" />
          Back
        </button>
        <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
        <span style={{ fontSize: 13, color: "#9ca3af" }}>Drug Inventory</span>
        <span style={{ fontSize: 13, color: "#9ca3af" }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{drug.name}</span>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={() => router.push(`/drugs/${id}/edit`)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
            <Icon d={icons.edit} size={13} color="#374151" />
            Edit
          </button>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1100, margin: "0 auto", animation: "fadeIn 0.3s ease" }}>

        {/* Header card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${formColor}15`, border: `1px solid ${formColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={icons.pill} size={20} color={formColor} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>{drug.name}</h1>
                  {drug.form && <Badge label={drug.form} bg={`${formColor}15`} color={formColor} />}
                  {drug.requiresprescription && <Badge label="Rx" bg="#fee2e2" color="#dc2626" />}
                  {!drug.requiresprescription && <Badge label="OTC" bg="#dcfce7" color="#16a34a" />}
                  {drug.insuranceapproved && <Badge label="Insured" bg="#dbeafe" color="#2563eb" />}
                  {!drug.isactive && <Badge label="Inactive" bg="#f3f4f6" color="#6b7280" />}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{drug.genericname ?? "No generic name"}</div>
                {drug.strength && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{drug.strength} {drug.unit ? `· ${drug.unit}` : ""}</div>}
              </div>
            </div>

            {/* Price quick view */}
            <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
              {meta.unitcost && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Unit Cost</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>${Number(meta.unitcost).toFixed(2)}</div>
                </div>
              )}
              {meta.sellingprice && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Selling Price</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>${Number(meta.sellingprice).toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Stock summary strip */}
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Total Stock",   value: totalStock ?? 0,  color: "#2563eb", bg: "#eff6ff" },
              { label: "Batch Records", value: stock.length,      color: "#7c3aed", bg: "#ede9fe" },
              { label: "Near Expiry",   value: nearExpiry ?? 0,  color: "#d97706", bg: "#fef3c7" },
              { label: "Expired",       value: expired ?? 0,     color: "#dc2626", bg: "#fee2e2" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "#fff", borderRadius: 10, padding: 4, border: "1px solid #f3f4f6", width: "fit-content" }}>
          {(["overview", "stock", "transactions"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === t ? "#2563eb" : "none", color: tab === t ? "#fff" : "#6b7280", transition: "all 0.15s" }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            <SectionCard title="Basic Information" icon={icons.info}>
              <InfoRow label="Item Code / Barcode" value={drug.barcode} />
              <InfoRow label="National Code"       value={drug.nationalcode} />
              <InfoRow label="ATC Code"            value={drug.atccode} />
              <InfoRow label="Manufacturer"        value={drug.manufacturer} />
              <InfoRow label="Dosage Form"         value={drug.form} />
              <InfoRow label="Strength"            value={drug.strength} />
              <InfoRow label="Unit"                value={drug.unit} />
              <InfoRow label="Traffic Category"    value={drug.traffic} />
              <InfoRow label="Pregnancy Category"  value={drug.pregnancy} />
            </SectionCard>

            <div>
              <SectionCard title="Pricing & Billing" icon={icons.dollar}>
                <InfoRow label="Unit Cost"      value={meta.unitcost      ? `$${Number(meta.unitcost).toFixed(2)}`      : null} />
                <InfoRow label="Selling Price"  value={meta.sellingprice  ? `$${Number(meta.sellingprice).toFixed(2)}`  : null} />
                <InfoRow label="Billing Code"   value={meta.billingcode} />
                <InfoRow label="Billable Item"  value={meta.billable !== undefined ? (meta.billable ? "Yes" : "No") : null} />
                <InfoRow label="Insurance"      value={drug.insuranceapproved ? "Approved" : "Not approved"} />
              </SectionCard>

              <SectionCard title="Storage & Safety" icon={icons.shield}>
                <InfoRow label="Storage Type"         value={drug.storagetype} />
                <InfoRow label="Controlled Substance" value={drug.traffic === "controlled" || drug.traffic === "narcotic" ? "Yes" : "No"} />
                <InfoRow label="Refrigeration"        value={drug.storagetype === "refrigerated" || drug.storagetype === "frozen" ? "Required" : "Not required"} />
                <InfoRow label="High Alert"           value={meta.highalert ? "Yes" : "No"} />
                <InfoRow label="Hazardous"            value={meta.hazardous ? "Yes" : "No"} />
              </SectionCard>
            </div>

            {(drug.indication || drug.warning || drug.interaction || drug.sideeffect) && (
              <div style={{ gridColumn: "1/-1" }}>
                <SectionCard title="Clinical Information" icon={icons.layers}>
                  {drug.indication  && <InfoRow label="Indication"      value={drug.indication} />}
                  {drug.warning     && <InfoRow label="Warnings"        value={drug.warning} />}
                  {drug.interaction && <InfoRow label="Interactions"    value={drug.interaction} />}
                  {drug.sideeffect  && <InfoRow label="Side Effects"    value={drug.sideeffect} />}
                </SectionCard>
              </div>
            )}

          </div>
        )}

        {/* STOCK TAB */}
        {tab === "stock" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Stock by Warehouse & Batch
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Warehouse", "Batch Number", "Manufacture Date", "Expiry Date", "Status", "Qty", "Reserved", "Last Updated"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stock.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No stock records found.</td></tr>
                  )}
                  {stock.map((s: any) => {
                    const bs = batchStatus(s.expirydate);
                    return (
                      <tr key={s.id} style={{ borderTop: "1px solid #f9fafb" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", fontWeight: 500 }}>{s.warehousename ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{s.batchnumber ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{s.manufacturedate ? new Date(s.manufacturedate).toLocaleDateString() : "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{s.expirydate ? new Date(s.expirydate).toLocaleDateString() : "—"}</td>
                        <td style={{ padding: "12px 16px" }}><Badge label={bs.label} bg={bs.bg} color={bs.color} /></td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: s.quantity < 50 ? "#dc2626" : "#111827" }}>{s.quantity}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{s.reservedquantity}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{s.lastupdated ? new Date(s.lastupdated).toLocaleDateString() : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {tab === "transactions" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Recent Transactions
              </span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Last 10 movements</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Date", "Type", "Warehouse", "Batch", "Qty", "Notes", "By"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No transactions yet.</td></tr>
                  )}
                  {transactions.map((t: any) => {
                    const tc = TX_COLORS[t.transactiontype] ?? { bg: "#f3f4f6", color: "#374151" };
                    return (
                      <tr key={t.id} style={{ borderTop: "1px solid #f9fafb" }}>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                          {t.createdat ? new Date(t.createdat).toLocaleString() : "—"}
                        </td>
                        <td style={{ padding: "12px 16px" }}><Badge label={t.transactiontype} bg={tc.bg} color={tc.color} /></td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{t.warehousename ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{t.batchnumber ?? "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: t.quantity > 0 ? "#16a34a" : "#dc2626" }}>
                            {t.quantity > 0 ? "+" : ""}{t.quantity}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{t.notes ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{t.createdby ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}