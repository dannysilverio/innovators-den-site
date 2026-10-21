import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";

const TOPIC_COLORS: Record<string, string> = {
  "Black Business": "#FFE600", "Tech & Innovation": "#3B82F6",
  "Music & Culture": "#8B5CF6", "Creative Arts": "#FF4D7E",
  "Finance & Wealth": "#10B981", "Health & Wellness": "#F97316",
  "Sports": "#06B6D4", "Media & Journalism": "#EC4899",
};
function topicColor(name: string) {
  return TOPIC_COLORS[name] ?? "#888";
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CirclesPage() {
  const { user, authHeader } = useAuth();
  const [, setLocation] = useLocation();
  const [circles, setCircles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/circles`)
      .then(r => r.json())
      .then(d => { setCircles(d.circles ?? d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadMessages = async (circle: any) => {
    setSelected(circle);
    setMsgLoading(true);
    setMessages([]);
    try {
      const r = await fetch(`${API_BASE}/circles/${circle.slug}/messages?limit=30`);
      const d = await r.json();
      setMessages(d.messages ?? d ?? []);
    } finally { setMsgLoading(false); }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selected) return;
    if (!user) { setLocation(`/sign-in?next=/circles`); return; }
    setSending(true);
    try {
      const r = await fetch(`${API_BASE}/circles/${selected.slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ content: newMsg.trim(), type: "message" }),
      });
      if (r.ok) {
        setNewMsg("");
        await loadMessages(selected);
      }
    } finally { setSending(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <Seo
        title="Circles | The Innovators Den"
        description="Join community conversations in The Innovators Den Circles — topic-based rooms for Black and Brown innovators."
        type="website"
      />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #111 0%, #000 100%)", borderBottom: "1px solid #1a1a1a", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 12px" }}>THE INNOVATORS DEN</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, margin: "0 0 12px", letterSpacing: -1 }}>Circles 💬</h1>
          <p style={{ color: "#888", fontSize: 16, margin: 0, maxWidth: 540 }}>
            Persistent community rooms where the culture connects — by topic, for the culture.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", display: "grid", gridTemplateColumns: selected ? "320px 1fr" : "1fr", gap: 24 }}>
        {/* Circle list */}
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#555" }}>Loading circles…</div>
          ) : circles.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <p style={{ fontSize: 36 }}>💬</p>
              <p style={{ color: "#888" }}>No circles yet — check back soon.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {circles.map(c => {
                const color = topicColor(c.name ?? c.topic);
                const isActive = selected?.id === c.id;
                return (
                  <button key={c.id} onClick={() => isActive ? setSelected(null) : loadMessages(c)}
                    style={{ background: isActive ? color + "15" : "#0d0d0d", border: `1px solid ${isActive ? color + "50" : "#1a1a1a"}`, borderRadius: 14, padding: 18, textAlign: "left", cursor: "pointer", color: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{c.name}</h3>
                      <span style={{ background: color + "20", color, border: `1px solid ${color}40`, borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                        {c.topic ?? c.category ?? "Circle"}
                      </span>
                    </div>
                    {c.description && <p style={{ margin: "0 0 10px", color: "#666", fontSize: 12, lineHeight: 1.5 }}>{c.description.slice(0, 100)}</p>}
                    <div style={{ display: "flex", gap: 12, color: "#555", fontSize: 11 }}>
                      {c.memberCount != null && <span>👥 {c.memberCount} members</span>}
                      {c.lastActivityAt && <span>🕐 {timeAgo(c.lastActivityAt)}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Message panel */}
        {selected && (
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 16, display: "flex", flexDirection: "column", height: 600, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{selected.name}</p>
                <p style={{ margin: "2px 0 0", color: "#555", fontSize: 11 }}>{selected.topic}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {msgLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#555" }}>Loading messages…</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <p style={{ fontSize: 28, margin: "0 0 10px" }}>🔇</p>
                  <p style={{ color: "#555", fontSize: 13 }}>No messages yet. Start the conversation!</p>
                </div>
              ) : messages.map((m: any) => (
                <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#000", flexShrink: 0 }}>
                    {(m.user?.displayName ?? m.displayName ?? "?")[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{m.user?.displayName ?? m.displayName ?? "Member"}</span>
                      <span style={{ fontSize: 10, color: "#444" }}>{timeAgo(m.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{m.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #1a1a1a" }}>
              {user ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Say something…" maxLength={500}
                    style={{ flex: 1, background: "#141414", border: "1px solid #222", borderRadius: 10, padding: "10px 14px", color: "#f0f0f0", fontSize: 13, outline: "none", fontFamily: "system-ui, sans-serif" }} />
                  <button onClick={sendMessage} disabled={sending || !newMsg.trim()}
                    style={{ padding: "10px 18px", background: "#FFE600", color: "#000", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: sending || !newMsg.trim() ? 0.5 : 1 }}>
                    Send
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "10px" }}>
                  <button onClick={() => setLocation("/sign-in?next=/circles")} style={{ background: "none", border: "none", color: "#FFE600", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Sign in to join the conversation →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
