import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import CategorySubBrand from "@/components/CategorySubBrand";
import { fetchArticles, TOPICS, getTopicColor, getTopicEmoji, timeAgo, deriveWhyShown, type Article } from "@/lib/api";
import { HeroSponsorBanner, WebNativeAdCard, DisplayRectangle, HouseAdCard, type Tier } from "@/components/AdUnit";
import { useAuth } from "@/context/AuthContext";
import swordStoryImage from "@assets/generated_images/michael-storm-prayer-hero.jpg";

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://theinnovatorsden.net/#organization",
      name: "The Innovators Den",
      url: "https://theinnovatorsden.net",
      logo: {
        "@type": "ImageObject",
        url: "https://theinnovatorsden.net/logo.png",
      },
      sameAs: [
        "https://apps.apple.com/app/the-innovators-den",
        "https://play.google.com/store/apps/details?id=com.theinnovatorsden.app",
      ],
      description: "The Innovators Den is a premium Black cultural news app. For Us, By Us.",
    },
    {
      "@type": "WebSite",
      "@id": "https://theinnovatorsden.net/#website",
      url: "https://theinnovatorsden.net",
      name: "The Innovators Den",
      publisher: { "@id": "https://theinnovatorsden.net/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://theinnovatorsden.net/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "MobileApplication",
      name: "The Innovators Den",
      operatingSystem: "iOS, Android",
      applicationCategory: "NewsApplication",
      offers: { "@type": "Offer", price: "0" },
      description: "Premium cultural news for Black innovators, entrepreneurs, creatives, and culture leaders.",
    },
  ],
};

type ArticleSignal = 'saved' | 'hidden' | 'more' | 'less' | null;

