import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const BRAND = {
  yellow: "#FFE600",
  green: "#10B981",
  purple: "#818CF8",
  pink: "#FF4D7E",
  orange: "#F97316",
  bg: "#000",
  card: "#0d0d0d",
  cardAlt: "#111",
  border: "#1e1e1e",
  text: "#f0f0f0",
  muted: "#666",
  mutedLight: "#999",
};

interface BriefingStory {
  id: string;
  title: string;
  bullet: string;
  topic: string;
  sourceName: string;
  imageUrl: string | null;
  aiScore: number | null;
}

interface Briefing {
  generatedAt: string;
  session: "AM" | "PM";
  headline: string;
  subheadline: string;
  stories: BriefingStory[];
}

function TopicPill({ topic }: { topic: string }) {
  const colors: Record<string, string> = {
    Technology: BRAND.purple,
    Business: BRAND.green,
    Culture: BRAND.pink,
    Finance: BRAND.orange,
    Innovation: BRAND.yellow,
    Politics: "#EF4444",
    Health: "#06B6D4",
    Education: "#A78BFA",
  };
  const color = colors[topic] ?? BRAND.mutedLight;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1,
      color, background: `${color}18`,
      border: `1px solid ${color}30`,
      padding: "2px 8px", borderRadius: 10,
      textTransform: "uppercase",
    }}>
      {topic}
    </span>
  );
}

function SessionTag({ session }: { session: "AM" | "PM" }) {
  const isAM = session === "AM";
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: 2,
      color: isAM ? BRAND.yellow : BRAND.purple,
      background: isAM ? `${BRAND.yellow}12` : `${BRAND.purple}12`,
      border: `1px solid ${isAM ? BRAND.yellow : BRAND.purple}30`,
      padding: "3px 10px", borderRadius: 6,
    }}>
      {isAM ? "☀ MORNING EDITION" : "🌙 EVENING EDITION"}
    </span>
  );
}

