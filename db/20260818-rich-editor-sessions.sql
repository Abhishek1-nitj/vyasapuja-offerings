ALTER TABLE offerings ADD COLUMN content_html TEXT;

UPDATE offerings
SET offering_number = -rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY datetime(created_at), id) AS rn
  FROM offerings
) numbered
WHERE offerings.id = numbered.id;

UPDATE offerings SET offering_number = ABS(offering_number);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  picture TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
