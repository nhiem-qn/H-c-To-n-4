-- Preserve existing slots while allowing daily practice through 19:30.
CREATE TABLE daytime_sessions_extended(slot_date TEXT NOT NULL,minute INTEGER NOT NULL CHECK(minute BETWEEN 450 AND 1170 AND (minute-450)%10=0),room_code TEXT NOT NULL UNIQUE REFERENCES rooms(code),PRIMARY KEY(slot_date,minute));
INSERT INTO daytime_sessions_extended SELECT slot_date,minute,room_code FROM daytime_sessions;
DROP TABLE daytime_sessions;
ALTER TABLE daytime_sessions_extended RENAME TO daytime_sessions;
