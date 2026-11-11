CREATE TABLE app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE daily_exams (exam_date TEXT PRIMARY KEY, room_code TEXT NOT NULL UNIQUE REFERENCES rooms(code), lesson_day INTEGER NOT NULL);
