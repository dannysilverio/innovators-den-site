import { readFileSync } from "node:fs";
import { targetPool } from "./target-db.mjs";
const seed = JSON.parse(readFileSync("data/editorial-seed.json", "utf8"));
if (seed.originals.length !== 12 || seed.categories.filter(c => c.sub_brand).length !== 13) throw new Error("Editorial seed inventory mismatch");
for (const story of seed.originals) {
  if (story.source_name !== "The Innovators Den" || story.content.length < 1000 ||
      [story.title, story.summary, story.content].some(text => /\u2014/.test(text))) throw new Error("Invalid original story in seed");
}
if (seed.categories.some(c => c.slug.toLowerCase() === "dining" || c.name.toLowerCase() === "dining") || seed.originals.some(s => s.topic.toLowerCase() === "dining")) throw new Error("Seed contains a retired category");
const pool = targetPool(), client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(719013,3)");
  for (const category of seed.categories) {
    await client.query("INSERT INTO categories(slug,name,sub_brand) VALUES($1,$2,$3) ON CONFLICT(slug) DO UPDATE SET name=excluded.name,sub_brand=excluded.sub_brand",
      [category.slug, category.name, category.sub_brand]);
  }
  let inserted = 0, skipped = 0;
  for (const story of seed.originals) {
    const existing = await client.query("SELECT id,source_name FROM articles WHERE id=$1 OR lower(btrim(title))=lower(btrim($2)) OR source_url=$3 FOR UPDATE",
      [story.id, story.title, story.source_url]);
    if (existing.rows.length > 1 || existing.rows.some(row => row.source_name !== "The Innovators Den"))
      throw new Error(`Article collision; nothing will be overwritten: ${story.title}`);
    if (existing.rows.length) { skipped++; continue; }
    await client.query("INSERT INTO articles SELECT * FROM jsonb_populate_record(NULL::articles,$1::jsonb)", [JSON.stringify(story)]);
    inserted++;
  }
  await client.query("COMMIT");
  console.log(JSON.stringify({ categories: seed.categories.length, subBrands: 13, originalsInserted: inserted, originalsAlreadyPresent: skipped }));
} catch (error) { await client.query("ROLLBACK"); throw error; }
finally { client.release(); await pool.end(); }
