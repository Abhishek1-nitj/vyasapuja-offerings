CREATE TABLE IF NOT EXISTS offerings (
  id TEXT PRIMARY KEY,
  offering_number INTEGER NOT NULL UNIQUE,
  devotee_name TEXT NOT NULL,
  center TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  word_count INTEGER NOT NULL DEFAULT 0,
  edit_code_hash TEXT,
  owner_google_sub TEXT,
  owner_google_email TEXT,
  owner_google_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_offerings_created_at ON offerings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offerings_number ON offerings(offering_number);

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
