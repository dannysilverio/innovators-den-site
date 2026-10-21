import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { targetPool, assertEmpty } from "./target-db.mjs";
const restored = process.argv.includes("--restored");
if (!restored && !process.argv.includes("--empty")) throw new Error("Choose --empty or --restored");
const pool = targetPool(), client = await pool.connect();
try {
  if (!restored) await assertEmpty(client);
  await client.query("BEGIN");
  await client.query("CREATE TABLE IF NOT EXISTS app_migration_history(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
  const files = readdirSync("migrations").filter(name => name.endsWith(".sql")).sort();
  for (const name of files) {
    if (restored && name.startsWith("0000")) continue;
    const sql = readFileSync(`migrations/${name}`, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const prior = await client.query("SELECT checksum FROM app_migration_history WHERE name=$1", [name]);
    if (prior.rows.length) {
      if (prior.rows[0].checksum !== checksum) throw new Error(`Previously applied migration changed: ${name}`);
      continue;
    }
    await client.query(sql);
    await client.query("INSERT INTO app_migration_history(name,checksum) VALUES($1,$2)", [name, checksum]);
    console.log(`Applied ${name}`);
  }
  await client.query("COMMIT");
} catch (error) { await client.query("ROLLBACK"); throw error; }
finally { client.release(); await pool.end(); }
