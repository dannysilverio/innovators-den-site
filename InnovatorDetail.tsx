import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";

const INDUSTRY_COLORS: Record<string, string> = {
  Innovation: "#FFE600", Creative: "#FF4D7E", Music: "#8B5CF6", Business: "#10B981",
  Sports: "#3B82F6", Health: "#F97316", Law: "#06B6D4", Media: "#EC4899",
  Finance: "#84CC16", Technology: "#6366F1",
};

export default function InnovatorDetail() {
  const [, params] = useRoute("/innovators/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [innovator, setInnovator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`${API_BASE}/innovators/${params.id}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setInnovator(d.innovator ?? d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [params?.id]);

  useEffect(() => {
    if (!user || !params?.id) return;
    fetch(`${API_BASE}/follows?deviceId=${user.id}`)
      .then(r => r.json())
      .then(d => {
        const follows: any[] = d.follows ?? [];
        const isFollowing = follows.some(f => f.targetType === "innovator" && f.targetId === params.id);
        setFollowing(isFollowing);
      })
      .catch(() => {});
  }, [user, params?.id]);

  const handleFollow = async () => {
    if (!user) { setLocation(`/sign-in?next=/innovators/${params?.id}`); return; }
    setFollowLoading(true);
    setFollowing(f => !f);
    try {
      if (!following) {
        await fetch(`${API_BASE}/follows`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId: user.id, targetType: "innovator", targetId: params?.id }),
        });
      } else {
        await fetch(`${API_BASE}/follows/${params?.id}?deviceId=${user.id}&targetType=innovator`, { method: "DELETE" });
      }
    } catch { setFollowing(f => !f); }
    finally { setFollowLoading(false); }
  };

  const industryColor = INDUSTRY_COLORS[innovator?.industry] ?? "#888";
  const initials = innovator?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";
  const bgColors = ["#FFE600", "#FF4D7E", "#3B82F6", "#10B981", "#8B5CF6", "#F97316"];
  const colorIdx = innovator?.name?.charCodeAt(0) % bgColors.length ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {innovator && (
        <Seo
          title={`${innovator.name} — ${innovator.title} | The Innovators Den`}
          description={innovator.bio?.slice(0, 155)}
          type="profile"
        />
      )}

      <div style={{ borderBottom: "1px solid #111", padding: "16px 24px" }}>
        <button onClick={() => setLocation("/innovators")} style={{ background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}>
          ← Back to Directory
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "#888" }}>Loading profile…</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <p style={{ color: "#FF6B6B" }}>Profile not found.</p>
          <button onClick={() => setLocation("/innovators")} style={{ padding: "10px 20px", background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff", cursor: "pointer" }}>Go back</button>
        </div>
      ) : innovator ? (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* Profile header */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap" }}>
            {innovator.profileImageUrl ? (
              <img src={innovator.profileImageUrl} alt={innovator.name} style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid #222" }} />
            ) : (
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: bgColors[colorIdx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#000", flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{innovator.name}</h1>
                {innovator.isFeatured && (
                  <span style={{ background: "#FFE60020", color: "#FFE600", border: "1px solid #FFE60040", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>★ FEATURED</span>
                )}
              </div>
              {innovator.title && <p style={{ margin: "0 0 4px", color: "#ddd", fontSize: 15, fontWeight: 600 }}>{innovator.title}</p>}
              {innovator.company && <p style={{ margin: "0 0 8px", color: "#888", fontSize: 13 }}>{innovator.company}</p>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ background: industryColor + "20", color: industryColor, border: `1px solid ${industryColor}40`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                  {innovator.industry}
                </span>
                {innovator.city && <span style={{ color: "#666", fontSize: 12 }}>📍 {innovator.city}</span>}
              </div>
            </div>
            <button onClick={handleFollow} disabled={followLoading}
              style={{ padding: "10px 20px", background: following ? "#111" : "#FFE600", color: following ? "#fff" : "#000", border: following ? "1px solid #333" : "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {followLoading ? "…" : following ? "Following ✓" : "Follow"}
            </button>
          </div>

          {/* Bio */}
          {innovator.bio && (
            <div style={{ margin: "0 0 32px", padding: 24, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 16 }}>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 10px" }}>ABOUT</p>
              <p style={{ margin: 0, lineHeight: 1.8, color: "#ccc", fontSize: 15 }}>{innovator.bio}</p>
            </div>
          )}

          {/* Tags */}
          {innovator.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
              {innovator.tags.map((t: string) => (
                <span key={t} style={{ background: "#111", border: "1px solid #222", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#888" }}>#{t}</span>
              ))}
            </div>
          )}

          {/* Social links */}
          {(innovator.instagramHandle || innovator.twitterHandle || innovator.linkedinUrl || innovator.websiteUrl) && (
            <div style={{ padding: 24, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 16 }}>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 16px" }}>CONNECT</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {innovator.websiteUrl && (
                  <a href={innovator.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                    🌐 Website
                  </a>
                )}
                {innovator.linkedinUrl && (
                  <a href={innovator.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, color: "#0A66C2", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                    in LinkedIn
                  </a>
                )}
                {innovator.instagramHandle && (
                  <a href={`https://instagram.com/${innovator.instagramHandle}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, color: "#E1306C", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                    📸 @{innovator.instagramHandle}
                  </a>
                )}
                {innovator.twitterHandle && (
                  <a href={`https://twitter.com/${innovator.twitterHandle}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, color: "#1DA1F2", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                    𝕏 @{innovator.twitterHandle}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