function ArticleActions({
  articleId,
  signal,
  onSignal,
}: {
  articleId: string;
  signal: ArticleSignal;
  onSignal: (id: string, s: ArticleSignal) => void;
}) {
  const btn = (label: string, value: ArticleSignal, activeColor: string) => {
    const active = signal === value;
    return (
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onSignal(articleId, active ? null : value); }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all"
        style={{
          color: active ? activeColor : 'rgba(255,255,255,0.35)',
          backgroundColor: active ? activeColor + '18' : 'transparent',
          border: `1px solid ${active ? activeColor + '55' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2 pt-3 mt-2 border-t border-white/[0.06]" onClick={e => e.preventDefault()}>
      {btn('🔖 Save', 'saved', '#FFE600')}
      {btn('👍 More like this', 'more', '#4ADE80')}
      {btn('👎 Less', 'less', '#FB923C')}
      {btn('✕ Hide', 'hidden', '#F87171')}
    </div>
  );
}

type PickArticle = {
  id: string;
  title: string;
  summary: string | null;
  sourceName: string;
  sourceUrl: string;
  imageUrl: string | null;
  topic: string;
  isCreatorContent: boolean;
  submittedByName: string | null;
  createdAt: string;
};

export default function Home() {
  const { user } = useAuth();
  const adTier = (user?.subscriptionTier ?? "free") as Tier;

  const [articles, setArticles] = useState<Article[]>([]);
  const [spotlightArticles, setSpotlightArticles] = useState<Article[]>([]);
  const [ourPicks, setOurPicks] = useState<PickArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState<Record<string, ArticleSignal>>({});
  const base = import.meta.env.BASE_URL;

  type WhatsMovingData = {
    trendingSignals: Array<{ id: string; title: string; topic: string; sourceName: string; imageUrl: string | null; trendScore: number; label: string }>;
    risingInnovators: Array<{ id: string; name: string; title: string; location: string | null; isVerified: boolean; label: string }>;
    hotDoors: Array<{ id: string; title: string; organization: string; type: string; amount: string | null; deadline: string | null; isRemote: boolean; label: string }>;
    cityPulse: { city: string; articles: Array<{ id: string; title: string; sourceName: string; topic: string }> } | null;
  };
  const [whatsMoving, setWhatsMoving] = useState<WhatsMovingData | null>(null);

  useEffect(() => {
    Promise.all([
      fetchArticles(undefined, 9),
      fetchArticles("Spotlight", 5),
      fetch("/api/articles/our-picks").then(r => r.json()).catch(() => ({ articles: [] })),
      fetch("/api/feed/whats-moving").then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([latest, spotlight, picksData, moving]) => {
      setArticles(latest);
      setSpotlightArticles(spotlight);
      if (Array.isArray(picksData.articles)) setOurPicks(picksData.articles);
      if (moving) setWhatsMoving(moving);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSignal = useCallback((articleId: string, signal: ArticleSignal) => {
    setSignals(prev => ({ ...prev, [articleId]: signal }));
  }, []);

  const visibleArticles = articles.filter(a => signals[a.id] !== 'hidden');

  return (
    <>
      <Seo
        title="The Innovators Den"
        description="The cultural operating system for Black, Brown, Latino, and underrepresented innovators. Built to inform, connect, and accelerate your rise. For us. By us."
        canonical="/"
        ogType="website"
        jsonLd={SITE_JSON_LD}
      />

      <div className="min-h-screen bg-black text-white">

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-block bg-[#FF4D7E]/20 border border-[#FF4D7E]/30 rounded-full px-4 py-1 text-[#FF4D7E] text-xs font-bold tracking-widest uppercase mb-6">
            For us. By us. Built for the underestimated.
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            The Cultural OS for{" "}
            <span className="text-[#FFE600]">Black, Brown & Latino Innovators</span>
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The cultural operating system for Black, Brown, Latino, and underrepresented innovators. Built to inform, connect, and accelerate your rise.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://apps.apple.com/app/the-innovators-den"
              className="bg-[#FFE600] text-black font-black px-8 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-all hover:scale-105"
            >
              Download on iOS
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.theinnovatorsden.app"
              className="border border-white/20 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:border-white/40 hover:bg-white/5 transition-all"
            >
              Get on Android
            </a>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-8" aria-label="Featured story">
          <Link href="/stories/the-sword-the-storm-and-the-prayer" className="group block overflow-hidden rounded-2xl border border-[#FFE600]/25 bg-[#101719] md:grid md:grid-cols-2">
            <div className="p-7 md:p-10 flex flex-col justify-center">
              <span className="text-[#FFE600] text-xs font-bold uppercase tracking-[0.2em]">Featured story · Culture</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold leading-tight text-white group-hover:text-[#FFE600] transition-colors">The Sword, the Storm, and the Prayer</h2>
              <p className="mt-3 text-white/70 leading-relaxed">Saint Michael, Belié Belcán, and the ancient question that still fights beside us.</p>
              <span className="mt-5 text-sm text-white/50">By Daneury Miguel Silverio · Read the story →</span>
            </div>
            <img src={swordStoryImage} alt="Illustrated Saint Michael beneath a storm-lit sky" className="w-full h-56 md:h-full object-cover" loading="lazy" />
          </Link>
        </section>

        {/* TOPICS GRID */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight">Browse Topics</h2>
            <Link href={`${base}topics`} className="text-[#FFE600] text-sm font-bold hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {TOPICS.map(topic => (
              <Link key={topic.slug} href={`/topics/${encodeURIComponent(topic.slug)}`}>
                <div
                  className="rounded-2xl p-4 cursor-pointer hover:opacity-90 transition-opacity border border-white/5"
                  style={{ backgroundColor: topic.color + "22", borderColor: topic.color + "44" }}
                >
                  <div className="text-2xl mb-2">{topic.emoji}</div>
                  <div className="font-bold text-sm" style={{ color: topic.color }}>{topic.label}</div>
                  <CategorySubBrand topic={topic.label} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* WHAT'S MOVING — live intelligence strip */}
        {whatsMoving && (whatsMoving.trendingSignals.length > 0 || whatsMoving.hotDoors.length > 0 || whatsMoving.risingInnovators.length > 0) && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 rounded-full bg-[#FFE600]" />
              <h2 className="text-2xl font-black tracking-tight">What's Moving</h2>
              <span className="bg-[#FFE600]/10 border border-[#FFE600]/20 text-[#FFE600] text-[10px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase">Live</span>
            </div>

            {/* Trending Signals */}
            {whatsMoving.trendingSignals.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">⚡ Trending Signals</p>
                <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {whatsMoving.trendingSignals.slice(0, 8).map(sig => (
                    <Link key={sig.id} href={`/articles/${sig.id}`}>
                      <div className="flex-shrink-0 w-56 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 cursor-pointer hover:border-[#FFE600]/30 hover:bg-[#FFE600]/[0.04] transition-all group">
                        {sig.imageUrl && (
                          <div className="w-full h-28 rounded-xl overflow-hidden mb-3">
                            <img src={sig.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={e => { (e.target as HTMLImageElement).closest('div')!.style.display = 'none'; }} />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: getTopicColor(sig.topic) + '22', color: getTopicColor(sig.topic) }}>{sig.topic}</span>
                          <span className="text-[9px] font-black text-[#FFE600]/60 uppercase tracking-widest bg-[#FFE600]/10 px-2 py-0.5 rounded-full">{sig.label}</span>
                        </div>
                        <h3 className="text-sm font-bold leading-snug line-clamp-3 text-white group-hover:text-[#FFE600] transition-colors">{sig.title}</h3>
                        <p className="text-white/35 text-xs mt-2 truncate">{sig.sourceName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Hot Doors */}
              {whatsMoving.hotDoors.length > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">🚪 Hot Doors</p>
                  <div className="flex flex-col gap-3">
                    {whatsMoving.hotDoors.slice(0, 4).map(door => (
                      <Link key={door.id} href={`${base}opportunities/${door.id}`}>
                        <div className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl hover:border-[#FF4D7E]/30 hover:bg-[#FF4D7E]/[0.03] transition-all cursor-pointer group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4D7E] bg-[#FF4D7E]/10 px-2 py-0.5 rounded-full">{door.type}</span>
                              {door.isRemote && <span className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Remote</span>}
                              <span className="text-[9px] font-black text-[#FFE600]/60 uppercase tracking-widest bg-[#FFE600]/10 px-2 py-0.5 rounded-full">{door.label}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-[#FF4D7E] transition-colors line-clamp-2">{door.title}</h4>
                            <p className="text-white/40 text-xs mt-1">{door.organization}{door.amount ? ` · ${door.amount}` : ''}</p>
                          </div>
                          {door.deadline && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] font-black text-[#FFE600]">{Math.max(0, Math.ceil((new Date(door.deadline).getTime() - Date.now()) / 86400000))}d left</p>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Rising Innovators */}
              {whatsMoving.risingInnovators.length > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">🌱 Rising Innovators</p>
                  <div className="flex flex-col gap-3">
                    {whatsMoving.risingInnovators.slice(0, 4).map(inn => {
                      const initials = inn.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                      const colors = ['#FFE600', '#FF4D7E', '#3B82F6', '#10B981', '#8B5CF6'];
                      const color = colors[inn.name.charCodeAt(0) % colors.length];
                      return (
                        <Link key={inn.id} href={`${base}innovators/${inn.id}`}>
                          <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl hover:border-[#10B981]/30 hover:bg-[#10B981]/[0.03] transition-all cursor-pointer group">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: color + '22', color }}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors truncate">{inn.name}</p>
                                {inn.isVerified && <span className="text-[#FFE600] text-xs flex-shrink-0">✓</span>}
                              </div>
                              <p className="text-white/40 text-xs truncate">{inn.title}{inn.location ? ` · ${inn.location}` : ''}</p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/70 bg-[#10B981]/10 px-2 py-0.5 rounded-full flex-shrink-0">{inn.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* City Pulse */}
            {whatsMoving.cityPulse && whatsMoving.cityPulse.articles.length > 0 && (
              <div className="mt-8 p-5 bg-white/[0.03] border border-white/[0.07] rounded-2xl">
                <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">📍 City Pulse — {whatsMoving.cityPulse.city}</p>
                <div className="flex flex-col gap-2">
                  {whatsMoving.cityPulse.articles.slice(0, 3).map(a => (
                    <Link key={a.id} href={`/articles/${a.id}`}>
                      <div className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0 cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: getTopicColor(a.topic) + '22', color: getTopicColor(a.topic) }}>{a.topic}</span>
                        <p className="text-sm text-white/80 line-clamp-1 flex-1">{a.title}</p>
                        <p className="text-xs text-white/30 flex-shrink-0 truncate max-w-[80px]">{a.sourceName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* THE LIST — Forbes-style ranked Spotlight section */}
        {(loading || spotlightArticles.length > 0) && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            {/* Editorial header */}
            <div className="border border-[#FF6B35]/25 rounded-2xl p-6 mb-6 bg-gradient-to-r from-[#FF6B35]/8 to-transparent">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#FF6B35]">⚡ The Innovators Den List</span>
                    <span className="bg-[#FF6B35] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{new Date().getFullYear()}</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter leading-tight mb-1">Ones to Watch</h2>
                  <p className="text-white/45 text-sm">Up-and-coming artists, founders &amp; innovators — before they blow up</p>
                </div>
                <Link href={`${base}topics/${encodeURIComponent('Spotlight')}`} className="text-[#FF6B35] text-sm font-bold hover:underline whitespace-nowrap self-center">
                  Full List →
                </Link>
              </div>
            </div>

            {/* Numbered list entries */}
            {loading ? (
              <div className="space-y-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div>
                {spotlightArticles.map((article, i) => (
                  <Link key={article.id} href={`/articles/${article.id}`}>
                    <div className="flex items-center gap-5 py-4 group cursor-pointer hover:bg-white/[0.03] rounded-xl px-3 -mx-3 transition-all border-b border-white/[0.06] last:border-0">
                      {/* Rank number */}
                      <div className="w-10 text-right flex-shrink-0">
                        <span className="text-2xl font-black text-[#FF6B35]/35 group-hover:text-[#FF6B35]/80 transition-colors font-mono leading-none">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      {/* Vertical divider */}
                      <div className="w-px h-10 bg-[#FF6B35]/15 group-hover:bg-[#FF6B35]/40 transition-colors flex-shrink-0" />
                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#FF6B35] transition-colors mb-1">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-white/35 text-xs line-clamp-1 mb-1">{article.summary}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#FF6B35]/70 font-semibold">{article.sourceName}</span>
                          <span className="text-white/20">·</span>
                          <span className="text-white/25">{timeAgo(article.createdAt)}</span>
                        </div>
                      </div>
                      {/* Thumbnail */}
                      {article.imageUrl && (
                        <div className="w-16 h-14 rounded-lg overflow-hidden flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={e => { (e.target as HTMLImageElement).closest('div')!.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      {/* Arrow */}
                      <span className="text-white/15 group-hover:text-[#FF6B35] transition-colors flex-shrink-0 text-base">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* OUR PICKS — Den creator stories first, then top curated external */}
        {(loading || ourPicks.length > 0) && (
          <section className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-widest text-[#FFE600]">✦ Our Picks</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">Handpicked For Your Rise</h2>
              </div>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-60 h-48 bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {ourPicks.map(article => (
                  <Link key={article.id} href={`/articles/${article.id}`}>
                    <div
                      className="relative flex-shrink-0 w-60 h-52 rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ border: article.isCreatorContent ? '1.5px solid rgba(255,230,0,0.4)' : '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-white/5" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-end">
                        {article.isCreatorContent && (
                          <span className="self-start bg-[#FFE600] text-black text-[9px] font-black px-2 py-0.5 rounded-full mb-2 tracking-widest uppercase">
                            ✦ Den Signal
                          </span>
                        )}
                        <span
                          className="self-start text-[9px] font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-widest"
                          style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                        >
                          {article.topic}
                        </span>
                        <CategorySubBrand topic={article.topic} />
                        <h3 className="text-sm font-bold leading-snug line-clamp-3 text-white group-hover:text-[#FFE600] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-white/40 text-[11px] mt-1 truncate">
                          {article.isCreatorContent && article.submittedByName
                            ? `By ${article.submittedByName}`
                            : article.sourceName}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* W-HOME-001: Hero Sponsor Banner — between Spotlight and Latest Stories */}
        <div className="max-w-6xl mx-auto px-4 py-2">
          <HeroSponsorBanner tier={adTier} index={0} />
        </div>

        {/* LATEST ARTICLES */}
        <section className="max-w-6xl mx-auto px-4 py-8 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight">Latest Stories</h2>
            {Object.values(signals).some(s => s === 'hidden') && (
              <button
                onClick={() => setSignals({})}
                className="text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Reset preferences
              </button>
            )}
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleArticles.map(article => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <article
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 cursor-pointer group"
                    style={{
                      opacity: signals[article.id] === 'less' ? 0.55 : 1,
                      outline: signals[article.id] === 'saved' ? '2px solid #FFE60055' : undefined,
                      outlineOffset: signals[article.id] === 'saved' ? '2px' : undefined,
                    }}
                  >
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
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div
                          className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: getTopicColor(article.topic) + "22", color: getTopicColor(article.topic) }}
                        >
                          {getTopicEmoji(article.topic)} {article.topic}
                        </div>
                        <CategorySubBrand topic={article.topic} />
                        {(() => {
                          const label = deriveWhyShown(article);
                          return label ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(246,196,66,0.1)', border: '1px solid rgba(246,196,66,0.25)', color: '#FFE600' }}>
                              ⚡ {label}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#FFE600] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-white/50 text-xs line-clamp-2 mb-3">{article.summary}</p>
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>{article.sourceName}</span>
                        <span>{timeAgo(article.createdAt)}</span>
                      </div>
                      <ArticleActions
                        articleId={article.id}
                        signal={signals[article.id] ?? null}
                        onSignal={handleSignal}
                      />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* W-HOME-002: Native Ad + H-001: House Ad — before App Promo */}
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <WebNativeAdCard tier={adTier} index={0} context="home" />
          <DisplayRectangle tier={adTier} index={0} />
          <HouseAdCard variant="membership" />
        </div>

        {/* APP PROMO */}
        <section className="bg-[#FFE600] py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-black text-black tracking-tighter mb-4">
              Read on the go. Download the app.
            </h2>
            <p className="text-black/60 text-lg mb-8 max-w-xl mx-auto">
              The full experience — personalized feeds, saved articles, offline reading, and no ads — is in the app.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://apps.apple.com/app/the-innovators-den"
                className="bg-black text-white font-black px-8 py-4 rounded-2xl hover:opacity-80 transition-opacity"
              >
                🍎 Apple App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.theinnovatorsden.app"
                className="bg-black text-white font-black px-8 py-4 rounded-2xl hover:opacity-80 transition-opacity"
              >
                ▶ Google Play
              </a>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-black tracking-tight mb-4">What is The Innovators Den?</h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            The Innovators Den is a Black-owned media brand delivering curated, brand-safe news and culture content across 12 categories — built for innovators, entrepreneurs, creatives, and culture leaders. Every story is sourced from premium publishers and filtered for quality and relevance.
          </p>
          <p className="text-white/40 text-base leading-relaxed max-w-2xl mx-auto">
            Our editorial focus covers Black excellence in tech, business, arts, sports, and lifestyle. We surface the stories that mainstream media overlooks — and we do it with style.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-white/40">
            <div className="font-black text-white">THE INNOVATORS DEN</div>
            <div className="flex gap-6">
              <Link href={`${base}topics`} className="hover:text-white transition-colors">Topics</Link>
              <Link href={`${base}privacy`} className="hover:text-white transition-colors">Privacy Policy</Link>
              <a href="https://theinnovatorsden.net/sitemap.xml" className="hover:text-white transition-colors">Sitemap</a>
              <a href="https://theinnovatorsden.net/llms.txt" className="hover:text-white transition-colors">AI Info</a>
            </div>
            <div>© {new Date().getFullYear()} The Innovators Den. For Us, By Us.</div>
          </div>
        </footer>
      </div>
    </>
  );
}
