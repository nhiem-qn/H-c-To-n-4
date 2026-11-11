CREATE TABLE admin_sessions (token_hash TEXT PRIMARY KEY, version TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE data_transfer (id INTEGER PRIMARY KEY CHECK (id = 1), checksum TEXT NOT NULL, status TEXT NOT NULL, created_at INTEGER NOT NULL);
