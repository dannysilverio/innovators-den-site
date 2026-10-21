import { useRef, useState } from "react";
import { Link } from "wouter";
import html2canvas from "html2canvas";
import { useAuth } from "@/context/AuthContext";

const IC_TIERS = new Set(["inner_circle", "founding"]);

function InnerCircleGate() {
  return (
    <div style={{
      minHeight: "100vh", background: "#000", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{
        background: "#111", border: "1px solid #FF4D7E40", borderRadius: 20,
        padding: 40, maxWidth: 420, width: "100%", textAlign: "center",
        boxShadow: "0 0 40px #FF4D7E18",
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <p style={{ color: "#FF4D7E", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
          DEN INNER CIRCLE
        </p>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 10px" }}>
          Members Only
        </h2>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
          This tool is exclusive to Den Inner Circle members.
          Upgrade your membership to continue.
        </p>
        <Link href="/membership">
          <a style={{
            display: "block", width: "100%", background: "#FF4D7E", color: "#fff",
            border: "none", borderRadius: 10, padding: "14px",
            fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none",
            marginBottom: 12, boxSizing: "border-box",
          }}>
            Upgrade to Inner Circle →
          </a>
        </Link>
        <Link href="/sign-in">
          <a style={{ display: "block", color: "#555", fontSize: 13, textDecoration: "none", marginTop: 8 }}>
            Already a member? Sign in
          </a>
        </Link>
      </div>
    </div>
  );
}

const BRAND = {
  black: "#000000",
  yellow: "#FFE600",
  pink: "#FF4D7E",
  white: "#FFFFFF",
  gray: "#1A1A1A",
  grayMid: "#2A2A2A",
  grayText: "#999999",
};

// Native render size — html2canvas captures this, then we resize to exactly 1242×2688
const NATIVE_W = 414;
const NATIVE_H = 896;
// Final App Store dimensions
const FINAL_W = 1242;
const FINAL_H = 2688;

function StatusBar() {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 20px 4px", background: BRAND.black, flexShrink: 0,
    }}>
      <span style={{ color: BRAND.white, fontSize: 15, fontWeight: 600, fontFamily: "monospace" }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="white"/><rect x="4" y="2" width="3" height="10" rx="1" fill="white"/><rect x="8" y="0" width="3" height="12" rx="1" fill="white"/><rect x="12" y="0" width="5" height="12" rx="1" fill="white" opacity="0.3"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.4C5.6 2.4 3.4 3.4 1.8 5L0 3.2C2.1 1.2 4.9 0 8 0s5.9 1.2 8 3.2L14.2 5C12.6 3.4 10.4 2.4 8 2.4z" fill="white"/><path d="M8 5.6C6.4 5.6 5 6.2 3.9 7.2L2.1 5.4C3.6 4 5.7 3.2 8 3.2s4.4.8 5.9 2.2L12.1 7.2C11 6.2 9.6 5.6 8 5.6z" fill="white"/><circle cx="8" cy="10" r="2" fill="white"/></svg>
        <div style={{ display: "flex", border: "1px solid white", borderRadius: 3, padding: "1px 2px", gap: 1, alignItems: "center" }}>
          <div style={{ width: 18, height: 9, background: "white", borderRadius: 1 }}/>
          <div style={{ width: 2, height: 5, background: "white", borderRadius: 1 }}/>
        </div>
      </div>
    </div>
  );
}

function DynamicIsland() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 0", background: BRAND.black, flexShrink: 0 }}>
      <div style={{ width: 120, height: 34, background: "#000", borderRadius: 20, border: "2px solid #1a1a1a" }}/>
    </div>
  );
}

function TabBar({ active }: { active: "Home" | "Topics" | "Saved" | "Profile" }) {
  const tabs: { name: string; icon: React.ReactNode }[] = [
    { name: "Home", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill={active === "Home" ? BRAND.yellow : "#555"}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
    { name: "Topics", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill={active === "Topics" ? BRAND.yellow : "#555"}><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg> },
    { name: "Saved", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill={active === "Saved" ? BRAND.yellow : "#555"}><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg> },
    { name: "Profile", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill={active === "Profile" ? BRAND.yellow : "#555"}><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg> },
  ];
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      background: BRAND.black, borderTop: "1px solid #222",
      padding: "8px 0 28px", flexShrink: 0,
    }}>
      {tabs.map(t => (
        <div key={t.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {t.icon}
          <span style={{ fontSize: 10, color: t.name === active ? BRAND.yellow : "#555", fontWeight: t.name === active ? 700 : 400 }}>{t.name}</span>
        </div>
      ))}
    </div>
  );
}

