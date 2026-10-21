import pg from "pg";
export function targetPool() {
  if (!process.argv.includes("--confirm-new-target")) throw new Error("Refusing database work without --confirm-new-target");
  if (!process.env.TARGET_DATABASE_URL) throw new Error("TARGET_DATABASE_URL is required. DATABASE_URL is deliberately not used by migration tools.");
  const target = new URL(process.env.TARGET_DATABASE_URL);
  if (process.env.SOURCE_DATABASE_URL) {
    const source = new URL(process.env.SOURCE_DATABASE_URL);
    const sameHost = source.hostname.replace("-pooler.", ".") === target.hostname.replace("-pooler.", ".");
    if (sameHost && source.pathname === target.pathname) throw new Error("Source and target must be different databases");
  }
  return new pg.Pool({ connectionString: process.env.TARGET_DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 });
}
export async function assertEmpty(client) {
  const { rows } = await client.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
  if (rows[0].n) throw new Error("Target is not empty. Refusing to overwrite it.");
}
