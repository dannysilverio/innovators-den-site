import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import http from "node:http";
import { SITE_ORIGIN, LEGACY_ORIGIN, REDIRECT_HOSTS, domainRedirect, siteUrl,
  articleUrl, isAllowedOrigin, resolveApiOrigin, normalizeSiteMetadata } from "../lib/api-zod/src/site-domain.js";
import { createWebServer } from "../artifacts/web/server/serve.mjs";
import mobileServer from "../artifacts/mobile/server/serve.js";

test("every redirect alias preserves the full path and query without changing the primary or legacy host", () => {
  const path = "/web/articles/story-123?utm_source=friend&name=a%26b";
  for (const host of REDIRECT_HOSTS)
    assert.equal(domainRedirect(host, path), `${SITE_ORIGIN}${path}`);
  assert.equal(domainRedirect(new URL(SITE_ORIGIN).host, path), null);
  assert.equal(domainRedirect(new URL(LEGACY_ORIGIN).host, path), null);
  assert.equal(domainRedirect("theinnovatorsden.xyz.attacker.example", path), null);
});

test("canonical article, category, sitemap, metadata and share URLs agree", () => {
  assert.equal(siteUrl("/"), `${SITE_ORIGIN}/web/`);
  assert.equal(siteUrl("/topics/food-and-wine"), `${SITE_ORIGIN}/web/topics/food-and-wine`);
  assert.equal(siteUrl("/web/topics/Culture"), `${SITE_ORIGIN}/web/topics/Culture`);
  assert.equal(siteUrl("/sitemap.xml"), `${SITE_ORIGIN}/sitemap.xml`);
  assert.equal(articleUrl("id1"), `${SITE_ORIGIN}/web/articles/id1`);
  assert.equal(articleUrl("id1", "The Sword, the Storm, and the Prayer"),
    `${SITE_ORIGIN}/web/stories/the-sword-the-storm-and-the-prayer`);
  assert.equal(siteUrl(`${LEGACY_ORIGIN}/web/articles/id1?ref=x`), `${SITE_ORIGIN}/web/articles/id1?ref=x`);
  assert.equal(siteUrl("https://external.example/path"), "https://external.example/path");
  assert.deepEqual(normalizeSiteMetadata({ url: "https://theinnovatorsden.net/topics", items: ["https://theinnovatorsden.net/#organization"] }),
    { url: `${SITE_ORIGIN}/web/topics`, items: [`${SITE_ORIGIN}/web/#organization`] });
});

test("origin policy accepts the primary and old app, rejects lookalikes, and isolates previews", () => {
  for (const origin of [SITE_ORIGIN, LEGACY_ORIGIN, ...REDIRECT_HOSTS.map(host => `https://${host}`)])
    assert.equal(isAllowedOrigin(origin), true);
  for (const origin of ["https://evil.example", `${SITE_ORIGIN}.evil.example`, "null", `${SITE_ORIGIN}/page`])
    assert.equal(isAllowedOrigin(origin), false);
  assert.equal(isAllowedOrigin(undefined), true);
  assert.equal(isAllowedOrigin("https://preview.replit.dev", true), true);
  assert.equal(isAllowedOrigin("https://preview.replit.dev", false), false);
});

test("one API setting supports the primary, legacy and development API without duplicated /api", () => {
  assert.equal(resolveApiOrigin(), SITE_ORIGIN);
  assert.equal(resolveApiOrigin(`${LEGACY_ORIGIN}/api/`), LEGACY_ORIGIN);
  assert.equal(resolveApiOrigin("example.replit.dev"), "https://example.replit.dev");
  assert.equal(resolveApiOrigin("http://localhost:8080/api"), "http://localhost:8080");
  for (const value of ["https://example.com/path", "https://a:b@example.com", "http://example.com", "https://example.com?q=x"])
    assert.throws(() => resolveApiOrigin(value));
});

for (const [name, server] of [["web", createWebServer()], ["root/mobile", mobileServer]]) {
  test(`${name} production HTTP server sends actual 301 redirects with paths and queries intact`, async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    try {
      const port = server.address().port;
      for (const host of REDIRECT_HOSTS) {
        const response = await new Promise((resolve, reject) => {
          const request = http.get({ hostname: "127.0.0.1", port,
            path: "/web/articles/abc?x=1&next=%2Fweb%2Ftopics", headers: { host } }, response => {
            response.resume();
            response.on("end", () => resolve(response));
          });
          request.on("error", reject);
        });
        assert.equal(response.statusCode, 301);
        assert.equal(response.headers.location, `${SITE_ORIGIN}/web/articles/abc?x=1&next=%2Fweb%2Ftopics`);
      }
      const legacy = await new Promise((resolve, reject) => {
        http.get({ hostname: "127.0.0.1", port,
          path: name === "web" ? "/web/" : "/", headers: { host: new URL(LEGACY_ORIGIN).host } }, response => {
          response.resume(); response.on("end", () => resolve(response));
        }).on("error", reject);
      });
      assert.equal(legacy.statusCode, 200, "The legacy address must keep serving, not redirect");
    } finally { await new Promise(resolve => server.close(resolve)); }
  });
}
