const TRIAL_MS=7*86400000;
const isTrial=s=>s.trial_started_at!=null&&s.term_months==null;
async function trialLogin(request,env){
 const b=await body(request,1500);if(typeof b.device!=='string'||!/^[a-f0-9]{48}$/.test(b.device))fail(400,'Con mở lại trình duyệt để bắt đầu học thử nhé.');
 const device=await hash('mia-trial:'+b.device),ip=request.headers.get('cf-connecting-ip')||'unknown';
 await rateLimit(env,'trial-login:'+ip,30);
 let s=await first(env.DB,'SELECT * FROM students WHERE trial_device_hash=?',device);
 if(!s){
  const name=cleanName(b.name),created=now(),id=crypto.randomUUID(),salt=random(16);
  await rateLimit(env,'trial-create:'+ip+':'+Math.floor(created/86400000),5);
  // Daily creation budget survives minute buckets; IP is hashed before storage.
  let budget='trial-day:'+await hash(ip)+':'+Math.floor(created/86400000);
  await run(env.DB,'INSERT INTO rate_limits(key,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1',budget,created+2*86400000);
  if((await first(env.DB,'SELECT attempts FROM rate_limits WHERE key=?',budget)).attempts>30)fail(429,'Hôm nay có nhiều lượt học thử. Phụ huynh liên hệ admin để được cấp tài khoản nhé.');
  try{await run(env.DB,'INSERT INTO students(id,name,normalized,pin_hash,pin_salt,created_at,expires_at,trial_started_at,trial_device_hash) VALUES(?,?,?,?,?,?,?,?,?)',id,name,normalizeName(name),await hash(salt+':'+random()),salt,created,created+TRIAL_MS,created,device)}catch(error){
   s=await first(env.DB,'SELECT * FROM students WHERE trial_device_hash=?',device);
   if(!s){if(/UNIQUE/i.test(error.message))fail(409,'Tên này đã có tài khoản. Con dùng tên kèm biệt danh hoặc đăng nhập bằng mã riêng nhé.');throw error}
  }
  s||=await first(env.DB,'SELECT * FROM students WHERE id=?',id);
 }
 if(!isTrial(s))fail(403,'Con đã có tài khoản chính thức. Hãy đăng nhập bằng tên và mã riêng admin cấp.','TRIAL_CONVERTED');
 if(!s.active)fail(403,'Tài khoản đang khóa. Phụ huynh liên hệ admin giúp con nhé.');
 checkTerm(s);
 const token=random(),time=now();await run(env.DB,'INSERT INTO sessions(token_hash,student_id,expires_at) VALUES(?,?,?)',await hash(token),s.id,Math.min(time+SESSION_MS,s.expires_at));await touchPresence(env,s.id);
 return json({token,serverTime:time,student:{id:s.id,name:s.name,expires_at:s.expires_at,term_months:s.term_months,trial_started_at:s.trial_started_at}});
}
