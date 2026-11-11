ALTER TABLE rooms ADD COLUMN awarded INTEGER NOT NULL DEFAULT 0;
CREATE INDEX rooms_award_status ON rooms(status,awarded);
CREATE TABLE student_presence(student_id TEXT PRIMARY KEY REFERENCES students(id),last_seen INTEGER NOT NULL);
CREATE INDEX student_presence_seen ON student_presence(last_seen);
CREATE INDEX participants_recent_presence ON participants(last_seen) WHERE present=1;
CREATE TABLE study_days(student_id TEXT NOT NULL REFERENCES students(id),study_date TEXT NOT NULL,first_at INTEGER NOT NULL,last_at INTEGER NOT NULL,PRIMARY KEY(student_id,study_date));
CREATE TABLE learning_activity(student_id TEXT NOT NULL REFERENCES students(id),event_id TEXT NOT NULL,kind TEXT NOT NULL,lesson_day INTEGER NOT NULL,event_at INTEGER NOT NULL,received_at INTEGER NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(student_id,event_id));
CREATE INDEX learning_activity_date ON learning_activity(student_id,event_at);
CREATE TABLE contest_results(room_code TEXT NOT NULL REFERENCES rooms(code),student_id TEXT NOT NULL REFERENCES students(id),points INTEGER NOT NULL,total INTEGER NOT NULL,score REAL NOT NULL,completed_at INTEGER NOT NULL,PRIMARY KEY(room_code,student_id));
CREATE INDEX contest_results_student ON contest_results(student_id,completed_at);
CREATE TABLE member_totals(student_id TEXT NOT NULL REFERENCES students(id),period TEXT NOT NULL,points INTEGER NOT NULL DEFAULT 0,questions INTEGER NOT NULL DEFAULT 0,exams INTEGER NOT NULL DEFAULT 0,score_sum REAL NOT NULL DEFAULT 0,attendance INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(student_id,period));
CREATE INDEX member_totals_period ON member_totals(period);
CREATE TRIGGER contest_result_award AFTER INSERT ON contest_results BEGIN
 INSERT INTO member_totals(student_id,period,points,questions,exams,score_sum) VALUES(NEW.student_id,'all',NEW.points,NEW.total,1,NEW.score) ON CONFLICT(student_id,period) DO UPDATE SET points=points+NEW.points,questions=questions+NEW.total,exams=exams+1,score_sum=score_sum+NEW.score;
 INSERT INTO member_totals(student_id,period,points,questions,exams,score_sum) VALUES(NEW.student_id,strftime('%Y-%m',NEW.completed_at/1000,'unixepoch','+7 hours'),NEW.points,NEW.total,1,NEW.score) ON CONFLICT(student_id,period) DO UPDATE SET points=points+NEW.points,questions=questions+NEW.total,exams=exams+1,score_sum=score_sum+NEW.score;
END;
CREATE TRIGGER study_day_award AFTER INSERT ON study_days BEGIN
 INSERT INTO member_totals(student_id,period,attendance) VALUES(NEW.student_id,'all',1) ON CONFLICT(student_id,period) DO UPDATE SET attendance=attendance+1;
 INSERT INTO member_totals(student_id,period,attendance) VALUES(NEW.student_id,substr(NEW.study_date,1,7),1) ON CONFLICT(student_id,period) DO UPDATE SET attendance=attendance+1;
END;
INSERT INTO study_days(student_id,study_date,first_at,last_at) SELECT student_id,date(submitted_at/1000,'unixepoch','+7 hours'),MIN(submitted_at),MAX(submitted_at) FROM answers GROUP BY student_id,date(submitted_at/1000,'unixepoch','+7 hours');
INSERT INTO contest_results(room_code,student_id,points,total,score,completed_at) SELECT r.code,p.student_id,COALESCE(SUM(a.correct),0),json_array_length(r.questions),ROUND(10.0*COALESCE(SUM(a.correct),0)/json_array_length(r.questions),1),COALESCE(r.ended_at,r.deadline,r.created_at) FROM rooms r JOIN participants p ON p.room_code=r.code LEFT JOIN answers a ON a.room_code=r.code AND a.student_id=p.student_id WHERE r.status='ended' GROUP BY r.code,p.student_id;
UPDATE rooms SET awarded=1 WHERE status='ended';
