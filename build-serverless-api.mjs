import { createRequire } from "node:module";
const require = createRequire(new URL("../artifacts/api-server/package.json", import.meta.url));
const { build } = require("esbuild");
const manifest = require("./package.json");
await build({
  entryPoints: ["artifacts/api-server/src/app.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "artifacts/api-server/dist/vercel-app.mjs",
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
  external: [...Object.keys(manifest.dependencies).filter(name => !name.startsWith("@workspace/")), "pg"],
});
console.log("Production serverless API bundle built from app.ts.");
