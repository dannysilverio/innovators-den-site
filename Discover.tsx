import { useState, useEffect } from "react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import { TOPICS } from "@/lib/api";

const INNOVATORS_CATEGORIES = [
  { icon: "🚀", label: "Entrepreneurs", slug: "entrepreneurs" },
  { icon: "🎨", label: "Creatives", slug: "creatives" },
  { icon: "🎵", label: "Musicians", slug: "musicians" },
  { icon: "📈", label: "Investors", slug: "investors" },
  { icon: "🎬", label: "Content Creators", slug: "content-creators" },
  { icon: "⚖️", label: "Lawyers", slug: "lawyers" },
  { icon: "💪", label: "Wellness Leaders", slug: "wellness" },
  { icon: "🏆", label: "Athletes", slug: "athletes" },
];

const FEATURES = [
  {
    icon: "📰",
    title: "Daily Feed",
    description: "Curated news across Innovation, Culture, Business, Music, Law, and more — personalized to your interests.",
    link: "/",
    cta: "Read Now →",
  },
  {
    icon: "📅",
    title: "Events",
    description: "Summits, mixers, workshops, and virtual sessions for founders, creatives, and changemakers.",
    link: "/events",
    cta: "See Events →",
  },
  {
    icon: "💡",
    title: "Opportunities",
    description: "Grants, jobs, fellowships, and brand deals curated specifically for Black entrepreneurs and creators.",
    link: "/opportunities",
    cta: "Find Opportunities →",
  },
  {
    icon: "🎙️",
    title: "The Podcast",
    description: "In-depth conversations with founders, artists, and innovators shaping the future.",
    link: "https://podcasts.apple.com/us/podcast/the-innovators-den/id1678746448",
    cta: "Listen →",
    external: true,
  },
  {
    icon: "👥",
    title: "Innovator Directory",
    description: "Discover, connect with, and follow Black founders, creatives, investors, and leaders.",
    link: "/innovators",
    cta: "Explore People →",
  },
  {
    icon: "✦",
    title: "Pro Membership",
    description: "Go ad-free, unlock the full Opportunities Board, receive daily briefings, and support independent Black media.",
    link: "/membership",
    cta: "Become a Member →",
  },
];

