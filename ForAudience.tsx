import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import Seo from "@/components/Seo";

const API_BASE = "/api";

const AUDIENCE_META: Record<string, {
  hero: string; sub: string; description: string;
  emoji: string; keywords: string[];
}> = {
  "black-entrepreneurs": {
    emoji: "✊🏾", hero: "Built for Black Entrepreneurs",
    sub: "The Innovators Den is your cultural operating system — news, funding, networks, and community all in one place.",
    description: "Discover grants, angel investors, accelerators, and news curated specifically for Black entrepreneurs and business owners. Join a community that gets it.",
    keywords: ["black entrepreneurs", "black business funding", "minority business grants", "black-owned business community"],
  },
  "latina-founders": {
    emoji: "💪🏽", hero: "For Latina Founders & Leaders",
    sub: "Connect with a community that celebrates your vision, amplifies your voice, and opens the right doors.",
    description: "Funding opportunities, mentorship, and breaking news for Latina founders building the next generation of impactful companies.",
    keywords: ["latina founders", "hispanic entrepreneurs", "latina business community", "latina startup funding"],
  },
  "black-creatives": {
    emoji: "🎨", hero: "The Den for Black Creatives",
    sub: "Where artists, designers, writers, and creators come to stay informed, get discovered, and get paid.",
    description: "Brand deals, creative fellowships, industry news, and a thriving community of Black and Brown creatives.",
    keywords: ["black creatives", "black artists funding", "creative economy", "black content creators"],
  },
  "tech-innovators": {
    emoji: "💡", hero: "For Underrepresented Tech Innovators",
    sub: "Stay ahead with curated tech news, funding alerts, and a network that looks like the future.",
    description: "The Innovators Den keeps underrepresented technologists informed on AI, funding, hiring opportunities, and ecosystem events.",
    keywords: ["black tech professionals", "underrepresented in tech", "diversity in tech", "black engineers funding"],
  },
  "social-entrepreneurs": {
    emoji: "🌍", hero: "For Social Entrepreneurs & Changemakers",
    sub: "Purpose-driven news and opportunities for founders building businesses that create impact.",
    description: "Impact investing opportunities, nonprofit grants, social enterprise news, and a community of mission-driven founders.",
    keywords: ["social entrepreneur", "impact investing", "minority nonprofit grants", "social enterprise community"],
  },
};

const DEFAULT_META = {
  emoji: "✦", hero: "The Innovators Den",
  sub: "The cultural operating system for Black, Brown, Latino, and underrepresented innovators.",
  description: "Stay informed, connected, and funded with curated news, opportunities, and community built specifically for underrepresented founders and creatives.",
  keywords: ["innovators den", "black innovators", "underrepresented founders", "minority entrepreneurs"],
};

export default function ForAudience() {
  const [, params] = useRoute("/for/:topic");
  const [articles, setArticles] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = params?.topic ?? "";
  const meta = AUDIENCE_META[slug] ?? DEFAULT_META;

  useEffect(() => {
    const tag = slug.split("-")[0];
    Promise.all([
      fetch(`${API_BASE}/articles?limit=6&tag=${tag}`).then(r => r.json()).catch(() => ({ articles: [] })),
      fetch(`${API_BASE}/opportunities?limit=4`).then(r => r.json()).catch(() => ({ opportunities: [] })),
    ]).then(([a, o]) => {
      setArticles(a.articles ?? []);
      setOpportunities(o.opportunities ?? []);
      setLoading(false);
    });
  }, [slug]);

  const schemaOrg = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": meta.hero,
    "description": meta.description,
    "publisher": { "@type": "Organization", "name": "The Innovators Den", "url": "https://theinnovatorsden.net" },
    "keywords": meta.keywords.join(", "),
  });

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <Seo
        title={`${meta.hero} | The Innovators Den`}
        description={meta.description}
        type="website"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaOrg }} />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)", borderBottom: "1px solid #1a1a1a", padding: "80px 24px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 48, margin: "0 0 16px" }}>{meta.emoji}</p>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: -1, maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
          {meta.hero}
        </h1>
        <p style={{ color: "#888", fontSize: "clamp(15px, 2vw, 18px)", margin: "0 auto 32px", maxWidth: 600, lineHeight: 1.6 }}>
          {meta.sub}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/membership" style={{ padding: "14px 28px", background: "#FFE600", color: "#000", fontWeight: 800, fontSize: 15, borderRadius: 12, textDecoration: "none", display: "inline-block" }}>
            Join the Den →
          </a>
          <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer"
            style={{ padding: "14px 24px", background: "#111", border: "1px solid #2a2a2a", color: "#fff", fontWeight: 600, fontSize: 14, borderRadius: 12, textDecoration: "none", display: "inline-block" }}>
            Download App
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Latest articles */}
        {!loading && articles.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px" }}>Latest News</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {articles.map((a: any) => (
                <a key={a.id} href={`/articles/${a.id}`}
                  style={{ display: "block", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 14, padding: 20, textDecoration: "none", color: "#fff" }}>
                  <p style={{ color: "#FFE600", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 8px" }}>{a.source ?? "THE DEN"}</p>
                  <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{a.title}</h3>
                  <p style={{ margin: 0, color: "#666", fontSize: 12, lineHeight: 1.5 }}>
                    {a.summary?.slice(0, 100) ?? a.description?.slice(0, 100)}…
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Opportunities */}
        {!loading && opportunities.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px" }}>Open Opportunities</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {opportunities.map((o: any) => (
                <a key={o.id} href={`/opportunities/${o.id}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 14, padding: "16px 20px", textDecoration: "none", color: "#fff", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>{o.title}</p>
                    <p style={{ margin: 0, color: "#666", fontSize: 12 }}>{o.organization}</p>
                  </div>
                  {o.amount && <span style={{ color: "#FFE600", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{o.amount}</span>}
                </a>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <a href="/opportunities" style={{ color: "#FFE600", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                View all opportunities →
              </a>
            </div>
          </section>
        )}

        {/* Why the Den */}
        <section style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800 }}>Why The Innovators Den?</h2>
          <p style={{ color: "#888", fontSize: 14, margin: "0 0 32px", lineHeight: 1.6, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            {meta.description}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, textAlign: "left", marginBottom: 32 }}>
            {[
              { icon: "📰", label: "Curated News", desc: "Only the stories that matter to your community" },
              { icon: "💰", label: "Funding Alerts", desc: "Grants, fellowships, and investment opportunities" },
              { icon: "🤝", label: "Community Circles", desc: "Topic-based rooms for real conversation" },
              { icon: "🗺️", label: "Innovator Directory", desc: "Find and connect with people in your industry" },
            ].map(f => (
              <div key={f.label} style={{ padding: 20, background: "#141414", border: "1px solid #222", borderRadius: 12 }}>
                <p style={{ fontSize: 24, margin: "0 0 8px" }}>{f.icon}</p>
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13 }}>{f.label}</p>
                <p style={{ margin: 0, color: "#666", fontSize: 12, lineHeight: 1.4 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <a href="/membership" style={{ padding: "14px 28px", background: "#FFE600", color: "#000", fontWeight: 800, fontSize: 15, borderRadius: 12, textDecoration: "none", display: "inline-block" }}>
            Join Free Today →
          </a>
        </section>
      </div>
    </div>
  );
}
