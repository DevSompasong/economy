/*
  # Create News Articles Table

  ## Summary
  Creates the core data store for the Economic News Aggregator application.

  ## New Tables

  ### `news_articles`
  Stores fetched economic news articles from NewsAPI and other sources.

  | Column | Type | Description |
  |--------|------|-------------|
  | id | uuid | Primary key, auto-generated |
  | title | text | Article headline (required) |
  | description | text | Short article summary/excerpt |
  | content | text | Full or truncated article body |
  | url | text | Canonical article URL (unique, prevents duplicates) |
  | image_url | text | Featured image URL |
  | source_name | text | Publisher/source name (e.g. Reuters, Bloomberg) |
  | category | text | News category: general, stocks, forex, crypto |
  | published_at | timestamptz | Original publication timestamp |
  | created_at | timestamptz | When this record was inserted |

  ## Security

  - RLS enabled on `news_articles`
  - Anon and authenticated users can read all published articles (is_published = true)
  - Only service role can insert/update/delete articles
  - `is_published` flag allows safe content moderation without data loss

  ## Notes

  1. The `url` column has a UNIQUE constraint to prevent duplicate articles
  2. `is_published` defaults to true, allowing instant display after fetch
  3. An index on `published_at` speeds up chronological sorting queries
  4. An index on `category` speeds up category filter queries
*/

CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text,
  url text UNIQUE NOT NULL,
  image_url text,
  source_name text,
  category text DEFAULT 'general',
  published_at timestamptz,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS news_articles_published_at_idx ON news_articles (published_at DESC);
CREATE INDEX IF NOT EXISTS news_articles_category_idx ON news_articles (category);
CREATE INDEX IF NOT EXISTS news_articles_is_published_idx ON news_articles (is_published);

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published articles"
  ON news_articles FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Service role can insert articles"
  ON news_articles FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update articles"
  ON news_articles FOR UPDATE
  TO service_role
  USING (is_published = is_published)
  WITH CHECK (true);

CREATE POLICY "Service role can delete articles"
  ON news_articles FOR DELETE
  TO service_role
  USING (is_published = is_published);
