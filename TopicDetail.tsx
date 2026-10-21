import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { isRetiredTopic, normalizeTopic } from "@workspace/api-zod/category-aliases";
import Seo from "@/components/Seo";
import CategorySubBrand from "@/components/CategorySubBrand";
import { fetchArticles, getTopicColor, getTopicEmoji, timeAgo, TOPICS, type Article } from "@/lib/api";

const TOPIC_DESCRIPTIONS: Record<string, string> = {
  "Innovation": "Black tech founders, STEM trailblazers, emerging technology, startups, and the people pushing the boundaries of what's possible.",
  "Art": "Black visual artists, exhibitions, galleries, and the culture-defining creatives shaping the art world.",
  "Culture": "NYC, ATL, MIA, LA scenes — Black lifestyle, style, community, and the culture that moves the world.",
  "Music": "Hip-hop, R&B, Afrobeats, gospel — the artists, tours, albums, and new releases defining the soundtrack of our generation.",
  "Business Growth": "Black entrepreneurship, finance, wealth building, real estate investing, and building generational wealth.",
  "Sports": "NBA, NFL, track and field, tennis — Black athletes winning on and off the field, in business and in life.",
  "Food & Wine": "Food, wine, spirits, tastings, and the people and places behind them.",
  "Health": "Wellness, mental health, fitness, nutrition — building a healthy lifestyle rooted in Black community wisdom.",
  "Travel": "Destination guides, travel culture, diaspora experiences, and the best places to explore around the world.",
  "Astrology": "Horoscopes, astrology culture, birth chart insights, and spiritual wellness for the modern era.",
  "Law": "Legal rights, business law, tax advice, justice news — know your rights, protect your business, stay informed.",
};

export default function TopicDetail() {
  const params = useParams<{ topic: string }>();
  const rawTopic = decodeURIComponent(params.topic ?? "");
  const requestedTopic = normalizeTopic(rawTopic);
  const [, navigate] = useLocation();
  useEffect(() => {
    if (isRetiredTopic(rawTopic)) navigate(`/topics/food-and-wine${window.location.search}`, { replace: true });
  }, [rawTopic, navigate]);
  const topicInfo = TOPICS.find(t => t.slug === requestedTopic || t.label === requestedTopic);
  const topic = topicInfo?.label ?? requestedTopic;
  const color = getTopicColor(topic);
  const emoji = getTopicEmoji(topic);
  const description = TOPIC_DESCRIPTIONS[topic] ?? `Latest ${topic} news from The Innovators Den.`;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    fetchArticles(topic, 30).then(data => {
      setArticles(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [topic]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${topic} News — The Innovators Den`,
    description,
    url: `https://theinnovatorsden.net/topics/${encodeURIComponent(topicInfo?.slug ?? topic)}`,
    isPartOf: { "@id": "https://theinnovatorsden.net/#website" },
    about: { "@type": "Thing", name: topic },
  };

  return (
    <>
      <Seo
        title={`${topic} News`}
        description={`${topic} news for Black innovators and culture leaders. ${description}`}
        canonical={`/topics/${encodeURIComponent(topicInfo?.slug ?? topic)}`}
        jsonLd={jsonLd}
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

        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Link href={base} className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href={`${base}topics`} className="hover:text-white transition-colors">Topics</Link>
            <span>/</span>
            <span style={{ color }}>{topic}</span>
          </div>
        </div>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{emoji}</div>
            <div>
              <h1 className="text-4xl font-black tracking-tight" style={{ color }}>{topic}</h1>
              <CategorySubBrand topic={topic} />
              <p className="text-white/50 text-base mt-1">{description}</p>
            </div>
          </div>
        </section>

        <main className="max-w-6xl mx-auto px-4 pb-20">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <p className="text-lg">No articles yet in this topic.</p>
              <p className="text-sm mt-2">Check back soon — we update daily.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map(article => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <article className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 cursor-pointer group">
                    {article.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="text-xs font-bold" style={{ color }}>{article.topic}</span>
                      <CategorySubBrand topic={article.topic} />
                      <h2 className="font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#FFE600] transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-white/50 text-xs line-clamp-2 mb-3">{article.summary}</p>
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>{article.sourceName}</span>
                        <span>{timeAgo(article.createdAt)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </main>

        <footer className="border-t border-white/10 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-white/40">
            <Link href={base} className="font-black text-white hover:text-[#FFE600] transition-colors">THE INNOVATORS DEN</Link>
            <div>© {new Date().getFullYear()} The Innovators Den. For Us, By Us.</div>
          </div>
        </footer>
      </div>
    </>
  );
}
