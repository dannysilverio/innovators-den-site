import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/track";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const BRAND = {
  yellow: "#FFE600",
  green: "#10B981",
  bg: "#000",
  card: "#0d0d0d",
  border: "#1e1e1e",
  text: "#f0f0f0",
  muted: "#666",
  mutedLight: "#999",
};

const TOPICS = [
  "Business Growth", "Technology", "Innovation", "Culture", "Food & Wine", "Finance",
  "Health", "Education", "Art", "Media", "Law", "Music", "Politics",
];

type FormState = {
  title: string;
  summary: string;
  content: string;
  topic: string;
  imageUrl: string;
  tags: string;
};

export default function Submit() {
  const { user, token, refresh } = useAuth();
  const isCreator = !!(user?.isCreator);

  const [form, setForm] = useState<FormState>({
    title: "", summary: "", content: "", topic: "", imageUrl: "", tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Creator code gate state
  const [creatorCode, setCreatorCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleRedeem = async () => {
    if (!creatorCode.trim() || redeemLoading) return;
    setRedeemLoading(true);
    setRedeemError(null);
    try {
      const res = await fetch(`${API_BASE}/creator/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ code: creatorCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRedeemError(data.error ?? "Code not recognized. Check with your Den contact.");
      } else {
        await refresh(); // Re-fetch user so isCreator updates
      }
    } catch {
      setRedeemError("Network error. Try again.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const canSubmit = form.title.trim().length >= 5
    && form.summary.trim().length >= 20
    && form.content.trim().length >= 100
    && form.topic;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const tagList = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/articles/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: form.title.trim(),
          summary: form.summary.trim(),
          content: form.content.trim(),
          topic: form.topic,
          imageUrl: form.imageUrl.trim() || undefined,
          tags: tagList,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Submission failed. Please try again.");
        return;
      }
      setSubmitted(true);
      trackEvent("article_submitted", { topic: form.topic });
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "system-ui, sans-serif", paddingTop: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 500 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>✦</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Your Signal is live.</h1>
          <p style={{ color: BRAND.mutedLight, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            It's now featured in Our Picks for the community to read.
          </p>
          <a href="/" style={{ display: "inline-block", padding: "12px 28px", background: BRAND.yellow, color: "#000", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Back to the Den →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>
      <Helmet>
        <title>Submit a Signal — The Innovators Den</title>
        <meta name="description" content="Write for The Innovators Den. Submit your own Signal — articles, analysis, and essays published under your byline." />
      </Helmet>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px 100px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: BRAND.yellow, fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>
            ✦ CREATOR ACCESS
          </p>
          <h1 style={{ margin: "0 0 10px", fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
            Write for The Den
          </h1>
          <p style={{ color: BRAND.mutedLight, fontSize: 15, margin: 0, lineHeight: 1.6, maxWidth: 540 }}>
            Submit your own Signal — articles, essays, analysis, and perspectives. Published under your byline, attributed to your Rise Profile.
          </p>
        </div>

        {/* Gate — not logged in */}
        {!user && (
          <div style={{ background: `${BRAND.yellow}08`, border: `1px solid ${BRAND.yellow}25`, borderRadius: 20, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 36, margin: "0 0 16px" }}>✍️</p>
            <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800 }}>Sign In to Write</h2>
            <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              Creator Signals are a Den Member benefit. Sign in or upgrade to start writing.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a href="/sign-in" style={{ padding: "11px 24px", background: BRAND.card, border: `1px solid ${BRAND.border}`, color: BRAND.text, borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Sign In</a>
              <a href="/membership" style={{ padding: "11px 24px", background: BRAND.yellow, color: "#000", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Upgrade →</a>
            </div>
          </div>
        )}

        {/* Gate — signed in but no creator code */}
        {user && !isCreator && (
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            <p style={{ fontSize: 40, margin: "0 0 16px" }}>✦</p>
            <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 800, color: BRAND.text }}>Creator Access Required</h2>
            <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
              Signal submissions are invite-only. Enter your creator code from The Innovators Den team to unlock write access.
            </p>
            <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 14, padding: "24px", marginBottom: 8, textAlign: "left" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: BRAND.mutedLight, marginBottom: 8 }}>YOUR CREATOR CODE</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={creatorCode}
                  onChange={e => setCreatorCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleRedeem()}
                  placeholder="XXXXX-XXXXX"
                  maxLength={11}
                  style={{
                    flex: 1, background: BRAND.card, border: `1px solid ${redeemError ? "#EF4444" : BRAND.border}`,
                    borderRadius: 10, color: BRAND.text, fontSize: 18, fontWeight: 700, letterSpacing: 4,
                    padding: "12px 14px", outline: "none", fontFamily: "system-ui, sans-serif",
                    textTransform: "uppercase",
                  }}
                />
                <button
                  onClick={handleRedeem}
                  disabled={!creatorCode.trim() || redeemLoading}
                  style={{
                    background: BRAND.yellow, color: "#000", border: "none", borderRadius: 10,
                    padding: "12px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
                    opacity: !creatorCode.trim() || redeemLoading ? 0.5 : 1,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {redeemLoading ? "…" : "Unlock →"}
                </button>
              </div>
              {redeemError && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 10, marginBottom: 0 }}>{redeemError}</p>}
            </div>
            <p style={{ color: BRAND.muted, fontSize: 12, margin: "12px 0 0" }}>
              Don't have a code?{" "}
              <a href="mailto:hello@innovatorsden.app" style={{ color: BRAND.yellow, textDecoration: "none" }}>
                Reach out to the team →
              </a>
            </p>
          </div>
        )}

        {/* Form */}
        {user && isCreator && (
          <form onSubmit={handleSubmit}>
            <div style={{ background: `${BRAND.yellow}08`, border: `1px solid ${BRAND.yellow}25`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
              <span style={{ color: BRAND.yellow, fontSize: 14 }}>✦</span>
              <span style={{ fontSize: 13, color: BRAND.yellow }}>Writing as <strong>{user.displayName}</strong> · Published under your byline · Goes live instantly</span>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: BRAND.mutedLight, marginBottom: 8 }}>
                HEADLINE <span style={{ color: BRAND.yellow }}>*</span>
              </label>
              <input
                value={form.title}
                onChange={e => set("title")(e.target.value)}
                placeholder="Give your Signal a sharp, specific title"
                maxLength={200}
                style={{ width: "100%", boxSizing: "border-box", background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 10, color: BRAND.text, fontSize: 16, padding: "13px 16px", outline: "none", fontFamily: "system-ui, sans-serif" }}
              />
              <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 4, textAlign: "right" }}>{form.title.length}/200</div>
            </div>

            {/* Topic */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: BRAND.mutedLight, marginBottom: 8 }}>
                TOPIC <span style={{ color: BRAND.yellow }}>*</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TOPICS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("topic")(t)}
                    style={{
                      padding: "7px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                      background: form.topic === t ? `${BRAND.yellow}18` : "transparent",
                      color: form.topic === t ? BRAND.yellow : BRAND.muted,
                      border: `1px solid ${form.topic === t ? BRAND.yellow + "40" : BRAND.border}`,
                      fontWeight: form.topic === t ? 700 : 400,
                      transition: "all 0.15s",
                    }}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: BRAND.mutedLight, marginBottom: 4 }}>
                SUMMARY <span style={{ color: BRAND.yellow }}>*</span>
              </label>
              <p style={{ fontSize: 12, color: BRAND.muted, margin: "0 0 8px" }}>2–3 sentences shown in feed previews</p>
              <textarea
                value={form.summary}
                onChange={e => set("summary")(e.target.value)}
                placeholder="What's the core insight or argument?"
                maxLength={500}
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 10, color: BRAND.text, fontSize: 14, padding: "13px 16px", outline: "none", fontFamily: "system-ui, sans-serif", resize: "vertical", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 4, textAlign: "right" }}>{form.summary.length}/500</div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: BRAND.mutedLight, marginBottom: 4 }}>
                FULL ARTICLE <span style={{ color: BRAND.yellow }}>*</span>
              </label>
              <p style={{ fontSize: 12, color: BRAND.muted, margin: "0 0 8px" }}>Min 100 characters</p>
              <textarea
                value={form.content}
                onChange={e => set("content")(e.target.value)}
                placeholder="Write your full article here..."
                maxLength={50000}
                rows={20}
                style={{ width: "100%", boxSizing: "border-box", background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 10, color: BRAND.text, fontSize: 14, padding: "13px 16px", outline: "none", fontFamily: "system-ui, sans-serif", resize: "vertical", lineHeight: 1.75 }}
              />
              <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 4, textAlign: "right" }}>{form.content.length}/50,000</div>
            </div>

            {/* Cover image */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: BRAND.mutedLight, marginBottom: 8 }}>
                COVER IMAGE URL <span style={{ fontSize: 10, fontWeight: 400, color: BRAND.muted }}>(optional)</span>
              </label>
              <input
                value={form.imageUrl}
                onChange={e => set("imageUrl")(e.target.value)}
                placeholder="https://..."
                style={{ width: "100%", boxSizing: "border-box", background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 10, color: BRAND.text, fontSize: 14, padding: "13px 16px", outline: "none", fontFamily: "system-ui, sans-serif" }}
              />
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: BRAND.mutedLight, marginBottom: 4 }}>
                TAGS <span style={{ fontSize: 10, fontWeight: 400, color: BRAND.muted }}>(optional)</span>
              </label>
              <p style={{ fontSize: 12, color: BRAND.muted, margin: "0 0 8px" }}>Comma-separated: e.g. funding, AI, startups</p>
              <input
                value={form.tags}
                onChange={e => set("tags")(e.target.value)}
                placeholder="funding, AI, startups..."
                style={{ width: "100%", boxSizing: "border-box", background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 10, color: BRAND.text, fontSize: 14, padding: "13px 16px", outline: "none", fontFamily: "system-ui, sans-serif" }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#EF4444" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              style={{
                width: "100%", padding: "15px", background: canSubmit ? BRAND.yellow : "#333",
                color: canSubmit ? "#000" : BRAND.muted,
                border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: canSubmit ? "pointer" : "default", fontFamily: "system-ui, sans-serif",
                transition: "all 0.15s",
              }}
            >
              {submitting ? "Submitting…" : "Submit Signal for Review →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
