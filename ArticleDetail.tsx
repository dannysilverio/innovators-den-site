import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useLocation, Redirect } from "wouter";
import Seo from "@/components/Seo";
import ArticleBody from "@/components/ArticleBody";
import StoryVideo from "@/components/StoryVideo";
import CategorySubBrand from "@/components/CategorySubBrand";
import { articleUrl } from "@workspace/api-zod/site-domain";
import { fetchArticle, getTopicColor, getTopicEmoji, timeAgo, TOPICS, type Article } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/track";

const API_BASE = "/api";

function ScrollProgress({ color }: { color: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: "transparent" }}>
      <div style={{ height: "100%", background: color, width: `${progress}%`, transition: "width 0.1s linear" }} />
    </div>
  );
}

function BookmarkButton({ article, userId }: { article: Article; userId: string | null }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE}/bookmarks/${userId}`)
      .then(r => r.json())
      .then((d: any[]) => {
        const saved = Array.isArray(d) ? d : [];
        setBookmarked(saved.some((b: any) => b.id === article.id));
      })
      .catch(() => {});
  }, [userId, article.id]);

  const toggle = async () => {
    if (!userId) { setLocation("/sign-in"); return; }
    setLoading(true);
    setBookmarked(b => !b);
    try {
      if (!bookmarked) {
        const response = await fetch(`${API_BASE}/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId: userId,
            article: {
              id: article.id,
              title: article.title,
              summary: article.summary,
              sourceName: article.sourceName,
              imageUrl: article.imageUrl,
              topic: article.topic,
              createdAt: article.createdAt,
            },
          }),
        });
        if (!response.ok) throw new Error("Could not save article");
        trackEvent("article_saved", { topic: article.topic });
      } else {
        await fetch(`${API_BASE}/bookmarks/${article.id}?deviceId=${userId}`, { method: "DELETE" });
      }
    } catch { setBookmarked(b => !b); }
    finally { setLoading(false); }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? "Remove bookmark" : "Save article"}
      style={{
        background: bookmarked ? "#FFE60020" : "#1a1a1a",
        border: `1px solid ${bookmarked ? "#FFE600" : "#2a2a2a"}`,
        borderRadius: 8, padding: "7px 14px", color: bookmarked ? "#FFE600" : "#888",
        fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        transition: "all 0.15s",
      }}
    >
      {bookmarked ? "🔖 Saved" : "🔖 Save"}
    </button>
  );
}

