import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
import {fixture,TEST_PASSWORD} from './fixtures.mjs';
const f=fixture(),realNow=Date.now;let clock=Date.parse('2026-11-11T19:59:59+07:00');Date.now=()=>clock;
try{
 const admin=await f.call('/api/admin-auth/login','POST',{username:'mia-admin',password:TEST_PASSWORD});
 await f.call('/api/admin/daily-settings','POST',{schoolStart:'2026-09-07'},admin.token);
 await f.call('/api/admin/daily-settings','POST',{schoolStart:'2026-09-08'},admin.token,400);
 const a=await f.call('/api/admin/students','POST',{name:'Bạn Thỏ'},admin.token,201),b=await f.call('/api/admin/students','POST',{name:'Bạn Gấu'},admin.token,201);
 const login=async x=>(await f.call('/api/login','POST',{name:x.student.name,pin:x.pin})).token;
 const [ta,tb]=await Promise.all([login(a),login(b)]);
 let d=await f.call('/api/daily');assert.equal(d.status,'upcoming');assert.equal(d.day,48);assert.equal(d.timezone,'Asia/Ho_Chi_Minh');assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM rooms').get().n,0);
 await f.call('/api/daily/join','POST',{},ta,409);await f.call('/api/daily/join','POST',{},null,401);
 clock+=1000;let tasks=[];await worker.scheduled({scheduledTime:clock},f.env,{waitUntil:p=>tasks.push(p)});await Promise.all(tasks);
 const [da,db]=await Promise.all([f.call('/api/daily'),f.call('/api/daily')]);assert.equal(da.code,db.code);assert.equal(da.status,'waiting');assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM daily_exams').get().n,1);
 const [ra,rb]=await Promise.all([f.call('/api/daily/join','POST',{},ta),f.call('/api/daily/join','POST',{},tb)]);assert.equal(ra.room.code,rb.room.code);assert.equal(ra.room.automatic,true);assert.equal(ra.room.startsAt,Date.parse('2026-11-11T20:05:00+07:00'));
 const code=ra.room.code;await f.call('/api/admin/rooms/'+code+'/start','POST',{},admin.token,409);
 clock=da.startsAt;let snap=await f.call('/api/rooms/'+code+'/heartbeat','POST',{},ta);assert.equal(snap.room.status,'running');assert.equal(snap.room.index,0);assert(!('answer' in snap.question));assert(!('hint' in snap.question),'do not expose a hint before half time');assert.equal(snap.room.deadline,clock+60000);
 const qs=JSON.parse(f.sql.prepare('SELECT questions FROM rooms WHERE code=?').get(code).questions);
 await f.call('/api/rooms/'+code+'/answer','POST',{index:0,value:qs[0].answer},ta);
 snap=await f.call('/api/rooms/'+code+'/heartbeat','POST',{},tb);assert.equal(snap.participants.find(p=>p.id===a.student.id).result,'submitted');assert(!('answer' in snap.question));
 clock+=30000;snap=await f.call('/api/rooms/'+code+'/heartbeat','POST',{},tb);assert(snap.question.hint);assert(!('answer' in snap.question));clock+=30000;snap=await f.call('/api/rooms/'+code+'/heartbeat','POST',{},tb);assert.equal(snap.room.revealed,true);assert.equal(snap.question.answer,qs[0].answer);assert.equal(snap.participants.find(p=>p.id===a.student.id).result,'correct');
 await f.call('/api/rooms/'+code+'/answer','POST',{index:0,value:qs[0].answer},tb,409);
 clock+=8000;snap=await f.call('/api/rooms/'+code+'/heartbeat','POST',{},ta);assert.equal(snap.room.index,1);assert(!('answer' in snap.question));assert.equal(snap.submitted,false);
 // Returning after a sleeping/background tab jumps to the authoritative current question.
 clock=da.startsAt+4*68000;snap=await f.call('/api/rooms/'+code+'/heartbeat','POST',{},ta);assert.equal(snap.room.index,4);
 clock=da.startsAt+5*68000;d=await f.call('/api/daily');assert.equal(d.status,'ended');await f.call('/api/daily/join','POST',{},tb,409);
 let report=await f.call('/api/admin/students/'+a.student.id+'/report','GET',null,admin.token);assert.equal(report.rooms[0].correct,1);
 let backup=await f.call('/api/admin/export','GET',null,admin.token);assert.equal(backup.tables.daily_exams.length,1);assert.equal(backup.tables.app_settings[0].value,'2026-09-07');
 const restored=fixture(),restoreAdmin=await restored.call('/api/admin-auth/login','POST',{username:'mia-admin',password:TEST_PASSWORD});
 let job=await restored.call('/api/admin/import','POST',{backup},restoreAdmin.token),chunks=[];for(let table of job.order)for(let i=0;i<backup.tables[table].length;i+=job.batchSize)chunks.push(backup.tables[table].slice(i,i+job.batchSize));while(!job.ok)job=await restored.call('/api/admin/import','POST',{checksum:job.checksum,batchIndex:job.nextBatch,rows:chunks[job.nextBatch]},restoreAdmin.token);
 assert.equal(restored.sql.prepare('SELECT room_code FROM daily_exams').get().room_code,code);assert.equal((await restored.call('/api/daily')).status,'ended');
 clock=Date.parse('2026-11-12T20:00:00+07:00');d=await f.call('/api/daily');assert.notEqual(d.code,code);assert.equal(d.day,49);assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM daily_exams').get().n,2);
 clock=Date.parse('2026-11-14T19:00:00+07:00');d=await f.call('/api/daily');assert.equal(d.day,50,'weekend revises Friday');
 // Weekly/monthly exams still require a teacher-created room code.
 const freshAdmin=await f.call('/api/admin-auth/login','POST',{username:'mia-admin',password:TEST_PASSWORD});
 for(let kind of ['week','month']){let r=await f.call('/api/admin/rooms','POST',{day:50,kind,count:kind==='month'?15:10,seconds:60},freshAdmin.token,201);let j=await f.call('/api/rooms/'+r.code+'/join','POST',{},ta);assert.equal(j.room.automatic,false);assert.equal(j.room.total,kind==='month'?15:10)}
 console.log('PASS: Vietnam 20h cron, idempotent daily generation, no-code authenticated entry, shared room, timed questions/reveal/end, late rejection, school calendar, backups and coded weekly/monthly exams.');
}finally{Date.now=realNow}
