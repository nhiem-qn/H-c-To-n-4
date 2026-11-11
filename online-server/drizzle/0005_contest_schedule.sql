CREATE TABLE room_settings (
 room_code TEXT PRIMARY KEY REFERENCES rooms(code),
 public_id TEXT NOT NULL UNIQUE,
 entry_mode TEXT NOT NULL CHECK(entry_mode IN ('open','code')),
 contest_type TEXT NOT NULL CHECK(contest_type IN ('custom','midweek','weekend')),
 scope TEXT NOT NULL,
 slot_date TEXT,
 opens_at INTEGER NOT NULL,
 scheduled_at INTEGER,
 auto_run INTEGER NOT NULL DEFAULT 0 CHECK(auto_run IN (0,1)),
 created_by TEXT NOT NULL CHECK(created_by IN ('admin','auto'))
);
CREATE UNIQUE INDEX contest_slot ON room_settings(contest_type,slot_date) WHERE slot_date IS NOT NULL AND contest_type IN ('midweek','weekend');
CREATE INDEX contest_public_schedule ON room_settings(opens_at,contest_type);
