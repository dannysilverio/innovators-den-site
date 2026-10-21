/** Public links never depend on the current request host or a build container. */
export const SITE_ORIGIN = "https://theinnovatorsden.net";
export const LEGACY_ORIGIN = "https://innovators-den-news--danny449.replit.app";
export const REDIRECT_HOSTS = [
  "theinnovatorsden.xyz", "www.theinnovatorsden.xyz",
  "theinnovatorsden.online", "www.theinnovatorsden.online",
  "www.theinnovatorsden.net",
];
const internalHosts = new Set([
  new URL(SITE_ORIGIN).hostname, new URL(LEGACY_ORIGIN).hostname,
  "theinnovatorsden.net", "www.theinnovatorsden.net", ...REDIRECT_HOSTS,
]);

export function siteUrl(path = "/") {
  const url = new URL(path, SITE_ORIGIN);
  if (!internalHosts.has(url.hostname)) return url.href;
  const rootResource = /^\/(?:api(?:\/|$)|sitemap\.xml$|robots\.txt$|llms\.txt$|manifest$)/.test(url.pathname);
  const pathname = rootResource || /^\/web(?:\/|$)/.test(url.pathname)
    ? url.pathname : `/web${url.pathname}`;
  return `${SITE_ORIGIN}${pathname}${url.search}${url.hash}`;
}

export function articleUrl(id, title) {
  return siteUrl(title === "The Sword, the Storm, and the Prayer"
    ? "/stories/the-sword-the-storm-and-the-prayer"
    : `/articles/${encodeURIComponent(id)}`);
}

export function normalizeSiteMetadata(value) {
  if (typeof value === "string" && /^https?:\/\//.test(value)) return siteUrl(value);
  if (Array.isArray(value)) return value.map(normalizeSiteMetadata);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeSiteMetadata(item)]));
  return value;
}

/** Exact allowlist only; retain the old production hostname without redirecting it. */
export function domainRedirect(host, requestPath = "/") {
  const hostname = String(host ?? "").split(",")[0].trim().toLowerCase().split(":")[0];
  const retired = /^\/(?:web\/)?topics\/dining\/?(\?.*)?$/i.exec(requestPath);
  if (retired) {
    const path = `/web/topics/food-and-wine${retired[1] ?? ""}`;
    return REDIRECT_HOSTS.includes(hostname) ? `${SITE_ORIGIN}${path}` : path;
  }
  return REDIRECT_HOSTS.includes(hostname)
    ? `${SITE_ORIGIN}${requestPath.startsWith("/") ? requestPath : `/${requestPath}`}`
    : null;
}

export function isAllowedOrigin(origin, development = false) {
  if (!origin) return true; // Native clients, server jobs and same-origin navigation.
  try {
    const url = new URL(origin);
    if (url.origin !== origin) return false;
    if (url.protocol === "https:" && internalHosts.has(url.hostname)) return true;
    return development && (
      (["localhost", "127.0.0.1"].includes(url.hostname) && ["http:", "https:"].includes(url.protocol)) ||
      (url.protocol === "https:" && /\.replit\.dev$/.test(url.hostname))
    );
  } catch { return false; }
}

export function resolveApiOrigin(value) {
  const url = new URL(value && !/^https?:\/\//.test(value) ? `https://${value}` : value || SITE_ORIGIN);
  if (url.username || url.password || url.search || url.hash || !["", "/", "/api", "/api/"].includes(url.pathname))
    throw new Error("API base must be an origin (or end in /api), without credentials, query or fragment.");
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
    throw new Error("API base must use HTTPS.");
  return url.origin;
}
