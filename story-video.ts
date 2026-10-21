/** No raw embed markup or arbitrary iframe hosts. Keep this policy shared by all clients. */
export const DIRECT_VIDEO_HOSTS = [
  "storage.googleapis.com",
  "commondatastorage.googleapis.com",
  "res.cloudinary.com",
] as const;

export type StoryVideoSource = {
  provider: "file" | "youtube" | "vimeo" | "descript";
  url: string;
  embedUrl?: string;
};

function secureUrl(value: string): URL {
  if (typeof value !== "string" || value.length > 4096 || /[<>\u0000-\u001f]/.test(value)) {
    throw new Error("Enter a video URL, not HTML or embed code.");
  }
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error("Enter a valid HTTPS URL."); }
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
    throw new Error("Video and poster URLs must use HTTPS without credentials or custom ports.");
  }
  return url;
}

export function parseStoryVideo(value: string): StoryVideoSource {
  const url = secureUrl(value);
  const host = url.hostname.toLowerCase();
  if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(host)) {
    const id = host === "youtu.be" ? url.pathname.slice(1)
      : url.pathname === "/watch" ? url.searchParams.get("v")
      : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1];
    if (!id || !/^[\w-]{11}$/.test(id)) throw new Error("Enter a valid YouTube watch, Shorts, share or embed URL.");
    return { provider: "youtube", url: url.href, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0` };
  }
  if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
    const match = url.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?\/?$/);
    if (!match) throw new Error("Enter a Vimeo video or player URL.");
    const hash = url.searchParams.get("h") ?? match[2];
    if (hash && !/^[a-zA-Z0-9]+$/.test(hash)) throw new Error("Invalid Vimeo privacy token.");
    return { provider: "vimeo", url: url.href, embedUrl: `https://player.vimeo.com/video/${match[1]}${hash ? `?h=${hash}` : ""}` };
  }
  if (host === "share.descript.com") {
    const match = url.pathname.match(/^\/(?:view|embed)\/([a-zA-Z0-9_-]+)\/?$/);
    if (!match) throw new Error("Enter a Descript share.descript.com/view/… link.");
    return { provider: "descript", url: url.href, embedUrl: `https://share.descript.com/embed/${match[1]}` };
  }
  if ((DIRECT_VIDEO_HOSTS as readonly string[]).includes(host) && /\.(mp4|mov)$/i.test(url.pathname)) {
    return { provider: "file", url: url.href };
  }
  throw new Error(`Use YouTube, Vimeo, share.descript.com, or an MP4/MOV file on: ${DIRECT_VIDEO_HOSTS.join(", ")}.`);
}

export type StoryVideoFields = {
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  videoCaption?: string | null;
};

/** Omitted fields stay omitted for PATCH; blank strings explicitly clear a field. */
export function validateStoryVideoFields(input: Record<string, unknown>): StoryVideoFields {
  const result: StoryVideoFields = {};
  for (const key of ["videoUrl", "videoPosterUrl", "videoCaption"] as const) {
    const raw = input[key];
    if (raw === undefined) continue;
    if (raw !== null && typeof raw !== "string") throw new Error(`${key} must be a string or null.`);
    const value = typeof raw === "string" ? raw.trim() : null;
    if (!value) { result[key] = null; continue; }
    if (key === "videoUrl") result[key] = parseStoryVideo(value).url;
    if (key === "videoPosterUrl") {
      const poster = secureUrl(value);
      if (/^(localhost|.*\.localhost|.*\.local)$/.test(poster.hostname) || /^[\d.]+$/.test(poster.hostname) || poster.hostname.includes(":")) {
        throw new Error("Use a public HTTPS poster image URL.");
      }
      result[key] = poster.href;
    }
    if (key === "videoCaption") {
      if (value.length > 300) throw new Error("Keep the video caption to 300 characters or fewer.");
      result[key] = value;
    }
  }
  return result;
}

/** Insert after the opening section, never after the final block. */
export function videoInsertionIndex(blocks: string[]): number {
  if (blocks.length < 2) return 1;
  const heading = blocks.findIndex((block, index) => index > 0 && /^(#{1,3}\s|\*\*[^*]+\*\*$)/.test(block.trim()));
  return heading > 0 ? heading : Math.max(1, Math.floor(blocks.length / 2));
}

export function splitStoryForVideo(content: string): [string, string] {
  const blocks = content.split(/\n\s*\n/);
  if (blocks.length > 1) {
    const index = videoInsertionIndex(blocks);
    return [blocks.slice(0, index).join("\n\n"), blocks.slice(index).join("\n\n")];
  }
  // Even a single-paragraph article can keep its concluding text below the video.
  const middle = Math.floor(content.length / 2);
  const boundary = content.indexOf(" ", middle);
  return boundary > 0 ? [content.slice(0, boundary), content.slice(boundary + 1)] : [content, ""];
}
