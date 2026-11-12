import {LESSONS,DAYS,makeExam,makeRangeExam,correct,numeric} from './bank.js';
const DEFAULT_APP='https://nhiem-qn.github.io/H-c-To-n-4/';
function appUrl(env){return String(env.APP_URL||DEFAULT_APP).replace(/\/?$/,'/')}
function standalone(env){return env.AUTH_MODE!=='sites'}
const LIMIT=40,ONLINE_MS=22000,SESSION_MS=7*86400000;
const now=()=>Date.now();
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
function fail(status,message,code){let e=new Error(message);e.status=status;e.code=code;throw e}
function accountTerm(value){let months=Number(value);if(![1,3,6,12].includes(months))fail(400,'Chọn thời hạn 1, 3, 6 tháng hoặc 1 năm.');return months}
function addTermMonths(time,months){let date=new Date(time+7*3600000),day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+months);let last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));return date.getTime()-7*3600000}
function checkTerm(s){if(s.expires_at!==null&&s.expires_at!==undefined&&s.expires_at<=now())fail(401,'Tài khoản đã hết hạn sử dụng. Vui lòng liên hệ admin để được duyệt gia hạn.','ACCOUNT_EXPIRED')}
const normalizeName=s=>String(s||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('vi');
function cleanName(s){s=String(s||'').normalize('NFKC').trim().replace(/\s+/g,' ');if(s.length<2||s.length>40||/[<>\u0000-\u001f]/.test(s))fail(400,'Tên cần có 2–40 kí tự, không chứa kí tự đặc biệt.');return s}
const random=(n=24)=>Array.from(crypto.getRandomValues(new Uint8Array(n)),x=>x.toString(16).padStart(2,'0')).join('');
const code=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
async function hash(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('')}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
async function body(request,max=30000){if(Number(request.headers.get('content-length'))>max)fail(413,'Dữ liệu quá lớn.');let text=await request.text();if(text.length>max)fail(413,'Dữ liệu quá lớn.');try{return JSON.parse(text||'{}')}catch{fail(400,'Dữ liệu không đúng định dạng.')}}
const all=async(db,sql,...args)=>(await db.prepare(sql).bind(...args).all()).results;
const first=(db,sql,...args)=>db.prepare(sql).bind(...args).first();
const run=(db,sql,...args)=>db.prepare(sql).bind(...args).run();
async function legacyAdmin(request,env){
 const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
 if(!id)fail(401,'Đăng nhập ChatGPT để quản trị.');
 const existing=await first(env.DB,'SELECT user_id FROM admins LIMIT 1');
 if(existing){if(existing.user_id!==id)fail(403,'Tài khoản này không có quyền admin.');return id}
 if(!env.ADMIN_EMAIL||normalizeName(email)!==normalizeName(env.ADMIN_EMAIL))fail(403,'Chỉ chủ ứng dụng được kích hoạt quyền admin.');
 await run(env.DB,'INSERT OR IGNORE INTO admins(user_id,created_at) VALUES(?,?)',id,now());
 const owner=await first(env.DB,'SELECT user_id FROM admins LIMIT 1');if(owner.user_id!==id)fail(403,'Không có quyền admin.');return id
}
async function credentialVersion(env){return hash(String(env.ADMIN_PASSWORD_HASH||'')+':'+String(env.ADMIN_PASSWORD_SALT||''))}
function adminConfigured(env){return /^[a-f0-9]{64}$/.test(env.ADMIN_PASSWORD_HASH||'')&&/^[a-f0-9]{32}$/.test(env.ADMIN_PASSWORD_SALT||'')}
async function derivePassword(password,salt){let key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);let value=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:Uint8Array.from(salt.match(/../g),x=>parseInt(x,16)),iterations:100000},key,256);return Array.from(new Uint8Array(value),x=>x.toString(16).padStart(2,'0')).join('')}
async function admin(request,env){
 if(!standalone(env))return legacyAdmin(request,env);
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');if(!/^[a-f0-9]{48}$/.test(token))fail(401,'Đăng nhập bằng tài khoản và mật khẩu admin.');
 const session=await first(env.DB,'SELECT token_hash,version FROM admin_sessions WHERE token_hash=? AND expires_at>?',await hash(token),now());
 if(!session||!equal(session.version,await credentialVersion(env)))fail(401,'Phiên admin đã hết hạn. Vui lòng đăng nhập lại.');return env.ADMIN_USERNAME||'admin'
}
const TRANSFER_FIELDS={students:['id','name','normalized','pin_hash','pin_salt','active','created_at','expires_at','term_months','renewed_at'],rooms:['code','title','questions','status','question_index','started_at','deadline','seconds','created_at','ended_at'],participants:['room_code','student_id','seat','joined_at','last_seen','present','blocked'],answers:['room_code','student_id','question_index','value','correct','submitted_at'],progress:['student_id','payload','updated_at'],app_settings:['key','value'],daily_exams:['exam_date','room_code','lesson_day'],room_settings:['room_code','public_id','entry_mode','contest_type','scope','slot_date','opens_at','scheduled_at','auto_run','created_by'],study_days:['student_id','study_date','first_at','last_at'],learning_activity:['student_id','event_id','kind','lesson_day','event_at','received_at','payload'],ai_controls:['id','enabled'],weekend_sessions:['slot_date','hour','room_code'],chat_messages:['id','sender_id','recipient_id','body','created_at','deleted'],chat_blocks:['owner_id','blocked_id'],chat_reports:['id','message_id','reporter_id','reason','created_at','resolved'],chat_controls:['id','enabled','revision']};
async function exportData(env){let job=await first(env.DB,'SELECT status FROM data_transfer WHERE id=1');if(job?.status==='pending')fail(409,'Đang khôi phục dữ liệu; hãy hoàn tất trước khi xuất.');let tables={};for(let [name,fields] of Object.entries(TRANSFER_FIELDS))tables[name]=await all(env.DB,'SELECT '+fields.join(',')+' FROM '+name+' ORDER BY rowid');return{format:'MIA-BACKUP',version:1,exportedAt:new Date().toISOString(),tables}}
async function importData(env,backup){
 if(backup?.format!=='MIA-BACKUP'||backup.version!==1||!backup.tables)fail(400,'Không đúng tệp sao lưu MIA.');for(let table of ['app_settings','daily_exams','room_settings','study_days','learning_activity','ai_controls','weekend_sessions','chat_messages','chat_blocks','chat_reports','chat_controls'])if(!(table in backup.tables))backup.tables[table]=[];for(let s of Array.isArray(backup.tables.students)?backup.tables.students:[])if(s&&typeof s==='object')for(let field of ['expires_at','term_months','renewed_at'])if(!(field in s))s[field]=null;let count=0;
 for(let [name,fields] of Object.entries(TRANSFER_FIELDS)){let rows=backup.tables[name];if(!Array.isArray(rows))fail(400,'Thiếu dữ liệu '+name);count+=rows.length;for(let row of rows){if(!row||typeof row!=='object'||fields.some(f=>!(f in row)||!(row[f]===null||typeof row[f]==='string'||(typeof row[f]==='number'&&Number.isFinite(row[f])))))fail(400,'Dữ liệu '+name+' không hợp lệ.')}}
 if(count>20000)fail(413,'Bản sao vượt quá 20.000 bản ghi.');
 const students=new Set(backup.tables.students.map(s=>s.id)),rooms=new Set(backup.tables.rooms.map(r=>r.code));
 if(students.size!==backup.tables.students.length||new Set(backup.tables.students.map(s=>s.normalized)).size!==students.size||rooms.size!==backup.tables.rooms.length)fail(400,'Bản sao có mã hoặc tên trùng.');
 for(let [table,fields] of Object.entries(TRANSFER_FIELDS))for(let row of backup.tables[table])if(fields.some(f=>row[f]===null&&!(table==='chat_messages'&&f==='recipient_id')&&!(table==='students'&&['expires_at','term_months','renewed_at'].includes(f))&&!(table==='rooms'&&['started_at','deadline','ended_at'].includes(f))&&!(table==='room_settings'&&['slot_date','scheduled_at'].includes(f))))fail(400,'Bản sao thiếu trường bắt buộc.');
 for(let table of ['participants','answers','progress']){let rows=backup.tables[table],keys=rows.map(r=>table==='progress'?r.student_id:r.room_code+':'+r.student_id+(table==='answers'?':'+r.question_index:''));if(new Set(keys).size!==rows.length)fail(400,'Bản sao có bản ghi trùng.')}
 if(new Set(backup.tables.participants.map(r=>r.room_code+':'+r.seat)).size!==backup.tables.participants.length||backup.tables.participants.some(r=>!Number.isInteger(r.seat)||r.seat<0||r.seat>=LIMIT||![0,1].includes(r.present)||![0,1].includes(r.blocked))||backup.tables.answers.some(r=>!Number.isInteger(r.question_index)||r.question_index<0||r.question_index>24||![0,1].includes(r.correct)))fail(400,'Ghế hoặc đáp án trong bản sao không hợp lệ.');
 for(let s of backup.tables.students){if(s.expires_at!==null&&(!Number.isSafeInteger(s.expires_at)||s.expires_at<=s.created_at)||s.term_months!==null&&![1,3,6,12].includes(s.term_months)||s.renewed_at!==null&&!Number.isSafeInteger(s.renewed_at)||(s.expires_at===null)!==(s.term_months===null))fail(400,'Thời hạn tài khoản trong bản sao không hợp lệ.');cleanName(s.name);if(normalizeName(s.name)!==s.normalized||!/^[a-f0-9]{64}$/.test(s.pin_hash)||!/^[a-f0-9]{32}$/.test(s.pin_salt)||![0,1].includes(s.active))fail(400,'Tài khoản học sinh trong bản sao không hợp lệ.')}
 for(let r of backup.tables.rooms){roomCode(r.code);let qs;try{qs=JSON.parse(r.questions)}catch{fail(400,'Đề thi trong bản sao không hợp lệ.')}if(!Array.isArray(qs)||qs.length<1||qs.length>25||qs.some(q=>typeof q.q!=='string'||typeof q.answer!=='string'||!Array.isArray(q.options)))fail(400,'Đề thi trong bản sao không hợp lệ.')}
 for(let row of [...backup.tables.participants,...backup.tables.answers])if(!students.has(row.student_id)||!rooms.has(row.room_code))fail(400,'Bản sao thiếu học sinh hoặc phòng được tham chiếu.');
 for(let p of backup.tables.progress){if(!students.has(p.student_id))fail(400,'Tiến độ không có học sinh tương ứng.');try{JSON.parse(p.payload)}catch{fail(400,'Tiến độ trong bản sao không hợp lệ.')}}
 if(new Set(backup.tables.daily_exams.map(x=>x.exam_date)).size!==backup.tables.daily_exams.length||new Set(backup.tables.daily_exams.map(x=>x.room_code)).size!==backup.tables.daily_exams.length||backup.tables.daily_exams.some(x=>!rooms.has(x.room_code)||!/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(x.exam_date)||!Number.isInteger(x.lesson_day)||x.lesson_day<1||x.lesson_day>175))fail(400,'Lịch thi trong bản sao không hợp lệ.');
 if(new Set(backup.tables.app_settings.map(x=>x.key)).size!==backup.tables.app_settings.length||backup.tables.app_settings.some(x=>x.key!=='school_start'||!/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(x.value)||!Number.isFinite(Date.parse(x.value+'T00:00:00Z'))||new Date(x.value+'T00:00:00Z').getUTCDay()!==1))fail(400,'Cấu hình lịch học trong bản sao không hợp lệ.');
 let meta=backup.tables.room_settings;if(new Set(meta.map(x=>x.room_code)).size!==meta.length||new Set(meta.map(x=>x.public_id)).size!==meta.length||meta.some(x=>!rooms.has(x.room_code)||!/^[a-f0-9-]{36}$/.test(x.public_id)||!['open','code'].includes(x.entry_mode)||!['custom','midweek','weekend'].includes(x.contest_type)||!['daily','week','month','term'].includes(x.scope)||!['admin','auto'].includes(x.created_by)||![0,1].includes(x.auto_run)||!Number.isSafeInteger(x.opens_at)||x.scheduled_at!==null&&!Number.isSafeInteger(x.scheduled_at)||x.auto_run===1&&x.scheduled_at===null||x.slot_date!==null&&(!/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(x.slot_date)||weeklyType(x.slot_date)!==x.contest_type)))fail(400,'Lịch hoặc cách vào cuộc thi trong bản sao không hợp lệ.');let official=meta.filter(x=>x.slot_date!==null).map(x=>x.contest_type+':'+x.slot_date);if(new Set(official).size!==official.length)fail(400,'Bản sao có buổi thi tuần trùng.');
 for(let table of ['study_days','learning_activity']){let rows=backup.tables[table],keys=rows.map(r=>r.student_id+':'+(r.study_date||r.event_id));if(new Set(keys).size!==rows.length||rows.some(r=>!students.has(r.student_id)))fail(400,'Hoạt động học không hợp lệ.');for(let r of rows){if(table==='study_days'&&(!/^20\d{2}-\d{2}-\d{2}$/.test(r.study_date)||!Number.isSafeInteger(r.first_at)||!Number.isSafeInteger(r.last_at)))fail(400,'Ngày chuyên cần không hợp lệ.');if(table==='learning_activity'){if(!['lecture-complete','theory-read','book-read','practice','self-exam'].includes(r.kind)||!Number.isInteger(r.lesson_day)||r.lesson_day<1||r.lesson_day>175||!Number.isSafeInteger(r.event_at)||!Number.isSafeInteger(r.received_at)||r.event_id.length>150)fail(400,'Hoạt động học không hợp lệ.');try{JSON.parse(r.payload)}catch{fail(400,'Chi tiết học không hợp lệ.')}}}}
 if(backup.tables.ai_controls.length>1||backup.tables.ai_controls.some(r=>r.id!==1||![0,1].includes(r.enabled)))fail(400,'Cấu hình AI không hợp lệ.');
 const weekend=backup.tables.weekend_sessions;if(new Set(weekend.map(r=>r.slot_date+':'+r.hour)).size!==weekend.length||new Set(weekend.map(r=>r.room_code)).size!==weekend.length||weekend.some(r=>!rooms.has(r.room_code)||!/^20\d{2}-\d{2}-\d{2}$/.test(r.slot_date)||![0,6].includes(weekdayVN(r.slot_date))||![9,11,15,17].includes(r.hour)||!backup.tables.room_settings.some(m=>m.room_code===r.room_code&&m.auto_run===1&&m.created_by==='auto'&&m.scheduled_at===Date.parse(r.slot_date+'T'+String(r.hour).padStart(2,'0')+':00:00+07:00')+60000)))fail(400,'Buổi thi cuối tuần trong bản sao không hợp lệ.');
 const messages=backup.tables.chat_messages,messageIds=new Set(messages.map(r=>r.id));if(messageIds.size!==messages.length||messages.some(r=>!Number.isSafeInteger(r.id)||r.id<1||!students.has(r.sender_id)||r.recipient_id!==null&&(!students.has(r.recipient_id)||r.recipient_id===r.sender_id)||typeof r.body!=='string'||!r.body.length||r.body.length>400||!Number.isSafeInteger(r.created_at)||![0,1].includes(r.deleted)))fail(400,'Tin nhắn trong bản sao không hợp lệ.');
 const blocks=backup.tables.chat_blocks;if(new Set(blocks.map(r=>r.owner_id+':'+r.blocked_id)).size!==blocks.length||blocks.some(r=>!students.has(r.owner_id)||!students.has(r.blocked_id)||r.owner_id===r.blocked_id))fail(400,'Chặn bạn trong bản sao không hợp lệ.');
 const reports=backup.tables.chat_reports;if(new Set(reports.map(r=>r.id)).size!==reports.length||new Set(reports.map(r=>r.message_id+':'+r.reporter_id)).size!==reports.length||reports.some(r=>!Number.isSafeInteger(r.id)||r.id<1||!messageIds.has(r.message_id)||!students.has(r.reporter_id)||!['unfriendly','private-info','other'].includes(r.reason)||!Number.isSafeInteger(r.created_at)||![0,1].includes(r.resolved)))fail(400,'Báo cáo trò chuyện không hợp lệ.');
 if(backup.tables.chat_controls.length>1||backup.tables.chat_controls.some(r=>r.id!==1||![0,1].includes(r.enabled)||!Number.isSafeInteger(r.revision)||r.revision<0))fail(400,'Cấu hình trò chuyện không hợp lệ.');
 const checksum=await hash(JSON.stringify(backup)),job=await first(env.DB,'SELECT * FROM data_transfer WHERE id=1');
 let manifest=[];for(let [table,fields] of Object.entries(TRANSFER_FIELDS)){let rows=backup.tables[table];for(let offset=0;offset<rows.length;offset+=25){let chunk=rows.slice(offset,offset+25);manifest.push({table,count:chunk.length,hash:await hash(JSON.stringify(chunk))})}}
 if(job?.status==='pending'&&job.checksum!==checksum)fail(409,'Hãy dùng đúng tệp đang nhập dở để hoàn tất.');
 if(job?.status==='done'&&job.checksum===checksum)return transferState({...job,manifest:JSON.stringify(manifest)});
 if(!job||job.status!=='pending'){let existing=await first(env.DB,'SELECT (SELECT COUNT(*) FROM students)+(SELECT COUNT(*) FROM rooms) AS n');if(existing.n)fail(409,'Chỉ khôi phục vào cơ sở dữ liệu trống để không ghi đè dữ liệu đang có.');await run(env.DB,"INSERT INTO data_transfer(id,checksum,status,created_at,manifest,next_batch) VALUES(1,?,'pending',?,?,0) ON CONFLICT(id) DO UPDATE SET checksum=excluded.checksum,status='pending',created_at=excluded.created_at,manifest=excluded.manifest,next_batch=0",checksum,now(),JSON.stringify(manifest))}
 else if(JSON.parse(job.manifest||'[]').length===0&&manifest.length)await run(env.DB,'UPDATE data_transfer SET manifest=?,next_batch=0 WHERE id=1',JSON.stringify(manifest));
 if(!manifest.length)await run(env.DB,"UPDATE data_transfer SET status='done' WHERE id=1");
 return transferState(await first(env.DB,'SELECT * FROM data_transfer WHERE id=1'))
}
function transferState(job){let manifest=JSON.parse(job.manifest||'[]'),next=job.next_batch||0,records=manifest.reduce((n,b)=>n+b.count,0),processed=manifest.slice(0,next).reduce((n,b)=>n+b.count,0);return{ok:job.status==='done',checksum:job.checksum,nextBatch:next,records,processed,order:Object.keys(TRANSFER_FIELDS),batchSize:25}}
async function importBatch(env,b){
 let job=await first(env.DB,'SELECT * FROM data_transfer WHERE id=1');if(!job||job.checksum!==b.checksum)fail(409,'Không khớp bản sao đang khôi phục.');if(job.status==='done')return transferState(job);
 if(!Number.isInteger(b.batchIndex)||b.batchIndex<0)fail(400,'Lô dữ liệu không hợp lệ.');
 if(b.batchIndex<job.next_batch)return transferState(job);if(b.batchIndex!==job.next_batch)fail(409,'Hãy tiếp tục đúng lô dữ liệu được máy chủ yêu cầu.');
 let manifest=JSON.parse(job.manifest||'[]'),batch=manifest[b.batchIndex];if(!batch||!Array.isArray(b.rows)||b.rows.length!==batch.count||!equal(await hash(JSON.stringify(b.rows)),batch.hash))fail(400,'Lô dữ liệu không khớp tệp sao lưu.');
 let fields=TRANSFER_FIELDS[batch.table],statements=b.rows.map(row=>env.DB.prepare('INSERT '+(['ai_controls','chat_controls'].includes(batch.table)?'':'OR IGNORE ')+'INTO '+batch.table+'('+fields.join(',')+') VALUES('+fields.map(()=>'?').join(',')+')'+(batch.table==='ai_controls'?' ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled':batch.table==='chat_controls'?' ON CONFLICT(id) DO UPDATE SET enabled=excluded.enabled,revision=excluded.revision':'')).bind(...fields.map(f=>batch.table==='participants'&&f==='present'?0:row[f])));
 statements.push(env.DB.prepare('UPDATE data_transfer SET next_batch=?,status=? WHERE id=1 AND checksum=? AND next_batch=?').bind(b.batchIndex+1,b.batchIndex+1===manifest.length?'done':'pending',job.checksum,b.batchIndex));
 await env.DB.batch(statements);if(b.batchIndex+1===manifest.length){await run(env.DB,"INSERT OR IGNORE INTO study_days(student_id,study_date,first_at,last_at) SELECT student_id,date(submitted_at/1000,'unixepoch','+7 hours'),MIN(submitted_at),MAX(submitted_at) FROM answers GROUP BY student_id,date(submitted_at/1000,'unixepoch','+7 hours')");await sealAwards(env);}return transferState(await first(env.DB,'SELECT * FROM data_transfer WHERE id=1'))
}
async function student(request,env){let token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');if(!/^[a-f0-9]{48}$/.test(token))fail(401,'Vui lòng đăng nhập bằng tên và mã riêng.');let row=await first(env.DB,'SELECT s.id,s.name,s.expires_at,s.term_months FROM sessions t JOIN students s ON s.id=t.student_id WHERE t.token_hash=? AND t.expires_at>? AND s.active=1',await hash(token),now());if(!row)fail(401,'Phiên đăng nhập đã hết hạn hoặc tài khoản đã bị khóa.');checkTerm(row);return row}
async function rateLimit(env,key,max=12){let time=now(),bucket=key+':'+Math.floor(time/60000);await run(env.DB,'INSERT INTO rate_limits(key,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1',bucket,time+120000);let r=await first(env.DB,'SELECT attempts FROM rate_limits WHERE key=?',bucket);if(r.attempts>max)fail(429,'Bạn thử quá nhiều lần. Vui lòng chờ một phút.');}
function roomCode(value){let c=String(value||'').trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(c))fail(400,'Mã phòng gồm 6 chữ hoặc số.');return c}
async function getRoom(env,value){let c=roomCode(value),r=await first(env.DB,'SELECT * FROM rooms WHERE code=?',c);if(!r)fail(404,'Không tìm thấy phòng thi.');return r}
function choices(q){if(q.options)return q.options;let n=numeric(q.answer),list=[q.answer];if(n!==null){let parts=q.answer.split('/');let extra=parts.length===2?[`${Number(parts[0])+1}/${parts[1]}`,`${parts[0]}/${Number(parts[1])+1}`,`${Number(parts[0])+2}/${Number(parts[1])+1}`]:[String(n+1),String(Math.max(0,n-1)),String(n+10),String(n+2)];for(let x of extra)if(!list.some(y=>correct(x,y)))list.push(x)}if(list.length<2)fail(500,'Câu hỏi chưa có phương án hợp lệ.');return list.slice(0,4).sort(()=>Math.random()-.5)}
// Daily exams follow Vietnam time. The server clock is authoritative; cron and
// requests use the same idempotent creation path (including after a missed cron).
const DAILY_SECONDS=60,DAILY_REVEAL_MS=8000,DAILY_LOBBY_MS=60000;
function vietnamDate(t){return new Date(t+7*3600000).toISOString().slice(0,10)}
function defaultSchoolStart(date){let year=Number(date.slice(0,4));if(date.slice(5)<'09-01')year--;let d=new Date(Date.UTC(year,8,1));d.setUTCDate(1+(8-d.getUTCDay())%7);return d.toISOString().slice(0,10)}
async function dailyPlan(env,t=now()){
 let date=vietnamDate(t),saved=await first(env.DB,"SELECT value FROM app_settings WHERE key='school_start'"),schoolStart=saved?.value||defaultSchoolStart(date);
 let offset=Math.floor((Date.parse(date+'T00:00:00Z')-Date.parse(schoolStart+'T00:00:00Z'))/86400000),day=Math.max(1,Math.min(175,Math.floor(Math.max(0,offset)/7)*5+Math.min(Math.max(0,offset)%7,4)+1));
 let opensAt=Date.parse(date+'T20:00:00+07:00');return{date,day,schoolStart,opensAt,startsAt:opensAt+DAILY_LOBBY_MS,timezone:'Asia/Ho_Chi_Minh',seconds:DAILY_SECONDS,revealSeconds:8}
}
async function ensureDaily(env,t=now()){
 await run(env.DB,"UPDATE rooms SET status='ended',question_index=json_array_length(questions)-1,deadline=created_at+60000+(json_array_length(questions)-1)*68000+60000,ended_at=created_at+60000+json_array_length(questions)*68000 WHERE code IN(SELECT room_code FROM daily_exams) AND status!='ended' AND created_at+60000+json_array_length(questions)*68000<=?",t);
 let plan=await dailyPlan(env,t);if(t<plan.opensAt)return{plan,room:null};
 let entry=await first(env.DB,'SELECT room_code FROM daily_exams WHERE exam_date=?',plan.date);
 if(!entry){let exam=makeExam(plan.day,'daily'),qs=exam.qs.map(q=>({...q,options:choices(q)})),c=code().slice(0,6);
  // A transaction and unique date guarantee one room even when cron and pupils arrive together.
  await env.DB.batch([env.DB.prepare("INSERT OR IGNORE INTO rooms(code,title,questions,seconds,created_at) SELECT ?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM daily_exams WHERE exam_date=?)").bind(c,'🌙 Thi ngày '+plan.date+' · Ngày học '+plan.day,JSON.stringify(qs),DAILY_SECONDS,plan.opensAt,plan.date),env.DB.prepare('INSERT OR IGNORE INTO daily_exams(exam_date,room_code,lesson_day) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE code=?)').bind(plan.date,c,plan.day,c)]);
  entry=await first(env.DB,'SELECT room_code FROM daily_exams WHERE exam_date=?',plan.date)
 }
 let room=await getRoom(env,entry.room_code);return{plan,room:await advanceDaily(env,room,t)}
}
async function advanceDaily(env,r,t=now()){
 let entry=await first(env.DB,'SELECT exam_date,lesson_day FROM daily_exams WHERE room_code=?',r.code);if(!entry)return r;
 r.automatic=true;r.examDate=entry.exam_date;r.lessonDay=entry.lesson_day;
 if(r.status==='ended')return r;
 let start=Date.parse(entry.exam_date+'T20:00:00+07:00')+DAILY_LOBBY_MS,total=JSON.parse(r.questions).length,slot=DAILY_SECONDS*1000+DAILY_REVEAL_MS,index=Math.floor((t-start)/slot);
 if(t<start){r.startsAt=start;return r}
 if(index>=total){await run(env.DB,"UPDATE rooms SET status='ended',question_index=?,ended_at=?,deadline=? WHERE code=? AND status!='ended'",total-1,start+total*slot,start+(total-1)*slot+DAILY_SECONDS*1000,r.code)}
 else await run(env.DB,"UPDATE rooms SET status='running',question_index=?,started_at=?,deadline=? WHERE code=? AND status!='ended' AND question_index<=?",index,start+index*slot,start+index*slot+DAILY_SECONDS*1000,r.code,index);
 return{...await getRoom(env,r.code),automatic:true,examDate:entry.exam_date,lessonDay:entry.lesson_day,startsAt:start}
}
async function dailyStatus(env){let {plan,room}=await ensureDaily(env);if(room)plan.day=room.lessonDay;let lesson=LESSONS[DAYS[plan.day-1].lesson-1];return{serverTime:now(),...plan,lesson:lesson.title,status:room?.status||'upcoming',code:room?.code||null,total:room?JSON.parse(room.questions).length:5,endsAt:plan.startsAt+(room?JSON.parse(room.questions).length:5)*(DAILY_SECONDS*1000+DAILY_REVEAL_MS)}}
async function snapshot(env,r,self=null,isAdmin=false){
 r=await advanceContest(env,r);
 let time=now(),questions=JSON.parse(r.questions),q=questions[r.question_index],revealed=r.status==='ended'||(r.status==='running'&&time>=r.deadline),rows=await all(env.DB,'SELECT p.*,s.name,s.active,s.expires_at FROM participants p JOIN students s ON s.id=p.student_id WHERE room_code=? ORDER BY seat',r.code),answers=await all(env.DB,'SELECT student_id,question_index,correct,submitted_at,value FROM answers WHERE room_code=?',r.code);
 const visibleIndex=revealed?r.question_index:r.question_index-1;
 let participants=rows.map(p=>{let mine=answers.filter(a=>a.student_id===p.student_id),current=mine.find(a=>a.question_index===r.question_index);return{id:p.student_id,name:p.name,seat:p.seat,online:!!p.present&&p.last_seen>time-ONLINE_MS&&!p.blocked&&!!p.active&&(p.expires_at===null||p.expires_at>time),blocked:!!p.blocked,joinedAt:p.joined_at,result:revealed?(current?(current.correct?'correct':'wrong'):'missing'):(current?'submitted':'waiting'),score:mine.filter(a=>a.question_index<=visibleIndex&&a.correct).length,answered:mine.filter(a=>a.question_index<=visibleIndex).length}});
 let question=r.status==='waiting'?null:q?{index:r.question_index+1,total:questions.length,text:q.q,topic:q.key,options:q.options,source:q.source,...(r.status==='running'&&time>=r.deadline-r.seconds*500?{hint:EXAM_RULES[q.key]||'Đọc kĩ đề, xác định dữ kiện và thử từng bước trước khi chọn đáp án.',hintKey:EXAM_RULES[q.key]?q.key:null}:{}),...(revealed?{answer:q.answer,explanation:q.why}:{})}:null;
 return{serverTime:time,room:{code:r.code,title:r.title,status:r.status,index:r.question_index,total:questions.length,seconds:r.seconds,deadline:r.deadline,startedAt:r.started_at,revealed,automatic:!!r.automatic,startsAt:r.startsAt||null,nextAt:r.automatic&&r.deadline?r.deadline+DAILY_REVEAL_MS:null,entryMode:r.entryMode||(r.automatic?'open':'code'),contestType:r.contestType||(r.automatic?'daily':'custom'),publicId:r.publicId||null},question,participants,selfId:self?.id||null,submitted:self?answers.some(a=>a.student_id===self.id&&a.question_index===r.question_index):false,isAdmin}
}
async function api(request,env,url){const p=url.pathname,method=request.method;
 if(p==='/api/health')return json({ok:true,app:'Học Toán cùng MIA',version:11,speechFallback:true,friendsChat:true,weekendSessions:[9,11,15,17,20],aiAdvisor:true,studentTerms:true,rewardsAndReports:true,weeklyContests:true,adaptiveLearning:true,examCoaching:true,dailyExamTime:'20:00',timezone:'Asia/Ho_Chi_Minh',authMode:standalone(env)?'standalone':'sites'});
 if(p==='/api/admin-auth/status')return json({mode:standalone(env)?'standalone':'sites',configured:standalone(env)?adminConfigured(env):true});
 if(p==='/api/admin-auth/login'&&method==='POST'){
  if(!standalone(env))fail(409,'Máy chủ cũ vẫn dùng đăng nhập chủ ứng dụng. Hãy triển khai bản độc lập từ GitHub Actions.');if(!adminConfigured(env))fail(503,'Chưa cấu hình mật khẩu admin trên máy chủ.');
  const b=await body(request),ip=request.headers.get('cf-connecting-ip')||'unknown';await rateLimit(env,'admin-ip:'+ip,8);
  const username=String(b.username||''),password=String(b.password||'');if(password.length>256)fail(401,'Tên hoặc mật khẩu admin không đúng.');let candidate=await derivePassword(password,env.ADMIN_PASSWORD_SALT);
  if(!equal(candidate,env.ADMIN_PASSWORD_HASH)||normalizeName(username)!==normalizeName(env.ADMIN_USERNAME||'admin'))fail(401,'Tên hoặc mật khẩu admin không đúng.');
  let token=random(),expiresAt=now()+8*3600000;await run(env.DB,'INSERT INTO admin_sessions(token_hash,version,expires_at) VALUES(?,?,?)',await hash(token),await credentialVersion(env),expiresAt);return json({token,username:env.ADMIN_USERNAME||'admin',expiresAt})
 }
 if(p==='/api/admin-auth/logout'&&method==='POST'){await admin(request,env);await run(env.DB,'DELETE FROM admin_sessions WHERE token_hash=?',await hash((request.headers.get('authorization')||'').slice(7)));return json({ok:true})}
 if(!['/api/admin/session','/api/admin/export','/api/admin/import'].includes(p)){let transfer=await first(env.DB,'SELECT status FROM data_transfer WHERE id=1');if(transfer?.status==='pending')fail(503,'Đang khôi phục bản sao lưu. Admin cần nhập lại đúng tệp để hoàn tất.')}
 if(p==='/api/community'&&method==='GET'){let viewer=null;try{viewer=await student(request,env)}catch(error){if(error.status!==401)throw error}return json(await communityData(env,viewer,url.searchParams.get('period')))}
 if(p==='/api/presence'&&method==='POST'){let s=await student(request,env);await touchPresence(env,s.id);return json({ok:true,serverTime:now()})}
 if(p==='/api/family-report'&&method==='GET'){let s=await student(request,env);return json(await familyReport(env,s,url))}
 if(p==='/api/contests'&&method==='GET')return json(await contestFeed(env));
 let publicJoin=p.match(/^\/api\/contests\/([a-f0-9-]{36})\/join$/);if(publicJoin&&method==='POST'){await student(request,env);let settings=await first(env.DB,'SELECT * FROM room_settings WHERE public_id=?',publicJoin[1]);if(!settings)fail(404,'Chưa tìm thấy cuộc thi.');if(settings.entry_mode!=='open')fail(403,'Cuộc thi này yêu cầu mã phòng do admin cấp.');if(now()<settings.opens_at)fail(409,'Chưa đến giờ mở phòng thi.');return api(request,env,new URL('/api/rooms/'+settings.room_code+'/join',url.origin))}
 if(p==='/api/daily'&&method==='GET')return json(await dailyStatus(env));
 if(p==='/api/daily/join'&&method==='POST'){await student(request,env);let d=await ensureDaily(env);if(!d.room)fail(409,'Bài thi mở lúc 20h giờ Việt Nam.');if(d.room.status==='ended')fail(409,'Bài thi hôm nay đã kết thúc. Hẹn em lúc 20h ngày mai!');return api(request,env,new URL('/api/rooms/'+d.room.code+'/join',url.origin))}
 if(p==='/api/login'&&method==='POST'){
  const b=await body(request),name=normalizeName(b.name),ip=request.headers.get('cf-connecting-ip')||'unknown';await rateLimit(env,'ip:'+ip,120);await rateLimit(env,'name:'+name,10);
  const s=await first(env.DB,'SELECT * FROM students WHERE normalized=? AND active=1',name);if(!s||!equal(s.pin_hash,await hash(s.pin_salt+':'+String(b.pin||'').trim().toUpperCase())))fail(401,'Tên hoặc mã riêng không đúng. Hãy hỏi admin để được cấp lại.');
  checkTerm(s);const token=random();await run(env.DB,'INSERT INTO sessions(token_hash,student_id,expires_at) VALUES(?,?,?)',await hash(token),s.id,now()+SESSION_MS);await touchPresence(env,s.id);return json({token,student:{id:s.id,name:s.name,expires_at:s.expires_at,term_months:s.term_months}})
 }
 if(p==='/api/friends'||p.startsWith('/api/chat/'))return socialApi(request,env,url,await student(request,env));
 if(p==='/api/advisor'&&method==='GET'){let s=await student(request,env);return json({advisor:await advisorFor(env,s.id),ai:await aiStatus(env,s.id)})}
 if(p==='/api/voice'&&method==='POST'){let s=await student(request,env),b=await body(request,3000);return teachingAudio(env,s.id,s.name,b.text)}
 if(p==='/api/ai/lesson'&&method==='POST'){let s=await student(request,env);return json(await extendedLesson(env,s.id,await body(request,1000),await advisorFor(env,s.id)))}
 if(p==='/api/me'){const s=await student(request,env);return json({student:s})}
 if(p==='/api/logout'&&method==='POST'){await student(request,env);await run(env.DB,'DELETE FROM sessions WHERE token_hash=?',await hash((request.headers.get('authorization')||'').slice(7)));return json({ok:true})}
 if(p==='/api/progress'){
  const s=await student(request,env);
  if(method==='GET'){const r=await first(env.DB,'SELECT payload,updated_at FROM progress WHERE student_id=?',s.id);let rows=await all(env.DB,"SELECT a.room_code,a.question_index,a.correct,a.submitted_at,r.questions FROM answers a JOIN rooms r ON r.code=a.room_code WHERE a.student_id=? AND (r.status='ended' OR a.question_index<r.question_index OR (a.question_index=r.question_index AND r.deadline<=?)) ORDER BY a.submitted_at DESC LIMIT 200",s.id,now());let evidence=rows.map(a=>({id:'online:'+a.room_code+':'+a.question_index,key:JSON.parse(a.questions)[a.question_index]?.key,prompt:JSON.parse(a.questions)[a.question_index]?.q,correct:!!a.correct,at:a.submitted_at,verified:true})).filter(a=>typeof a.key==='string');return json({progress:r?JSON.parse(r.payload):null,updatedAt:r?.updated_at||null,evidence})}
  if(method==='PUT'){const b=await body(request,2000000);if(!b.progress||!Array.isArray(b.progress.completed)||!Array.isArray(b.progress.results)||!Array.isArray(b.progress.read)||b.progress.completed.some(x=>!Number.isInteger(x)||x<1||x>175)||b.progress.results.length>1000)fail(400,'Tiến độ không hợp lệ.');b.progress.name=s.name;await archiveLearning(env,s.id,b.progress);await run(env.DB,'INSERT INTO progress(student_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(student_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',s.id,JSON.stringify(b.progress),now());return json({ok:true})}
 }
 if(p.startsWith('/api/admin/')){
  const owner=await admin(request,env);
  if(method!=='GET'&&request.headers.get('origin')!==url.origin&&(!standalone(env)||request.headers.get('origin')!==new URL(appUrl(env)).origin))fail(403,'Yêu cầu quản trị phải gửi từ trang admin.');
  if(p==='/api/admin/export'&&method==='GET')return json(await exportData(env));
  if(p==='/api/admin/import'&&method==='POST'){const b=await body(request,8000000);return json(b.backup?await importData(env,b.backup):await importBatch(env,b))}
  if(p==='/api/admin/daily-settings'){if(method==='GET')return json(await dailyStatus(env));if(method==='POST'){let b=await body(request),date=String(b.schoolStart||'');if(!/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||new Date(date+'T00:00:00Z').getUTCDay()!==1)fail(400,'Chọn ngày thứ Hai bắt đầu tuần học 1.');await run(env.DB,"INSERT INTO app_settings(key,value) VALUES('school_start',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",date);return json(await dailyStatus(env))}}
  if(p==='/api/admin/community'&&method==='GET')return json(await communityData(env,{id:'admin'},url.searchParams.get('period')));
  if(p.startsWith('/api/admin/chat'))return adminChatApi(request,env,url);
  if(p==='/api/admin/advisor'&&method==='GET')return json({...await advisorOverview(env),ai:await aiStatus(env)});
  if(p==='/api/admin/ai-settings'){if(method==='POST'){let b=await body(request);if(typeof b.enabled!=='boolean')fail(400,'Chọn bật hoặc tắt AI.');await run(env.DB,'UPDATE ai_controls SET enabled=? WHERE id=1',b.enabled?1:0)}return json(await aiStatus(env))}
  if(p==='/api/admin/voice-test'&&method==='POST')return teachingAudio(env,'admin','', 'Chào em, cô Mi A cùng em học toán nhé.');
  if(p==='/api/admin/ai-test'&&method==='POST')return json(await extendedLesson(env,'admin',{day:1,intent:'simpler'}));
  if(p==='/api/admin/session')return json({role:'admin',appUrl:appUrl(env),ownerId:owner});
  if(p==='/api/admin/students'&&method==='GET')return json({serverTime:now(),students:await all(env.DB,'SELECT s.id,s.name,s.active,s.created_at,s.expires_at,s.term_months,s.renewed_at,p.updated_at,CASE WHEN s.active=1 AND (s.expires_at IS NULL OR s.expires_at>?) AND (x.last_seen>=? OR EXISTS(SELECT 1 FROM participants q WHERE q.student_id=s.id AND q.present=1 AND q.last_seen>=?)) THEN 1 ELSE 0 END online FROM students s LEFT JOIN progress p ON p.student_id=s.id LEFT JOIN student_presence x ON x.student_id=s.id ORDER BY s.created_at DESC LIMIT 2000',now(),now()-90000,now()-ONLINE_MS)});
  if(p==='/api/admin/students'&&method==='POST'){
   const b=await body(request),name=cleanName(b.name),id=crypto.randomUUID(),pin=code(),salt=random(16),months=accountTerm(b.months===undefined?1:b.months),created=now(),expires=addTermMonths(created,months);
   try{await run(env.DB,'INSERT INTO students(id,name,normalized,pin_hash,pin_salt,created_at,expires_at,term_months) VALUES(?,?,?,?,?,?,?,?)',id,name,normalizeName(name),await hash(salt+':'+pin),salt,created,expires,months)}catch(e){if(/UNIQUE/.test(e.message))fail(409,'Tên này đã có. Hãy thêm lớp hoặc biệt danh để phân biệt.');throw e}return json({student:{id,name,created_at:created,expires_at:expires,term_months:months},pin},201)
  }
  let match=p.match(/^\/api\/admin\/students\/([^/]+)\/(reset|active|report|renew)$/);
  if(match){const id=match[1],action=match[2],s=await first(env.DB,'SELECT id,name,created_at,active,expires_at,term_months,renewed_at FROM students WHERE id=?',id);if(!s)fail(404,'Không tìm thấy học sinh.');
   if(action==='report'&&method==='GET'){let pr=await first(env.DB,'SELECT payload FROM progress WHERE student_id=?',id);let tests=await all(env.DB,'SELECT r.code,r.title,r.status,r.questions,COUNT(a.question_index) answered,COALESCE(SUM(a.correct),0) correct FROM participants p JOIN rooms r ON r.code=p.room_code LEFT JOIN answers a ON a.room_code=r.code AND a.student_id=p.student_id WHERE p.student_id=? GROUP BY r.code ORDER BY r.created_at DESC',id);return json({student:s,progress:pr?JSON.parse(pr.payload):null,rooms:tests.map(x=>({code:x.code,title:x.title,status:x.status,answered:x.answered,correct:x.correct,total:JSON.parse(x.questions).length})),report:await familyReport(env,s,url)})}
   if(action==='renew'&&method==='POST'){let b=await body(request),months=accountTerm(b.months),time=now(),base=Math.max(time,s.expires_at||0),expires=addTermMonths(base,months);let updated=await run(env.DB,'UPDATE students SET expires_at=?,term_months=?,renewed_at=? WHERE id=? AND expires_at IS ?',expires,months,time,id,s.expires_at);if(!updated.meta.changes)fail(409,'Tài khoản vừa được cập nhật. Hãy làm mới danh sách trước khi gia hạn.');return json({student:await first(env.DB,'SELECT id,name,created_at,active,expires_at,term_months,renewed_at FROM students WHERE id=?',id),serverTime:time})}
   if(action==='reset'&&method==='POST'){const pin=code(),salt=random(16);await env.DB.batch([env.DB.prepare('UPDATE students SET pin_hash=?,pin_salt=? WHERE id=?').bind(await hash(salt+':'+pin),salt,id),env.DB.prepare('DELETE FROM sessions WHERE student_id=?').bind(id)]);return json({student:s,pin})}
   if(action==='active'&&method==='POST'){let b=await body(request);await env.DB.batch([env.DB.prepare('UPDATE students SET active=? WHERE id=?').bind(b.active?1:0,id),env.DB.prepare('DELETE FROM sessions WHERE student_id=?').bind(id),env.DB.prepare('UPDATE participants SET present=0 WHERE student_id=?').bind(id)]);return json({ok:true})}
  }
  if(p==='/api/admin/rooms'&&method==='GET')return json({rooms:(await all(env.DB,"SELECT r.code,r.title,r.status,r.created_at,r.question_index,s.public_id,COALESCE(s.entry_mode,CASE WHEN EXISTS(SELECT 1 FROM daily_exams d WHERE d.room_code=r.code) THEN 'open' ELSE 'code' END) AS entry_mode,s.scheduled_at,s.auto_run,s.contest_type FROM rooms r LEFT JOIN room_settings s ON s.room_code=r.code ORDER BY r.created_at DESC LIMIT 50")),lessons:LESSONS.map(l=>({id:l.id,title:l.title})),days:DAYS.map(d=>({id:d.id,lesson:d.lesson}))});
  if(p==='/api/admin/rooms'&&method==='POST'){
   const b=await body(request),day=Number(b.day),seconds=Number(b.seconds||30),count=Number(b.count||10);if(!Number.isInteger(day)||day<1||day>175||!Number.isInteger(seconds)||seconds<10||seconds>300||!Number.isInteger(count)||count<1||count>25)fail(400,'Kiểm tra ngày học, số câu (1–25) và thời gian (10–300 giây).');
   let meta=validateContestMeta(b),exam=makeExam(day,b.kind==='daily'?'daily':b.kind==='term'?'term':b.kind==='month'?'month':'week'),qs=exam.qs.slice(0,count).map(q=>({...q,options:choices(q)}));let inserted=await insertContest(env,{title:String(b.title||'Phòng thi cùng MIA').slice(0,80),qs,seconds,meta});if(!inserted)fail(409,'Buổi thi tuần này đã có phòng. Mở phòng hiện có hoặc chọn cuộc thi riêng.');let c=inserted.code;return json({code:c,entryMode:meta.entry_mode,publicId:inserted.settings.public_id,appUrl:appUrl(env)+(meta.entry_mode==='open'?'?event='+inserted.settings.public_id:'?room='+c)+'#online'},201)
  }
  match=p.match(/^\/api\/admin\/rooms\/([A-Z2-9]{6})(?:\/(start|next|finish|kick|allow))?$/);
  if(match){let r=await getRoom(env,match[1]),action=match[2];if(method==='GET'&&!action)return json(await snapshot(env,r,null,true));
   if(method==='POST'&&action){if(['start','next','finish'].includes(action)&&(await first(env.DB,'SELECT room_code FROM daily_exams WHERE room_code=?',r.code)|| (await roomSettings(env,r.code))?.auto_run))fail(409,'Bài thi ngày tự điều khiển theo đồng hồ 20h.');let t=now(),qs=JSON.parse(r.questions);
    if(action==='start'){if(r.status!=='waiting')fail(409,'Phòng đã bắt đầu.');await run(env.DB,"UPDATE rooms SET status='running',question_index=0,started_at=?,deadline=? WHERE code=? AND status='waiting'",t,t+r.seconds*1000,r.code)}
    if(action==='next'){if(r.status!=='running'||t<r.deadline)fail(409,'Hãy đợi hết giờ câu hiện tại trước khi chuyển câu.');if(r.question_index+1>=qs.length)await run(env.DB,"UPDATE rooms SET status='ended',ended_at=? WHERE code=?",t,r.code);else await run(env.DB,'UPDATE rooms SET question_index=question_index+1,started_at=?,deadline=? WHERE code=? AND question_index=?',t,t+r.seconds*1000,r.code,r.question_index)}
    if(action==='finish')await run(env.DB,"UPDATE rooms SET status='ended',ended_at=?,deadline=? WHERE code=?",t,t,r.code);
    if(action==='kick'||action==='allow'){let b=await body(request);await run(env.DB,'UPDATE participants SET blocked=?,present=0 WHERE room_code=? AND student_id=?',action==='kick'?1:0,r.code,String(b.studentId||''))}
    return json(await snapshot(env,await getRoom(env,r.code),null,true))
   }
  }
  fail(404,'Không có chức năng quản trị này.');
 }
 let m=p.match(/^\/api\/rooms\/([A-Z2-9]{6})(?:\/(join|heartbeat|leave|answer))?$/);
 if(m){const s=await student(request,env),r=await advanceContest(env,await getRoom(env,m[1])),action=m[2],time=now();let member=await first(env.DB,'SELECT * FROM participants WHERE room_code=? AND student_id=?',r.code,s.id);
  if(action==='join'&&method==='POST'){
   if(r.status==='ended')fail(409,'Phòng thi đã kết thúc.');let settings=await roomSettings(env,r.code);if(settings&&time<settings.opens_at)fail(409,'Chưa đến giờ mở phòng thi.');if(member?.blocked)fail(403,'Admin đã mời bạn ra khỏi phòng.');
   if(member)await run(env.DB,'UPDATE participants SET present=1,last_seen=?,joined_at=? WHERE room_code=? AND student_id=?',time,time,r.code,s.id);
   else {try{let res=await run(env.DB,'INSERT INTO participants(room_code,student_id,seat,joined_at,last_seen) SELECT ?,?,COALESCE(MAX(seat)+1,0),?,? FROM participants WHERE room_code=? HAVING COALESCE(MAX(seat)+1,0)<?',r.code,s.id,time,time,r.code,LIMIT);if(!res.meta.changes)fail(409,'Phòng đã đủ 40 thí sinh.')}catch(e){if(e.status)throw e;if(/UNIQUE/.test(e.message))fail(409,'Bạn đã có chỗ trong phòng. Hãy thử lại.');throw e}}
   return json(await snapshot(env,r,s))
  }
  if(!member||member.blocked)fail(403,'Hãy vào phòng trước hoặc liên hệ admin.');
  if(action==='leave'&&method==='POST'){await run(env.DB,'UPDATE participants SET present=0,last_seen=? WHERE room_code=? AND student_id=?',time,r.code,s.id);return json({ok:true})}
  if(action==='heartbeat'&&method==='POST'){if(!member.present)fail(403,'Bạn đã rời phòng. Hãy vào lại.');await run(env.DB,'UPDATE participants SET last_seen=? WHERE room_code=? AND student_id=?',time,r.code,s.id);return json(await snapshot(env,r,s))}
  if(action==='answer'&&method==='POST'){
   if(!member.present)fail(403,'Bạn đã rời phòng.');const b=await body(request),index=Number(b.index),qs=JSON.parse(r.questions),q=qs[index];if(r.status!=='running'||index!==r.question_index||time>=r.deadline)fail(409,'Câu hỏi đã hết giờ hoặc đã chuyển.');if(!q||!q.options.includes(b.value))fail(400,'Chọn một phương án trên bảng.');
   const res=await run(env.DB,"INSERT OR IGNORE INTO answers(room_code,student_id,question_index,value,correct,submitted_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE code=? AND status='running' AND question_index=? AND deadline>?)",r.code,s.id,index,b.value,correct(b.value,q.answer)?1:0,time,r.code,index,time);if(!res.meta.changes)fail(409,'Bạn đã trả lời câu này hoặc câu hỏi đã hết giờ.');await markStudyDay(env,s.id);return json({accepted:true})
  }
  if(!action&&method==='GET')return json(await snapshot(env,r,s));
 }
 fail(404,'Không tìm thấy chức năng.');
}
export default {async scheduled(event,env,ctx){ctx.waitUntil((async()=>{let job=await first(env.DB,'SELECT status FROM data_transfer WHERE id=1');if(job?.status!=='pending'){let time=event.scheduledTime||now();await ensureWeekendSessions(env,time);await ensureWeekly(env,time);await ensureDaily(env,time)}})())},async fetch(request,env,ctx){const url=new URL(request.url),origin=request.headers.get('origin'),allowed=origin===new URL(appUrl(env)).origin||origin===url.origin;let response;
 try{
  if(request.method==='OPTIONS'){if(!allowed)return new Response(null,{status:403});response=new Response(null,{status:204})}
  else if(url.pathname==='/admin'&&standalone(env))return Response.redirect(appUrl(env)+'admin.html',302);
  else if(url.pathname==='/admin'){try{await admin(request,env);response=new Response(ADMIN_HTML,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'}})}catch(e){if(e.status===401)return Response.redirect(url.origin+'/signin-with-chatgpt?return_to=%2Fadmin',302);throw e}}
  else if(url.pathname==='/'&&!url.searchParams.has('health'))return Response.redirect(appUrl(env)+'#online',302);
  else if(origin&&!allowed)response=json({error:'Nguồn truy cập không được phép.'},403);
  else response=await api(request,env,url);
 }catch(e){response=json({error:e.status?e.message:'Máy chủ đang gặp lỗi. Vui lòng thử lại.',...(e.code?{code:e.code}:{})},e.status||500);if(!e.status)console.error(e.message)}
 const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');if(allowed){headers.set('Access-Control-Allow-Origin',origin);headers.set('Vary','Origin');headers.set('Access-Control-Allow-Headers','Authorization,Content-Type');headers.set('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');headers.set('Access-Control-Max-Age','600')}
 return new Response(response.body,{status:response.status,headers});
}};
