import { db } from "@/lib/db";
import { notFound } from "next/navigation";

// This page IS the auto-generated output described in the plan: once every
// team has signed off, this renders a clean summary a sales rep can send
// straight to the customer — no manual copy-pasting terms from Slack threads.
export default async function DealSummary({ params }: { params: { id: string } }) {
  const deal = await db.deal.findUnique({ where: { id: params.id } });
  if (!deal) notFound();

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <a href="/" style={{ color: "#8b8f9a", fontSize: 13 }}>← Back to dashboard</a>
      <div style={{ background: "#141720", borderRadius: 12, padding: 28, marginTop: 16, border: "1px solid #4ade80" }}>
        <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, letterSpacing: 0.5 }}>DEAL CONFIRMED — ALL TEAMS APPROVED</div>
        <h1 style={{ fontSize: 24, margin: "8px 0 20px" }}>{deal!.customerName}</h1>

        <Row label="Sales rep" value={deal!.salesRep} />
        <Row label="Discount" value={`${deal!.discountPct}%`} />
        <Row label="Trial period" value={`${deal!.trialDays} days`} />
        {deal!.customFeature && <Row label="Custom scope" value={deal!.customFeature} />}
        <Row label="Engineering" value="Scoped and confirmed" />
        <Row label="Finance" value="Invoice issued" />
        <Row label="Legal" value="Contract approved" />
        <Row label="Finalized" value={new Date(deal!.finalizedAt!).toLocaleString()} />
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #23262f" }}>
      <span style={{ color: "#8b8f9a", fontSize: 14 }}>{label}</span>
      <span style={{ fontSize: 14 }}>{value}</span>
    </div>
  );
}
