import {LESSONS,DAYS,makeExam,correct,numeric} from './bank.js';
const APP='https://nhiem-qn.github.io/H-c-To-n-4/';
const LIMIT=40,ONLINE_MS=22000,SESSION_MS=7*86400000;
const now=()=>Date.now();
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
function fail(status,message){let e=new Error(message);e.status=status;throw e}
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
async function admin(request,env){
 const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
 if(!id)fail(401,'Đăng nhập ChatGPT để quản trị.');
 const existing=await first(env.DB,'SELECT user_id FROM admins LIMIT 1');
 if(existing){if(existing.user_id!==id)fail(403,'Tài khoản này không có quyền admin.');return id}
 if(!env.ADMIN_EMAIL||normalizeName(email)!==normalizeName(env.ADMIN_EMAIL))fail(403,'Chỉ chủ ứng dụng được kích hoạt quyền admin.');
 await run(env.DB,'INSERT OR IGNORE INTO admins(user_id,created_at) VALUES(?,?)',id,now());
 const owner=await first(env.DB,'SELECT user_id FROM admins LIMIT 1');if(owner.user_id!==id)fail(403,'Không có quyền admin.');return id
}
async function student(request,env){let token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');if(!/^[a-f0-9]{48}$/.test(token))fail(401,'Vui lòng đăng nhập bằng tên và mã riêng.');let row=await first(env.DB,'SELECT s.id,s.name FROM sessions t JOIN students s ON s.id=t.student_id WHERE t.token_hash=? AND t.expires_at>? AND s.active=1',await hash(token),now());if(!row)fail(401,'Phiên đăng nhập đã hết hạn hoặc tài khoản đã bị khóa.');return row}
async function rateLimit(env,key,max=12){let time=now(),bucket=key+':'+Math.floor(time/60000);await run(env.DB,'INSERT INTO rate_limits(key,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1',bucket,time+120000);let r=await first(env.DB,'SELECT attempts FROM rate_limits WHERE key=?',bucket);if(r.attempts>max)fail(429,'Bạn thử quá nhiều lần. Vui lòng chờ một phút.');}
function roomCode(value){let c=String(value||'').trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(c))fail(400,'Mã phòng gồm 6 chữ hoặc số.');return c}
async function getRoom(env,value){let c=roomCode(value),r=await first(env.DB,'SELECT * FROM rooms WHERE code=?',c);if(!r)fail(404,'Không tìm thấy phòng thi.');return r}
function choices(q){if(q.options)return q.options;let n=numeric(q.answer),list=[q.answer];if(n!==null){let parts=q.answer.split('/');let extra=parts.length===2?[`${Number(parts[0])+1}/${parts[1]}`,`${parts[0]}/${Number(parts[1])+1}`,`${Number(parts[0])+2}/${Number(parts[1])+1}`]:[String(n+1),String(Math.max(0,n-1)),String(n+10),String(n+2)];for(let x of extra)if(!list.some(y=>correct(x,y)))list.push(x)}if(list.length<2)fail(500,'Câu hỏi chưa có phương án hợp lệ.');return list.slice(0,4).sort(()=>Math.random()-.5)}
async function snapshot(env,r,self=null,isAdmin=false){
 let time=now(),questions=JSON.parse(r.questions),q=questions[r.question_index],revealed=r.status==='ended'||(r.status==='running'&&time>=r.deadline),rows=await all(env.DB,'SELECT p.*,s.name FROM participants p JOIN students s ON s.id=p.student_id WHERE room_code=? ORDER BY seat',r.code),answers=await all(env.DB,'SELECT student_id,question_index,correct,submitted_at,value FROM answers WHERE room_code=?',r.code);
 const visibleIndex=revealed?r.question_index:r.question_index-1;
 let participants=rows.map(p=>{let mine=answers.filter(a=>a.student_id===p.student_id),current=mine.find(a=>a.question_index===r.question_index);return{id:p.student_id,name:p.name,seat:p.seat,online:!!p.present&&p.last_seen>time-ONLINE_MS&&!p.blocked,blocked:!!p.blocked,joinedAt:p.joined_at,result:revealed?(current?(current.correct?'correct':'wrong'):'missing'):(current?'submitted':'waiting'),score:mine.filter(a=>a.question_index<=visibleIndex&&a.correct).length,answered:mine.filter(a=>a.question_index<=visibleIndex).length}});
 let question=r.status==='waiting'?null:q?{index:r.question_index+1,total:questions.length,text:q.q,options:q.options,source:q.source,...(revealed?{answer:q.answer,explanation:q.why}:{})}:null;
 return{serverTime:time,room:{code:r.code,title:r.title,status:r.status,index:r.question_index,total:questions.length,seconds:r.seconds,deadline:r.deadline,startedAt:r.started_at,revealed},question,participants,selfId:self?.id||null,submitted:self?answers.some(a=>a.student_id===self.id&&a.question_index===r.question_index):false,isAdmin}
}
async function api(request,env,url){const p=url.pathname,method=request.method;
 if(p==='/api/health')return json({ok:true,app:'Học Toán cùng MIA',version:1});
 if(p==='/api/login'&&method==='POST'){
  const b=await body(request),name=normalizeName(b.name),ip=request.headers.get('cf-connecting-ip')||'unknown';await rateLimit(env,'ip:'+ip,120);await rateLimit(env,'name:'+name,10);
  const s=await first(env.DB,'SELECT * FROM students WHERE normalized=? AND active=1',name);if(!s||!equal(s.pin_hash,await hash(s.pin_salt+':'+String(b.pin||'').trim().toUpperCase())))fail(401,'Tên hoặc mã riêng không đúng. Hãy hỏi admin để được cấp lại.');
  const token=random();await run(env.DB,'INSERT INTO sessions(token_hash,student_id,expires_at) VALUES(?,?,?)',await hash(token),s.id,now()+SESSION_MS);return json({token,student:{id:s.id,name:s.name}})
 }
 if(p==='/api/me'){const s=await student(request,env);return json({student:s})}
 if(p==='/api/logout'&&method==='POST'){await student(request,env);await run(env.DB,'DELETE FROM sessions WHERE token_hash=?',await hash((request.headers.get('authorization')||'').slice(7)));return json({ok:true})}
 if(p==='/api/progress'){
  const s=await student(request,env);
  if(method==='GET'){const r=await first(env.DB,'SELECT payload,updated_at FROM progress WHERE student_id=?',s.id);return json({progress:r?JSON.parse(r.payload):null,updatedAt:r?.updated_at||null})}
  if(method==='PUT'){const b=await body(request,2000000);if(!b.progress||!Array.isArray(b.progress.completed)||!Array.isArray(b.progress.results)||!Array.isArray(b.progress.read)||b.progress.completed.some(x=>!Number.isInteger(x)||x<1||x>175)||b.progress.results.length>1000)fail(400,'Tiến độ không hợp lệ.');b.progress.name=s.name;await run(env.DB,'INSERT INTO progress(student_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(student_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',s.id,JSON.stringify(b.progress),now());return json({ok:true})}
 }
 if(p.startsWith('/api/admin/')){
  const owner=await admin(request,env);
  if(method!=='GET'&&request.headers.get('origin')!==url.origin)fail(403,'Yêu cầu quản trị phải gửi từ trang admin.');
  if(p==='/api/admin/session')return json({role:'admin',appUrl:APP,ownerId:owner});
  if(p==='/api/admin/students'&&method==='GET')return json({students:await all(env.DB,'SELECT s.id,s.name,s.active,s.created_at,p.updated_at FROM students s LEFT JOIN progress p ON p.student_id=s.id ORDER BY s.created_at DESC LIMIT 2000')});
  if(p==='/api/admin/students'&&method==='POST'){
   const b=await body(request),name=cleanName(b.name),id=crypto.randomUUID(),pin=code(),salt=random(16);
   try{await run(env.DB,'INSERT INTO students(id,name,normalized,pin_hash,pin_salt,created_at) VALUES(?,?,?,?,?,?)',id,name,normalizeName(name),await hash(salt+':'+pin),salt,now())}catch(e){if(/UNIQUE/.test(e.message))fail(409,'Tên này đã có. Hãy thêm lớp hoặc biệt danh để phân biệt.');throw e}return json({student:{id,name},pin},201)
  }
  let match=p.match(/^\/api\/admin\/students\/([^/]+)\/(reset|active|report)$/);
  if(match){const id=match[1],action=match[2],s=await first(env.DB,'SELECT id,name FROM students WHERE id=?',id);if(!s)fail(404,'Không tìm thấy học sinh.');
   if(action==='report'&&method==='GET'){let pr=await first(env.DB,'SELECT payload FROM progress WHERE student_id=?',id);let tests=await all(env.DB,'SELECT r.code,r.title,r.status,r.questions,COUNT(a.question_index) answered,COALESCE(SUM(a.correct),0) correct FROM participants p JOIN rooms r ON r.code=p.room_code LEFT JOIN answers a ON a.room_code=r.code AND a.student_id=p.student_id WHERE p.student_id=? GROUP BY r.code ORDER BY r.created_at DESC',id);return json({student:s,progress:pr?JSON.parse(pr.payload):null,rooms:tests.map(x=>({code:x.code,title:x.title,status:x.status,answered:x.answered,correct:x.correct,total:JSON.parse(x.questions).length}))})}
   if(action==='reset'&&method==='POST'){const pin=code(),salt=random(16);await env.DB.batch([env.DB.prepare('UPDATE students SET pin_hash=?,pin_salt=? WHERE id=?').bind(await hash(salt+':'+pin),salt,id),env.DB.prepare('DELETE FROM sessions WHERE student_id=?').bind(id)]);return json({student:s,pin})}
   if(action==='active'&&method==='POST'){let b=await body(request);await env.DB.batch([env.DB.prepare('UPDATE students SET active=? WHERE id=?').bind(b.active?1:0,id),env.DB.prepare('DELETE FROM sessions WHERE student_id=?').bind(id),env.DB.prepare('UPDATE participants SET present=0 WHERE student_id=?').bind(id)]);return json({ok:true})}
  }
  if(p==='/api/admin/rooms'&&method==='GET')return json({rooms:(await all(env.DB,'SELECT code,title,status,created_at,question_index FROM rooms ORDER BY created_at DESC LIMIT 50')),lessons:LESSONS.map(l=>({id:l.id,title:l.title})),days:DAYS.map(d=>({id:d.id,lesson:d.lesson}))});
  if(p==='/api/admin/rooms'&&method==='POST'){
   const b=await body(request),day=Number(b.day),seconds=Number(b.seconds||30),count=Number(b.count||10);if(!Number.isInteger(day)||day<1||day>175||!Number.isInteger(seconds)||seconds<10||seconds>300||!Number.isInteger(count)||count<1||count>25)fail(400,'Kiểm tra ngày học, số câu (1–25) và thời gian (10–300 giây).');
   let exam=makeExam(day,b.kind==='daily'?'daily':b.kind==='term'?'term':'week');let qs=exam.qs.slice(0,count).map(q=>({...q,options:choices(q)}));let c=code().slice(0,6);await run(env.DB,'INSERT INTO rooms(code,title,questions,seconds,created_at) VALUES(?,?,?,?,?)',c,String(b.title||'Phòng thi cùng MIA').slice(0,80),JSON.stringify(qs),seconds,now());return json({code:c,appUrl:APP+'?room='+c+'#online'},201)
  }
  match=p.match(/^\/api\/admin\/rooms\/([A-Z2-9]{6})(?:\/(start|next|finish|kick|allow))?$/);
  if(match){let r=await getRoom(env,match[1]),action=match[2];if(method==='GET'&&!action)return json(await snapshot(env,r,null,true));
   if(method==='POST'&&action){let t=now(),qs=JSON.parse(r.questions);
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
 if(m){const s=await student(request,env),r=await getRoom(env,m[1]),action=m[2],time=now();let member=await first(env.DB,'SELECT * FROM participants WHERE room_code=? AND student_id=?',r.code,s.id);
  if(action==='join'&&method==='POST'){
   if(r.status==='ended')fail(409,'Phòng thi đã kết thúc.');if(member?.blocked)fail(403,'Admin đã mời bạn ra khỏi phòng.');
   if(member)await run(env.DB,'UPDATE participants SET present=1,last_seen=?,joined_at=? WHERE room_code=? AND student_id=?',time,time,r.code,s.id);
   else {try{let res=await run(env.DB,'INSERT INTO participants(room_code,student_id,seat,joined_at,last_seen) SELECT ?,?,COALESCE(MAX(seat)+1,0),?,? FROM participants WHERE room_code=? HAVING COALESCE(MAX(seat)+1,0)<?',r.code,s.id,time,time,r.code,LIMIT);if(!res.meta.changes)fail(409,'Phòng đã đủ 40 thí sinh.')}catch(e){if(e.status)throw e;if(/UNIQUE/.test(e.message))fail(409,'Bạn đã có chỗ trong phòng. Hãy thử lại.');throw e}}
   return json(await snapshot(env,r,s))
  }
  if(!member||member.blocked)fail(403,'Hãy vào phòng trước hoặc liên hệ admin.');
  if(action==='leave'&&method==='POST'){await run(env.DB,'UPDATE participants SET present=0,last_seen=? WHERE room_code=? AND student_id=?',time,r.code,s.id);return json({ok:true})}
  if(action==='heartbeat'&&method==='POST'){if(!member.present)fail(403,'Bạn đã rời phòng. Hãy vào lại.');await run(env.DB,'UPDATE participants SET last_seen=? WHERE room_code=? AND student_id=?',time,r.code,s.id);return json(await snapshot(env,r,s))}
  if(action==='answer'&&method==='POST'){
   if(!member.present)fail(403,'Bạn đã rời phòng.');const b=await body(request),index=Number(b.index),qs=JSON.parse(r.questions),q=qs[index];if(r.status!=='running'||index!==r.question_index||time>=r.deadline)fail(409,'Câu hỏi đã hết giờ hoặc đã chuyển.');if(!q||!q.options.includes(b.value))fail(400,'Chọn một phương án trên bảng.');
   const res=await run(env.DB,"INSERT OR IGNORE INTO answers(room_code,student_id,question_index,value,correct,submitted_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE code=? AND status='running' AND question_index=? AND deadline>?)",r.code,s.id,index,b.value,correct(b.value,q.answer)?1:0,time,r.code,index,time);if(!res.meta.changes)fail(409,'Bạn đã trả lời câu này hoặc câu hỏi đã hết giờ.');return json({accepted:true})
  }
  if(!action&&method==='GET')return json(await snapshot(env,r,s));
 }
 fail(404,'Không tìm thấy chức năng.');
}
export default {async fetch(request,env,ctx){const url=new URL(request.url),origin=request.headers.get('origin'),allowed=origin===new URL(APP).origin||origin===url.origin;let response;
 try{
  if(request.method==='OPTIONS'){if(!allowed)return new Response(null,{status:403});response=new Response(null,{status:204})}
  else if(url.pathname==='/admin'){try{await admin(request,env);response=new Response(ADMIN_HTML,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'}})}catch(e){if(e.status===401)return Response.redirect(url.origin+'/signin-with-chatgpt?return_to=%2Fadmin',302);throw e}}
  else if(url.pathname==='/'&&!url.searchParams.has('health'))return Response.redirect(APP+'#online',302);
  else if(origin&&!allowed)response=json({error:'Nguồn truy cập không được phép.'},403);
  else response=await api(request,env,url);
 }catch(e){response=json({error:e.status?e.message:'Máy chủ đang gặp lỗi. Vui lòng thử lại.'},e.status||500);if(!e.status)console.error(e.message)}
 const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');if(allowed){headers.set('Access-Control-Allow-Origin',origin);headers.set('Vary','Origin');headers.set('Access-Control-Allow-Headers','Authorization,Content-Type');headers.set('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');headers.set('Access-Control-Max-Age','600')}
 return new Response(response.body,{status:response.status,headers});
}};
