import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const B = {
  yellow: "#FFE600",
  green: "#10B981",
  pink: "#FF4D7E",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  orange: "#F97316",
  bg: "#000",
  card: "#0d0d0d",
  border: "#1e1e1e",
  text: "#f0f0f0",
  muted: "#666",
  mutedLight: "#999",
};

const TYPES = [
  { key: "all",          label: "All",          color: "#888",     icon: "◈" },
  { key: "co-founder",   label: "Co-Founder",   color: "#FF4D7E",  icon: "⚡" },
  { key: "advisor",      label: "Advisor",       color: "#8B5CF6",  icon: "◎" },
  { key: "contractor",   label: "Contractor",   color: "#3B82F6",  icon: "⚙" },
  { key: "beta-tester",  label: "Beta Tester",  color: "#10B981",  icon: "◆" },
  { key: "investor",     label: "Investor",     color: "#F97316",  icon: "◉" },
  { key: "mentor",       label: "Mentor",       color: "#FFE600",  icon: "✦" },
];

const COLLAB_SKILLS = ["React", "Node.js", "Python", "iOS", "Android", "Design", "Marketing", "Sales", "Finance", "Legal", "Operations", "AI/ML", "Blockchain", "Healthcare", "EdTech", "FinTech"];

interface CollabPost {
  id: string;
  userId: string;
  displayName: string;
  type: string;
  title: string;
  description: string;
  skills: string[];
  equity: string | null;
  contactMethod: string | null;
  createdAt: string;
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function TypeBadge({ type }: { type: string }) {
  const t = TYPES.find(x => x.key === type) ?? TYPES[0];
  return (
    <span style={{ background: t.color + "18", color: t.color, border: `1px solid ${t.color}30`, fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, letterSpacing: 0.8 }}>
      {t.icon} {t.label.toUpperCase()}
    </span>
  );
}

function CollabCard({ post, onDelete, isMine }: { post: CollabPost; onDelete?: (id: string) => void; isMine: boolean }) {
  const [deleting, setDeleting] = useState(false);
  const { token } = useAuth();

  const handleDelete = async () => {
    if (!confirm("Remove this post?")) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/collaborate/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete?.(post.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ background: B.card, border: `1px solid ${B.border}`, borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
        <TypeBadge type={post.type} />
        {isMine && (
          <span style={{ background: "#FFE60015", color: "#FFE600", border: "1px solid #FFE60030", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
            YOUR POST
          </span>
        )}
      </div>

      <div>
        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: B.text, lineHeight: 1.3 }}>{post.title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: B.mutedLight, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {post.description}
        </p>
      </div>

      {post.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {post.skills.map(s => (
            <span key={s} style={{ background: "#1a1a1a", border: `1px solid ${B.border}`, color: B.mutedLight, fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>{s}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: B.text }}>{post.displayName}</span>
          {post.equity && (
            <span style={{ fontSize: 12, color: B.mutedLight }}>· {post.equity} equity</span>
          )}
          <span style={{ fontSize: 11, color: B.muted }}>{timeAgo(post.createdAt)}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {post.contactMethod && (
            <a
              href={post.contactMethod.startsWith("http") ? post.contactMethod : `mailto:${post.contactMethod}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "7px 14px", background: B.yellow, color: "#000", borderRadius: 8, fontWeight: 700, fontSize: 12, textDecoration: "none" }}
            >
              Connect →
            </a>
          )}
          {isMine && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: "7px 12px", background: "transparent", border: `1px solid ${B.border}`, color: B.muted, borderRadius: 8, fontSize: 12, cursor: "pointer" }}
            >
              {deleting ? "…" : "Remove"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostModal({ onClose, onCreated }: { onClose: () => void; onCreated: (post: CollabPost) => void }) {
  const { token } = useAuth();
  const [type, setType] = useState("co-founder");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [equity, setEquity] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim().length >= 5 && description.trim().length >= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/collaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, title: title.trim(), description: description.trim(), skills, equity: equity.trim() || undefined, contactMethod: contactMethod.trim() || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Could not post. Try again.");
        return;
      }
      const post = await res.json();
      onCreated(post);
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0d0d0d", border: `1px solid ${B.border}`, borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", padding: "28px 28px 32px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: B.text }}>Post an Ask</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: B.muted, cursor: "pointer", fontSize: 20, padding: 4 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Type */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: B.mutedLight, marginBottom: 8 }}>I'M LOOKING FOR *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TYPES.slice(1).map(t => (
                <button key={t.key} type="button" onClick={() => setType(t.key)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", background: type === t.key ? t.color + "18" : "transparent", color: type === t.key ? t.color : B.muted, border: `1px solid ${type === t.key ? t.color + "40" : B.border}`, fontWeight: type === t.key ? 700 : 400 }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: B.mutedLight, marginBottom: 6 }}>HEADLINE *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Looking for a technical co-founder for my FinTech app" maxLength={150} style={{ width: "100%", boxSizing: "border-box", background: "#111", border: `1px solid ${B.border}`, borderRadius: 10, color: B.text, fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "system-ui, sans-serif" }} />
            <div style={{ fontSize: 11, color: B.muted, marginTop: 3, textAlign: "right" }}>{title.length}/150</div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: B.mutedLight, marginBottom: 6 }}>DETAILS *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your project, what you're building, and what you need from this person..." maxLength={2000} rows={5} style={{ width: "100%", boxSizing: "border-box", background: "#111", border: `1px solid ${B.border}`, borderRadius: 10, color: B.text, fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "system-ui, sans-serif", resize: "vertical", lineHeight: 1.6 }} />
            <div style={{ fontSize: 11, color: B.muted, marginTop: 3, textAlign: "right" }}>{description.length}/2000</div>
          </div>

          {/* Skills */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: B.mutedLight, marginBottom: 8 }}>SKILLS NEEDED <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {COLLAB_SKILLS.map(s => (
                <button key={s} type="button" onClick={() => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, cursor: "pointer", background: skills.includes(s) ? B.yellow + "18" : "transparent", color: skills.includes(s) ? B.yellow : B.muted, border: `1px solid ${skills.includes(s) ? B.yellow + "40" : B.border}`, fontWeight: skills.includes(s) ? 700 : 400 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Equity + Contact in a row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: B.mutedLight, marginBottom: 6 }}>EQUITY <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input value={equity} onChange={e => setEquity(e.target.value)} placeholder="e.g. 1-3%, negotiable" style={{ width: "100%", boxSizing: "border-box", background: "#111", border: `1px solid ${B.border}`, borderRadius: 10, color: B.text, fontSize: 13, padding: "11px 13px", outline: "none", fontFamily: "system-ui, sans-serif" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: B.mutedLight, marginBottom: 6 }}>CONTACT <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input value={contactMethod} onChange={e => setContactMethod(e.target.value)} placeholder="email or URL" style={{ width: "100%", boxSizing: "border-box", background: "#111", border: `1px solid ${B.border}`, borderRadius: 10, color: B.text, fontSize: 13, padding: "11px 13px", outline: "none", fontFamily: "system-ui, sans-serif" }} />
            </div>
          </div>

          {error && <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={!canSubmit || submitting} style={{ padding: "13px", background: canSubmit ? B.yellow : "#222", color: canSubmit ? "#000" : B.muted, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: canSubmit ? "pointer" : "default", fontFamily: "system-ui, sans-serif" }}>
            {submitting ? "Posting…" : "Post to Board →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Collaborate() {
  const { user, token } = useAuth();
  const isPro = !!(user?.isPro);
  const [posts, setPosts] = useState<CollabPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? `${API_BASE}/collaborate` : `${API_BASE}/collaborate?type=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleCreated = (post: CollabPost) => {
    setPosts(prev => [post, ...prev]);
  };

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const myId = user?.id;

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>
      <Helmet>
        <title>Collaboration Board — The Innovators Den</title>
        <meta name="description" content="Find co-founders, advisors, contractors, investors, and mentors in The Innovators Den community." />
      </Helmet>

      {showModal && isPro && (
        <PostModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 100px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 36, flexWrap: "wrap" }}>
          <div>
            <p style={{ color: B.yellow, fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 10px" }}>✦ COLLABORATION BOARD</p>
            <h1 style={{ margin: "0 0 10px", fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
              Find Your People.
            </h1>
            <p style={{ color: B.mutedLight, fontSize: 15, margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
              Co-founders, advisors, contractors, investors, and mentors — posted by Den Members building the next wave.
            </p>
          </div>
          {user ? (
            isPro ? (
              <button
                onClick={() => setShowModal(true)}
                style={{ padding: "12px 24px", background: B.yellow, color: "#000", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif", flexShrink: 0 }}
              >
                ✦ Post an Ask
              </button>
            ) : (
              <a href="/membership" style={{ padding: "12px 24px", background: B.card, border: `1px solid ${B.yellow}30`, color: B.yellow, borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                Upgrade to Post →
              </a>
            )
          ) : (
            <a href="/sign-in" style={{ padding: "12px 24px", background: B.card, border: `1px solid ${B.border}`, color: B.text, borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              Sign In to Post
            </a>
          )}
        </div>

        {/* Type filter chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {TYPES.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                background: filter === t.key ? t.color + "18" : "transparent",
                color: filter === t.key ? t.color : B.muted,
                border: `1px solid ${filter === t.key ? t.color + "40" : B.border}`,
                fontWeight: filter === t.key ? 700 : 400,
                fontFamily: "system-ui, sans-serif",
                transition: "all 0.15s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: B.muted }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>◈</div>
            <p style={{ color: B.muted, fontSize: 16, margin: "0 0 20px" }}>
              {filter === "all" ? "No asks posted yet — be the first." : `No ${filter.replace("-", " ")} asks posted yet.`}
            </p>
            {isPro && (
              <button onClick={() => setShowModal(true)} style={{ padding: "11px 24px", background: B.yellow, color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                Post an Ask →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {posts.map(post => (
              <CollabCard
                key={post.id}
                post={post}
                isMine={post.userId === myId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
