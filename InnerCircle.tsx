import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

const IC_TIERS = new Set(["inner_circle", "founding"]);

function UpgradeGate() {
  const [wEmail, setWEmail] = useState("");
  const [wName, setWName] = useState("");
  const [wSending, setWSending] = useState(false);
  const [wDone, setWDone] = useState(false);
  const [wError, setWError] = useState<string | null>(null);

  const handleWaitlist = async () => {
    if (!wEmail) return;
    setWSending(true);
    setWError(null);
    try {
      const res = await fetch("/api/waitlist/inner-circle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: wEmail, name: wName || undefined, source: "ic_gate" }),
      });
      const data = await res.json();
      if (!res.ok) { setWError(data.error ?? "Something went wrong. Try again."); }
      else { setWDone(true); }
    } catch { setWError("Network error. Please try again."); }
    finally { setWSending(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#000", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif", padding: 20,
    }}>
      <div style={{
        background: "#111", border: "1px solid #FF4D7E40", borderRadius: 20,
        padding: 40, maxWidth: 440, width: "100%", textAlign: "center",
        boxShadow: "0 0 60px #FF4D7E14",
      }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>💎</div>
        <p style={{ color: "#FF4D7E", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>
          THE INNOVATORS DEN
        </p>
        <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "0 0 10px", letterSpacing: -0.5 }}>
          Inner Circle
        </h2>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
          This area is exclusive to Den Inner Circle and Founding members.
          Upgrade your membership to unlock access.
        </p>

        <Link href="/membership">
          <a style={{
            display: "block", width: "100%", background: "#FF4D7E", color: "#fff",
            border: "none", borderRadius: 10, padding: "14px",
            fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none",
            marginBottom: 16, boxSizing: "border-box",
          }}>
            Upgrade to Inner Circle →
          </a>
        </Link>

        <Link href="/sign-in">
          <a style={{
            display: "block", width: "100%", background: "transparent", color: "#888",
            border: "1px solid #222", borderRadius: 10, padding: "13px",
            fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none",
            marginBottom: 24, boxSizing: "border-box",
          }}>
            Already a member? Sign in
          </a>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 20px" }}>
          <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
          <span style={{ color: "#444", fontSize: 12 }}>or join the waitlist</span>
          <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
        </div>

        {wDone ? (
          <div style={{ padding: "10px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
            <p style={{ color: "#10B981", fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>You're on the list.</p>
            <p style={{ color: "#555", fontSize: 13 }}>We'll reach out when your invitation is ready.</p>
          </div>
        ) : (
          <div style={{ background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: 14, padding: "20px 20px 16px" }}>
            <p style={{ color: "#FF4D7E", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>REQUEST AN INVITATION</p>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={wName}
              onChange={e => setWName(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", background: "#1a1a1a",
                border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", fontSize: 14,
                outline: "none", marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={wEmail}
              onChange={e => setWEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleWaitlist()}
              style={{
                width: "100%", padding: "12px 14px", background: "#1a1a1a",
                border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", fontSize: 14,
                outline: "none", marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
            {wError && <p style={{ color: "#FF4D7E", fontSize: 13, marginBottom: 10 }}>{wError}</p>}
            <button
              onClick={handleWaitlist}
              disabled={wSending || !wEmail}
              style={{
                width: "100%", background: "transparent", color: "#FF4D7E",
                border: "1px solid #FF4D7E40", borderRadius: 10, padding: "12px",
                fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                opacity: wSending || !wEmail ? 0.6 : 1,
              }}
            >
              {wSending ? "Joining waitlist…" : "Request My Invitation →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const PERKS = [
  { icon: "🎟️", title: "Exclusive Events", desc: "Private rooftop gatherings, invite-only summits, and networking experiences reserved for Inner Circle members." },
  { icon: "🎙️", title: "Founder Briefings", desc: "Monthly private sessions with TID founders. Real talk on strategy, culture, and what's next for the platform." },
  { icon: "🏆", title: "Elite Badge", desc: "Your Den Inner Circle badge displays across the platform — a mark of the most committed members in the community." },
  { icon: "🛎️", title: "Concierge Access", desc: "Direct line to the TID team for support, feedback, and priority access to new features before anyone else." },
  { icon: "✍️", title: "Content Moderation", desc: "Help shape the platform by reviewing and approving articles submitted to The Innovators Den." },
  { icon: "📸", title: "Screenshot Studio", desc: "Access the App Store screenshot generator to create marketing assets for the platform." },
  { icon: "📜", title: "App Credits", desc: "Your name is listed in the app credits as a founding member of The Innovators Den community." },
  { icon: "💬", title: "Direct Team Line", desc: "Reach out to Danny & Osvaldo directly with ideas, partnerships, or anything on your mind." },
];

const QUICK_LINKS = [
  { label: "Content Moderation", href: "/moderation", color: "#FF4D7E", icon: "✍️", desc: "Review pending articles" },
  { label: "Screenshot Studio", href: "/screenshots", color: "#FFE600", icon: "📸", desc: "Generate App Store assets" },
  { label: "Events", href: "/events", color: "#10B981", icon: "🎟️", desc: "View exclusive events" },
  { label: "Membership", href: "/membership", color: "#8B5CF6", icon: "💎", desc: "Your tier & benefits" },
];

function InnerCircleHub() {
  const { user, logout } = useAuth();
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <div style={{
        background: "linear-gradient(135deg, #0d000a 0%, #1a0010 40%, #000 100%)",
        borderBottom: "1px solid #FF4D7E20",
        padding: "60px 24px 52px",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: 500, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, #FF4D7E18 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#FF4D7E15", border: "1px solid #FF4D7E40",
          borderRadius: 20, padding: "6px 16px", marginBottom: 20,
        }}>
          <span style={{ fontSize: 14 }}>💎</span>
          <span style={{ color: "#FF4D7E", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>DEN INNER CIRCLE</span>
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, margin: "0 0 14px", letterSpacing: -1.5 }}>
          Welcome to the Circle
        </h1>
        <p style={{ color: "#888", fontSize: 17, margin: "0 auto 28px", maxWidth: 480, lineHeight: 1.6 }}>
          You're part of the most exclusive tier in The Innovators Den. Everything here is built for you.
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          background: "#111", border: "1px solid #FF4D7E40", borderRadius: 16,
          padding: "14px 24px",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 22,
            background: "linear-gradient(135deg, #FF4D7E, #9B1D45)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>💎</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#FF4D7E", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 3 }}>MEMBERSHIP STATUS</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>
              {user?.subscriptionTier === "founding" ? "Founding Member ✦" : "Den Inner Circle ✦"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 0" }}>
        <p style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>QUICK ACCESS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 52 }}>
          {QUICK_LINKS.map(link => (
            <Link key={link.href} href={link.href}>
              <a style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "#111", border: `1px solid ${link.color}30`,
                    borderRadius: 14, padding: "20px 20px 18px",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = link.color + "70";
                    (e.currentTarget as HTMLDivElement).style.background = "#161616";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = link.color + "30";
                    (e.currentTarget as HTMLDivElement).style.background = "#111";
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{link.icon}</div>
                  <div style={{ color: link.color, fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{link.label}</div>
                  <div style={{ color: "#555", fontSize: 12 }}>{link.desc}</div>
                </div>
              </a>
            </Link>
          ))}
        </div>

        <p style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 18 }}>YOUR INNER CIRCLE BENEFITS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 52 }}>
          {PERKS.map(perk => (
            <div key={perk.title} style={{
              background: "#0d0d0d", border: "1px solid #1a1a1a",
              borderRadius: 14, padding: "22px 22px 20px",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{perk.icon}</div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 7 }}>{perk.title}</div>
              <div style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>{perk.desc}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: "#0d0d0d", border: "1px solid #1a1a1a",
          borderRadius: 14, padding: "24px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 80, flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {user?.displayName ?? "Inner Circle Member"}
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>
              {user?.email ?? ""} · {user?.subscriptionTier === "founding" ? "Founding Member" : "Den Inner Circle"}
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: "none", border: "1px solid #333",
              borderRadius: 8, padding: "10px 18px",
              color: "#555", fontSize: 13, cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InnerCirclePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#444", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (!user || !IC_TIERS.has(user.subscriptionTier)) {
    return <UpgradeGate />;
  }

  return <InnerCircleHub />;
}
