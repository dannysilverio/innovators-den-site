import { useState, useCallback } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

const IC_TIERS = new Set(["inner_circle", "founding"]);
const API_BASE = "/api";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  topic: string | null;
  createdAt: string | null;
  status: string;
  reviewNote: string | null;
  isCreatorContent: boolean;
  submittedByName: string | null;
}

function InnerCircleGate() {
  return (
    <div style={{
      minHeight: "100vh", background: "#000", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
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
          Content Moderation
        </h2>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
          This panel is exclusive to Den Inner Circle members.
          Upgrade your membership to access content moderation.
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
          <a style={{
            display: "block", color: "#555", fontSize: 13, textDecoration: "none",
            marginTop: 8,
          }}>
            Already a member? Sign in
          </a>
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending:     { bg: "#FFE60020", text: "#FFE600" },
    approved:    { bg: "#10B98120", text: "#10B981" },
    rejected:    { bg: "#FF4D7E20", text: "#FF4D7E" },
    needs_edits: { bg: "#F9731620", text: "#F97316" },
    scheduled:   { bg: "#818CF820", text: "#818CF8" },
  };
  const c = colors[status] ?? { bg: "#33333320", text: "#888" };
  const label = status === "needs_edits" ? "NEEDS EDITS" : status.toUpperCase();
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 10, fontWeight: 700, letterSpacing: 1,
      padding: "3px 8px", borderRadius: 4,
    }}>
      {label}
    </span>
  );
}

type FilterTab = "pending" | "approved" | "rejected" | "needs_edits" | "all";

