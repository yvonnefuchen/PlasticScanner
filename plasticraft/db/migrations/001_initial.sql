-- Initial schema
CREATE TABLE IF NOT EXISTS sessions (
  id             text PRIMARY KEY,
  timestamp      timestamptz NOT NULL,
  pre            jsonb NOT NULL,
  post           jsonb,
  scan_photo_url text,
  car_photo_url  text,
  reshape_images jsonb,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
