ALTER TABLE students ADD COLUMN expires_at INTEGER;
ALTER TABLE students ADD COLUMN term_months INTEGER CHECK(term_months IS NULL OR term_months IN (1,3,6,12));
ALTER TABLE students ADD COLUMN renewed_at INTEGER;
CREATE INDEX students_expiry ON students(expires_at);
