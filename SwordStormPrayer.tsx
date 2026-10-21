import { Fragment, useEffect, useState, type ReactNode } from "react";
import StoryVideo from "@/components/StoryVideo";
import CategorySubBrand from "@/components/CategorySubBrand";
import { articleUrl } from "@workspace/api-zod/site-domain";
import { videoInsertionIndex } from "@workspace/api-zod/story-video";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import Seo from "@/components/Seo";
import { fetchArticle, fetchArticles, type Article } from "@/lib/api";
import source from "@/content/sword-storm-prayer.md?raw";
import heroImage from "@assets/generated_images/michael-storm-prayer-hero.jpg";
import altarImage from "@assets/generated_images/belie-belcan-altar.jpg";
import belieImage from "@assets/generated_images/belie-belcan-symbolic.jpg";
import candleImage from "@assets/generated_images/sword-candle-prayer.jpg";
import "./SwordStormPrayer.css";

const storyPath = "/stories/the-sword-the-storm-and-the-prayer";

function plain(text: string) {
  return text.replace(/^\s*#{1,3}\s+/, "").replace(/\*\*/g, "").replace(/\*/g, "").trim();
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

type Block = { kind: "heading" | "paragraph" | "quote" | "divider"; text: string; level?: number; id?: string };

function parseBlocks(markdown: string): Block[] {
  let headingIndex = 0;
  return markdown.trim().split(/\n\s*\n/).map(chunk => {
    const text = chunk.trim();
    if (text === "---") return { kind: "divider", text };
    const heading = text.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      return { kind: "heading", text: heading[2], level, id: `section-${headingIndex++}` };
    }
    if (text.startsWith("> ")) return { kind: "quote", text: text.replace(/^>\s?/gm, "") };
    return { kind: "paragraph", text };
  });
}

const blocks = parseBlocks(source);
const title = plain(blocks[0].text);
const subtitle = plain(blocks[1].text);
const date = plain(blocks[2].text);
const author = plain(blocks[3].text).replace(/^By /, "");
const body = blocks.slice(4);
const sources = [
  { title: "Vatican News: St. Michael, Archangel", url: "https://www.vaticannews.va/en/saints/09/29/st--michael--archangel.html" },
  { title: "The Church of England: Michael and All Angels", url: "https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/festivals/michael-and" },
  { title: "Orthodox Church in America: Synaxis of the Archangel Michael", url: "https://www.oca.org/saints/lives/2026/11/08/103244-synaxis-of-the-archangel-michael-and-the-other-bodiless-powers" },
  { title: "Ethos: Spirit possession in the Dominican Republic", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6477824/" },
  { title: "Concordia University: Rafa Santos, Basement Altar", url: "https://www.concordia.ca/finearts/about/galleries-venues/fofa-gallery/exhibitions/2022/undergraduate-student-exhibition/rafa-santos.html" },
  { title: "Diario Libre: San Miguel and Belié Belcán on September 29", url: "https://www.diariolibre.com/actualidad/nacional/2025/09/29/dia-de-san-miguel-entre-devocion-catolica-y-practicas-de-santeria/3260882" },
];

function StoryFigure({ kind }: { kind: "altar" | "belie" | "candle" }) {
  return kind === "belie" ? (
    <figure className="ss-figure">
      <img
        src={belieImage}
        alt="Imagined painting of a guardian figure in white with a lowered sword, candles, and a glass of water"
        loading="lazy"
      />
      <figcaption><strong>Artistic interpretation of Belié Belcán.</strong> This imagined illustration is not a traditional icon or documentary image of a religious practice.</figcaption>
    </figure>
  ) : kind === "altar" ? (
    <figure className="ss-figure">
      <img
        src={altarImage}
        alt="Artistic interpretation of a candlelit Dominican devotional altar with flowers, water, and sacred imagery"
        loading="lazy"
        data-testid="img-belie-belcan-altar"
      />
      <figcaption><strong>Artistic interpretation</strong> of a devotional setting associated with Belié Belcán. This illustration is not documentary footage or an authoritative traditional portrait.</figcaption>
    </figure>
  ) : (
    <figure className="ss-figure">
      <img
        src={candleImage}
        alt="Illustration of a candle burning beside a sword in a quiet place of prayer"
        loading="lazy"
        data-testid="img-sword-candle-prayer"
      />
      <figcaption>Illustration: the sword, the candle, and the quiet work of prayer.</figcaption>
    </figure>
  );
}

export default function SwordStormPrayer() {
  const [article, setArticle] = useState<Article | null>(null);
  const [progress, setProgress] = useState(0);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const liveBody = article?.content?.trim() ? parseBlocks(article.content) : body;
  const liveSections = liveBody.filter(block => block.kind === "heading" && block.level !== 3);

  useEffect(() => {
    fetchArticle("62edb145-035b-43ef-914c-2a20f4299218")
      .then(async data => data ?? (await fetchArticles("Culture", 100))
        .find(a => a.sourceName === "The Innovators Den" && a.title === "The Sword, the Storm, and the Prayer") ?? null)
      .then(setArticle)
      .catch(() => { /* The complete bundled story remains available offline. */ });
  }, []);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(articleUrl("", title));
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 3000);
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="ss-story">
      <Seo
        title="The Sword, the Storm, and the Prayer"
        description={subtitle}
        canonical={`${import.meta.env.BASE_URL.replace(/\/$/, "")}${storyPath}`}
        ogImage={heroImage}
        ogType="article"
        publishedTime="2026-09-29"
        topic="Culture"
      />
      <Helmet>
        <meta name="author" content={author} />
      </Helmet>
      <div className="ss-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <header className="ss-hero">
        <div className="ss-hero-inner">
          <nav className="ss-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" data-testid="link-story-home">The Innovators Den</Link>
            <span aria-hidden="true">/</span>
            <span>Stories</span>
          </nav>
          <p className="ss-kicker">Culture / Faith / Identity</p>
          <CategorySubBrand topic="Culture" />
          <h1 className="ss-title" data-testid="text-story-title">{title}</h1>
          <p className="ss-subtitle">{subtitle}</p>
          <div className="ss-meta">
            <span><strong>By {author}</strong></span>
            <span className="ss-dot" aria-hidden="true" />
            <time dateTime="2026-09-29">{date}</time>
          </div>
        </div>
        <figure className="ss-hero-image">
          <img src={heroImage} alt="Illustrated Saint Michael with a sword amid a dramatic storm sky" data-testid="img-story-hero" />
          <figcaption className="ss-image-credit">Illustration / The Innovators Den</figcaption>
        </figure>
      </header>

      <main className="ss-paper">
        <article className="ss-article" aria-label={title}>
          <div className="ss-body">
            {liveBody.map((block, index) => <Fragment key={index}>
              {article?.videoUrl && index === videoInsertionIndex(liveBody.map(item => item.kind === "heading" ? `## ${item.text}` : item.kind === "divider" ? "---" : item.text)) && <StoryVideo {...article} />}
              {(() => {
              if (block.kind === "divider") return <hr key={index} aria-hidden="true" />;
              if (block.kind === "quote") return <blockquote key={index}>{inline(block.text)}</blockquote>;
              if (block.kind === "paragraph") return <p key={index}>{inline(block.text)}</p>;
              const heading = block.level === 3
                ? <h3 id={block.id} key={`heading-${index}`}>{inline(block.text)}</h3>
                : <h2 id={block.id} key={`heading-${index}`}>{inline(block.text)}</h2>;
              const headingText = plain(block.text);
              if (headingText === "In the 21 Divisions") {
                return <div key={index}>{heading}<StoryFigure kind="altar" /></div>;
              }
              if (headingText === "Two rivers") {
                return <div key={index}>{heading}<StoryFigure kind="belie" /></div>;
              }
              if (headingText === "The real weapon") {
                return <div key={index}>{heading}<StoryFigure kind="candle" /></div>;
              }
              return heading;
              })()}
            </Fragment>)}
          </div>
          <section className="ss-sources" aria-labelledby="ss-sources-heading">
            <h2 id="ss-sources-heading">Sources &amp; context</h2>
            <p>Selected references for the historical and religious traditions discussed above. Interpretations and personal reflections are the author's.</p>
            <ul>
              {sources.map(item => (
                <li key={item.url}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a></li>
              ))}
            </ul>
          </section>
        </article>
        <aside className="ss-rail" aria-label="On this page">
          <div className="ss-rail-inner">
            <div className="ss-rail-label">In this story</div>
            <ol>
              {liveSections.map(block => (
                <li key={block.id}>
                  <a href={`#${block.id}`} data-testid={`link-section-${block.id}`}>{plain(block.text)}</a>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </main>

      <footer className="ss-end">
        <div className="ss-end-inner">
          <div>
            <span className="ss-end-label">End of story</span>
            <h2>Keep the conversation open.</h2>
          </div>
          <div className="ss-actions">
            <button type="button" onClick={copyLink} className="ss-action" data-testid="button-copy-story-link">
              {copyStatus === "copied" ? "Link copied" : copyStatus === "error" ? "Unable to copy link" : "Copy story link"}
            </button>
            <Link href="/discover" className="ss-action ss-action-primary" data-testid="link-discover-stories">Explore more stories</Link>
          </div>
        </div>
        <div className="ss-footer">
          <Link href="/" data-testid="link-footer-home">THE INNOVATORS DEN</Link>
          <span>Culture · Faith · Identity</span>
        </div>
      </footer>
    </div>
  );
}