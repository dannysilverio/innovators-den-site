# Verification

## Passed locally

- Frozen dependency install for the exported workspace.
- Website production build and production Node-targeted serverless API bundle.
- Shared-library TypeScript checks.
- Empty Postgres schema creation through the supplied migration runner.
- Seeding all 12 complete originals, 13 categories and 13 exact sub-brands.
- A repeated seed inserted zero duplicate originals.
- Read-only pg_dump followed by pg_restore into a different empty database.
- Counts matched across 48 schema tables in the isolated test, including a
  synthetic external article, user and login identity/password-hash record.
- Target-only additive upgrade after restoration.
- Actual exported API returned the exact full body for every one of the
  12 originals, preserving categories and video fields.
- Bounded feed cards retained all 12 originals beside external content.
- Admin full-body article listing returned all 12 complete originals.
- Unauthorized cron and article-edit requests were rejected.
- Authorized edits containing an em dash were rejected without changing stories.
- Authorized cron authentication and persistent progress completion.
- CORS accepted the primary `.net` origin.
- Runtime feed catalogue contained 136 sources.
- Editorial scan found zero em dashes in titles, summaries/subtitles, bodies
  and video captions across all 12 originals.
- Redirect definitions specify 301s; SPA matching excludes API/static paths.
- Current Replit website preview still rendered. No running service was restarted.

## Not represented as verified

- A real Vercel deployment, domain attachment, DNS, SSL or provider account setup.
- A production database export, migration or comparison. None was run.
- Third-party video playback on physical devices or all RSS publishers' availability.
- All website journeys, password reset, payments, email delivery or an end-to-end
  security audit.
- Node 22 deployment behavior on Vercel itself. Local checks ran on Node 24 with
  PostgreSQL 16; the API bundle targets Node 22 and the Vercel project requests it.

Existing optional-expression/chunk-size build warnings remain. The local smoke
test may log an idle database connection closing when its temporary Postgres
cluster is stopped; this does not involve the application's real database.

To repeat the export checks:

```
pnpm verify
pnpm build
node scripts/smoke-migrations.mjs
```

The last command requires local PostgreSQL tools and creates only a private
temporary cluster with no TCP listener. It never uses the configured real
application database. Its synthetic dump stays in ignored `private-data/`;
that directory is excluded from the delivered zip.

## Category merge verification

The development-only merge moved 468 article category assignments, removed the
retired category, and retained Food & Wine / Brindis and 13 active categories.
An atomic comparison confirmed all unrelated article categories and category
names/sub-brands were unchanged. No live production database was accessed.

Disposable restored-database tests passed for repeated merges, duplicate follows,
notification opt-in preservation, combined affinity scores, untouched unrelated
preferences, legacy topic filters and query-preserving 301 category links.
Raw webhook bytes are excluded from JSON category normalization.
