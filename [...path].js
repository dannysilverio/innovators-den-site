// Vercel's Node function uses the API bundle produced by pnpm build.
// That bundle starts at src/app.ts, never the listening/scheduling src/index.ts.
import app from "../artifacts/api-server/dist/vercel-app.mjs";
export default app;
