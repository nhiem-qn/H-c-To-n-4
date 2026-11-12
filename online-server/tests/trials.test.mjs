import assert from 'node:assert/strict';import {fixture,TEST_PASSWORD} from './fixtures.mjs';
const f=fixture(),realNow=Date.now;let clock=realNow();Date.now=()=>clock;const device='a'.repeat(48),week=7*86400000;
try{
 const admin=await f.call('/api/admin-auth/login','POST',{username:'mia-admin',password:TEST_PASSWORD});
 await f.call('/api/trial','POST',{name:'Bạn thử',device:'bad'},null,400);
 let a=await f.call('/api/trial','POST',{name:'Bé Học Thử',device});assert.equal(a.student.expires_at,clock+week);assert.equal(a.serverTime,clock);assert(!JSON.stringify(a).includes(device));assert(!JSON.stringify(a).includes('pin'));
 await f.call('/api/progress','PUT',{progress:{completed:[1],read:[1],results:[]}},a.token);
 clock+=86400000;let resumed=await f.call('/api/trial','POST',{name:'Tên mới không đặt lại hạn',device});assert.equal(resumed.student.id,a.student.id);assert.equal(resumed.student.name,'Bé Học Thử');assert.equal(resumed.student.expires_at,a.student.expires_at);assert.deepEqual((await f.call('/api/progress','GET',null,resumed.token)).progress.completed,[1]);
 await f.call('/api/trial','POST',{name:'Bé Học Thử',device:'b'.repeat(48)},null,409);
 clock=a.student.expires_at-1;await f.call('/api/me','GET',null,resumed.token);
 clock++;let expired=await f.call('/api/trial','POST',{name:'Đổi tên vẫn hết hạn',device},null,401);assert.equal(expired.code,'TRIAL_EXPIRED');await f.call('/api/progress','GET',null,resumed.token,401);await f.call('/api/advisor','GET',null,resumed.token,401);await f.call('/api/voice','POST',{text:'Xin chào'},resumed.token,401);
 // Refresh admin session after the week has elapsed; convert the same student.
 let owner=await f.call('/api/admin-auth/login','POST',{username:'mia-admin',password:TEST_PASSWORD});let list=await f.call('/api/admin/students','GET',null,owner.token);assert(list.students.find(s=>s.id===a.student.id).trial_started_at!=null);
 let renewed=await f.call('/api/admin/students/'+a.student.id+'/renew','POST',{months:1},owner.token);assert(renewed.pin);assert.equal(renewed.student.id,a.student.id);await f.call('/api/trial','POST',{name:'Không học thử lại',device},null,403);let login=await f.call('/api/login','POST',{name:'Bé Học Thử',pin:renewed.pin});assert.equal(login.student.term_months,1);assert.deepEqual((await f.call('/api/progress','GET',null,login.token)).progress.completed,[1]);
 let backup=await f.call('/api/admin/export','GET',null,owner.token),target=fixture(),ta=await target.call('/api/admin-auth/login','POST',{username:'mia-admin',password:TEST_PASSWORD}),job=await target.call('/api/admin/import','POST',{backup},ta.token),chunks=[];for(let table of job.order)for(let i=0;i<backup.tables[table].length;i+=25)chunks.push(backup.tables[table].slice(i,i+25));while(!job.ok)job=await target.call('/api/admin/import','POST',{checksum:job.checksum,batchIndex:job.nextBatch,rows:chunks[job.nextBatch]},ta.token);await target.call('/api/trial','POST',{name:'Vẫn không học thử lại',device},null,403);
 // A currently active trial must survive backup validation too.
 let t=await f.call('/api/trial','POST',{name:'Bạn thử mới',device:'c'.repeat(48)});let activeBackup=await f.call('/api/admin/export','GET',null,owner.token),blank=fixture(),ba=await blank.call('/api/admin-auth/login','POST',{username:'mia-admin',password:TEST_PASSWORD});await blank.call('/api/admin/import','POST',{backup:activeBackup},ba.token);
 console.log('PASS: 7-day server expiry, name/device replay never restarts trial, unique names, private saved progress, expired API rejection, admin conversion with PIN, preserved progress and trial-aware backup restore.');
}finally{Date.now=realNow}
