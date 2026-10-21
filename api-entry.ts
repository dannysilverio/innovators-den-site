// Vercel's Node serverless entry. Never import src/index.ts: it starts timers,
// listens on a port, and runs the Replit-only launch import.
import app from "../artifacts/api-server/src/app";
export default app;
