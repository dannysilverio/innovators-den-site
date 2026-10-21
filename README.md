# Category merge update

Dining has been merged into **Food & Wine**, sub-brand **Brindis**. The source,
seed and restored-database migration include this update. Read
`CATEGORY_MERGE.md` before migrating an existing database.

# The Innovators Den: website migration pack

Fresh development source for the website, Express API, shared libraries, local
article images and scripts. No credentials, production database dump, user rows,
Expo app, dependencies or build outputs belong in this export.

The canonical site is **https://theinnovatorsden.net/web/**. The 12 Den originals
are included with full text, images and video metadata. Food & Wine, Brindis,
all 13 requested sub-brands and the em dash safeguards are included.

## Deploying person: start here

1. Use Node 22 and pnpm 10.26.1. Keep this folder as the Vercel project root,
   not `artifacts/web`. Run `pnpm install --frozen-lockfile`.
2. Provision a **new** managed Postgres database. Follow `DATABASE_MIGRATION.md`.
   Choose either an empty editorial-only database or a complete read-only
   production copy. Do not point these migration tools at Replit.
3. Set the required environment variable names listed in `ENVIRONMENT.md` in
   Vercel. Supply your own values securely. No existing values are supplied.
4. Run `pnpm verify`, then `pnpm build`. The Vercel framework setting is **Other**;
   `vercel.json` defines the install/build commands, output, API, routing and cron.
5. Deploy to a private/protected Vercel preview first. Test `/api/healthz`, feeds,
   search, admin login/editing, account saves, all 12 story readers, both video
   players and `/sitemap.xml`. Physical playback and real provider credentials
   require the deployer's tests.
6. Only after the owner approves cutover, attach `.net`, `.xyz`, `.online` and
   each `www` hostname to Vercel. Copy Vercel's exact DNS records into Namecheap
   and wait for HTTPS. Do not change or shut down Replit as part of preparation.

## Serverless behavior

- `api/[...path].js` exports the Express bundle built from `src/app.ts`, with a
  Node 22 build target. It does not listen on a port,
  seed stories on startup, or start the Replit scheduler.
- SPA fallback explicitly excludes `/api`, `/assets` and `/web/assets`.
  Original article images are static assets, not Express file responses.
- Five alias hostnames issue real 301s to `.net` with path/query preserved.
  The primary root redirects to `/web/`.
- `/api/cron/rss` requires Vercel's Bearer cron secret and is called every minute.
  Postgres tracks hourly work beginning at :03. Each invocation processes a
  resumable batch from the unchanged 136-source catalogue. Backlogged hours finish
  before newer hours. No in-process RSS timer is used.
- `/api/cron/maintenance` handles idle room cleanup every minute and trend scores
  once per half hour, also with database locks. Both cron routes await their work.
- The website's feed-card API is paginated to avoid Vercel's response limit.
  `limit` is at most 500; `offset` and `X-Next-Offset` support continuation.
  Originals are included alongside the initial feed. Full article bodies remain
  on the individual article endpoint. Admin requests complete bodies for Den
  originals explicitly.
- Original publishing/editing and moderation now enforce the existing admin JWT
  in this exported copy. Public non-Den submissions retain their old path.

## Important limits and launch checks

- Minute-level Cron needs a Vercel plan supporting that schedule; Hobby's daily
  restriction is not sufficient. Functions have a 300-second configured ceiling.
  Monitor cron errors/backlog and adjust batch size or move ingestion to a
  managed queue/worker if workloads cannot keep up. Cron delivery is best effort.
- Vercel cannot host a persistent WebSocket/media server or store large uploaded
  videos on its filesystem. Existing videos use approved external players/hosts.
  New large video uploads need durable object storage/CDN and direct uploads.
- Stripe uses standard Stripe configuration, not Replit connectors. Verify the
  new webhook endpoint and raw-body signature checks with Stripe test events.
  Resend sender-domain verification and any Google/Apple provider configuration
  need separate account setup. No provider settings were changed here.
- Existing production RSS connectivity/source failures are not repaired by
  changing hosts. Verify source success rates and database health on the target.
- Existing unrelated full-project type-check errors remain. Website production
  build, serverless bundling and export verification are separate checks; do not
  represent this as a complete functional/security audit.
- Browser sessions/localStorage do not move between hostnames. Account-backed
  saves require signing in again; anonymous browser-only saves need an explicitly
  designed transfer, or users can keep using the old Replit address.
- The existing mobile app continues using Replit. This website-only pack does
  not synchronize writes between the old and new databases after cutover.
- The existing reset email points to `/reset-password`, but the website router
  has no password-reset screen. Implement that screen before enabling a
  website-only password-reset journey; it is an existing product gap, not a
  Vercel runtime limitation.
- Historical Replit post-merge and billing-provisioning helpers are reference
  source only. They are not Vercel initialization steps. The old mixed schema/demo
  seed script is deliberately disabled in this export.

Nothing in this pack has been published, no domain has been changed, and no
production database migration/export has been run.
