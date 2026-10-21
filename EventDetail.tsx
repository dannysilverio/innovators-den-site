import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/track";

const API_BASE = "/api";

const TYPE_COLORS: Record<string, string> = {
  "in-person": "#10B981", virtual: "#3B82F6", hybrid: "#8B5CF6",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function daysUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / 86400000);
}

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const { user, authHeader } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpState, setRsvpState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (!params?.id) return;
    fetch(`${API_BASE}/events/${params.id}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setEvent(d.event ?? d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [params?.id]);

  const handleRsvp = async () => {
    if (!user) { setLocation(`/sign-in?next=/events/${params?.id}`); return; }
    setRsvpState("loading");
    try {
      const r = await fetch(`${API_BASE}/events/${params?.id}/rsvp`, {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status: "going" }),
      });
      if (!r.ok) throw new Error();
      setRsvpState("done");
      trackEvent("event_rsvp_completed", { event_type: event?.type ?? "unknown" });
    } catch { setRsvpState("error"); }
  };

  const typeColor = TYPE_COLORS[event?.type] ?? "#888";
  const days = event ? daysUntil(event.eventDate) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {event && (
        <Seo
          title={`${event.title} | The Innovators Den`}
          description={event.description?.slice(0, 155)}
          type="article"
        />
      )}

      {/* Back nav */}
      <div style={{ borderBottom: "1px solid #111", padding: "16px 24px" }}>
        <button onClick={() => setLocation("/events")} style={{ background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to Events
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "#888" }}>Loading event…</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <p style={{ color: "#FF6B6B" }}>Could not load event.</p>
          <button onClick={() => setLocation("/events")} style={{ padding: "10px 20px", background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff", cursor: "pointer" }}>Go back</button>
        </div>
      ) : event ? (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* Type badge + countdown */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ background: typeColor + "20", color: typeColor, border: `1px solid ${typeColor}40`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
              {event.type?.toUpperCase() ?? "EVENT"}
            </span>
            {event.category && (
              <span style={{ background: "#1a1a1a", color: "#888", border: "1px solid #222", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>
                {event.category}
              </span>
            )}
            {days !== null && (
              <span style={{ marginLeft: "auto", color: days <= 7 ? "#FF4D7E" : "#FFE600", fontSize: 13, fontWeight: 700 }}>
                {days === 0 ? "Today!" : `${days}d away`}
              </span>
            )}
            {days === null && <span style={{ marginLeft: "auto", color: "#555", fontSize: 13 }}>Past event</span>}
          </div>

          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: -0.5, lineHeight: 1.2 }}>
            {event.title}
          </h1>

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, margin: "24px 0", padding: "24px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 16 }}>
            <div>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>DATE</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{fmt(event.eventDate)}</p>
              <p style={{ margin: "2px 0 0", color: "#888", fontSize: 12 }}>{fmtTime(event.eventDate)}{event.eventEndDate ? ` – ${fmtTime(event.eventEndDate)}` : ""}</p>
            </div>
            {(event.location || event.city) && (
              <div>
                <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>LOCATION</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{event.location}</p>
                {event.city && <p style={{ margin: "2px 0 0", color: "#888", fontSize: 12 }}>{event.city}</p>}
                {event.address && <p style={{ margin: "2px 0 0", color: "#666", fontSize: 11 }}>{event.address}</p>}
              </div>
            )}
            {event.organizer && (
              <div>
                <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>ORGANIZER</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{event.organizer}</p>
              </div>
            )}
            <div>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>PRICE</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: event.price === "free" || event.price === "0" ? "#10B981" : "#FFE600" }}>
                {event.price === "free" || event.price === "0" ? "Free" : event.price ?? "Free"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ margin: "24px 0", lineHeight: 1.8, fontSize: 16, color: "#ddd", whiteSpace: "pre-wrap" }}>
            {event.description}
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "20px 0" }}>
              {event.tags.map((t: string) => (
                <span key={t} style={{ background: "#111", border: "1px solid #222", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#888" }}>#{t}</span>
              ))}
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            {event.rsvpUrl ? (
              <a href={event.rsvpUrl} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent("event_registration_clicked", { event_type: event.type ?? "unknown" })}
                style={{ padding: "14px 28px", background: "#FFE600", color: "#000", fontWeight: 800, fontSize: 15, borderRadius: 12, textDecoration: "none", display: "inline-block" }}>
                Register / Get Tickets →
              </a>
            ) : (
              <button onClick={handleRsvp} disabled={rsvpState === "loading" || rsvpState === "done"}
                style={{ padding: "14px 28px", background: rsvpState === "done" ? "#10B981" : "#FFE600", color: "#000", fontWeight: 800, fontSize: 15, borderRadius: 12, border: "none", cursor: rsvpState === "loading" ? "wait" : "pointer", opacity: rsvpState === "loading" ? 0.7 : 1 }}>
                {rsvpState === "done" ? "✓ You're going!" : rsvpState === "loading" ? "Saving…" : "RSVP — I'm Going"}
              </button>
            )}
            <button onClick={() => { navigator.share?.({ title: event.title, url: window.location.href }).catch(() => {}); }}
              style={{ padding: "14px 20px", background: "#111", border: "1px solid #222", color: "#fff", fontWeight: 600, fontSize: 14, borderRadius: 12, cursor: "pointer" }}>
              Share ↗
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