interface LiveStats {
  eventsCount: number;
  opportunitiesCount: number;
  innovatorsCount: number;
  collaborationsCount: number;
}

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<"features" | "topics" | "community">("features");
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [evRes, opRes, inRes, colRes] = await Promise.allSettled([
          fetch("/api/events").then(r => r.json()),
          fetch("/api/opportunities").then(r => r.json()),
          fetch("/api/innovators").then(r => r.json()),
          fetch("/api/collaborate").then(r => r.json()),
        ]);
        setStats({
          eventsCount: evRes.status === "fulfilled" && Array.isArray(evRes.value) ? evRes.value.length : 0,
          opportunitiesCount: opRes.status === "fulfilled" && Array.isArray(opRes.value) ? opRes.value.length : 0,
          innovatorsCount: inRes.status === "fulfilled" && Array.isArray(inRes.value) ? inRes.value.length : 0,
          collaborationsCount: colRes.status === "fulfilled" && Array.isArray(colRes.value) ? colRes.value.length : 0,
        });
      } catch { /* non-critical */ }
    }
    fetchStats();
  }, []);

  const STAT_PILLS = [
    { label: "Events", count: stats?.eventsCount, link: "/events" },
    { label: "Opportunities", count: stats?.opportunitiesCount, link: "/opportunities" },
    { label: "Innovators", count: stats?.innovatorsCount, link: "/innovators" },
    { label: "Collab Posts", count: stats?.collaborationsCount, link: "/collaborate" },
  ];

  const LIVE_COUNTS: Record<string, number | undefined> = {
    "Events": stats?.eventsCount,
    "Opportunities": stats?.opportunitiesCount,
    "Innovator Directory": stats?.innovatorsCount,
    "Collaboration Board": stats?.collaborationsCount,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#ffffff", fontFamily: "system-ui, sans-serif" }}>
      <Seo
        title="Discover | The Innovators Den"
        description="Explore everything The Innovators Den has to offer — events, opportunities, topics, and the innovator community."
        type="website"
      />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #000000 100%)", borderBottom: "1px solid #222222", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>THE INNOVATORS DEN</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: -1 }}>
            Discover 🌍
          </h1>
          <p style={{ color: "#888888", fontSize: 17, margin: "0 0 32px", maxWidth: 500, lineHeight: 1.6 }}>
            Your hub for everything in The Innovators Den — news, events, opportunities, community, and more.
          </p>
          {/* Live stat pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {STAT_PILLS.map(pill => (
              <a
                key={pill.label}
                href={pill.link}
                onClick={e => { e.preventDefault(); window.location.href = pill.link; }}
                style={{
                  background: "#111", border: "1px solid #2a2a2a", borderRadius: 100,
                  padding: "7px 14px", textDecoration: "none", display: "flex",
                  alignItems: "center", gap: 8, transition: "border-color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#444")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
              >
                {pill.count != null && (
                  <span style={{ background: "#FFE600", color: "#000", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 100 }}>
                    {pill.count.toLocaleString()}
                  </span>
                )}
                <span style={{ color: "#aaa", fontSize: 13, fontWeight: 600 }}>{pill.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "0 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 32 }}>
          {(["features", "topics", "community"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "16px 0",
                color: activeTab === tab ? "#FFE600" : "#888888",
                fontWeight: 700, fontSize: 13, letterSpacing: 1,
                borderBottom: activeTab === tab ? "2px solid #FFE600" : "2px solid transparent",
                textTransform: "uppercase",
              }}
            >
              {tab === "features" ? "What's Inside" : tab === "topics" ? "Topics" : "Community"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Features tab */}
        {activeTab === "features" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {FEATURES.map(f => {
              const liveCount = LIVE_COUNTS[f.title];
              return (
                <a
                  key={f.title}
                  href={f.external ? f.link : undefined}
                  onClick={!f.external ? e => { e.preventDefault(); window.location.href = f.link; } : undefined}
                  target={f.external ? "_blank" : undefined}
                  rel={f.external ? "noopener noreferrer" : undefined}
                  style={{
                    background: "#111111", border: "1px solid #222222", borderRadius: 14,
                    padding: 24, textDecoration: "none", display: "flex", flexDirection: "column",
                    gap: 12, transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#333333")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#222222")}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 36 }}>{f.icon}</span>
                    {liveCount != null && liveCount > 0 && (
                      <span style={{ background: "#FFE60015", border: "1px solid #FFE60030", color: "#FFE600", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 100 }}>
                        {liveCount.toLocaleString()} live
                      </span>
                    )}
                  </div>
                  <h3 style={{ color: "#ffffff", fontSize: 18, fontWeight: 700, margin: 0 }}>{f.title}</h3>
                  <p style={{ color: "#888888", fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{f.description}</p>
                  <span style={{ color: "#FFE600", fontSize: 13, fontWeight: 700 }}>{f.cta}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Topics tab */}
        {activeTab === "topics" && (
          <div>
            <p style={{ color: "#888888", marginBottom: 24, fontSize: 15 }}>
              Choose topics that matter to you and your feed will automatically update.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {TOPICS.map(topic => (
                <Link key={topic.slug} href={`/topics/${topic.slug}`}>
                  <a style={{
                    background: "#111111", border: `1px solid ${topic.color}30`,
                    borderRadius: 12, padding: "20px 16px", textDecoration: "none",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 10, transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = topic.color;
                    e.currentTarget.style.background = topic.color + "10";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = topic.color + "30";
                    e.currentTarget.style.background = "#111111";
                  }}>
                    <span style={{ fontSize: 28 }}>{topic.emoji}</span>
                    <span style={{ color: topic.color, fontSize: 13, fontWeight: 700 }}>{topic.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Community tab */}
        {activeTab === "community" && (
          <div>
            <p style={{ color: "#888888", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
              The Innovators Den is more than a media platform — it's a community for Black entrepreneurs, creatives, and leaders.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 40 }}>
              {INNOVATORS_CATEGORIES.map(cat => (
                <Link key={cat.slug} href={`/innovators?category=${cat.slug}`}>
                  <a style={{
                    background: "#111111", border: "1px solid #222222", borderRadius: 12,
                    padding: "20px 16px", textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#333333")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#222222")}>
                    <span style={{ fontSize: 24 }}>{cat.icon}</span>
                    <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 600 }}>{cat.label}</span>
                  </a>
                </Link>
              ))}
            </div>
            <div style={{ background: "#111111", border: "1px solid #222222", borderRadius: 14, padding: 28 }}>
              <h3 style={{ color: "#FFE600", fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>✦ Get the App</h3>
              <p style={{ color: "#888888", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
                Download The Innovators Den app for iOS and Android for the full community experience, personalized feed, and push notifications.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="https://apps.apple.com/app/the-innovators-den" target="_blank" rel="noopener noreferrer"
                  style={{ background: "#FFE600", color: "#000000", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 8, textDecoration: "none" }}>
                  Download for iOS
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.theinnovatorsden.app" target="_blank" rel="noopener noreferrer"
                  style={{ background: "#1a1a1a", color: "#ffffff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 8, border: "1px solid #333", textDecoration: "none" }}>
                  Get on Android
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
