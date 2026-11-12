ALTER TABLE students ADD COLUMN trial_started_at INTEGER;
ALTER TABLE students ADD COLUMN trial_device_hash TEXT;
CREATE UNIQUE INDEX students_trial_device ON students(trial_device_hash) WHERE trial_device_hash IS NOT NULL;
