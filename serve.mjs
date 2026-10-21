import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { domainRedirect } from "@workspace/api-zod/site-domain";

const root = path.resolve(fileURLToPath(new URL("../dist/public/", import.meta.url)));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript",
  ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json",
  ".ico": "image/x-icon", ".txt": "text/plain", ".woff2": "font/woff2" };

/** Dynamic serving is necessary for real HTTP 301s, not JavaScript redirects. */
export function createWebServer() {
  return http.createServer((req, res) => {
    const redirect = domainRedirect(req.headers["x-forwarded-host"] || req.headers.host, req.url);
    if (redirect) { res.writeHead(301, { Location: redirect }); res.end(); return; }
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405); res.end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
    catch { res.writeHead(400); res.end(); return; }
    pathname = pathname.replace(/^\/web(?:\/|$)/, "/");
    if (["/sitemap.xml", "/robots.txt", "/llms.txt"].includes(pathname)) {
      const upstream = http.get({
        hostname: "127.0.0.1", port: process.env.API_INTERNAL_PORT || 8080,
        path: `/api${pathname}${new URL(req.url, "http://localhost").search}`,
      }, response => {
        res.writeHead(response.statusCode || 502, response.headers);
        response.pipe(res);
      });
      upstream.setTimeout(15_000, () => upstream.destroy(new Error("SEO upstream timeout")));
      upstream.on("error", () => {
        if (!res.headersSent) res.writeHead(502);
        res.end("SEO resource temporarily unavailable");
      });
      return;
    }
    let file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403); res.end(); return; }
    if (!existsSync(file) || !statSync(file).isFile()) file = path.join(root, "index.html");
    if (!existsSync(file)) { res.writeHead(503); res.end("Web build unavailable"); return; }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": file.includes(`${path.sep}assets${path.sep}`) ? "public, max-age=31536000, immutable" : "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") { res.end(); return; }
    createReadStream(file).on("error", () => res.destroy()).pipe(res);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port <= 0) throw new Error("PORT is required");
  createWebServer().listen(port, "0.0.0.0", () => console.log(`Web server listening on ${port}`));
}
