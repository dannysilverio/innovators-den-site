import { useState } from "react";
import { Helmet } from "react-helmet-async";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const BRAND = {
  yellow: "#FFE600",
  green: "#10B981",
  purple: "#818CF8",
  pink: "#FF4D7E",
  orange: "#F97316",
  bg: "#000",
  card: "#111",
  border: "#1e1e1e",
  text: "#f0f0f0",
  muted: "#666",
};

const REQUEST_TYPES = [
  "Introduction / Warm Referral",
  "Press & Media Opportunity",
  "Speaking Engagement",
  "Investment Introduction",
  "Partnership Opportunity",
  "Career Transition Support",
  "Business Advisory",
  "Other",
];

export default function Concierge() {
  const [form, setForm] = useState({
    requestType: REQUEST_TYPES[0],
    subject: "",
    description: "",
    isUrgent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/concierge/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? `HTTP ${r.status}`); }
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const F: React.CSSProperties = {
    display: "block", width: "100%", boxSizing: "border-box",
    padding: "12px 14px", background: "#1a1a1a",
    border: `1px solid ${BRAND.border}`, borderRadius: 10,
    color: BRAND.text, fontSize: 14, outline: "none",
    fontFamily: "system-ui, sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>
      <Helmet>
        <title>Concierge — The Innovators Den</title>
        <meta name="description" content="White-glove service for Den Pro and Founding members. Request introductions, press coverage, speaking engagements, and more." />
      </Helmet>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 32px 80px" }}>
        <p style={{ color: BRAND.yellow, fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>MEMBER SERVICE</p>
        <h1 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>Concierge</h1>
        <p style={{ color: BRAND.muted, fontSize: 16, margin: "0 0 40px", lineHeight: 1.6 }}>
          As a Pro or Founding member, you have access to white-glove support from The Den team. Submit a request below and we'll respond within 24 hours.
        </p>

        {/* Value props */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 40 }}>
          {[
            { icon: "🤝", label: "Warm Introductions", desc: "Direct intros to investors, press, and leaders" },
            { icon: "🎙️", label: "Speaking Opportunities", desc: "Curated stages that match your expertise" },
            { icon: "📰", label: "Media Visibility", desc: "Press opportunities and thought leadership" },
            { icon: "💡", label: "Advisory Support", desc: "Business guidance from our network" },
          ].map(v => (
            <div key={v.label} style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 18 }}>
              <p style={{ margin: "0 0 6px", fontSize: 22 }}>{v.icon}</p>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>{v.label}</p>
              <p style={{ margin: 0, color: BRAND.muted, fontSize: 12, lineHeight: 1.4 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        {success ? (
          <div style={{ background: `${BRAND.green}12`, border: `1px solid ${BRAND.green}30`, borderRadius: 16, padding: 36, textAlign: "center" }}>
            <p style={{ fontSize: 40, margin: "0 0 16px" }}>✓</p>
            <h2 style={{ margin: "0 0 10px", color: BRAND.green, fontWeight: 700 }}>Request Submitted</h2>
            <p style={{ color: "#ccc", fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>
              Thank you. Our team will review your request and follow up within 24 hours.
            </p>
            <button onClick={() => { setSuccess(false); setForm({ requestType: REQUEST_TYPES[0], subject: "", description: "", isUrgent: false }); }}
              style={{ padding: "12px 24px", background: BRAND.yellow, color: "#000", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8 }}>REQUEST TYPE</label>
              <select value={form.requestType} onChange={e => setForm(p => ({ ...p, requestType: e.target.value }))} style={F}>
                {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8 }}>
                SUBJECT <span style={{ color: BRAND.pink }}>*</span>
              </label>
              <input
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="Brief summary of your request"
                style={F}
              />
            </div>
            <div>
              <label style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8 }}>
                DETAILS <span style={{ color: BRAND.pink }}>*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe what you need and any relevant context. The more detail, the better we can help."
                rows={6}
                style={{ ...F, resize: "vertical" }}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.isUrgent}
                onChange={e => setForm(p => ({ ...p, isUrgent: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: BRAND.yellow }}
              />
              <span style={{ fontSize: 14, color: BRAND.text }}>
                This is time-sensitive (within 48 hours)
              </span>
            </label>
            {error && <p style={{ color: BRAND.pink, fontSize: 14, margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px 24px", background: BRAND.yellow, color: "#000",
                border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15,
                cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1,
                letterSpacing: 0.3, transition: "opacity 0.2s",
              }}
            >
              {submitting ? "Submitting…" : "Submit Concierge Request →"}
            </button>
            <p style={{ color: BRAND.muted, fontSize: 12, margin: 0, textAlign: "center" }}>
              Available to Den Pro, Inner Circle, and Founding members. Standard response: 24 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
