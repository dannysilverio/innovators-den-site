import { Link } from "wouter";
import Seo from "@/components/Seo";
import CategorySubBrand from "@/components/CategorySubBrand";
import { TOPICS } from "@/lib/api";

const TOPIC_DESCRIPTIONS: Record<string, string> = {
  "Innovation": "Black tech founders, STEM trailblazers, emerging technology, startups, and the people pushing the boundaries of what's possible.",
  "Art": "Black visual artists, exhibitions, galleries, and the culture-defining creatives shaping the art world.",
  "Culture": "NYC, ATL, MIA, LA scenes — Black lifestyle, style, community, and the culture that moves the world.",
  "Music": "Hip-hop, R&B, Afrobeats, gospel — the artists, tours, albums, and new releases defining the soundtrack of our generation.",
  "Business Growth": "Black entrepreneurship, finance, wealth building, real estate investing, and building generational wealth.",
  "Sports": "NBA, NFL, track and field, tennis — Black athletes winning on and off the field, in business and in life.",
  "food-and-wine": "Food, wine, spirits, tastings, and the people and places behind them.",
  "Health": "Wellness, mental health, fitness, nutrition — building a healthy lifestyle rooted in Black community wisdom.",
  "Travel": "Destination guides, travel culture, diaspora experiences, and the best places to explore around the world.",
  "Astrology": "Horoscopes, astrology culture, birth chart insights, and spiritual wellness for the modern era.",
  "Law": "Legal rights, business law, tax advice, justice news — know your rights, protect your business, stay informed.",
};

const TOPIC_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://theinnovatorsden.net/topics",
  name: "Topics — The Innovators Den",
  description: `Browse all ${TOPICS.length} content categories covered by The Innovators Den: ${TOPICS.map(t => t.label).join(", ")}.`,
  url: "https://theinnovatorsden.net/topics",
  isPartOf: { "@id": "https://theinnovatorsden.net/#website" },
};

export default function Topics() {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <Seo
        title="All Topics"
        description={`Browse all ${TOPICS.length} content categories covered by The Innovators Den: ${TOPICS.map(t => t.label).join(", ")}.`}
        canonical="/topics"
        jsonLd={TOPIC_JSON_LD}
      />
      <div className="min-h-screen bg-black text-white">
        <nav className="border-b border-white/10 px-4 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <Link href={base}>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#FFE600] flex items-center justify-center">
                <span className="text-black font-black text-sm">ID</span>
              </div>
              <span className="font-black text-lg tracking-tight">THE INNOVATORS DEN</span>
            </div>
          </Link>
          <a
            href="https://apps.apple.com/app/the-innovators-den"
            className="bg-[#FFE600] text-black font-bold px-4 py-2 rounded-full text-xs hover:bg-yellow-300 transition-colors"
          >
            Get the App
          </a>
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-black tracking-tight mb-4">Browse Topics</h1>
          <p className="text-white/60 text-lg mb-12 max-w-xl">
            12 categories curated for Black innovators, entrepreneurs, creatives, and culture leaders.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOPICS.map(topic => (
              <Link key={topic.slug} href={`/topics/${encodeURIComponent(topic.slug)}`}>
                <div
                  className="rounded-2xl p-6 cursor-pointer hover:opacity-90 transition-all hover:-translate-y-1 border border-white/5 group"
                  style={{ backgroundColor: topic.color + "15", borderColor: topic.color + "40" }}
                >
                  <div className="text-4xl mb-4">{topic.emoji}</div>
                  <h2 className="text-xl font-black mb-2 group-hover:underline" style={{ color: topic.color }}>
                    {topic.label}
                  </h2>
                  <CategorySubBrand topic={topic.label} />
                  <p className="text-white/50 text-sm leading-relaxed line-clamp-3">
                    {TOPIC_DESCRIPTIONS[topic.slug]}
                  </p>
                  <div className="mt-4 text-xs font-bold" style={{ color: topic.color }}>
                    Read stories →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>

        <footer className="border-t border-white/10 py-8 px-4 mt-8">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-white/40">
            <Link href={base} className="font-black text-white hover:text-[#FFE600] transition-colors">THE INNOVATORS DEN</Link>
            <div>© {new Date().getFullYear()} The Innovators Den. For Us, By Us.</div>
          </div>
        </footer>
      </div>
    </>
  );
}
