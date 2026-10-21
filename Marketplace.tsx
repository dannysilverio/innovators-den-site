import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

const BRAND = {
  yellow: "#FFE600",
  green: "#10B981",
  purple: "#818CF8",
  pink: "#FF4D7E",
  orange: "#F97316",
  bg: "#000",
  card: "#111",
  border: "#1e1e1e",
  text: "#f0f0f0",
  muted: "#666",
};

const CATEGORIES = ["All","Design","Development","Marketing","Finance","Legal","Consulting","Coaching","Writing","Other"];

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/marketplace`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setListings(d.listings ?? d ?? []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = listings.filter(l => {
    const matchCat = category === "All" || l.category === category;
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.owner_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && l.status === "active";
  });

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>
      <Helmet>
        <title>Marketplace — The Innovators Den</title>
        <meta name="description" content="Discover services and expertise from Black, Brown, Latino, and underrepresented innovators." />
      </Helmet>

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${BRAND.border}`, padding: "48px 32px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: BRAND.yellow, fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>INNOVATORS DEN</p>
        <h1 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
          The Marketplace
        </h1>
        <p style={{ color: BRAND.muted, fontSize: 16, margin: "0 0 28px", maxWidth: 560, lineHeight: 1.6 }}>
          Connect with talented professionals from our community. Services, consulting, and expertise — all vetted by The Den.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services or providers…"
            style={{ flex: 1, minWidth: 220, padding: "10px 14px", background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 10, color: BRAND.text, fontSize: 14, outline: "none" }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 80px" }}>
        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: category === c ? 700 : 400,
              background: category === c ? `${BRAND.yellow}18` : "transparent",
              color: category === c ? BRAND.yellow : BRAND.muted,
              border: `1px solid ${category === c ? BRAND.yellow + "40" : BRAND.border}`,
              cursor: "pointer", transition: "all 0.15s",
            }}>{c}</button>
          ))}
        </div>

        {loading && <div style={{ textAlign: "center", padding: 80, color: BRAND.muted }}>Loading marketplace…</div>}
        {error && <div style={{ textAlign: "center", padding: 40, color: BRAND.pink }}>Error: {error}</div>}

        {!loading && !error && (
          filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <p style={{ color: BRAND.muted, fontSize: 16 }}>No listings found yet. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map(l => (
                <div key={l.id} onClick={() => setSelected(l)}
                  style={{
                    background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 24,
                    cursor: "pointer", transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = BRAND.yellow + "50")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = BRAND.border)}
                >
                  {l.is_featured && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: BRAND.yellow, background: `${BRAND.yellow}15`, padding: "3px 8px", borderRadius: 10, marginBottom: 12, display: "inline-block" }}>
                      ★ FEATURED
                    </span>
                  )}
                  <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{l.title}</h3>
                  <p style={{ color: BRAND.muted, fontSize: 13, margin: "0 0 16px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {l.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{l.owner_name ?? "Anonymous"}</p>
                      <p style={{ margin: 0, fontSize: 11, color: BRAND.muted }}>{l.category}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {l.rate ? (
                        <p style={{ margin: 0, color: BRAND.yellow, fontWeight: 700, fontSize: 14 }}>
                          ${l.rate}<span style={{ color: BRAND.muted, fontWeight: 400, fontSize: 11 }}>/{l.rate_unit?.replace("per_", "") ?? "hr"}</span>
                        </p>
                      ) : (
                        <p style={{ margin: 0, color: BRAND.muted, fontSize: 12 }}>Custom pricing</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Listing detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111", border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: 36, maxWidth: 560, width: "100%", position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: BRAND.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
            {selected.is_featured && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: BRAND.yellow, background: `${BRAND.yellow}15`, padding: "3px 8px", borderRadius: 10, marginBottom: 16, display: "inline-block" }}>★ FEATURED</span>
            )}
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>{selected.title}</h2>
            <p style={{ color: BRAND.muted, fontSize: 12, margin: "0 0 20px" }}>{selected.category} · {selected.owner_name}</p>
            <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>{selected.description}</p>
            {selected.tags?.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {selected.tags.map((t: string) => (
                  <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#1a1a1a", color: BRAND.muted, border: `1px solid ${BRAND.border}` }}>{t}</span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: `1px solid ${BRAND.border}` }}>
              <div>
                {selected.rate ? (
                  <p style={{ margin: 0, color: BRAND.yellow, fontWeight: 700, fontSize: 18 }}>
                    ${selected.rate}<span style={{ color: BRAND.muted, fontWeight: 400, fontSize: 13 }}>/{selected.rate_unit?.replace("per_", "") ?? "hr"}</span>
                  </p>
                ) : <p style={{ margin: 0, color: BRAND.muted, fontSize: 14 }}>Custom pricing — contact to discuss</p>}
              </div>
              {selected.contact_info && (
                <a href={`mailto:${selected.contact_info}`} style={{ padding: "10px 20px", background: BRAND.yellow, color: "#000", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  Contact →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
