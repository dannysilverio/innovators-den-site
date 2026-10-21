const API_BASE = "/api";

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  videoCaption?: string | null;
  sourceName: string;
  sourceUrl: string;
  imageUrl: string | null;
  topic: string;
  status: string;
  aiScore: number | null;
  isSponsored: boolean;
  isCreatorContent?: boolean;
  noveltyScore?: number;
  trendScore?: number;
  createdAt: string;
}

export function deriveWhyShown(article: Pick<Article, 'isSponsored' | 'isCreatorContent' | 'createdAt' | 'noveltyScore' | 'trendScore' | 'topic'>): string | null {
  if (article.isSponsored) return null;
  const hoursOld = (Date.now() - new Date(article.createdAt).getTime()) / 3_600_000;
  if (article.isCreatorContent) return 'Den member story';
  if (hoursOld < 3) return 'Just dropped';
  if ((article.trendScore ?? 0) > 0.7) return `Rising in ${article.topic}`;
  if ((article.noveltyScore ?? 0) > 0.8) return 'Fresh signal';
  return null;
}

export const TOPICS = [
  { slug: "Innovation", label: "Innovation", color: "#3B82F6", emoji: "🚀" },
  { slug: "Art", label: "Art", color: "#8B5CF6", emoji: "🎨" },
  { slug: "Culture", label: "Culture", color: "#FF4D7E", emoji: "✊" },
  { slug: "Music", label: "Music", color: "#EC4899", emoji: "🎵" },
  { slug: "Business Growth", label: "Business Growth", color: "#10B981", emoji: "📈" },
  { slug: "Sports", label: "Sports", color: "#F97316", emoji: "🏆" },
  { slug: "food-and-wine", label: "Food & Wine", color: "#D946EF", emoji: "🍷" },
  { slug: "Health", label: "Health", color: "#22C55E", emoji: "💪" },
  { slug: "Travel", label: "Travel", color: "#06B6D4", emoji: "✈️" },
  { slug: "Astrology", label: "Astrology", color: "#E879F9", emoji: "⭐" },
  { slug: "Law", label: "Law", color: "#F59E0B", emoji: "⚖️" },
  { slug: "Finance", label: "Finance", color: "#4ADE80", emoji: "💰" },
  { slug: "Spotlight", label: "Spotlight", color: "#FF6B35", emoji: "⚡" },
] as const;

export function getTopicColor(topic: string): string {
  return TOPICS.find(t => t.slug === topic || t.label === topic)?.color ?? "#FFE600";
}

export function getTopicEmoji(topic: string): string {
  return TOPICS.find(t => t.slug === topic || t.label === topic)?.emoji ?? "📰";
}

export async function fetchArticles(topic?: string, limit = 50): Promise<Article[]> {
  const params = new URLSearchParams();
  if (topic) params.set("topic", TOPICS.find(t => t.slug === topic)?.label ?? topic);
  params.set("status", "approved");
  const res = await fetch(`${API_BASE}/articles?${params}`);
  if (!res.ok) throw new Error("Failed to fetch articles");
  const data: Article[] = await res.json();
  const originals = data.filter(a => a.sourceName === "The Innovators Den");
  const external = data.filter(a => a.sourceName !== "The Innovators Den");
  return [...originals, ...external].slice(0, limit);
}

export async function fetchArticle(id: string): Promise<Article | null> {
  const res = await fetch(`${API_BASE}/articles/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
