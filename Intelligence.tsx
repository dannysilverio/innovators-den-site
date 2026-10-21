import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const BRAND = {
  yellow: "#FFE600",
  green: "#10B981",
  purple: "#818CF8",
  pink: "#FF4D7E",
  orange: "#F97316",
  bg: "#000",
  card: "#0d0d0d",
  border: "#1e1e1e",
  text: "#f0f0f0",
  muted: "#666",
};

const TYPE_COLOR: Record<string, string> = {
  trend: BRAND.yellow,
  talent: BRAND.green,
  opportunity: BRAND.orange,
  brand: BRAND.pink,
  ecosystem: BRAND.purple,
  custom: "#888",
};

const TIER_COLOR: Record<string, string> = {
  founding: BRAND.yellow,
  pro: BRAND.purple,
  inner_circle: BRAND.pink,
};

export default function Intelligence() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch(`${API_BASE}/intelligence/reports`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setReports(d.reports ?? d ?? []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const types = ["all", ...Array.from(new Set(reports.map((r: any) => r.type).filter(Boolean)))];
  const filtered = reports.filter(r => typeFilter === "all" || r.type === typeFilter);

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>
      <Helmet>
        <title>Intelligence — The Innovators Den</title>
        <meta name="description" content="Proprietary intelligence reports and trend analysis for Den Pro and Founding members." />
      </Helmet>

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${BRAND.border}`, padding: "48px 32px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <p style={{ color: BRAND.purple, fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>
          ✦ PRO &amp; FOUNDING EXCLUSIVE
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
          Intelligence Reports
        </h1>
        <p style={{ color: BRAND.muted, fontSize: 16, margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
          Proprietary analysis, talent intelligence, ecosystem trends, and brand opportunities — curated exclusively for Den Pro and Founding members.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 32px 80px" }}>
        {/* Type filter */}
        {types.length > 2 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            {types.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: "7px 16px", borderRadius: 20, fontSize: 12,
                fontWeight: typeFilter === t ? 700 : 400, cursor: "pointer",
                background: typeFilter === t ? `${TYPE_COLOR[t] ?? BRAND.yellow}18` : "transparent",
                color: typeFilter === t ? (TYPE_COLOR[t] ?? BRAND.yellow) : BRAND.muted,
                border: `1px solid ${typeFilter === t ? (TYPE_COLOR[t] ?? BRAND.yellow) + "40" : BRAND.border}`,
                textTransform: "capitalize",
              }}>{t}</button>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: 80, color: BRAND.muted }}>
            Loading intelligence reports…
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ background: `${BRAND.purple}10`, border: `1px solid ${BRAND.purple}25`, borderRadius: 20, padding: 48, maxWidth: 440, margin: "0 auto" }}>
              <p style={{ fontSize: 40, margin: "0 0 16px" }}>🔒</p>
              <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800 }}>Pro Members Only</h2>
              <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
                Intelligence reports are available to Den Pro and Founding members.
              </p>
              <a href="/membership" style={{
                display: "inline-block", padding: "12px 28px",
                background: BRAND.yellow, color: "#000",
                borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}>
                Upgrade Membership →
              </a>
            </div>
          </div>
        )}

        {!loading && !error && (
          filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <p style={{ color: BRAND.muted, fontSize: 16 }}>
                No {typeFilter !== "all" ? typeFilter : ""} reports published yet. Check back soon.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {filtered.map(r => (
                <div key={r.id} style={{
                  background: BRAND.card,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: 16, padding: 28,
                  transition: "border-color 0.15s",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1,
                      color: TYPE_COLOR[r.type] ?? BRAND.muted,
                      background: `${TYPE_COLOR[r.type] ?? BRAND.muted}18`,
                      padding: "3px 8px", borderRadius: 10, textTransform: "uppercase",
                    }}>
                      {r.type}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1,
                      color: TIER_COLOR[r.required_tier] ?? BRAND.muted,
                      background: `${TIER_COLOR[r.required_tier] ?? BRAND.muted}18`,
                      padding: "3px 8px", borderRadius: 10, textTransform: "uppercase",
                    }}>
                      {r.required_tier === "founding" ? "Founding" : "Pro+"} Exclusive
                    </span>
                    {r.period && <span style={{ fontSize: 12, color: BRAND.muted }}>{r.period}</span>}
                  </div>

                  <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, lineHeight: 1.3 }}>
                    {r.title}
                  </h2>
                  <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.65, margin: "0 0 20px" }}>
                    {r.summary}
                  </p>

                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    {r.author_name && <span style={{ color: BRAND.muted, fontSize: 12 }}>By {r.author_name}</span>}
                    {r.published_at && (
                      <span style={{ color: BRAND.muted, fontSize: 12 }}>
                        {new Date(r.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    )}
                    <button
                      onClick={() => setSelected(selected?.id === r.id ? null : r)}
                      style={{
                        marginLeft: "auto", padding: "8px 18px",
                        background: selected?.id === r.id ? `${BRAND.purple}20` : `${BRAND.purple}12`,
                        color: BRAND.purple,
                        border: `1px solid ${BRAND.purple}35`,
                        borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {selected?.id === r.id ? "Collapse" : "Read Full Report →"}
                    </button>
                  </div>

                  {selected?.id === r.id && r.content && (
                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${BRAND.border}` }}>
                      <pre style={{
                        color: BRAND.text, fontSize: 14, lineHeight: 1.8,
                        margin: 0, whiteSpace: "pre-wrap",
                        fontFamily: "system-ui, sans-serif",
                      }}>
                        {r.content}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
