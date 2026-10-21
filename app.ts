import { canonicalCategoryInputs } from "./lib/category-aliases";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";
import { securityHeaders, apiRateLimit } from "./middleware/security";
import { domainRedirect, isAllowedOrigin } from "@workspace/api-zod/site-domain";

const app: Express = express();

// Replit (and most hosting providers) sit behind a reverse proxy that
// adds X-Forwarded-For.  Without trust proxy = 1, express-rate-limit
// throws a ValidationError on every request and the response never arrives.
app.set("trust proxy", 1);
app.use((req, res, next) => {
  const location = domainRedirect(req.get("x-forwarded-host") || req.get("host"), req.originalUrl);
  if (location) { res.redirect(301, location); return; }
  next();
});

// Security headers on every response
app.use(securityHeaders);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          // Strip query string to avoid leaking tokens or PII
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin(origin, callback) {
    const preview = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
    callback(null, isAllowedOrigin(origin, process.env.NODE_ENV !== "production") || origin === preview);
  },
  credentials: true,
}));
app.use("/api/checkout/webhook", (req, res, next) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) { res.status(503).json({ error: "Webhook verification is not configured" }); return; }
  if (!req.get("stripe-signature")) { res.status(400).json({ error: "Missing Stripe signature" }); return; }
  next();
}, express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", canonicalCategoryInputs);

// Serve locally stored article images (photos uploaded for original Den content)
// Must be under /api/ so Replit's proxy routes these requests to this server.
app.use("/api/assets", express.static(fileURLToPath(new URL("../assets/", import.meta.url))));

// General rate limiting on all API routes
app.use("/api", apiRateLimit);
app.use("/api", router);

export default app;
