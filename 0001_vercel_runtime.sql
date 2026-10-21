-- Additive target-only upgrade after restoring an older production dump.
-- The empty-target baseline already contains the article and category columns.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_poster_url text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_caption text;
CREATE TABLE IF NOT EXISTS categories (
  slug text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sub_brand text
);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sub_brand text;
CREATE TABLE IF NOT EXISTS den_job_runs (
  job_key text PRIMARY KEY,
  cursor integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
