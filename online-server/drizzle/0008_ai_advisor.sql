CREATE TABLE ai_requests(id TEXT PRIMARY KEY,actor TEXT NOT NULL,usage_date TEXT NOT NULL,cache_key TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE INDEX ai_requests_daily ON ai_requests(usage_date);
CREATE INDEX ai_requests_actor_daily ON ai_requests(actor,usage_date);
CREATE TABLE ai_lessons(cache_key TEXT PRIMARY KEY,payload TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE ai_controls(id INTEGER PRIMARY KEY CHECK(id=1),enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN(0,1)));
INSERT INTO ai_controls(id,enabled) VALUES(1,1);