export default function ArticleDetail() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    setImageFailed(false);
    fetchArticle(params.id).then(data => {
      setArticle(data);
      setLoading(false);
      if (data?.topic) {
        fetch(`${API_BASE}/articles?topic=${encodeURIComponent(data.topic)}&limit=4`)
          .then(r => r.json())
          .then(d => {
            const items: Article[] = Array.isArray(d) ? d : (d.articles ?? d.data ?? []);
            setRelated(items.filter(a => a.id !== data.id).slice(0, 3));
          })
          .catch(() => {});
      }
    }).catch(() => setLoading(false));
  }, [params.id]);

  const shareUrl = article ? articleUrl(String(article.id), article.title) : "";

  const shareOnTwitter = () => {
    const text = article ? `"${article.title}" via @InnovatorsDen` : "Check this out on The Innovators Den";
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, "_blank");
    trackEvent("article_share_clicked", { method: "x", topic: article?.topic ?? "unknown" });
  };

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      trackEvent("article_share_clicked", { method: "copy_link", topic: article?.topic ?? "unknown" });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl, article?.topic]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-black">Article not found</p>
        <Link href={base} className="text-[#FFE600] hover:underline">← Back home</Link>
      </div>
    );
  }

  const color = getTopicColor(article.topic);
  const emoji = getTopicEmoji(article.topic);
  const isOriginal = article.sourceName === "The Innovators Den" || article.isCreatorContent === true;
  const isSwordStory = isOriginal && article.title === "The Sword, the Storm, and the Prayer";
  if (isSwordStory) {
    return <Redirect to="/stories/the-sword-the-storm-and-the-prayer" replace />;
  }

  const plainContent = article.content
    ? article.content.replace(/<[^>]*>/g, " ").trim()
    : article.summary;

  const wordCount = [article.title, article.summary, plainContent].join(" ").trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 238));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    datePublished: article.createdAt,
    dateModified: article.createdAt,
    image: article.imageUrl ?? undefined,
    url: articleUrl(String(article.id), article.title),
    isPartOf: { "@id": "https://theinnovatorsden.net/#website" },
    publisher: {
      "@type": "Organization",
      "@id": "https://theinnovatorsden.net/#organization",
      name: "The Innovators Den",
      logo: { "@type": "ImageObject", url: "https://theinnovatorsden.net/logo.png" },
    },
    author: {
      "@type": "Organization",
      name: article.sourceName,
      url: article.sourceUrl,
    },
    articleSection: article.topic,
    about: { "@type": "Thing", name: article.topic },
    keywords: `${article.topic}, Black culture, The Innovators Den, ${article.sourceName}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://theinnovatorsden.net/articles/${article.id}` },
  };

  return (
    <>
      <ScrollProgress color={color} />
      <Seo
        title={article.title}
        description={article.summary}
        canonical={articleUrl(String(article.id), article.title)}
        ogImage={article.imageUrl ?? undefined}
        ogType="article"
        publishedTime={article.createdAt}
        topic={article.topic}
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-black text-white">
        <nav className="border-b border-white/10 px-4 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <Link href={base}>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#FFE600] flex items-center justify-center">
                <span className="text-black font-black text-sm">ID</span>
              </div>
              <span className="font-black text-lg tracking-tight">THE INNOVATORS DEN</span>
            </div>
          </Link>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <BookmarkButton article={article} userId={user?.id ?? null} />
            <a
              href="https://apps.apple.com/app/the-innovators-den"
              className="bg-[#FFE600] text-black font-bold px-4 py-2 rounded-full text-xs hover:bg-yellow-300 transition-colors"
            >
              Get the App
            </a>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Link href={base} className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/topics/${encodeURIComponent(TOPICS.find(t => t.label === article.topic)?.slug ?? article.topic)}`} className="hover:text-white transition-colors" style={{ color }}>
              {emoji} {article.topic}
            </Link>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-4 pb-20">
          <div className="mb-6">
            <div
              className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: color + "22", color }}
            >
              {emoji} {article.topic}
            </div>
            <CategorySubBrand topic={article.topic} />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-white/50 mb-6">
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors font-semibold"
              >
                {article.sourceName === "The Innovators Den" ? "By The Innovators Den" : article.sourceName}
              </a>
              <span>·</span>
              <time dateTime={article.createdAt}>{timeAgo(article.createdAt)}</time>
              <span>·</span>
              <span style={{ color: "#888" }}>{readingMinutes} min read</span>
            </div>

            {/* Share row */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 24 }}>
              <button
                onClick={shareOnTwitter}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#111", border: "1px solid #222", borderRadius: 8, color: "#1DA1F2", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                𝕏 Share
              </button>
              <button
                onClick={copyLink}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: copied ? "#10B98120" : "#111", border: `1px solid ${copied ? "#10B981" : "#222"}`, borderRadius: 8, color: copied ? "#10B981" : "#888", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              >
                {copied ? "✓ Copied" : "🔗 Copy link"}
              </button>
            </div>
          </div>

          {article.imageUrl && !imageFailed && (
            <div className="rounded-2xl overflow-hidden mb-8 aspect-video">
              <img
                src={article.imageUrl}
                alt={article.title}
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-invert prose-lg max-w-none mb-10">
            <p className="text-white/80 text-xl leading-relaxed font-medium mb-6 border-l-4 pl-4" style={{ borderColor: color }}>
              {article.summary}
            </p>
            {isOriginal && (!article.content?.trim() || article.content.trim() === article.summary.trim()) ? (
              <p role="alert" className="text-amber-300">The complete story is temporarily unavailable. Please try again shortly.</p>
            ) : article.content?.trim() && (isOriginal || plainContent !== article.summary) ? (
              <div className="text-white/70 text-base leading-relaxed space-y-4">
                <ArticleBody content={article.content} video={article.videoUrl ? <StoryVideo {...article} /> : undefined} />
              </div>
            ) : null}
            {!isOriginal && <p className="mt-5 text-sm text-white/50">Source excerpt / extracted text. The complete article may only be available at the publisher.</p>}
            {article.videoUrl && !isOriginal && (!article.content?.trim() || plainContent === article.summary) && <StoryVideo {...article} />}
          </div>

          {!isOriginal && <div className="border border-white/10 rounded-2xl p-6 bg-white/5 mb-8">
            <p className="text-white/60 text-sm mb-1">This article was sourced from</p>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFE600] font-bold hover:underline"
            >
              Read the full story at the source: {article.sourceName} →
            </a>
          </div>}

          {/* Related articles */}
          {related.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
                More from {article.topic}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                {related.map(r => (
                  <div
                    key={r.id}
                    onClick={() => { setLocation(`/articles/${r.id}`); window.scrollTo(0, 0); }}
                    style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#333")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
                  >
                    {r.imageUrl && <img src={r.imageUrl} alt="" style={{ width: "100%", height: 120, objectFit: "cover" }} />}
                    <div style={{ padding: 14 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: "#f0f0f0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                        {r.title}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{r.sourceName} · {timeAgo(r.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#FFE600] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-black text-black mb-2">Read more in the app</h2>
            <p className="text-black/60 mb-6">Full articles, personalized feeds, saved stories — download The Innovators Den app.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://apps.apple.com/app/the-innovators-den"
                className="bg-black text-white font-black px-6 py-3 rounded-xl hover:opacity-80 transition-opacity"
              >
                🍎 iOS App
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.theinnovatorsden.app"
                className="bg-black text-white font-black px-6 py-3 rounded-xl hover:opacity-80 transition-opacity"
              >
                ▶ Android App
              </a>
            </div>
          </div>
        </article>

        <footer className="border-t border-white/10 py-8 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-white/40">
            <Link href={base} className="font-black text-white hover:text-[#FFE600] transition-colors">THE INNOVATORS DEN</Link>
            <div>© {new Date().getFullYear()} The Innovators Den. For Us, By Us.</div>
          </div>
        </footer>
      </div>
    </>
  );
}
