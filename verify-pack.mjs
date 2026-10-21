import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
const read = path => readFileSync(path, "utf8");
const seed = JSON.parse(read("data/editorial-seed.json"));
const config = JSON.parse(read("vercel.json"));
const brands = {
  Innovation: "Brain Trust", Art: "Frame Room", Culture: "The Stoop", Music: "Tarima",
  "Business Growth": "The Margin", Sports: "Walk-Off", "Food & Wine": "Brindis",
  Health: "Second Wind", Travel: "Carry-On Culture", Astrology: "Rising Sign",
  Law: "Counsel Hour", Finance: "Capital Cipher", Spotlight: "The Debut",
};
assert.equal(seed.originals.length, 12);
assert.equal(new Set(seed.originals.map(story => story.id)).size, 12);
for (const [name, brand] of Object.entries(brands))
  assert.equal(seed.categories.find(category => category.name === name)?.sub_brand, brand);
let emDashes = 0;
for (const story of seed.originals) {
  assert.equal(story.source_name, "The Innovators Den");
  assert.equal(story.status, "approved");
  assert.ok(story.content.length > 1000, story.title);
  assert.ok(story.created_at);
  for (const key of ["title", "subtitle", "summary", "content", "video_caption"])
    emDashes += (String(story[key] ?? "").match(/\u2014/g) || []).length;
  assert.ok(story.source_url.startsWith("https://theinnovatorsden.net/web/"));
  if (story.image_url?.startsWith("https://theinnovatorsden.net/api/assets/"))
    assert.ok(existsSync("artifacts/api-server/assets/" + story.image_url.split("/api/assets/")[1]), story.image_url);
}
assert.equal(emDashes, 0);
for (const [title, id] of [
  ["The Man Who Carried Scotland Home", "EvIzC2rzc6Y"],
  ["Every Bottle a Magnum", "ERw8wzVpuCU"],
]) {
  const story = seed.originals.find(row => row.title === title);
  assert.equal(story.topic, "Food & Wine");
  assert.ok(story.video_url.endsWith(id));
  assert.ok(story.video_caption);
}
for (const title of ["The Sword, the Storm, and the Prayer", "For My Father, On His Birthday"])
  assert.equal(seed.originals.find(row => row.title === title).topic, "Culture");
const fallback = config.rewrites.at(-1);
const matcher = new RegExp("^" + fallback.source + "$");
for (const path of ["/api/articles", "/api/cron/rss", "/api", "/assets/main.js", "/web/assets/main.js"])
  assert.equal(matcher.test(path), false, `SPA must exclude ${path}`);
for (const path of ["/web/articles/fixture", "/web/topics/Culture", "/web/search"])
  assert.equal(matcher.test(path), true);
assert.equal(config.redirects.filter(row => row.has).length, 5);
for (const redirect of config.redirects) assert.equal(redirect.statusCode, 301);
assert.equal(config.crons.length, 2);
assert.ok(readdirSync("migrations").some(name => /^0000.*\.sql$/.test(name)));
assert.ok(read("api/[...path].js").includes("dist/vercel-app.mjs"));
assert.ok(read("scripts/build-serverless-api.mjs").includes('src/app.ts"'));
assert.ok(!read("scripts/build-serverless-api.mjs").includes('src/index.ts"'));
assert.ok(read("artifacts/api-server/src/routes/articles.ts").includes('router.patch("/articles/:id", requireAdmin'));
assert.ok(read("artifacts/web/src/pages/Admin.tsx").includes("includeContent=1"));
console.log(JSON.stringify({ originals: 12, subBrands: 13, emDashes, newVideoStories: 2, redirects: 5, cronJobs: 2, result: "PASS" }));