function HomeScreen() {
  return (
    <div style={{ width: NATIVE_W, height: NATIVE_H, display: "flex", flexDirection: "column", background: BRAND.black, fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif", overflow: "hidden" }}>
      <DynamicIsland />
      <StatusBar />
      {/* Header */}
      <div style={{ padding: "8px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ color: BRAND.yellow, fontSize: 19, fontWeight: 900, letterSpacing: -0.5 }}>THE INNOVATORS DEN</div>
          <div style={{ color: BRAND.grayText, fontSize: 10, marginTop: 1, letterSpacing: 1 }}>FOR US BY US</div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={BRAND.yellow}><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
        </div>
      </div>
      {/* Filter tabs */}
      <div style={{ padding: "0 16px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "hidden" }}>
          {["All", "Innovation", "Culture", "Music", "Business"].map(t => (
            <div key={t} style={{
              padding: "5px 12px", borderRadius: 20, flexShrink: 0,
              background: t === "All" ? BRAND.yellow : "#1e1e1e",
              color: t === "All" ? BRAND.black : "#aaa",
              fontSize: 12, fontWeight: t === "All" ? 700 : 400,
            }}>{t}</div>
          ))}
        </div>
      </div>
      {/* Hero */}
      <div style={{ padding: "0 16px 10px", flexShrink: 0 }}>
        <div style={{ color: BRAND.yellow, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>THE DROP</div>
        <div style={{ background: "#0d0d1a", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ height: 150, background: "linear-gradient(135deg, #1a0a2e 0%, #3d1f6e 50%, #1a0a2e 100%)", display: "flex", alignItems: "flex-end", padding: "12px" }}>
            <div>
              <span style={{ background: BRAND.pink, color: BRAND.white, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, marginBottom: 6, display: "inline-block" }}>INNOVATION</span>
              <div style={{ color: BRAND.white, fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>Black Tech Founders Raise $2.4B in Record Quarter</div>
            </div>
          </div>
          <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: BRAND.grayText, fontSize: 11 }}>TechCrunch · 1h ago</div>
            <div style={{ display: "flex", gap: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#555"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#555"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
            </div>
          </div>
        </div>
      </div>
      {/* Article cards */}
      {[
        { title: "JAY-Z's Armand de Brignac Partners With Moët in Landmark Deal", src: "Billboard", cat: "BUSINESS", grad: "linear-gradient(135deg, #1a2a0a, #2a3a1a)" },
        { title: "HBCU Grads Are Reshaping Silicon Valley's Culture", src: "Essence", cat: "CULTURE", grad: "linear-gradient(135deg, #0a1a2a, #1a2a3a)" },
        { title: "Beyoncé's Renaissance Film Breaks Streaming Records", src: "Rolling Stone", cat: "MUSIC", grad: "linear-gradient(135deg, #2a0a1a, #3a1a2a)" },
      ].map((a, i) => (
        <div key={i} style={{ padding: "0 16px 8px", flexShrink: 0 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 12, overflow: "hidden", display: "flex" }}>
            <div style={{ width: 80, minHeight: 70, background: a.grad, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: "10px 12px" }}>
              <span style={{ background: BRAND.yellow, color: BRAND.black, fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 2 }}>{a.cat}</span>
              <div style={{ color: BRAND.white, fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginTop: 4, marginBottom: 4 }}>{a.title}</div>
              <div style={{ color: BRAND.grayText, fontSize: 10 }}>{a.src} · 2h ago</div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <TabBar active="Home" />
    </div>
  );
}

function TopicsScreen() {
  const topics = [
    { name: "Innovation", color: "#4CAF50", emoji: "💡" },
    { name: "Art", color: "#E91E63", emoji: "🎨" },
    { name: "Culture", color: "#9C27B0", emoji: "✊" },
    { name: "Music", color: "#2196F3", emoji: "🎵" },
    { name: "Business Growth", color: "#FF9800", emoji: "📈" },
    { name: "Sports", color: "#F44336", emoji: "🏆" },
    { name: "Food & Wine", color: "#795548", emoji: "🍽️" },
    { name: "Health", color: "#00BCD4", emoji: "💪" },
    { name: "Travel", color: "#03A9F4", emoji: "✈️" },
    { name: "Astrology", color: "#E879F9", emoji: "⭐" },
    { name: "Law", color: "#F59E0B", emoji: "⚖️" },
  ];
  return (
    <div style={{ width: NATIVE_W, height: NATIVE_H, display: "flex", flexDirection: "column", background: BRAND.black, fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif", overflow: "hidden" }}>
      <DynamicIsland />
      <StatusBar />
      <div style={{ padding: "10px 16px 12px", flexShrink: 0 }}>
        <div style={{ color: BRAND.white, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Topics</div>
        <div style={{ color: BRAND.grayText, fontSize: 13, marginTop: 2 }}>Explore what matters to you</div>
      </div>
      <div style={{ flex: 1, overflowY: "hidden", padding: "0 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {topics.map(topic => (
            <div key={topic.name} style={{
              background: "#1a1a1a", borderRadius: 14, padding: "16px 12px",
              display: "flex", flexDirection: "column", gap: 6,
              borderLeft: `3px solid ${topic.color}`,
            }}>
              <span style={{ fontSize: 24 }}>{topic.emoji}</span>
              <div style={{ color: BRAND.white, fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{topic.name}</div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="Topics" />
    </div>
  );
}

function SavedScreen() {
  const articles = [
    { title: "Black Entrepreneurs Are Redefining the Future of Finance", src: "Forbes", cat: "BUSINESS", grad: "linear-gradient(135deg, #1a2a0a, #2a3a1a)", time: "2d ago" },
    { title: "The Cultural Significance of Afrobeats Going Mainstream", src: "The Guardian", cat: "MUSIC", grad: "linear-gradient(135deg, #0a1a2a, #1a2a3a)", time: "5d ago" },
    { title: "How Atlanta's BeltLine Became a Model for Urban Renewal", src: "Curbed", cat: "CULTURE", grad: "linear-gradient(135deg, #2a0a1a, #3a1a2a)", time: "1w ago" },
  ];
  return (
    <div style={{ width: NATIVE_W, height: NATIVE_H, display: "flex", flexDirection: "column", background: BRAND.black, fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif", overflow: "hidden" }}>
      <DynamicIsland />
      <StatusBar />
      <div style={{ padding: "10px 16px 12px", flexShrink: 0 }}>
        <div style={{ color: BRAND.white, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Saved</div>
        <div style={{ color: BRAND.grayText, fontSize: 13, marginTop: 2 }}>3 articles bookmarked</div>
      </div>
      <div style={{ flex: 1, overflowY: "hidden" }}>
        {articles.map((a, i) => (
          <div key={i} style={{ margin: "0 14px 10px", background: "#1a1a1a", borderRadius: 14, overflow: "hidden", display: "flex" }}>
            <div style={{ width: 88, minHeight: 80, background: a.grad, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: "12px 12px" }}>
              <span style={{ background: BRAND.yellow, color: BRAND.black, fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 2 }}>{a.cat}</span>
              <div style={{ color: BRAND.white, fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginTop: 5, marginBottom: 5 }}>{a.title}</div>
              <div style={{ color: BRAND.grayText, fontSize: 10 }}>{a.src} · Saved {a.time}</div>
            </div>
          </div>
        ))}
        <div style={{ margin: "14px 14px 0", padding: "24px 16px", background: "#1a1a1a", borderRadius: 16, textAlign: "center", border: "1px dashed #444" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#555" style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <div style={{ color: BRAND.white, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Save stories you love</div>
          <div style={{ color: BRAND.grayText, fontSize: 12 }}>Tap the bookmark icon on any article to save it here</div>
        </div>
        <div style={{ margin: "10px 14px 0" }}>
          <div style={{ color: BRAND.yellow, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>RECENTLY READ</div>
          {[
            { title: "Lil Baby Partners With Apple Music for Exclusive Tour Doc", cat: "MUSIC" },
            { title: "NBA Finals: A Look at the League's Black Ownership Gap", cat: "SPORTS" },
          ].map((a, i) => (
            <div key={i} style={{ padding: "10px 0", borderTop: i > 0 ? "1px solid #2a2a2a" : "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ background: "#2a2a2a", color: "#aaa", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 2 }}>{a.cat}</span>
                <div style={{ color: "#ccc", fontSize: 12, fontWeight: 600, marginTop: 4 }}>{a.title}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#555" style={{ flexShrink: 0, marginLeft: 8 }}><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="Saved" />
    </div>
  );
}

function ProfileScreen() {
  return (
    <div style={{ width: NATIVE_W, height: NATIVE_H, display: "flex", flexDirection: "column", background: BRAND.black, fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif", overflow: "hidden" }}>
      <DynamicIsland />
      <StatusBar />
      <div style={{ padding: "10px 16px 0", flexShrink: 0 }}>
        <div style={{ color: BRAND.white, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Profile</div>
      </div>
      <div style={{ flex: 1, overflowY: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 16px" }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: `linear-gradient(135deg, ${BRAND.yellow}, ${BRAND.pink})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="rgba(0,0,0,0.7)"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
          <div style={{ color: BRAND.white, fontSize: 18, fontWeight: 800 }}>Welcome to The Den</div>
          <div style={{ color: BRAND.grayText, fontSize: 12, marginTop: 3 }}>Your personalized news hub</div>
        </div>
        {[
          { section: "PREFERENCES", items: [
            { emoji: "🔔", label: "Notifications", sub: "Daily digest enabled" },
            { emoji: "🏷️", label: "My Topics", sub: "6 topics selected" },
            { emoji: "🌙", label: "Dark Mode", sub: "Always on" },
          ]},
          { section: "ABOUT", items: [
            { emoji: "ℹ️", label: "About The Innovators Den", sub: "Version 1.0.0" },
            { emoji: "🔒", label: "Privacy Policy", sub: "" },
            { emoji: "📋", label: "Terms of Service", sub: "" },
          ]},
        ].map(s => (
          <div key={s.section} style={{ margin: "0 14px 12px" }}>
            <div style={{ color: BRAND.yellow, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>{s.section}</div>
            <div style={{ background: "#1a1a1a", borderRadius: 14, overflow: "hidden" }}>
              {s.items.map((item, i) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", padding: "13px 14px",
                  borderTop: i > 0 ? "1px solid #2a2a2a" : "none",
                }}>
                  <span style={{ fontSize: 18, marginRight: 12 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: BRAND.white, fontSize: 14 }}>{item.label}</div>
                    {item.sub && <div style={{ color: BRAND.grayText, fontSize: 11, marginTop: 1 }}>{item.sub}</div>}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#555"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ margin: "0 14px", padding: "16px", background: `linear-gradient(135deg, ${BRAND.yellow}22, ${BRAND.pink}22)`, borderRadius: 14, border: `1px solid ${BRAND.yellow}33` }}>
          <div style={{ color: BRAND.yellow, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>THE INNOVATORS DEN PODCAST</div>
          <div style={{ color: "#ccc", fontSize: 12, lineHeight: 1.5 }}>New episodes every Tuesday. Conversations with the builders shaping our future.</div>
        </div>
      </div>
      <TabBar active="Profile" />
    </div>
  );
}

const SCREENS = [
  { id: "home", label: "Home Feed", Component: HomeScreen, filename: "tid-home-feed" },
  { id: "topics", label: "Topics", Component: TopicsScreen, filename: "tid-topics" },
  { id: "saved", label: "Saved Articles", Component: SavedScreen, filename: "tid-saved" },
  { id: "profile", label: "Profile", Component: ProfileScreen, filename: "tid-profile" },
];

export default function Screenshots() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#444", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (!user || !IC_TIERS.has(user.subscriptionTier)) return <InnerCircleGate />;
  return <ScreenshotsInner />;
}

function ScreenshotsInner() {
  // captureRefs: hidden full-size elements used for html2canvas capture
  const captureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadAll, setDownloadAll] = useState(false);
  const [done, setDone] = useState<string[]>([]);

  const downloadAsJpg = async (index: number) => {
    const el = captureRefs.current[index];
    if (!el) return;
    const screen = SCREENS[index];
    setDownloading(screen.id);
    try {
      // Capture at 3× pixel ratio → 1242×2688
      const rawCanvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#000000",
        width: NATIVE_W,
        height: NATIVE_H,
        logging: false,
        imageTimeout: 0,
      });

      // Force output to exactly 1242×2688
      const final = document.createElement("canvas");
      final.width = FINAL_W;
      final.height = FINAL_H;
      const ctx = final.getContext("2d")!;
      ctx.drawImage(rawCanvas, 0, 0, FINAL_W, FINAL_H);

      await new Promise<void>(resolve => {
        final.toBlob(blob => {
          if (!blob) { resolve(); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${screen.filename}-1242x2688.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        }, "image/jpeg", 0.95);
      });

      setDone(d => [...d, screen.id]);
    } finally {
      setDownloading(null);
    }
  };

  const downloadAllJpg = async () => {
    setDownloadAll(true);
    setDone([]);
    for (let i = 0; i < SCREENS.length; i++) {
      await downloadAsJpg(i);
      await new Promise(r => setTimeout(r, 800));
    }
    setDownloadAll(false);
  };

  const PREVIEW_SCALE = 0.52;

  return (
    <div style={{ minHeight: "100vh", background: "#111", fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      {/* Hidden capture containers — full size, off-screen */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none", zIndex: -1 }}>
        {SCREENS.map((screen, i) => {
          const { Component } = screen;
          return (
            <div
              key={screen.id}
              ref={el => { captureRefs.current[i] = el; }}
              style={{ width: NATIVE_W, height: NATIVE_H, overflow: "hidden", background: BRAND.black }}
            >
              <Component />
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: BRAND.yellow, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>APP STORE SCREENSHOTS</div>
          <h1 style={{ color: BRAND.white, fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: -1 }}>The Innovators Den</h1>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 28px" }}>Output: <strong style={{ color: "#aaa" }}>1242 × 2688 px</strong> · iPhone 6.5" · JPEG · 95% quality</p>
          <button
            onClick={downloadAllJpg}
            disabled={downloadAll}
            style={{
              background: downloadAll ? "#333" : BRAND.yellow,
              color: downloadAll ? "#888" : BRAND.black,
              border: "none", borderRadius: 12,
              padding: "14px 36px", fontSize: 15, fontWeight: 700,
              cursor: downloadAll ? "wait" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {downloadAll ? `Generating… (${done.length}/4)` : done.length === 4 ? "✓ All 4 JPGs Downloaded" : "⬇ Download All 4 JPGs"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
          {SCREENS.map((screen, i) => {
            const { Component } = screen;
            const isDone = done.includes(screen.id);
            return (
              <div key={screen.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <div style={{ color: isDone ? BRAND.yellow : BRAND.white, fontSize: 14, fontWeight: 700, transition: "color 0.3s" }}>
                  {isDone ? "✓ " : ""}{screen.label}
                </div>

                {/* Scaled preview — visual only */}
                <div style={{
                  width: NATIVE_W * PREVIEW_SCALE,
                  height: NATIVE_H * PREVIEW_SCALE,
                  overflow: "hidden",
                  borderRadius: 28,
                  boxShadow: isDone
                    ? `0 0 0 2px ${BRAND.yellow}, 0 20px 60px rgba(0,0,0,0.7)`
                    : "0 0 0 2px #333, 0 20px 60px rgba(0,0,0,0.7)",
                  transition: "box-shadow 0.3s",
                  flexShrink: 0,
                  position: "relative",
                }}>
                  <div style={{
                    width: NATIVE_W, height: NATIVE_H, background: BRAND.black,
                    transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left",
                  }}>
                    <Component />
                  </div>
                </div>

                <button
                  onClick={() => downloadAsJpg(i)}
                  disabled={downloading !== null || downloadAll}
                  style={{
                    background: isDone ? "#1a2a0a" : BRAND.pink,
                    color: isDone ? "#4CAF50" : BRAND.white,
                    border: isDone ? "1px solid #4CAF50" : "none",
                    borderRadius: 10, padding: "11px 20px",
                    fontSize: 13, fontWeight: 700,
                    cursor: downloading !== null || downloadAll ? "wait" : "pointer",
                    width: "100%", transition: "all 0.3s",
                  }}
                >
                  {downloading === screen.id
                    ? "Generating…"
                    : isDone
                    ? "✓ Downloaded"
                    : `⬇ Download JPG`}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 40, padding: "18px 22px", background: "#1a1a1a", borderRadius: 12 }}>
          <div style={{ color: BRAND.white, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>How to upload to App Store Connect</div>
          <div style={{ color: "#888", fontSize: 13, lineHeight: 1.7 }}>
            1. Click "Download All 4 JPGs" above — files save as <code style={{ color: BRAND.yellow, background: "#2a2a2a", padding: "1px 5px", borderRadius: 3 }}>tid-*.jpg</code> to your downloads folder.<br/>
            2. In App Store Connect → Your App → Screenshots → iPhone 6.5" Display → drag and drop the 4 files.<br/>
            3. Each file is exactly <strong style={{ color: BRAND.white }}>1242 × 2688 px</strong> — the exact pixel dimensions Apple requires.
          </div>
        </div>
      </div>
    </div>
  );
}
