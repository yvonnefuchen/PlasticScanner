-- Add location column (country, city, region from Vercel geo headers)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS location jsonb;
