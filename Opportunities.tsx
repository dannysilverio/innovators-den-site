import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { FeaturedDoorCard, WebNativeAdCard, type Tier } from "@/components/AdUnit";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/track";

const OPP_TYPES_LIST = ["grant","job","collab","brand-deal","fellowship","competition","other"];

function SubmitOpportunityForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", organization: "", type: "grant",
    amount: "", deadline: "", applyUrl: "", location: "", isRemote: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const F: React.CSSProperties = {
    display: "block", width: "100%", boxSizing: "border-box",
    padding: "10px 12px", background: "#0d0d0d",
    border: "1px solid #2a2a2a", borderRadius: 8,
    color: "#f0f0f0", fontSize: 13, outline: "none",
    fontFamily: "system-ui, sans-serif",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.organization.trim()) {
      setError("Title, description, and organization are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/opportunities/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${r.status}`);
      }
      setSuccess(true);
      trackEvent("opportunity_submitted", { type: form.type || "other" });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 20, padding: 32, maxWidth: 580, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 40, margin: "0 0 16px" }}>✓</p>
            <h2 style={{ color: "#10B981", margin: "0 0 10px" }}>Submitted!</h2>
            <p style={{ color: "#888", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              Thank you! Your opportunity will be reviewed and added to the board within 24–48 hours.
            </p>
            <button onClick={onClose} style={{ padding: "12px 24px", background: "#FFE600", color: "#000", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ color: "#FFE600", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>SUBMIT AN OPPORTUNITY</p>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Add to the Board</h2>
              <p style={{ color: "#666", fontSize: 13, margin: "6px 0 0", lineHeight: 1.5 }}>
                Know of a grant, job, or opportunity the Den community should know about? Submit it for review.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>TITLE *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="SBA Grant, Engineering Manager, etc." style={F} />
              </div>
              <div>
                <label style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>TYPE *</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={F}>
                  {OPP_TYPES_LIST.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>ORGANIZATION *</label>
                <input value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} placeholder="Company / Foundation name" style={F} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>DESCRIPTION *</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="What is this opportunity? Who's it for? What should they know?" style={{ ...F, resize: "vertical" }} />
              </div>
              <div>
                <label style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>AMOUNT / VALUE</label>
                <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. $50,000 or $80K–$120K" style={F} />
              </div>
              <div>
                <label style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>DEADLINE</label>
                <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} style={F} />
              </div>
              <div>
                <label style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>APPLY URL</label>
                <input value={form.applyUrl} onChange={e => setForm(p => ({ ...p, applyUrl: e.target.value }))} placeholder="https://…" style={F} />
              </div>
              <div>
                <label style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>LOCATION</label>
                <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="City, State or N/A" style={F} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isRemote} onChange={e => setForm(p => ({ ...p, isRemote: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#FFE600" }} />
                  <span style={{ fontSize: 13, color: "#f0f0f0" }}>This is a remote opportunity</span>
                </label>
              </div>
            </div>
            {error && <p style={{ color: "#FF6B6B", fontSize: 13, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={submitting} style={{ padding: "13px 24px", background: "#FFE600", color: "#000", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Submitting…" : "Submit for Review →"}
            </button>
            <p style={{ color: "#555", fontSize: 12, margin: 0, textAlign: "center" }}>
              Submissions are reviewed before publishing. Typically 24–48 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const API_BASE = "/api";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  organization: string;
  imageUrl: string | null;
  type: string;
  category: string;
  amount: string | null;
  deadline: string | null;
  applyUrl: string | null;
  location: string | null;
  isRemote: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  tags: string[];
}

const TYPE_META: Record<string, { label: string; color: string; emoji: string }> = {
  grant: { label: "Grant", color: "#10B981", emoji: "💰" },
  job: { label: "Job", color: "#3B82F6", emoji: "💼" },
  collab: { label: "Collab", color: "#8B5CF6", emoji: "🤝" },
  "brand-deal": { label: "Brand Deal", color: "#F97316", emoji: "✨" },
  fellowship: { label: "Fellowship", color: "#EC4899", emoji: "🎓" },
  competition: { label: "Competition", color: "#EF4444", emoji: "🏆" },
};

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const meta = TYPE_META[opp.type] ?? { label: opp.type, color: "#FFE600", emoji: "📋" };
  const days = opp.deadline ? daysUntil(opp.deadline) : null;
  const [, setLocation] = useLocation();

  return (
    <article
      onClick={() => setLocation(`/opportunities/${opp.id}`)}
      style={{
        background: "#111111",
        border: opp.isFeatured ? "1px solid #333300" : "1px solid #222222",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#333333")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = opp.isFeatured ? "#333300" : "#222222")}
    >
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{
            background: meta.color + "20", color: meta.color,
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: 1,
          }}>{meta.emoji} {meta.label.toUpperCase()}</span>
          {opp.isFeatured && (
            <span style={{ background: "#FFE60020", color: "#FFE600", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: 1 }}>
              ★ FEATURED
            </span>
          )}
          {days !== null && (
            <span style={{
              marginLeft: "auto",
              color: days <= 7 ? "#EF4444" : days <= 14 ? "#F97316" : "#888888",
              fontSize: 12, fontWeight: 600,
            }}>
              {days <= 0 ? "Closed" : `${days}d left`}
            </span>
          )}
        </div>

        <h3 style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>
          {opp.title}
        </h3>
        <p style={{ color: "#888888", fontSize: 13, margin: "0 0 4px", fontWeight: 600 }}>{opp.organization}</p>

        <p style={{ color: "#888888", fontSize: 13, margin: "10px 0 14px", lineHeight: 1.5 }}>
          {opp.description.slice(0, 130)}{opp.description.length > 130 ? "…" : ""}
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          {opp.amount && (
            <span style={{ color: "#FFE600", fontSize: 14, fontWeight: 700 }}>{opp.amount}</span>
          )}
          {opp.isRemote ? (
            <span style={{ color: "#10B981", fontSize: 12 }}>🌐 Remote</span>
          ) : opp.location ? (
            <span style={{ color: "#888888", fontSize: 12 }}>📍 {opp.location}</span>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          {opp.applyUrl && (
            <a
              href={opp.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                flex: 1, display: "block", textAlign: "center",
                background: "#FFE600", color: "#000000",
                fontWeight: 700, fontSize: 14, padding: "10px",
                borderRadius: 8, textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Apply Now →
            </a>
          )}
          <button
            onClick={e => { e.stopPropagation(); setLocation(`/opportunities/${opp.id}`); }}
            style={{ padding: "10px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#888", fontSize: 12, cursor: "pointer" }}>
            Details
          </button>
        </div>
      </div>
    </article>
  );
}

const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: "1", title: "SBA Community Navigator Grant", description: "Up to $300K for minority-owned small businesses to hire community navigators and expand SBA program outreach.",
    organization: "U.S. Small Business Administration", imageUrl: null, type: "grant", category: "Business Growth",
    amount: "Up to $300,000", deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
    applyUrl: "#", location: "United States", isRemote: false, isPremium: false, isFeatured: true, tags: ["SBA", "grant"],
  },
  {
    id: "2", title: "Creator Economy Fellowship", description: "12-week paid fellowship for Black and brown content creators building sustainable media businesses. Mentorship + $10K stipend.",
    organization: "New Voices Foundation", imageUrl: null, type: "fellowship", category: "Innovation",
    amount: "$10,000 stipend", deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
    applyUrl: "#", location: null, isRemote: true, isPremium: false, isFeatured: true, tags: ["fellowship", "media"],
  },
  {
    id: "3", title: "Brand Partnership — Lifestyle Creator", description: "Seeking authentic lifestyle and wellness creators with 10K+ followers for a 6-month partnership with a major CPG brand.",
    organization: "The Innovators Den (Confidential)", imageUrl: null, type: "brand-deal", category: "Culture",
    amount: "$2,500/month", deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    applyUrl: "#", location: null, isRemote: true, isPremium: false, isFeatured: false, tags: ["brand deal"],
  },
  {
    id: "4", title: "Engineering Manager — FinTech Startup", description: "Series A FinTech startup focused on closing the racial wealth gap is hiring a senior engineering manager.",
    organization: "Greenwood (confidential)", imageUrl: null, type: "job", category: "Innovation",
    amount: "$160K–$200K", deadline: null,
    applyUrl: "#", location: "Remote or Atlanta", isRemote: true, isPremium: false, isFeatured: false, tags: ["job", "fintech"],
  },
];

const ALL_TYPES = Object.entries(TYPE_META).map(([key, val]) => ({ key, ...val }));

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const adTier = (user?.subscriptionTier ?? "free") as Tier;

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [remote, setRemote] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/opportunities?limit=50`)
      .then(r => r.json())
      .then(data => {
        setOpportunities(data.opportunities?.length ? data.opportunities : SAMPLE_OPPORTUNITIES);
      })
      .catch(() => setOpportunities(SAMPLE_OPPORTUNITIES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = opportunities.filter(o =>
    (selectedType === "all" || o.type === selectedType) &&
    (!remote || o.isRemote)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#ffffff", fontFamily: "system-ui, sans-serif" }}>
      <Seo
        title="Opportunities | The Innovators Den"
        description="Grants, jobs, fellowships, and brand deals for Black entrepreneurs and creators."
        type="website"
      />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #111111 0%, #000000 100%)", borderBottom: "1px solid #222222", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>THE INNOVATORS DEN</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, margin: "0 0 12px", letterSpacing: -1 }}>
            Opportunities Board 💡
          </h1>
          <p style={{ color: "#888888", fontSize: 16, margin: "0 0 24px", maxWidth: 540 }}>
            Grants, jobs, fellowships, brand deals, and collabs — curated for the culture.
          </p>
          <button
            onClick={() => setShowSubmit(true)}
            style={{ padding: "11px 22px", background: "#FFE600", color: "#000", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            + Submit an Opportunity
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "0 24px", overflowX: "auto" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", paddingTop: 16, paddingBottom: 16 }}>
          <button onClick={() => setSelectedType("all")} style={{
            background: selectedType === "all" ? "#FFE600" : "#111111",
            color: selectedType === "all" ? "#000000" : "#888888",
            border: "1px solid " + (selectedType === "all" ? "#FFE600" : "#222222"),
            borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>All</button>
          {ALL_TYPES.map(t => (
            <button key={t.key} onClick={() => setSelectedType(t.key)} style={{
              background: selectedType === t.key ? t.color + "20" : "#111111",
              color: selectedType === t.key ? t.color : "#888888",
              border: "1px solid " + (selectedType === t.key ? t.color : "#222222"),
              borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{t.emoji} {t.label}</button>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", cursor: "pointer", color: "#888888", fontSize: 13 }}>
            <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} style={{ accentColor: "#FFE600" }} />
            Remote only
          </label>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* W-DOORS-001: Featured Door — top of opportunities board */}
        <FeaturedDoorCard tier={adTier} index={0} />
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#888" }}>Loading opportunities…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <p style={{ fontSize: 40 }}>💡</p>
            <p style={{ color: "#888888" }}>No opportunities match your filters.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
              {filtered.map((o, i) => (
                <React.Fragment key={o.id}>
                  <OpportunityCard opp={o} />
                  {/* W-DOORS-002: Native card after every 8 listings */}
                  {(i + 1) % 8 === 0 && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <WebNativeAdCard tier={adTier} index={i} context="opportunities" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>

      {showSubmit && <SubmitOpportunityForm onClose={() => setShowSubmit(false)} />}
    </div>
  );
}
