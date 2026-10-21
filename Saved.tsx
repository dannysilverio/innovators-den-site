import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { timeAgo } from "@/lib/api";

const API_BASE = "/api";

function SavedContent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    try {
      const r = await fetch(`${API_BASE}/bookmarks/${user.id}`);
      const d = await r.json();
      setArticles(Array.isArray(d) ? d : []);
    } catch { setArticles([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user?.id]);

  const remove = async (articleId: string) => {
    if (!user) return;
    setRemoving(articleId);
    try {
      await fetch(`${API_BASE}/bookmarks/${articleId}?deviceId=${user.id}`, { method: "DELETE" });
      setArticles(prev => prev.filter(a => a.id !== articleId));
    } catch { }
    finally { setRemoving(null); }
  };

  const topicColors: Record<string, string> = {
    Business: "#10B981", Tech: "#6366F1", Music: "#8B5CF6", Health: "#F97316",
    Sports: "#3B82F6", Politics: "#EF4444", Finance: "#84CC16",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <Seo title="Saved Articles | The Innovators Den" description="Your saved articles and bookmarks on The Innovators Den." type="website" />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div>
            <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>MY LIBRARY</p>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Saved Articles</h1>
          </div>
          <span style={{ marginLeft: "auto", background: "#1a1a1a", color: "#888", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 12 }}>
            {articles.length}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#444" }}>
            <div style={{ width: 32, height: 32, border: "2px solid #FFE600", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
            <p style={{ color: "#666", fontSize: 16, margin: "0 0 8px" }}>Nothing saved yet</p>
            <p style={{ color: "#444", fontSize: 13, margin: "0 0 24px" }}>Bookmark articles from the feed to read them later</p>
            <button onClick={() => setLocation("/")} style={{ padding: "10px 24px", background: "#FFE600", color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Browse the Feed
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {articles.map(a => {
              const topicColor = topicColors[a.topic] ?? "#FFE600";
              return (
                <article key={a.id} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {a.imageUrl && (
                    <div style={{ height: 160, overflow: "hidden" }}>
                      <img src={a.imageUrl} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "16px 16px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {a.topic && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: topicColor, textTransform: "uppercase", marginBottom: 8, display: "block" }}>{a.topic}</span>
                    )}
                    <h3
                      onClick={() => setLocation(`/articles/${a.id}`)}
                      style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: "#f0f0f0", cursor: "pointer", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
                    >
                      {a.title}
                    </h3>
                    {a.summary && <p style={{ color: "#888", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{a.summary}</p>}
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#555", fontSize: 12 }}>{a.sourceName} · {a.createdAt ? timeAgo(a.createdAt) : ""}</span>
                      <button
                        onClick={() => remove(a.id)}
                        disabled={removing === a.id}
                        style={{ background: "none", border: "none", color: "#FF4D7E", fontSize: 12, cursor: "pointer", padding: "4px 8px", opacity: removing === a.id ? 0.5 : 1 }}
                      >
                        {removing === a.id ? "…" : "Remove"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SavedPage() {
  return <ProtectedRoute><SavedContent /></ProtectedRoute>;
}
