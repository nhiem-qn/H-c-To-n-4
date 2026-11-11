CREATE TABLE chat_messages(id INTEGER PRIMARY KEY AUTOINCREMENT,sender_id TEXT NOT NULL REFERENCES students(id),recipient_id TEXT REFERENCES students(id),body TEXT NOT NULL,created_at INTEGER NOT NULL,deleted INTEGER NOT NULL DEFAULT 0 CHECK(deleted IN(0,1)));
CREATE INDEX chat_group_feed ON chat_messages(recipient_id,id);
CREATE INDEX chat_sender_feed ON chat_messages(sender_id,id);
CREATE TABLE chat_blocks(owner_id TEXT NOT NULL REFERENCES students(id),blocked_id TEXT NOT NULL REFERENCES students(id),PRIMARY KEY(owner_id,blocked_id));
CREATE TABLE chat_reports(id INTEGER PRIMARY KEY AUTOINCREMENT,message_id INTEGER NOT NULL REFERENCES chat_messages(id),reporter_id TEXT NOT NULL REFERENCES students(id),reason TEXT NOT NULL,created_at INTEGER NOT NULL,resolved INTEGER NOT NULL DEFAULT 0 CHECK(resolved IN(0,1)),UNIQUE(message_id,reporter_id));
CREATE TABLE chat_controls(id INTEGER PRIMARY KEY CHECK(id=1),enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN(0,1)),revision INTEGER NOT NULL DEFAULT 0);
INSERT INTO chat_controls(id,enabled) VALUES(1,1);
CREATE TABLE weekend_sessions(slot_date TEXT NOT NULL,hour INTEGER NOT NULL CHECK(hour IN(9,11,15,17)),room_code TEXT NOT NULL UNIQUE REFERENCES rooms(code),PRIMARY KEY(slot_date,hour));
