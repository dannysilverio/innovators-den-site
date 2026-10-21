// Optional offline verification. Requires local PostgreSQL command-line tools.
// Creates a private temporary cluster with NO TCP listener, never a configured DB.
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
const temp = mkdtempSync(join(tmpdir(), "den-migration-check-"));
const port = 54000 + process.pid % 1000;
const baseEnv = { PATH: process.env.PATH, HOME: process.env.HOME };
function run(command, args, env = baseEnv) {
  const result = spawnSync(command, args, { env, encoding: "utf8" });
  if (result.error || result.status !== 0) throw new Error(`${command} failed\n${result.stderr || result.error}`);
  return result.stdout;
}
const url = db => `postgresql://${encodeURIComponent(userInfo().username)}@localhost/${db}?host=${encodeURIComponent(temp)}&port=${port}`;
function script(name, args, extra) {
  return run(process.execPath, [`scripts/${name}`, ...args], { ...baseEnv, ...extra });
}
let started = false, source, clone, admin, httpServer;
try {
  run("initdb", ["-D", join(temp, "data"), "--auth=trust", "--no-locale", "-E", "UTF8"]);
  run("pg_ctl", ["-D", join(temp, "data"), "-l", join(temp, "postgres.log"),
    "-o", `-k ${temp} -h '' -p ${port}`, "-w", "start"]);
  started = true;
  admin = new pg.Pool({ host: temp, port, database: "postgres", user: userInfo().username });
  await admin.query("CREATE DATABASE den_source");
  await admin.query("CREATE DATABASE den_clone");
  const targetEnv = { TARGET_DATABASE_URL: url("den_source") };
  script("migrate-target.mjs", ["--empty", "--confirm-new-target"], targetEnv);
  script("seed-originals.mjs", ["--confirm-new-target"], targetEnv);
  const second = JSON.parse(script("seed-originals.mjs", ["--confirm-new-target"], targetEnv).trim());
  assert.equal(second.originalsInserted, 0);
  assert.equal(second.originalsAlreadyPresent, 12);
  source = new pg.Pool({ host: temp, port, database: "den_source", user: userInfo().username });
  const fixtureUser = randomUUID();
  await source.query("INSERT INTO users(id,device_id,display_name) VALUES($1,$2,$3)",
    [fixtureUser, "migration-fixture-device", "Migration fixture"]);
  await source.query("INSERT INTO auth_identities(id,user_id,provider,provider_id,password_hash) VALUES($1,$2,$3,$4,$5)",
    [randomUUID(), fixtureUser, "email", "migration@example.invalid", "not-a-real-password-hash"]);
  const original = JSON.parse(readFileSync("data/editorial-seed.json", "utf8")).originals[0];
  const external = { ...original, id: randomUUID(), title: "RSS migration fixture", source_name: "RSS fixture",
    source_url: "https://example.invalid/migration-fixture" };
  await source.query("INSERT INTO articles SELECT * FROM jsonb_populate_record(NULL::articles,$1::jsonb)", [JSON.stringify(external)]);
  script("copy-production.mjs", ["export"], { SOURCE_DATABASE_URL: url("den_source") });
  const copyEnv = { SOURCE_DATABASE_URL: url("den_source"), TARGET_DATABASE_URL: url("den_clone") };
  script("copy-production.mjs", ["restore", "--confirm-new-target"], copyEnv);
  script("migrate-target.mjs", ["--restored", "--confirm-new-target"], copyEnv);
  script("seed-originals.mjs", ["--confirm-new-target"], copyEnv);
  clone = new pg.Pool({ host: temp, port, database: "den_clone", user: userInfo().username });
  const tables = await source.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  for (const { tablename } of tables.rows) {
    assert.match(tablename, /^[a-z_][a-z_0-9]*$/);
    const left = await source.query(`SELECT count(*)::int AS n FROM "${tablename}"`);
    const right = await clone.query(`SELECT count(*)::int AS n FROM "${tablename}"`);
    assert.equal(right.rows[0].n, left.rows[0].n, tablename);
  }
  assert.equal((await clone.query("SELECT count(*)::int AS n FROM articles")).rows[0].n, 13);
  assert.equal((await clone.query("SELECT count(*)::int AS n FROM users")).rows[0].n, 1);
  assert.equal((await clone.query("SELECT password_hash FROM auth_identities WHERE user_id=$1", [fixtureUser])).rows[0].password_hash, "not-a-real-password-hash");
  // Exercise a restored database with both retired and canonical preferences.
  await clone.query("INSERT INTO categories(slug,name) VALUES('dining','Dining')");
  await clone.query("UPDATE articles SET topic='Dining',tags=ARRAY['dining','culture'] WHERE id=$1", [external.id]);
  await clone.query("UPDATE users SET topic_preferences=ARRAY['Music','Dining','Food & Wine','Travel'] WHERE id=$1", [fixtureUser]);
  await clone.query("INSERT INTO user_notification_prefs(user_id,topic,notify_stories,notify_events) VALUES($1,'Dining',true,false),($1,'Food & Wine',false,true),($1,'Sports',false,false)", [fixtureUser]);
  await clone.query("INSERT INTO user_interest_profiles(user_id,topic,score,interaction_count) VALUES($1,'Dining',0.6,5),($1,'Food & Wine',0.7,8),($1,'Sports',0.25,2)", [fixtureUser]);
  await clone.query("INSERT INTO follows(user_id,target_type,target_id) VALUES($1,'topic','Dining'),($1,'topic','food-and-wine'),($1,'topic','Music')", [fixtureUser]);
  await clone.query("INSERT INTO user_preference_vectors(user_id,vertical_scores,tag_scores) VALUES($1,$2::jsonb,$3::jsonb)",
    [fixtureUser, '{"Dining":3,"Food & Wine":2,"Music":7}', '{"dining":5,"food-and-wine":2,"art":4}']);
  const untouchedInterest = (await clone.query("SELECT * FROM user_interest_profiles WHERE user_id=$1 AND topic='Sports'", [fixtureUser])).rows[0];
  const mergeSql = readFileSync("migrations/0004_merge_dining.sql", "utf8");
  const mergeClient = await clone.connect();
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      await mergeClient.query("BEGIN");
      await mergeClient.query(mergeSql);
      await mergeClient.query("COMMIT");
    }
    assert.deepEqual((await mergeClient.query("SELECT pg_temp.den_topic_json($1::jsonb,'targeting') AS data",
      ['{"topics":["Dining","Sports","Sports"],"title":"Dining"}'])).rows[0].data,
      { topics: ["Food & Wine", "Sports", "Sports"], title: "Dining" });
  } finally { mergeClient.release(); }
  assert.equal((await clone.query("SELECT count(*)::int n FROM categories")).rows[0].n, 13);
  assert.deepEqual((await clone.query("SELECT topic_preferences FROM users WHERE id=$1", [fixtureUser])).rows[0].topic_preferences,
    ["Music", "Food & Wine", "Travel"]);
  const preferences = (await clone.query("SELECT * FROM user_notification_prefs WHERE user_id=$1", [fixtureUser])).rows;
  assert.equal(preferences.length, 2);
  assert.ok(preferences.find(row => row.topic === "Food & Wine").notify_stories);
  assert.ok(preferences.find(row => row.topic === "Food & Wine").notify_events);
  const interest = (await clone.query("SELECT * FROM user_interest_profiles WHERE user_id=$1 AND topic='Food & Wine'", [fixtureUser])).rows[0];
  assert.equal(interest.score, 1);
  assert.equal(interest.interaction_count, 13);
  assert.deepEqual((await clone.query("SELECT * FROM user_interest_profiles WHERE user_id=$1 AND topic='Sports'", [fixtureUser])).rows[0], untouchedInterest);
  assert.deepEqual((await clone.query("SELECT target_id FROM follows WHERE user_id=$1 ORDER BY target_id", [fixtureUser])).rows.map(row => row.target_id), ["Music", "food-and-wine"]);
  const vectors = (await clone.query("SELECT * FROM user_preference_vectors WHERE user_id=$1", [fixtureUser])).rows[0];
  assert.deepEqual(vectors.vertical_scores, { "Food & Wine": 5, Music: 7 });
  assert.deepEqual(vectors.tag_scores, { "food-and-wine": 7, art: 4 });
  // Completely isolated runtime configuration. These are synthetic test strings,
  // not credentials for any deployment.
  process.env.DATABASE_URL = url("den_clone");
  process.env.JWT_SECRET = "temporary-migration-test-signing-key";
  process.env.ADMIN_TOKEN = "temporary-migration-test-admin";
  process.env.CRON_SECRET = "temporary-migration-test-cron";
  process.env.NODE_ENV = "production";
  process.env.LOG_LEVEL = "silent";
  const app = (await import("../artifacts/api-server/dist/vercel-app.mjs")).default;
  httpServer = await new Promise(resolve => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
  const origin = `http://127.0.0.1:${httpServer.address().port}`;
  const legacyLink = await fetch(origin + "/web/topics/Dining?keep=yes", { redirect: "manual" });
  assert.equal(legacyLink.status, 301);
  assert.equal(legacyLink.headers.get("location"), "/web/topics/food-and-wine?keep=yes");
  const legacyArticles = await (await fetch(origin + "/api/articles?topic=Dining&status=approved")).json();
  assert.ok(legacyArticles.some(row => row.id === external.id));
  assert.ok(legacyArticles.every(row => row.topic === "Food & Wine"));
  assert.equal((await fetch(origin + "/api/healthz")).status, 200);
  assert.equal((await fetch(origin + "/api/cron/rss")).status, 401);
  assert.equal((await fetch(origin + "/api/cron/maintenance", { headers: { Authorization: "Bearer incorrect" } })).status, 401);
  const slot = `rss:${new Date(Date.now() - 3 * 60_000).toISOString().slice(0, 13)}`;
  const feedCatalog = await (await fetch(origin + "/api/admin/feeds")).json();
  assert.ok(Array.isArray(feedCatalog));
  await clone.query("INSERT INTO den_job_runs(job_key,cursor) VALUES($1,$2)", [slot, feedCatalog.length]);
  const cronResult = await fetch(origin + "/api/cron/rss", { headers: { Authorization: "Bearer temporary-migration-test-cron" } });
  assert.equal(cronResult.status, 200);
  assert.equal((await cronResult.json()).completed, true);
  assert.equal((await fetch(origin + "/api/articles/" + original.id, { method: "PATCH",
    headers: { "Content-Type": "application/json" }, body: "{}" })).status, 401);
  assert.equal((await fetch(origin + "/api/articles/" + original.id, { method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-token": "temporary-migration-test-admin" },
    body: JSON.stringify({ title: "Rejected punctuation \u2014 fixture" }) })).status, 400);
  const fixture = JSON.parse(readFileSync("data/editorial-seed.json", "utf8"));
  for (const story of fixture.originals) {
    const response = await fetch(origin + "/api/articles/" + story.id);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.content, story.content, story.title);
    assert.equal(result.videoUrl, story.video_url);
    assert.equal(result.topic, story.topic);
  }
  const cards = await (await fetch(origin + "/api/articles?status=approved")).json();
  assert.equal(cards.filter(story => story.sourceName === "The Innovators Den").length, 12);
  assert.equal(cards.length, 13);
  assert.ok(cards.every(story => story.content === null));
  const full = await (await fetch(origin + "/api/articles?sourceName=The%20Innovators%20Den&includeContent=1")).json();
  assert.equal(full.length, 12);
  assert.ok(full.every(story => story.content.length > 1000));
  const cors = await fetch(origin + "/api/healthz", { headers: { Origin: "https://theinnovatorsden.net" } });
  assert.equal(cors.headers.get("access-control-allow-origin"), "https://theinnovatorsden.net");
  console.log(JSON.stringify({ schemaTables: tables.rows.length, repeatSeed: "PASS",
    readOnlyExportRestore: "PASS", externalArticleAndUserPreserved: true,
    fullArticleReaders: 12, rssSources: feedCatalog.length, apiAndCronAuthorization: "PASS",
    categoryMergeAndRepeatRun: "PASS", legacyCategoryLinksAndFilters: "PASS" }));
} finally {
  if (httpServer) await new Promise(resolve => httpServer.close(resolve));
  await source?.end(); await clone?.end(); await admin?.end();
  if (started) run("pg_ctl", ["-D", join(temp, "data"), "-m", "immediate", "-w", "stop"]);
}
