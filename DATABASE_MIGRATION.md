# Retired category compatibility

The migration sequence now includes `0004_merge_dining.sql`. After a database
restore, run the target migrations before the seed so old articles, RSS category
values, follows and preferences are merged into Food & Wine without duplicates.
See `CATEGORY_MERGE.md`. This is for the new target, not live Replit production.

# Database migration and data preservation

No database migration, production dump or production query was performed to
build this pack. Only the 12 development editorial rows and category metadata
were read for `data/editorial-seed.json`.

All commands below are for the person deploying, after choosing a **new target**.
Use secure environment settings. Never paste database credentials into scripts,
chat, source control or the zip.

## A. Empty database containing only the editorial launch content

Set TARGET_DATABASE_URL for a new empty Postgres, then from this folder:

```
pnpm db:migrate
pnpm db:seed
```

`migrations/0000_*.sql` is generated offline from the current Drizzle schema.
It creates the full modeled application schema, not just articles. The following
migrations add serverless job tracking, additive model reconciliation and legacy
SQL-created objects found in a read-only development schema inventory.

The seed is transactional and repeatable. It inserts 13 category records,
13 exact nonempty sub-brands and all 12 full Den originals with their IDs,
dates, categories, images and optional video fields. All categories retain their assigned
sub-brands. It will not overwrite an existing RSS article or user. Existing
originals are skipped rather than replacing later editorial work. Conflicting
IDs/titles/source URLs abort the transaction.

The two new Food & Wine stories are intentionally part of this new-host seed.
That does not change Replit's original ten-story import, publish the new host,
or authorize production work on Replit.

## B. Copy the complete live database without writing to it

Use PostgreSQL client tools matching or newer than the source server. Obtain a
read-only source connection through the database owner's secure process.
Prefer a read replica/backup export when the provider offers one.

1. Set SOURCE_DATABASE_URL and run:

```
node scripts/copy-production.mjs export
```

The script calls `pg_dump` in a read-only transaction with owner/ACL information
excluded. It reads the complete schema and all tables, including RSS inventory,
users, password hashes, bookmarks, RSVP records and other relations. It does not
UPDATE/INSERT/DELETE source data. A dump still uses connections and shared read
locks, so arrange an appropriate low-traffic window. No source dump is included
in this handoff.

2. Treat `private-data/production.dump` as highly sensitive user data. Encrypt
   it in transit and at rest, restrict access, and never commit or attach it to
   a public handoff. The pack's ignore rules exclude it.
3. Set TARGET_DATABASE_URL for a different, empty database and run:

```
node scripts/copy-production.mjs restore --confirm-new-target
pnpm db:upgrade-restored
pnpm db:seed
```

The restore first checks that the destination is empty and refuses an identical
source/target database. It restores **the actual source schema and all its data**,
including legacy tables not represented by today's Drizzle model. It uses no
`--clean`, drop, truncation or source writes.

`db:upgrade-restored` deliberately skips the empty-database baseline and applies
the additive runtime, model and legacy-object migrations. They create missing
tables/columns/indexes/foreign keys without dropping data or changing existing
column types. Before release, compare the restored schema with the full baseline
and current model. Resolve any additional historical type/default/constraint
drift with reviewed target-only migrations. Do not run a broad `drizzle push`
against the source. The pack cannot know unqueried production schema differences,
and incompatible old data should cause an explicit migration failure, not deletion.

The SQL migrations intentionally include legacy objects outside the ORM model.
Do not replace this migration runner with a destructive ORM push on either the
source or the new target.

4. Compare source dump/target row counts and sample IDs for every table, verify
   all foreign keys/sequences/indexes, and test sign-in and account-backed saves.
   Then verify the 12 originals are present, full and em-dash-free, including both
   YouTube URLs. Maintain all existing user/password identifiers and hashes.

## Cutover and rollback

Replit remains the live writer until explicit cutover approval. A one-time dump
cannot include new records created after its snapshot. Before DNS cutover,
arrange a separately approved final sync or a CDC/replication plan; otherwise
new users/bookmarks/articles written in the gap will be missing. This pack does
not silently turn the live app read-only or point both hosts at a new database.

Do not run target Cron while the target is being restored or reconciled.
Keep Replit and its original database available for rollback. DNS changes,
stopping old ingestion, freezing writes and final production synchronization
each require the owner's approval and were not done here.
