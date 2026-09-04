"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

type Deal = {
  id: string;
  customerName: string;
  salesRep: string;
  discountPct: number;
  trialDays: number;
  customFeature: string | null;
  engStatus: string;
  financeStatus: string;
  legalStatus: string;
  finalizedAt: string | null;
};

type CallReview = {
  id: string;
  status: "processing" | "ready" | "closed_lost" | "confirmed" | "failed";
  customerName: string | null;
};

const statusColor: Record<string, string> = {
  pending: "#8b8f9a",
  scoped: "#4ade80",
  invoiced: "#4ade80",
  approved: "#4ade80",
  blocked: "#f87171",
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

export default function Dashboard() {
  const { data: session } = useSession();
  const myRoles: string[] = session?.roles || [];

  const [deals, setDeals] = useState<Deal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: "", discountPct: "10", trialDays: "14", customFeature: "" });
  const [zoomUrl, setZoomUrl] = useState("");
  const [callReviews, setCallReviews] = useState<CallReview[]>([]);

  async function loadCalls() {
    if (!myRoles.includes("sales")) return;
    const res = await fetch("/api/calls");
    if (res.ok) setCallReviews(await res.json());
  }

  async function startListening(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/calls/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zoomUrl }),
    });
    setZoomUrl("");
    loadCalls();
  }

  async function load() {
    const res = await fetch("/api/deals");
    setDeals(await res.json());
  }

  useEffect(() => { load(); loadCalls(); }, [session]);

  async function updateStatus(id: string, field: string, value: string) {
    await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });
    load();
  }

  async function submitDeal(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ customerName: "", discountPct: "10", trialDays: "14", customFeature: "" });
    setShowForm(false);
    load();
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>DealFlow — active deals</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#8b8f9a" }}>{session?.user?.email} ({myRoles.join(", ") || "no role"})</span>
        <button onClick={() => signOut()} style={{ background: "transparent", color: "#8b8f9a", border: "1px solid #23262f", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
          Sign out
        </button>
        {myRoles.includes("sales") && (
          <button onClick={() => setShowForm(!showForm)} style={{
            background: "#4ade80", color: "#0b0d12", border: "none", borderRadius: 8,
            padding: "8px 14px", fontWeight: 600, cursor: "pointer",
          }}>
            {showForm ? "Cancel" : "+ New Deal"}
          </button>
        )}
        </div>
      </div>

      {myRoles.includes("sales") && (
        <div style={{ background: "#141720", borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🎧 Listen to a call</div>
          <form onSubmit={startListening} style={{ display: "flex", gap: 8 }}>
            <input required placeholder="Paste Zoom meeting link" value={zoomUrl}
              onChange={e => setZoomUrl(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button type="submit" style={{ ...inputStyle, background: "#4ade80", color: "#0b0d12", fontWeight: 600, cursor: "pointer" }}>
              Start
            </button>
          </form>

          {callReviews.length > 0 && (
            <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
              {callReviews.map(c => (
                <div key={c.id} style={{ fontSize: 13, display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid #23262f" }}>
                  <span style={{ color: "#8b8f9a" }}>
                    {c.status === "processing" && "⏳ Listening / processing..."}
                    {c.status === "ready" && `✅ ${c.customerName || "Deal"} — ready to review`}
                    {c.status === "closed_lost" && "❌ Not detected as closed"}
                    {c.status === "failed" && "⚠️ Something went wrong"}
                  </span>
                  {c.status === "ready" && <a href={`/review/${c.id}`} style={{ color: "#4ade80" }}>Review →</a>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={submitDeal} style={{ background: "#141720", padding: 16, borderRadius: 10, marginBottom: 24, display: "grid", gap: 10 }}>
          <input required placeholder="Customer name" value={form.customerName}
            onChange={e => setForm({ ...form, customerName: e.target.value })} style={inputStyle} />
          <div style={{ display: "flex", gap: 10 }}>
            <input type="number" placeholder="Discount %" value={form.discountPct}
              onChange={e => setForm({ ...form, discountPct: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <input type="number" placeholder="Trial days" value={form.trialDays}
              onChange={e => setForm({ ...form, trialDays: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <input placeholder="Custom feature / notes (optional)" value={form.customFeature}
            onChange={e => setForm({ ...form, customFeature: e.target.value })} style={inputStyle} />
          <button type="submit" style={{ ...inputStyle, background: "#4ade80", color: "#0b0d12", fontWeight: 600, cursor: "pointer" }}>
            Submit deal
          </button>
        </form>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {deals.map(d => (
          <div key={d.id} style={{
            background: "#141720", borderRadius: 10, padding: 16,
            border: d.finalizedAt ? "1px solid #4ade80" : "1px solid #23262f",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{d.customerName}</div>
                <div style={{ fontSize: 13, color: "#8b8f9a" }}>
                  {d.salesRep} · {d.discountPct}% discount · {d.trialDays}-day trial
                </div>
                {d.customFeature && <div style={{ fontSize: 13, color: "#8b8f9a", marginTop: 2 }}>{d.customFeature}</div>}
              </div>
              {d.finalizedAt && <a href={`/deals/${d.id}`} style={{ color: "#4ade80", fontSize: 13, alignSelf: "center" }}>View summary →</a>}
            </div>

            <div style={{ marginTop: 12 }}>
              <StatusPill label="Eng" value={d.engStatus} />
              <StatusPill label="Finance" value={d.financeStatus} />
              <StatusPill label="Legal" value={d.legalStatus} />
            </div>

            {!d.finalizedAt && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {myRoles.includes("eng") && (
                  <select defaultValue={d.engStatus} onChange={e => updateStatus(d.id, "engStatus", e.target.value)} style={selectStyle}>
                    <option value="pending">Eng: pending</option>
                    <option value="scoped">Eng: scoped</option>
                    <option value="blocked">Eng: blocked</option>
                  </select>
                )}
                {myRoles.includes("finance") && (
                  <select defaultValue={d.financeStatus} onChange={e => updateStatus(d.id, "financeStatus", e.target.value)} style={selectStyle}>
                    <option value="pending">Finance: pending</option>
                    <option value="invoiced">Finance: invoiced</option>
                    <option value="blocked">Finance: blocked</option>
                  </select>
                )}
                {myRoles.includes("legal") && (
                  <select defaultValue={d.legalStatus} onChange={e => updateStatus(d.id, "legalStatus", e.target.value)} style={selectStyle}>
                    <option value="pending">Legal: pending</option>
                    <option value="approved">Legal: approved</option>
                    <option value="blocked">Legal: blocked</option>
                  </select>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0b0d12", border: "1px solid #23262f", borderRadius: 6,
  padding: "8px 10px", color: "#e7e9ee", fontSize: 14,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, fontSize: 12, padding: "5px 8px",
};
