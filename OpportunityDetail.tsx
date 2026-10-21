import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import Seo from "@/components/Seo";
import { trackEvent } from "@/lib/track";

const API_BASE = "/api";

const TYPE_META: Record<string, { label: string; color: string; emoji: string }> = {
  grant:       { label: "Grant",       color: "#10B981", emoji: "💰" },
  job:         { label: "Job",         color: "#3B82F6", emoji: "💼" },
  collab:      { label: "Collab",      color: "#8B5CF6", emoji: "🤝" },
  "brand-deal": { label: "Brand Deal", color: "#FF4D7E", emoji: "✨" },
  fellowship:  { label: "Fellowship",  color: "#F97316", emoji: "🎓" },
  competition: { label: "Competition", color: "#FFE600", emoji: "🏆" },
  other:       { label: "Other",       color: "#888888", emoji: "💡" },
};

function daysUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / 86400000);
}
function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function OpportunityDetail() {
  const [, params] = useRoute("/opportunities/:id");
  const [, setLocation] = useLocation();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`${API_BASE}/opportunities/${params.id}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setOpp(d.opportunity ?? d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [params?.id]);

  const share = async () => {
    try {
      await navigator.share?.({ title: opp.title, url: window.location.href });
    } catch {
      await navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const meta = opp ? (TYPE_META[opp.type] ?? TYPE_META.other) : null;
  const days = opp?.deadline ? daysUntil(opp.deadline) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {opp && (
        <Seo
          title={`${opp.title} | Opportunities — The Innovators Den`}
          description={opp.description?.slice(0, 155)}
          type="article"
        />
      )}

      <div style={{ borderBottom: "1px solid #111", padding: "16px 24px" }}>
        <button onClick={() => setLocation("/opportunities")} style={{ background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}>
          ← Back to Opportunities
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "#888" }}>Loading…</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <p style={{ color: "#FF6B6B" }}>Opportunity not found.</p>
          <button onClick={() => setLocation("/opportunities")} style={{ padding: "10px 20px", background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff", cursor: "pointer" }}>Go back</button>
        </div>
      ) : opp ? (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* Header badges */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            {meta && (
              <span style={{ background: meta.color + "20", color: meta.color, border: `1px solid ${meta.color}40`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                {meta.emoji} {meta.label.toUpperCase()}
              </span>
            )}
            {opp.isFeatured && (
              <span style={{ background: "#FFE60020", color: "#FFE600", border: "1px solid #FFE60040", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>★ FEATURED</span>
            )}
            {days !== null && opp.deadline && (
              <span style={{ marginLeft: "auto", color: days <= 7 ? "#FF4D7E" : days <= 30 ? "#FFE600" : "#888", fontSize: 13, fontWeight: 700 }}>
                {days === 0 ? "Deadline today!" : `${days}d left`}
              </span>
            )}
            {days === null && opp.deadline && <span style={{ marginLeft: "auto", color: "#555", fontSize: 12 }}>Deadline passed</span>}
          </div>

          <h1 style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 800, margin: "0 0 8px", letterSpacing: -0.5, lineHeight: 1.2 }}>
            {opp.title}
          </h1>
          <p style={{ color: "#888", fontSize: 15, margin: "0 0 28px", fontWeight: 600 }}>{opp.organization}</p>

          {/* Key details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
            {opp.amount && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: 16 }}>
                <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>VALUE</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#FFE600" }}>{opp.amount}</p>
              </div>
            )}
            {opp.deadline && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: 16 }}>
                <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>DEADLINE</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: days !== null && days <= 7 ? "#FF4D7E" : "#fff" }}>{fmt(opp.deadline)}</p>
              </div>
            )}
            {(opp.location || opp.isRemote) && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: 16 }}>
                <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>LOCATION</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: opp.isRemote ? "#10B981" : "#fff" }}>
                  {opp.isRemote ? "🌐 Remote" : `📍 ${opp.location}`}
                </p>
              </div>
            )}
            {opp.category && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: 16 }}>
                <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>CATEGORY</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{opp.category}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ margin: "0 0 28px", padding: 24, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 16 }}>
            <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 12px" }}>ABOUT THIS OPPORTUNITY</p>
            <p style={{ margin: 0, lineHeight: 1.8, color: "#ccc", fontSize: 15, whiteSpace: "pre-wrap" }}>{opp.description}</p>
          </div>

          {/* Tags */}
          {opp.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
              {opp.tags.map((t: string) => (
                <span key={t} style={{ background: "#111", border: "1px solid #222", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#888" }}>#{t}</span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {opp.applyUrl && opp.applyUrl !== "#" ? (
              <a href={opp.applyUrl} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent("opportunity_apply_clicked", { type: opp.type ?? "other" })}
                style={{ padding: "14px 28px", background: "#FFE600", color: "#000", fontWeight: 800, fontSize: 15, borderRadius: 12, textDecoration: "none", display: "inline-block" }}>
                Apply Now →
              </a>
            ) : (
              <div style={{ padding: "14px 24px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, color: "#666", fontSize: 14 }}>
                Application link coming soon
              </div>
            )}
            <button onClick={share}
              style={{ padding: "14px 20px", background: "#111", border: "1px solid #222", color: copied ? "#10B981" : "#fff", fontWeight: 600, fontSize: 14, borderRadius: 12, cursor: "pointer" }}>
              {copied ? "Link copied!" : "Share ↗"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
