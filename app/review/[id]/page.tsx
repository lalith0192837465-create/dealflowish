"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReviewCall() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [review, setReview] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    fetch(`/api/calls/${id}`).then(r => r.ok ? r.json() : null).then((found) => {
      setReview(found);
      if (found) {
        setForm({
          customerName: found.customerName || "",
          discountPct: found.discountPct ?? 0,
          trialDays: found.trialDays ?? 14,
          customFeature: found.customFeature || "",
        });
      }
    });
  }, [id]);

  async function confirm() {
    await fetch(`/api/calls/${id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/");
  }

  if (!review) return <main style={{ padding: 32 }}>Loading...</main>;

  if (review.status === "processing") {
    return (
      <main style={{ maxWidth: 500, margin: "60px auto", padding: 20, textAlign: "center" }}>
        <p>Still listening to the call, or waiting on the transcript. Check back in a bit — you'll get a Slack ping when it's ready.</p>
      </main>
    );
  }

  if (review.status === "closed_lost" || review.closedWon === false) {
    return (
      <main style={{ maxWidth: 500, margin: "60px auto", padding: 20, textAlign: "center" }}>
        <p>The AI didn't detect a closed deal on this call, so nothing was drafted. If that's wrong, you can enter this deal manually from the dashboard.</p>
        <a href="/" style={{ color: "#4ade80" }}>← Back to dashboard</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ background: "#1a1d24", border: "1px solid #f5a623", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13 }}>
        🎧 Here's what the AI heard on the call. Check it, fix anything wrong, then confirm.
      </div>

      <div style={{ background: "#141720", borderRadius: 10, padding: 20, display: "grid", gap: 14 }}>
        <Field label="Customer name" value={form.customerName} onChange={(v: string) => setForm({ ...form, customerName: v })} />
        <Field label="Discount %" type="number" value={form.discountPct} onChange={(v: string) => setForm({ ...form, discountPct: Number(v) })} />
        <Field label="Trial days" type="number" value={form.trialDays} onChange={(v: string) => setForm({ ...form, trialDays: Number(v) })} />
        <Field label="Custom feature (for Eng)" value={form.customFeature} onChange={(v: string) => setForm({ ...form, customFeature: v })} textarea />
        {review.otherNotes && (
          <div>
            <div style={{ fontSize: 13, color: "#8b8f9a", marginBottom: 4 }}>Other notes (FYI only, not editable here)</div>
            <div style={{ fontSize: 14 }}>{review.otherNotes}</div>
          </div>
        )}
      </div>

      <button onClick={() => setShowTranscript(!showTranscript)} style={{ background: "none", border: "none", color: "#8b8f9a", fontSize: 13, marginTop: 12, cursor: "pointer" }}>
        {showTranscript ? "Hide" : "Show"} full transcript
      </button>
      {showTranscript && (
        <pre style={{ background: "#0b0d12", padding: 14, borderRadius: 8, fontSize: 12, whiteSpace: "pre-wrap", marginTop: 8, maxHeight: 300, overflow: "auto" }}>
          {review.transcript}
        </pre>
      )}

      <button onClick={confirm} style={{
        background: "#4ade80", color: "#0b0d12", border: "none", borderRadius: 8,
        padding: "10px 20px", fontWeight: 600, cursor: "pointer", marginTop: 20, fontSize: 14,
      }}>
        ✓ Looks right — confirm and send
      </button>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false }: any) {
  const style = {
    background: "#0b0d12", border: "1px solid #23262f", borderRadius: 6,
    padding: "8px 10px", color: "#e7e9ee", fontSize: 14, width: "100%", boxSizing: "border-box" as const,
  };
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 13, color: "#8b8f9a", marginBottom: 4 }}>{label}</div>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} style={{ ...style, minHeight: 70 }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={style} />
      )}
    </label>
  );
}
