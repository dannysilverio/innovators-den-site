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

const STATUS_COLOR: Record<string, string> = {
  open: BRAND.green, passed: BRAND.yellow, declined: BRAND.pink,
  implemented: BRAND.purple, archived: BRAND.muted,
};

export default function Governance() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("open");
  const [selected, setSelected] = useState<any | null>(null);
  const [voteMsg, setVoteMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/governance/proposals`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setProposals(d.proposals ?? d ?? []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const vote = async (proposalId: string, vote: "yes" | "no") => {
    try {
      const r = await fetch(`${API_BASE}/governance/proposals/${proposalId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? `HTTP ${r.status}`); }
      setVoteMsg("Vote recorded!");
      setTimeout(() => setVoteMsg(null), 3000);
      load();
    } catch (e: any) {
      setVoteMsg(`Error: ${e.message}`);
      setTimeout(() => setVoteMsg(null), 3000);
    }
  };

  const filtered = proposals.filter(p => filter === "all" ? true : p.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>
      <Helmet>
        <title>Community Governance — The Innovators Den</title>
        <meta name="description" content="Shape the future of The Innovators Den community through proposals and voting." />
      </Helmet>

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${BRAND.border}`, padding: "48px 32px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <p style={{ color: BRAND.purple, fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>COMMUNITY</p>
        <h1 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>Governance</h1>
        <p style={{ color: BRAND.muted, fontSize: 16, margin: 0, maxWidth: 560, lineHeight: 1.6 }}>
          Community members propose and vote on decisions that shape The Den. Your voice matters — every vote counts.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 32px 80px" }}>
        {voteMsg && (
          <div style={{ marginBottom: 20, padding: "12px 18px", borderRadius: 10, background: voteMsg.startsWith("Error") ? `${BRAND.pink}20` : `${BRAND.green}20`, color: voteMsg.startsWith("Error") ? BRAND.pink : BRAND.green, fontSize: 14, fontWeight: 600 }}>
            {voteMsg}
          </div>
        )}

        {/* Status filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {["open","passed","declined","implemented","all"].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: filter === s ? 700 : 400, cursor: "pointer",
              background: filter === s ? `${STATUS_COLOR[s] ?? BRAND.yellow}18` : "transparent",
              color: filter === s ? (STATUS_COLOR[s] ?? BRAND.yellow) : BRAND.muted,
              border: `1px solid ${filter === s ? (STATUS_COLOR[s] ?? BRAND.yellow) + "40" : BRAND.border}`,
              textTransform: "capitalize",
            }}>{s}</button>
          ))}
        </div>

        {loading && <div style={{ textAlign: "center", padding: 80, color: BRAND.muted }}>Loading proposals…</div>}
        {error && <div style={{ textAlign: "center", padding: 40, color: BRAND.pink }}>Error: {error}</div>}

        {!loading && !error && (
          filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <p style={{ color: BRAND.muted, fontSize: 16 }}>No {filter === "all" ? "" : filter} proposals yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map(p => (
                <div key={p.id} style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: STATUS_COLOR[p.status] ?? BRAND.muted, background: `${STATUS_COLOR[p.status] ?? BRAND.muted}18`, padding: "3px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                          {p.status}
                        </span>
                        {p.category && <span style={{ fontSize: 11, color: BRAND.muted }}>{p.category}</span>}
                      </div>
                      <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>{p.title}</h3>
                      <p style={{ color: BRAND.muted, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
                        {p.summary ?? p.description?.slice(0, 180) + (p.description?.length > 180 ? "…" : "")}
                      </p>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ color: BRAND.muted, fontSize: 12 }}>by {p.author_name ?? "Community Member"}</span>
                        {p.voting_ends_at && <span style={{ color: BRAND.muted, fontSize: 12 }}>Ends {new Date(p.voting_ends_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 80 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, color: BRAND.green, fontWeight: 700, fontSize: 18 }}>{p.yes_count ?? 0}</p>
                          <p style={{ margin: 0, color: BRAND.muted, fontSize: 10 }}>YES</p>
                        </div>
                        <div style={{ width: 1, height: 28, background: BRAND.border }} />
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, color: BRAND.pink, fontWeight: 700, fontSize: 18 }}>{p.no_count ?? 0}</p>
                          <p style={{ margin: 0, color: BRAND.muted, fontSize: 10 }}>NO</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {p.status === "open" && (
                      <>
                        <button onClick={() => vote(p.id, "yes")} style={{ padding: "8px 18px", background: `${BRAND.green}20`, color: BRAND.green, border: `1px solid ${BRAND.green}40`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          ✓ Vote Yes
                        </button>
                        <button onClick={() => vote(p.id, "no")} style={{ padding: "8px 18px", background: `${BRAND.pink}20`, color: BRAND.pink, border: `1px solid ${BRAND.pink}40`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          ✗ Vote No
                        </button>
                      </>
                    )}
                    <button onClick={() => setSelected(selected?.id === p.id ? null : p)} style={{ padding: "8px 18px", background: "transparent", color: BRAND.muted, border: `1px solid ${BRAND.border}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                      {selected?.id === p.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                  {selected?.id === p.id && (
                    <div style={{ marginTop: 20, padding: 20, background: "#0d0d0d", borderRadius: 12 }}>
                      <p style={{ color: BRAND.text, fontSize: 14, lineHeight: 1.7, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>{p.description}</p>
                      {p.team_response && (
                        <div style={{ borderTop: `1px solid ${BRAND.border}`, paddingTop: 16, marginTop: 4 }}>
                          <p style={{ color: BRAND.purple, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 8px" }}>DEN TEAM RESPONSE</p>
                          <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{p.team_response}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
