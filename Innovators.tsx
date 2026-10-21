import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";

interface Innovator {
  id: string;
  name: string;
  title: string;
  bio: string;
  profileImageUrl: string | null;
  city: string | null;
  industry: string;
  tags: string[];
  instagramHandle: string | null;
  twitterHandle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  isFeatured: boolean;
}

const INDUSTRIES = [
  "All", "Innovation", "Creative", "Music", "Business", "Sports",
  "Health", "Law", "Media", "Finance",
];

const INTENT_TYPES = [
  { key: "collaborate", label: "Collaborate" },
  { key: "hire",       label: "Hire" },
  { key: "invest",     label: "Invest" },
  { key: "advise",     label: "Advise" },
  { key: "speak",      label: "Speak" },
  { key: "partner",    label: "Partner" },
  { key: "other",      label: "Other" },
];

interface IntroModalState {
  innovator: Innovator;
  intentType: string;
  note: string;
  sending: boolean;
  sent: boolean;
  error: string | null;
}

function IntroModal({ state, onClose, onChange, onSubmit }: {
  state: IntroModalState;
  onClose: () => void;
  onChange: (patch: Partial<IntroModalState>) => void;
  onSubmit: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, width: "100%", maxWidth: 520, padding: "28px 28px 32px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Send Intro to {state.innovator.name}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        {state.sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✓</div>
            <p style={{ color: "#10B981", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Intro sent!</p>
            <p style={{ color: "#888", fontSize: 14, margin: 0 }}>{state.innovator.name} will be notified and can accept or decline.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#999", marginBottom: 8 }}>I WANT TO</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {INTENT_TYPES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => onChange({ intentType: t.key })}
                    style={{
                      padding: "7px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                      background: state.intentType === t.key ? "#FFE60018" : "transparent",
                      color: state.intentType === t.key ? "#FFE600" : "#666",
                      border: `1px solid ${state.intentType === t.key ? "#FFE60040" : "#1e1e1e"}`,
                      fontWeight: state.intentType === t.key ? 700 : 400,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >{t.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#999", marginBottom: 6 }}>
                ADD A NOTE <span style={{ fontWeight: 400, color: "#555" }}>(optional)</span>
              </label>
              <textarea
                value={state.note}
                onChange={e => onChange({ note: e.target.value })}
                placeholder="Introduce yourself and explain why you'd like to connect…"
                maxLength={500}
                rows={4}
                style={{ width: "100%", boxSizing: "border-box", background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, color: "#f0f0f0", fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "system-ui, sans-serif", resize: "vertical", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: "#555", marginTop: 3, textAlign: "right" }}>{state.note.length}/500</div>
            </div>

            {state.error && <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 12px" }}>{state.error}</p>}

            <button
              onClick={onSubmit}
              disabled={state.sending}
              style={{ width: "100%", padding: "13px", background: "#FFE600", color: "#000", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
            >
              {state.sending ? "Sending…" : "Send Intro →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function InnovatorCard({ innovator, onSendIntro, showIntroBtn }: { innovator: Innovator; onSendIntro?: () => void; showIntroBtn: boolean }) {
  const initials = innovator.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const bgColors = ["#FFE600", "#FF4D7E", "#3B82F6", "#10B981", "#8B5CF6", "#F97316"];
  const colorIdx = innovator.name.charCodeAt(0) % bgColors.length;
  const avatarColor = bgColors[colorIdx];
  const [, setLocation] = useLocation();

  return (
    <article
      onClick={() => setLocation(`/innovators/${innovator.id}`)}
      style={{
        background: "#111111",
        border: innovator.isFeatured ? "1px solid #333300" : "1px solid #222222",
        borderRadius: 14,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#333333")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = innovator.isFeatured ? "#333300" : "#222222")}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {innovator.profileImageUrl ? (
          <img src={innovator.profileImageUrl} alt={innovator.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#000000", fontWeight: 800, fontSize: 16 }}>{initials}</span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ color: "#ffffff", fontSize: 15, fontWeight: 700, margin: "0 0 2px", lineHeight: 1.3 }}>{innovator.name}</h3>
          <p style={{ color: "#888888", fontSize: 12, margin: 0, lineHeight: 1.4 }}>{innovator.title}</p>
          {innovator.city && <p style={{ color: "#666666", fontSize: 11, margin: "3px 0 0" }}>📍 {innovator.city}</p>}
        </div>
      </div>

      <p style={{ color: "#888888", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
        {innovator.bio.slice(0, 110)}{innovator.bio.length > 110 ? "…" : ""}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ background: "#1a1a1a", color: "#FFE600", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
          {innovator.industry}
        </span>
        {(innovator.tags ?? []).slice(0, 2).map(tag => (
          <span key={tag} style={{ background: "#1a1a1a", color: "#888888", fontSize: 10, padding: "3px 8px", borderRadius: 4 }}>#{tag}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
        {innovator.twitterHandle && (
          <a href={`https://twitter.com/${innovator.twitterHandle}`} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ color: "#888888", fontSize: 12, textDecoration: "none" }}>𝕏 @{innovator.twitterHandle}</a>
        )}
        {innovator.instagramHandle && (
          <a href={`https://instagram.com/${innovator.instagramHandle}`} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ color: "#888888", fontSize: 12, textDecoration: "none" }}>📸 @{innovator.instagramHandle}</a>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {showIntroBtn && onSendIntro && (
            <button
              onClick={e => { e.stopPropagation(); onSendIntro(); }}
              style={{ background: "#FFE60012", border: "1px solid #FFE60035", color: "#FFE600", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
            >
              ✦ Intro
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); setLocation(`/innovators/${innovator.id}`); }}
            style={{ background: "none", border: "none", color: "#FFE600", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            View →
          </button>
        </div>
      </div>
    </article>
  );
}

const SAMPLE_INNOVATORS: Innovator[] = [
  { id: "1", name: "Nia Thompson", title: "Founder & CEO, NourishHer Foods", bio: "Building the next generation of wellness brands for Black women. Former Unilever. Harvard MBA. 2024 Forbes 30 Under 30.", profileImageUrl: null, city: "Atlanta, GA", industry: "Business", tags: ["wellness", "founder"], instagramHandle: "niathompson", twitterHandle: null, linkedinUrl: null, websiteUrl: "#", isFeatured: true },
  { id: "2", name: "Marcus J. Williams", title: "Grammy-nominated music producer", bio: "Producer behind 15+ platinum records. Studio owner. Now building music tech tools to give independent artists more control.", profileImageUrl: null, city: "Los Angeles, CA", industry: "Music", tags: ["music", "tech"], instagramHandle: null, twitterHandle: "marcusjwilliams", linkedinUrl: null, websiteUrl: null, isFeatured: true },
  { id: "3", name: "Dr. Kenya Okafor", title: "Founder, Afrocentric Wellness Collective", bio: "Integrative medicine physician and wellness advocate. Building accessible holistic health solutions for underserved Black communities.", profileImageUrl: null, city: "Houston, TX", industry: "Health", tags: ["health", "medicine"], instagramHandle: "drkenyamd", twitterHandle: null, linkedinUrl: "#", websiteUrl: null, isFeatured: false },
  { id: "4", name: "Jamal Foster", title: "VC Partner, Concrete Rose Capital", bio: "Investing in pre-seed and seed-stage companies founded by underrepresented entrepreneurs. $42M AUM. 30 portfolio companies.", profileImageUrl: null, city: "New York, NY", industry: "Finance", tags: ["VC", "investing"], instagramHandle: null, twitterHandle: "jamalfostervc", linkedinUrl: "#", websiteUrl: null, isFeatured: false },
  { id: "5", name: "Aaliyah Reeves", title: "Award-winning visual artist & NFT creator", bio: "Pan-African digital artist blending afrofuturism with traditional West African motifs. NFT sales: $2.3M+. Gallery shows across 4 continents.", profileImageUrl: null, city: "Brooklyn, NY", industry: "Creative", tags: ["art", "NFT"], instagramHandle: "aaliyahcreates", twitterHandle: null, linkedinUrl: null, websiteUrl: "#", isFeatured: false },
  { id: "6", name: "Darius Cole, Esq.", title: "Entertainment & IP Attorney", bio: "Protecting creators, artists, and founders. Specializing in music contracts, IP, and deal negotiation. 200+ clients. Known for getting it right.", profileImageUrl: null, city: "Nashville, TN", industry: "Law", tags: ["law", "entertainment"], instagramHandle: null, twitterHandle: "dcolelaw", linkedinUrl: "#", websiteUrl: null, isFeatured: false },
];

export default function InnovatorsPage() {
  const { user, token } = useAuth();
  const [innovators, setInnovators] = useState<Innovator[]>([]);
  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<IntroModalState | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (industry !== "All") params.set("industry", industry);
    fetch(`${API_BASE}/innovators?${params}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.innovators;
        setInnovators(list?.length ? list : SAMPLE_INNOVATORS);
      })
      .catch(() => setInnovators(SAMPLE_INNOVATORS))
      .finally(() => setLoading(false));
  }, [industry]);

  const filtered = innovators.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.bio.toLowerCase().includes(search.toLowerCase()) || i.industry.toLowerCase().includes(search.toLowerCase())
  );

  const openIntroModal = (innovator: Innovator) => {
    if (!user) { window.location.href = "/sign-in"; return; }
    setModal({ innovator, intentType: "collaborate", note: "", sending: false, sent: false, error: null });
  };

  const handleIntroSubmit = async () => {
    if (!modal || !token) return;
    setModal(m => m ? { ...m, sending: true, error: null } : m);
    try {
      const res = await fetch(`${API_BASE}/intros`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientUserId: modal.innovator.id, intentType: modal.intentType, note: modal.note.trim() || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setModal(m => m ? { ...m, sending: false, error: d.error ?? "Could not send intro. Try again." } : m);
        return;
      }
      setModal(m => m ? { ...m, sending: false, sent: true } : m);
    } catch {
      setModal(m => m ? { ...m, sending: false, error: "Network error. Try again." } : m);
    }
  };

  // Show intro button only for logged-in users
  const showIntroBtn = !!user;

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#ffffff", fontFamily: "system-ui, sans-serif" }}>
      <Seo
        title="Innovator Directory | The Innovators Den"
        description="Discover Black entrepreneurs, creatives, musicians, lawyers, and leaders shaping the future."
        type="website"
      />

      {modal && (
        <IntroModal
          state={modal}
          onClose={() => setModal(null)}
          onChange={patch => setModal(m => m ? { ...m, ...patch } : m)}
          onSubmit={handleIntroSubmit}
        />
      )}

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #000000 100%)", borderBottom: "1px solid #222222", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>THE INNOVATORS DEN</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, margin: "0 0 12px", letterSpacing: -1 }}>
            Innovator Directory 👥
          </h1>
          <p style={{ color: "#888888", fontSize: 16, margin: "0 0 24px", maxWidth: 540 }}>
            Black founders, creatives, musicians, leaders, and visionaries building the future.
            {user && " Send intros to connect directly."}
          </p>
          <input
            type="search"
            placeholder="Search by name, industry, or keyword…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", maxWidth: 480, background: "#111111",
              border: "1px solid #333333", borderRadius: 10,
              padding: "12px 16px", color: "#ffffff", fontSize: 15,
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Industry filter */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "0 24px", overflowX: "auto" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 8, paddingTop: 16, paddingBottom: 16 }}>
          {INDUSTRIES.map(ind => (
            <button key={ind} onClick={() => setIndustry(ind)} style={{
              background: industry === ind ? "#FFE600" : "#111111",
              color: industry === ind ? "#000000" : "#888888",
              border: "1px solid " + (industry === ind ? "#FFE600" : "#222222"),
              borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif",
            }}>{ind}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#888" }}>Loading innovators…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <p style={{ fontSize: 40 }}>👥</p>
            <p style={{ color: "#888888" }}>No results found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map(i => (
              <InnovatorCard
                key={i.id}
                innovator={i}
                showIntroBtn={showIntroBtn && i.id !== user?.id}
                onSendIntro={() => openIntroModal(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
