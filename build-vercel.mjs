import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
const api = spawnSync(process.execPath, ["scripts/build-serverless-api.mjs"], { stdio: "inherit" });
if (api.status !== 0) process.exit(api.status || 1);
const result = spawnSync("pnpm", ["--filter", "@workspace/web", "run", "build"], { stdio: "inherit", env: { ...process.env, BASE_PATH: "/web/" } });
if (result.status !== 0) process.exit(result.status || 1);
// Only this generated output directory is replaced. Source and databases are untouched.
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
cpSync("artifacts/web/dist/public", "dist", { recursive: true });
cpSync("artifacts/web/dist/public", "dist/web", { recursive: true });
cpSync("artifacts/api-server/assets", "dist/article-assets", { recursive: true });