export default function Briefing() {
  const { user } = useAuth();
  const isPro = !!(user?.isPro);

  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPro) { setLoading(false); return; }
    fetch(`${API_BASE}/feed/briefing`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setBriefing(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [isPro]);

  const now = new Date();
  const timeLabel = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>
      <Helmet>
        <title>Daily Briefing — The Innovators Den</title>
        <meta name="description" content="Your AI-curated AM & PM digest — the most important stories for Black, Brown, and underestimated innovators." />
      </Helmet>

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${BRAND.border}`, padding: "48px 32px 40px", maxWidth: 860, margin: "0 auto" }}>
        <p style={{ color: BRAND.green, fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>
          ✦ MEMBER ACCESS
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
          Your Daily Briefing
        </h1>
        <p style={{ color: BRAND.muted, fontSize: 15, margin: "0 0 16px", lineHeight: 1.6 }}>
          Five hand-picked stories, twice a day. Everything you need to know — and nothing you don't.
        </p>
        <p style={{ color: BRAND.muted, fontSize: 12, margin: 0 }}>{dateLabel} · {timeLabel}</p>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 32px 100px" }}>

        {/* Auth gate */}
        {!user && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ background: `${BRAND.green}08`, border: `1px solid ${BRAND.green}25`, borderRadius: 20, padding: 48, maxWidth: 440, margin: "0 auto" }}>
              <p style={{ fontSize: 40, margin: "0 0 16px" }}>📰</p>
              <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800 }}>Sign In to Access</h2>
              <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
                Your Daily Briefing is a Den Member feature. Sign in or upgrade to start reading.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/sign-in" style={{ display: "inline-block", padding: "11px 24px", background: BRAND.card, border: `1px solid ${BRAND.border}`, color: BRAND.text, borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                  Sign In
                </a>
                <a href="/membership" style={{ display: "inline-block", padding: "11px 24px", background: BRAND.yellow, color: "#000", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                  Upgrade →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Membership gate for signed-in free users */}
        {user && !isPro && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ background: `${BRAND.green}08`, border: `1px solid ${BRAND.green}25`, borderRadius: 20, padding: 48, maxWidth: 480, margin: "0 auto" }}>
              <p style={{ fontSize: 40, margin: "0 0 16px" }}>☀️</p>
              <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800 }}>Member Access Feature</h2>
              <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
                The Daily Briefing is your AI-curated AM &amp; PM digest of the five most important stories — exclusively for Den Members.
              </p>
              <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
                {["Full AM & PM Briefings — wake up sharper", "Full Doors board + Tracked Doors", "Ad-free reading · Unlimited saves"].map(b => (
                  <div key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ color: BRAND.green, fontSize: 13, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#ccc" }}>{b}</span>
                  </div>
                ))}
              </div>
              <a href="/membership" style={{ display: "inline-block", padding: "12px 28px", background: BRAND.green, color: "#000", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                $9/mo · Start 7-Day Free Trial →
              </a>
            </div>
          </div>
        )}

        {/* Loading */}
        {isPro && loading && (
          <div style={{ textAlign: "center", padding: 80, color: BRAND.muted }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📰</div>
            Preparing your briefing…
          </div>
        )}

        {/* Error */}
        {isPro && !loading && error && (
          <div style={{ textAlign: "center", padding: 60, color: BRAND.muted }}>
            <p style={{ fontSize: 32, margin: "0 0 12px" }}>⚠️</p>
            <p style={{ fontSize: 15 }}>Couldn't load the briefing right now. Try again shortly.</p>
          </div>
        )}

        {/* Briefing content */}
        {isPro && !loading && !error && briefing && (
          <div>
            {/* Session badge + headline */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ marginBottom: 16 }}>
                <SessionTag session={briefing.session} />
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                {briefing.headline}
              </h2>
              <p style={{ color: BRAND.mutedLight, fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                {briefing.subheadline}
              </p>
              <p style={{ color: BRAND.muted, fontSize: 12, margin: "12px 0 0" }}>
                Generated {new Date(briefing.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
              </p>
            </div>

            {/* Story list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {briefing.stories.map((story, i) => (
                <div key={story.id} style={{
                  display: "flex", gap: 20, alignItems: "flex-start",
                  background: BRAND.card,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: 16, padding: 24,
                }}>
                  {/* Story number */}
                  <div style={{
                    flexShrink: 0,
                    width: 32, height: 32,
                    background: `${BRAND.yellow}15`,
                    border: `1px solid ${BRAND.yellow}30`,
                    borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: BRAND.yellow,
                  }}>
                    {i + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                      <TopicPill topic={story.topic} />
                      <span style={{ fontSize: 12, color: BRAND.muted }}>{story.sourceName}</span>
                      {story.aiScore !== null && story.aiScore >= 80 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: BRAND.yellow, background: `${BRAND.yellow}15`, border: `1px solid ${BRAND.yellow}30`, padding: "2px 7px", borderRadius: 6 }}>
                          TOP SIGNAL
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: BRAND.text }}>
                      {story.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: "#aaa", lineHeight: 1.65 }}>
                      {story.bullet}
                    </p>
                  </div>

                  {story.imageUrl && (
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      style={{ width: 88, height: 70, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${BRAND.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: BRAND.muted }}>
                Next briefing at {briefing.session === "AM" ? "7 PM" : "7 AM"}
              </p>
              <a href="/intelligence" style={{ fontSize: 13, color: BRAND.purple, textDecoration: "none", fontWeight: 600 }}>
                View Intelligence Reports →
              </a>
            </div>
          </div>
        )}

        {/* Empty state */}
        {isPro && !loading && !error && !briefing && (
          <div style={{ textAlign: "center", padding: 80, color: BRAND.muted }}>
            <p style={{ fontSize: 32, margin: "0 0 16px" }}>📋</p>
            <p style={{ fontSize: 15 }}>No briefing available yet. Check back in the morning.</p>
          </div>
        )}
      </div>
    </div>
  );
}
