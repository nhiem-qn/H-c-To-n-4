CREATE INDEX answers_student_time ON answers(student_id, submitted_at DESC);
CREATE INDEX participants_student ON participants(student_id);
