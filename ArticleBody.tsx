import { Fragment, type ReactNode } from "react";
import { splitStoryForVideo } from "@workspace/api-zod/story-video";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part.startsWith("*") && part.endsWith("*")
        ? <em key={i}>{part.slice(1, -1)}</em> : part,
  );
}

/** Text/markdown only: never inject untrusted article HTML. */
export default function ArticleBody({ content, video }: { content: string; video?: ReactNode }) {
  if (video) {
    const [opening, closing] = splitStoryForVideo(content);
    return <><ArticleBody content={opening} />{video}<ArticleBody content={closing} /></>;
  }
  const text = content.replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|h[1-6]|li)>/gi, "\n\n").replace(/<[^>]*>/g, "");
  return <div className="space-y-5 whitespace-pre-line">
    {text.split(/\n\s*\n/).filter(block => block.trim()).map((block, i) => {
      const heading = block.match(/^#{1,3}\s+([\s\S]*)$/);
      if (heading) return <h2 key={i} className="text-xl font-bold text-white">{inline(heading[1])}</h2>;
      if (/^\*Invited guest of [\s\S]+\*$/.test(block.trim())) {
        return <p key={i} className="text-xs leading-relaxed text-white/60">{inline(block.trim())}</p>;
      }
      if (/^[-⸻]{1,}$/.test(block.trim())) return <hr key={i} className="border-white/20" />;
      if (block.startsWith("> ")) return <blockquote key={i} className="border-l-2 pl-4">{inline(block.replace(/^>\s?/gm, ""))}</blockquote>;
      const lines = block.trim().split("\n");
      if (lines.every(line => /^-\s+/.test(line))) {
        return <ul key={i} className="list-disc pl-6 space-y-2">{lines.map((line, j) =>
          <li key={j}>{inline(line.replace(/^-\s+/, ""))}</li>,
        )}</ul>;
      }
      return <p key={i}>{block.split("\n").map((line, j) =>
        <Fragment key={j}>{j > 0 && <br />}{inline(line)}</Fragment>,
      )}</p>;
    })}
  </div>;
}
