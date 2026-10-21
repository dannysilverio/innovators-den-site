# Custom domain preparation

These are staged code changes, not a publication or DNS change. No production
database operation is part of domain preparation.

## Address layout

- Public website: `https://theinnovatorsden.net/web/`
- API: `https://theinnovatorsden.net/api`
- Sitemap: `https://theinnovatorsden.net/sitemap.xml`
- Robots and AI information: `/robots.txt`, `/llms.txt`
- Existing `/web/...` article/category URLs remain the same paths.
- Earlier `/articles/...`, `/topics/...`, `/stories/...` share links redirect to
  their `/web/...` equivalents.
- The primary domain's root opens the website; Expo manifest requests retain
  their behavior. The original `.replit.app` hostname is not redirected or
  removed.

The app does not currently publish an outgoing RSS XML feed. Its incoming RSS
ingestion and JSON article/feed APIs remain in place. The sitemap lists both
approved RSS content and Den originals, including every category. The previous
5,000-article sitemap cap has been removed.

## Production domain setup (manual, only when publishing is authorized)

1. In Replit Publishing > Domains, add all six hostnames to the **same existing
   deployment**:
   - `theinnovatorsden.net`, `www.theinnovatorsden.net`
   - `theinnovatorsden.xyz`, `www.theinnovatorsden.xyz`
   - `theinnovatorsden.online`, `www.theinnovatorsden.online`
2. At Namecheap, copy the exact DNS records Replit displays for each hostname.
   Do not guess an IP or TXT verification value. Remove only conflicting records
   for those hosts. Keep verification TXT records for TLS renewal.
3. Wait for verification and HTTPS certificates for **every** hostname. The
   redirecting hostnames need valid HTTPS too.
4. Do not also configure competing Namecheap URL redirects. These code changes
   supply real HTTP 301s from the five aliases above to `.net`, preserving the
   entire path and query string. The web production service is now a Node server
   because a static SPA cannot issue these host-dependent HTTP redirects.
5. Select `.net` as primary if the Domains UI offers that setting. Application
   canonical/share/sitemap URLs already consistently use `.net`.
6. Publish only after explicit authorization, the pending content/schema
   decisions below, and the DNS/HTTPS checks. None of those live operations
   has been performed by this change.

Replit does not automatically redirect separate attached custom domains; these
redirects depend on the new server build being published and each hostname
being routed to it.

## Mobile compatibility reference (not a website launch prerequisite)

The current scope is website-first: website, API, RSS, and domain/redirect setup.
Leave Expo as it is and do no new mobile work beyond preventing breakage.
The settings below document existing work, not required mobile rollout tasks.

Every mobile API call now uses `constants/network.ts`.

- Development uses the existing `EXPO_PUBLIC_DOMAIN` development address.
- Release builds default to `https://theinnovatorsden.net`.
- `EXPO_PUBLIC_API_URL` is the optional build-time override. It accepts an origin
  with HTTPS, with or without a trailing `/api`. For rollback it can point to
  the existing `.replit.app` origin.
- Rebuild mobile bundles/binaries when changing this public setting. Existing
  mobile builds pointing at `.replit.app` continue using that address.
- The API allows the new domains and the verified existing app origin. Native
  requests without an Origin header remain accepted. Preview origins are allowed
  only in development. Existing JWT/account/bookmark endpoints are unchanged.

## RSS scheduling

No RSS sources, keyword rules, article categories, ingestion timing or existing
article/user records were changed. The API still starts the existing ingestion
scheduler, which ingests hourly at :03 Eastern; its trend-score worker still
runs every 30 minutes.

The current published deployment is **Autoscale**. In-process timers are not a
reliable always-on schedule when an Autoscale deployment sleeps. Before relying
on uninterrupted scheduled ingestion, explicitly choose an always-running
Reserved VM for this deployment, or implement a separate scheduled worker with
appropriate concurrency protection. Domain attachment by itself does not solve
this existing hosting limitation. No live hosting settings were changed.

Existing production logs also showed RSS insert failures caused by database
connection timeouts. Development logs showed some upstream feeds returning 403
or invalid XML. This work did not alter those sources or investigate/fix the
production database. Verify ingestion health before calling the launch ready.

## Existing content and storage prerequisites

- Domain attachment must reuse the existing deployment and database, not create
  a new database or replace RSS inventory.
- The development-only video columns, categories table and exact category
  sub-brand seeds need an approved additive production schema/data rollout
  before these unreleased features can run there. Do not run a broad schema push
  to resolve unrelated existing schema drift.
- The guarded original-story import is still the fixed ten approved launch
  originals. Nikka and La Fête remain development-only and excluded until the
  user explicitly approves their production inclusion.
- DNS cannot share browser cookies or localStorage between `.replit.app` and
  `.net`. Web users need to sign in again. Account-backed saved stories remain
  in the same database. Device-only/anonymous bookmarks and IDs in browser
  storage do **not** automatically transfer to a new hostname. Native-device
  storage is unaffected. Do not promise automatic browser-storage migration;
  keep the old hostname available so anonymous readers retain access there.

## Verification commands

`node --test tests/custom-domain.test.mjs`

This checks exact domain allowlists, canonical path consistency, API-base
normalization, and real 301 responses from both production HTTP servers.
Development API and sitemap requests verify both originals, videos and RSS are
still served. Production DNS, HTTPS, scheduled uptime and physical-device
release networking can only be verified after the authorized live setup.
Web and API builds and shared-library type checking passed. Full web/mobile
type checks still report existing unrelated issues; these checks are not clean.
