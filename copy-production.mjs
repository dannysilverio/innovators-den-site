import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { targetPool, assertEmpty } from "./target-db.mjs";
const mode = process.argv[2];
if (!["export", "restore"].includes(mode)) throw new Error("Choose export or restore");
const file = "private-data/production.dump";
if (mode === "export") {
  if (!process.env.SOURCE_DATABASE_URL) throw new Error("SOURCE_DATABASE_URL is required");
  mkdirSync("private-data", { recursive: true, mode: 0o700 });
  const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--no-acl", `--file=${file}`,
    "--dbname", process.env.SOURCE_DATABASE_URL], {
    env: { ...process.env,
      PGOPTIONS: "-c default_transaction_read_only=on -c statement_timeout=0" },
    stdio: "inherit",
  });
  if (result.error || result.status !== 0) throw new Error("Read-only export failed. Check local PostgreSQL client and source access.");
} else {
  const pool = targetPool(), client = await pool.connect();
  try { await assertEmpty(client); } finally { client.release(); await pool.end(); }
  const result = spawnSync("pg_restore", ["--no-owner", "--no-acl", "--exit-on-error", "--single-transaction", "--dbname", process.env.TARGET_DATABASE_URL, file], { stdio: "inherit" });
  if (result.error || result.status !== 0) throw new Error("Restore failed");
}
