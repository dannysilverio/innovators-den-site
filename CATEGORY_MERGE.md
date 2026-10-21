# Retired category merge

The active category is **Food & Wine**, slug `food-and-wine`, sub-brand **Brindis**.
Dining is no longer an active category.

## Database deployment

`migrations/0004_merge_dining.sql` is applied by the existing target migration
commands. Run those migrations on the new target after restoring an old database,
then run the editorial seed. Never run this against the live Replit production
database.

The repeatable, transactional migration moves only the retired category:

- Article topics, saved article labels, event and listing category fields.
- User topic arrays, innovator topic arrays and matching article tags.
- Topic follows, combining duplicate follows into one canonical slug.
- Notification preferences, preserving any existing opt-in with boolean OR.
- Interest scores, adding interaction counts and scores capped at one.
- Personalization score maps and category-bearing advertising/metadata fields.

Other categories, article wording, user accounts and authentication data are not
changed. The old category row is removed only after its references are merged.

## Compatibility

Legacy topic input values are normalized by the API. Old website category links
redirect to `/web/topics/food-and-wine`, preserving their query strings.
Only aliases, migration history and tests retain the retired category name.

The website source and editorial seed are updated. The separate Replit mobile
source also updates its topic lists and converts cached follows/bookmark labels.
Expo is not included in this website-only Vercel export.

## Verification

The disposable database smoke test verifies a restored database with both old
and new follows/preferences, repeat runs, retained opt-ins, combined scores,
unchanged unrelated preferences, legacy article filters and 301 category links.
The full seed still contains 12 originals and 13 category sub-brands.