function ModerationPanel() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [acting, setActing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = filter === "all" ? "" : filter;
      const res = await fetch(`${API_BASE}/articles?status=${statusParam}&limit=50`);
      const data = await res.json();
      setArticles(data.articles ?? data ?? []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id: string, action: "approved" | "rejected" | "needs_edits", note?: string) => {
    setActing(id);
    try {
      const res = await fetch(`${API_BASE}/articles/${id}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, reviewNote: note ?? null }),
      });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.id !== id));
        setExpandedNote(null);
        const labels: Record<string, string> = {
          approved: "approved ✓",
          rejected: "rejected ✗",
          needs_edits: "sent back for edits ✏",
        };
        showToast(`Article ${labels[action] ?? action}`);
      }
    } catch {
      showToast("Action failed — try again");
    } finally {
      setActing(null);
    }
  };

  const pending     = articles.filter(a => a.status === "pending");
  const approved    = articles.filter(a => a.status === "approved");
  const rejected    = articles.filter(a => a.status === "rejected");
  const needsEdits  = articles.filter(a => a.status === "needs_edits");

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "pending",     label: "Pending",     count: pending.length },
    { key: "needs_edits", label: "Needs Edits", count: needsEdits.length },
    { key: "approved",    label: "Approved" },
    { key: "rejected",    label: "Rejected" },
    { key: "all",         label: "All" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: "#1a1a1a", border: "1px solid #333", borderRadius: 10,
          padding: "12px 20px", color: "#fff", fontSize: 14, fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "#FF4D7E", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>
            DEN INNER CIRCLE
          </p>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Content Moderation</h1>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {[
            { label: "PENDING",      count: pending.length,    color: "#FFE600" },
            { label: "NEEDS EDITS",  count: needsEdits.length, color: "#F97316" },
            { label: "APPROVED",     count: approved.length,   color: "#10B981" },
            { label: "REJECTED",     count: rejected.length,   color: "#FF4D7E" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.count}</div>
              <div style={{ color: "#888", fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "0 32px", display: "flex", gap: 4 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              background: "none", border: "none", padding: "14px 18px",
              color: filter === t.key ? "#fff" : "#666",
              fontWeight: filter === t.key ? 700 : 400,
              fontSize: 14, cursor: "pointer",
              borderBottom: filter === t.key ? "2px solid #FFE600" : "2px solid transparent",
              transition: "color 0.15s",
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{
                marginLeft: 6,
                background: t.key === "needs_edits" ? "#F97316" : "#FFE600",
                color: "#000",
                borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800,
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={load}
          style={{
            marginLeft: "auto", background: "#1a1a1a", border: "1px solid #333",
            color: "#888", borderRadius: 8, padding: "8px 14px",
            fontSize: 12, cursor: "pointer", alignSelf: "center",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Article list */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 32px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#888" }}>Loading articles…</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>✓</p>
            <p style={{ color: "#888", fontSize: 16 }}>
              {filter === "pending" ? "No pending articles — you're all caught up." : `No ${filter.replace("_", " ")} articles.`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {articles.map(article => {
              const isActing = acting === article.id;
              const noteOpen = expandedNote === article.id;
              const currentNote = noteMap[article.id] ?? article.reviewNote ?? "";
              const canAct = article.status === "pending" || article.status === "needs_edits";

              return (
                <div
                  key={article.id}
                  style={{
                    background: "#111", border: `1px solid ${article.status === "needs_edits" ? "#F9731640" : "#222"}`,
                    borderRadius: 14, padding: "20px 22px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = article.status === "needs_edits" ? "#F97316" : "#333")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = article.status === "needs_edits" ? "#F9731640" : "#222")}
                >
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <StatusBadge status={article.status} />
                        {article.isCreatorContent && (
                          <span style={{
                            background: "#FFE60015", color: "#FFE600", border: "1px solid #FFE60030",
                            fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, letterSpacing: 0.8,
                          }}>
                            ✦ CREATOR
                          </span>
                        )}
                        {article.topic && (
                          <span style={{
                            background: "#1a1a1a", color: "#888",
                            fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                          }}>
                            {article.topic.toUpperCase()}
                          </span>
                        )}
                        {article.sourceName && !article.isCreatorContent && (
                          <span style={{ color: "#555", fontSize: 12 }}>{article.sourceName}</span>
                        )}
                        {article.isCreatorContent && article.submittedByName && (
                          <span style={{ color: "#888", fontSize: 12 }}>by {article.submittedByName}</span>
                        )}
                        {article.createdAt && (
                          <span style={{ color: "#444", fontSize: 11, marginLeft: "auto" }}>
                            {new Date(article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>

                      <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, lineHeight: 1.4, color: "#fff" }}>
                        {article.title}
                      </h3>

                      {article.summary && (
                        <p style={{ margin: "0 0 12px", color: "#888", fontSize: 13, lineHeight: 1.6 }}>
                          {article.summary.slice(0, 200)}{article.summary.length > 200 ? "…" : ""}
                        </p>
                      )}

                      {/* Show existing review note if present */}
                      {article.reviewNote && (
                        <div style={{
                          background: "#F9731610", border: "1px solid #F9731630",
                          borderRadius: 8, padding: "10px 14px", marginBottom: 10,
                        }}>
                          <p style={{ color: "#F97316", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>REVIEW NOTE</p>
                          <p style={{ color: "#ccc", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{article.reviewNote}</p>
                        </div>
                      )}

                      {article.sourceUrl && !article.isCreatorContent && (
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#FFE600", fontSize: 12, textDecoration: "none" }}
                        >
                          View original →
                        </a>
                      )}
                    </div>

                    {canAct && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={() => moderate(article.id, "approved")}
                          disabled={isActing}
                          style={{
                            background: "#10B98120", border: "1px solid #10B981",
                            color: "#10B981", borderRadius: 8,
                            padding: "9px 18px", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", minWidth: 120,
                            opacity: isActing ? 0.5 : 1,
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => setExpandedNote(noteOpen ? null : article.id)}
                          disabled={isActing}
                          style={{
                            background: "#F9731620", border: "1px solid #F97316",
                            color: "#F97316", borderRadius: 8,
                            padding: "9px 18px", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", minWidth: 120,
                            opacity: isActing ? 0.5 : 1,
                          }}
                        >
                          ✏ Needs Edits
                        </button>
                        <button
                          onClick={() => moderate(article.id, "rejected")}
                          disabled={isActing}
                          style={{
                            background: "#FF4D7E20", border: "1px solid #FF4D7E",
                            color: "#FF4D7E", borderRadius: 8,
                            padding: "9px 18px", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", minWidth: 120,
                            opacity: isActing ? 0.5 : 1,
                          }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expandable review note panel for "Needs Edits" action */}
                  {noteOpen && (
                    <div style={{
                      marginTop: 16, borderTop: "1px solid #222", paddingTop: 16,
                      display: "flex", flexDirection: "column", gap: 10,
                    }}>
                      <p style={{ color: "#F97316", fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>
                        Add a review note for the author (optional)
                      </p>
                      <textarea
                        placeholder="Explain what needs to be changed…"
                        value={currentNote}
                        onChange={e => setNoteMap(prev => ({ ...prev, [article.id]: e.target.value }))}
                        rows={3}
                        style={{
                          width: "100%", background: "#1a1a1a", border: "1px solid #F9731640",
                          borderRadius: 8, color: "#fff", fontSize: 13, padding: "10px 12px",
                          outline: "none", resize: "vertical", fontFamily: "system-ui, sans-serif",
                          lineHeight: 1.5, boxSizing: "border-box",
                        }}
                      />
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => moderate(article.id, "needs_edits", currentNote)}
                          disabled={isActing}
                          style={{
                            background: "#F97316", color: "#fff", border: "none",
                            borderRadius: 8, padding: "9px 20px", fontSize: 13,
                            fontWeight: 700, cursor: "pointer",
                            opacity: isActing ? 0.5 : 1,
                          }}
                        >
                          Send Back for Edits
                        </button>
                        <button
                          onClick={() => { setExpandedNote(null); setNoteMap(prev => { const n = { ...prev }; delete n[article.id]; return n; }); }}
                          style={{
                            background: "none", color: "#666", border: "1px solid #333",
                            borderRadius: 8, padding: "9px 20px", fontSize: 13,
                            fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModerationPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#444", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (!user || !IC_TIERS.has(user.subscriptionTier)) return <InnerCircleGate />;
  return <ModerationPanel />;
}
