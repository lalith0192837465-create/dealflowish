"use client";
// This page is entirely self-contained mock data — it never touches the real
// database or API. Purpose: let someone click "Try Demo" and see the product
// working immediately, with zero setup and zero risk of polluting real data.

const mockDeals = [
  {
    id: "demo-1",
    customerName: "Northwind Bank",
    salesRep: "Chizu A.",
    discountPct: 15,
    trialDays: 30,
    customFeature: "Custom SSO integration for their auth team",
    engStatus: "scoped",
    financeStatus: "invoiced",
    legalStatus: "pending",
  },
  {
    id: "demo-2",
    customerName: "Vale Logistics",
    salesRep: "Chizu A.",
    discountPct: 10,
    trialDays: 14,
    customFeature: null,
    engStatus: "pending",
    financeStatus: "pending",
    legalStatus: "pending",
  },
  {
    id: "demo-3",
    customerName: "Harborline Retail",
    salesRep: "Marcus T.",
    discountPct: 20,
    trialDays: 45,
    customFeature: "Bulk CSV export for their finance team",
    engStatus: "scoped",
    financeStatus: "invoiced",
    legalStatus: "approved",
  },
];

const statusColor: Record<string, string> = {
  pending: "#8b8f9a", scoped: "#4ade80", invoiced: "#4ade80", approved: "#4ade80", blocked: "#f87171",
};

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <span style={{
      fontSize: 12, padding: "3px 8px", borderRadius: 999,
      background: "#1a1d24", color: statusColor[value] || "#e7e9ee",
      border: `1px solid ${statusColor[value] || "#333"}`, marginRight: 6,
    }}>
      {label}: {value}
    </span>
  );
}

export default function Demo() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ background: "#1a1d24", border: "1px solid #4ade80", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13 }}>
        👋 You're viewing sample data — nothing here is real or saved. <a href="/" style={{ color: "#4ade80" }}>Go to the real dashboard →</a>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>DealFlow — demo</h1>

      <div style={{ display: "grid", gap: 12 }}>
        {mockDeals.map(d => (
          <div key={d.id} style={{ background: "#141720", borderRadius: 10, padding: 16, border: "1px solid #23262f" }}>
            <div style={{ fontWeight: 600 }}>{d.customerName}</div>
            <div style={{ fontSize: 13, color: "#8b8f9a" }}>
              {d.salesRep} · {d.discountPct}% discount · {d.trialDays}-day trial
            </div>
            {d.customFeature && <div style={{ fontSize: 13, color: "#8b8f9a", marginTop: 2 }}>{d.customFeature}</div>}
            <div style={{ marginTop: 12 }}>
              <StatusPill label="Eng" value={d.engStatus} />
              <StatusPill label="Finance" value={d.financeStatus} />
              <StatusPill label="Legal" value={d.legalStatus} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
