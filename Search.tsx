import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";

const API_BASE = "/api";

interface SearchResults {
  stories: any[];
  innovators: any[];
  events: any[];
  opportunities: any[];
  total: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
}

function ResultSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#666", textTransform: "uppercase" }}>{title}</h2>
        <span style={{ background: "#1a1a1a", color: "#888", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>{count}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </section>
  );
}

function ResultCard({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "border-color 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#333")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
    >
      {children}
    </div>
  );
}

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const initialQ = new URLSearchParams(window.location.search).get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q.trim())}&limit=8`);
      const d = await r.json();
      setResults(d);
    } catch { setResults(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const newUrl = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search";
    window.history.replaceState(null, "", (import.meta.env.BASE_URL ?? "/web/").replace(/\/$/, "") + newUrl);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    inputRef.current?.focus();
  }, []);

  const hasResults = results && results.total > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <Seo
        title={query ? `"${query}" — Search | The Innovators Den` : "Search | The Innovators Den"}
        description="Search articles, innovators, events, and opportunities across The Innovators Den."
        type="website"
      />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 20px" }}>SEARCH</p>

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 40 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: 18, pointerEvents: "none" }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stories, people, events, opportunities…"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#0d0d0d", border: "1px solid #222", borderRadius: 14,
              color: "#f0f0f0", fontSize: 17, fontWeight: 500,
              padding: "16px 18px 16px 48px", outline: "none",
              fontFamily: "system-ui, sans-serif",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#FFE600")}
            onBlur={e => (e.currentTarget.style.borderColor = "#222")}
          />
          {loading && (
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, border: "2px solid #FFE600", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
          )}
        </div>
        <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>

        {/* Empty query state */}
        {!query.trim() && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⌕</div>
            <p style={{ fontSize: 15, margin: 0 }}>Search across stories, innovators, events, and opportunities</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
              {["Black entrepreneurs", "Grants", "AI", "Startup", "Music", "Health"].map(s => (
                <button key={s} onClick={() => setQuery(s)} style={{ padding: "6px 14px", background: "#111", border: "1px solid #222", borderRadius: 20, color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query.trim().length >= 2 && !loading && results && results.total === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#666", fontSize: 16 }}>No results for <strong style={{ color: "#fff" }}>"{query}"</strong></p>
            <p style={{ color: "#444", fontSize: 13, marginTop: 8 }}>Try a different search term</p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <>
            <p style={{ color: "#444", fontSize: 12, marginBottom: 28 }}>{results.total} result{results.total !== 1 ? "s" : ""} for <span style={{ color: "#888" }}>"{query}"</span></p>

            <ResultSection title="Stories" count={results.stories.length}>
              {results.stories.map((s: any) => (
                <ResultCard key={s.id} onClick={() => setLocation(`/articles/${s.id}`)}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {s.imageUrl && <img src={s.imageUrl} alt="" style={{ width: 72, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: "#f0f0f0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{s.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{s.sourceName} · {timeAgo(s.createdAt)}</p>
                    </div>
                  </div>
                </ResultCard>
              ))}
            </ResultSection>

            <ResultSection title="Innovators" count={results.innovators.length}>
              {results.innovators.map((inv: any) => (
                <ResultCard key={inv.id} onClick={() => setLocation(`/innovators/${inv.id}`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#000", flexShrink: 0 }}>
                      {inv.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>{inv.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{inv.title}{inv.location ? ` · ${inv.location}` : ""}</p>
                    </div>
                    {inv.isVerified && <span style={{ marginLeft: "auto", color: "#FFE600", fontSize: 14 }}>✓</span>}
                  </div>
                </ResultCard>
              ))}
            </ResultSection>

            <ResultSection title="Events" count={results.events.length}>
              {results.events.map((ev: any) => (
                <ResultCard key={ev.id} onClick={() => setLocation(`/events/${ev.id}`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: "#1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🗓</div>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>{ev.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        {ev.organizer && `${ev.organizer} · `}
                        {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : ""}
                        {ev.location ? ` · ${ev.location}` : ""}
                      </p>
                    </div>
                  </div>
                </ResultCard>
              ))}
            </ResultSection>

            <ResultSection title="Opportunities" count={results.opportunities.length}>
              {results.opportunities.map((op: any) => (
                <ResultCard key={op.id} onClick={() => setLocation(`/opportunities/${op.id}`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: "#1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💡</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>{op.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{op.organization}{op.amount ? ` · ${op.amount}` : ""}</p>
                    </div>
                    {op.deadline && (
                      <span style={{ fontSize: 11, color: "#F97316", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {Math.ceil((new Date(op.deadline).getTime() - Date.now()) / 86400000)}d left
                      </span>
                    )}
                  </div>
                </ResultCard>
              ))}
            </ResultSection>
          </>
        )}
      </div>
    </div>
  );
}
