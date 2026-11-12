// Injected by build.mjs beside the verified question bank and Worker helpers.
const CONTEST_LABELS={midweek:'Thử thách giữa tuần',weekend:'Đấu trường cuối tuần'};
function weekdayVN(date){return new Date(date+'T00:00:00Z').getUTCDay()}
function weeklyType(date){let day=weekdayVN(date);return day===3?'midweek':day===0?'weekend':null}
async function roomSettings(env,code){return first(env.DB,'SELECT * FROM room_settings WHERE room_code=?',code)}
async function advanceContest(env,r,t=now(),knownSettings=null){
 let meta=knownSettings||await roomSettings(env,r.code);if(!meta)return advanceDaily(env,r,t);
 let extra={automatic:!!meta.auto_run,startsAt:meta.scheduled_at,entryMode:meta.entry_mode,contestType:meta.contest_type,publicId:meta.public_id,scope:meta.scope};
 if(!meta.auto_run||!meta.scheduled_at||r.status==='ended'||t<meta.scheduled_at)return{...r,...extra};
 let qs=JSON.parse(r.questions),slot=r.seconds*1000+DAILY_REVEAL_MS,index=Math.floor((t-meta.scheduled_at)/slot);
 if(index>=qs.length)await run(env.DB,"UPDATE rooms SET status='ended',question_index=?,ended_at=?,deadline=? WHERE code=? AND status!='ended'",qs.length-1,meta.scheduled_at+qs.length*slot,meta.scheduled_at+(qs.length-1)*slot+r.seconds*1000,r.code);
 else await run(env.DB,"UPDATE rooms SET status='running',question_index=?,started_at=?,deadline=? WHERE code=? AND status!='ended' AND question_index<=?",index,meta.scheduled_at+index*slot,meta.scheduled_at+index*slot+r.seconds*1000,r.code,index);
 return{...await getRoom(env,r.code),...extra}
}
async function settleContests(env,t=now()){
 await run(env.DB,"UPDATE rooms SET status='ended',question_index=json_array_length(questions)-1,deadline=(SELECT scheduled_at FROM room_settings WHERE room_code=rooms.code)+(json_array_length(questions)-1)*(seconds*1000+8000)+seconds*1000,ended_at=(SELECT scheduled_at FROM room_settings WHERE room_code=rooms.code)+json_array_length(questions)*(seconds*1000+8000) WHERE status!='ended' AND code IN(SELECT room_code FROM room_settings WHERE auto_run=1 AND scheduled_at IS NOT NULL AND scheduled_at+json_array_length(rooms.questions)*(rooms.seconds*1000+8000)<=?)",t)
}
async function insertContest(env,{title,qs,seconds,meta,createdAt=now()}){
 let c=code().slice(0,6),id=crypto.randomUUID(),official=meta.slot_date&&meta.contest_type!=='custom';
 // D1 batch is atomic; a unique date/slot plus the conditional insert handles cron/admin races.
 await env.DB.batch([env.DB.prepare("INSERT INTO rooms(code,title,questions,seconds,created_at) SELECT ?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM room_settings WHERE contest_type=? AND slot_date=? AND ?=1)").bind(c,title,JSON.stringify(qs),seconds,createdAt,meta.contest_type,meta.slot_date,official?1:0),env.DB.prepare('INSERT INTO room_settings(room_code,public_id,entry_mode,contest_type,scope,slot_date,opens_at,scheduled_at,auto_run,created_by) SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE code=?)').bind(c,id,meta.entry_mode,meta.contest_type,meta.scope,meta.slot_date,meta.opens_at,meta.scheduled_at,meta.auto_run,meta.created_by,c)]);
 let row=await roomSettings(env,c);return row?{code:c,settings:row}:null
}
async function ensureWeekly(env,t=now()){
 await settleContests(env,t);let plan=await dailyPlan(env,t),type=weeklyType(plan.date);if(!type||t<plan.opensAt)return;
 let old=await first(env.DB,'SELECT room_code FROM room_settings WHERE contest_type=? AND slot_date=?',type,plan.date);if(old)return;
 let start=Math.floor((plan.day-1)/5)*5+1,exam=makeRangeExam(start,plan.day,10),qs=exam.qs.map(q=>({...q,options:choices(q)}));
 await insertContest(env,{title:CONTEST_LABELS[type]+' · Tuần '+Math.ceil(plan.day/5),qs,seconds:60,createdAt:plan.opensAt,meta:{entry_mode:'open',contest_type:type,scope:'week',slot_date:plan.date,opens_at:plan.opensAt,scheduled_at:plan.startsAt,auto_run:1,created_by:'auto'}})
}
function contestOpensAt(meta){return meta.auto_run&&meta.scheduled_at?Math.min(meta.opens_at,meta.scheduled_at-DAILY_LOBBY_MS):meta.opens_at}
function publicContest(r,meta,t){let auto=!!meta.auto_run,scheduled=meta.scheduled_at,ends=scheduled?scheduled+JSON.parse(r.questions).length*(r.seconds*1000+8000):null;return{id:meta.public_id,title:r.title,type:meta.weekend_hour!=null?'weekend-extra':meta.contest_type,entryMode:meta.entry_mode,scope:meta.scope,status:r.status,opensAt:contestOpensAt(meta),startsAt:scheduled,endsAt:ends,automatic:auto,total:JSON.parse(r.questions).length,seconds:r.seconds,createdBy:meta.created_by,canJoin:r.status!=='ended'&&t>=contestOpensAt(meta)}}
async function contestFeed(env,t=now()){
 await ensureWeekendSessions(env,t);await ensureWeekly(env,t);let daily=await dailyStatus(env),date=vietnamDate(t),rows=await all(env.DB,"SELECT r.*,s.public_id,s.entry_mode,s.contest_type,s.scope,s.slot_date,s.opens_at,s.scheduled_at,s.auto_run,s.created_by,w.hour weekend_hour FROM room_settings s JOIN rooms r ON r.code=s.room_code LEFT JOIN weekend_sessions w ON w.room_code=r.code WHERE (r.status!='ended' AND s.opens_at<=?) OR (r.status='ended' AND s.opens_at>=?) ORDER BY CASE WHEN s.contest_type!='custom' OR w.room_code IS NOT NULL THEN 0 ELSE 1 END,s.opens_at DESC LIMIT 80",t+7*86400000,Date.parse(date+'T00:00:00+07:00'));
 let events=[];for(let r of rows){let advanced=await advanceContest(env,r,t,r);events.push(publicContest(advanced,r,t))}
 for(let add=0;add<7;add++){let dayDate=new Date(Date.parse(date+'T00:00:00Z')+add*86400000).toISOString().slice(0,10),type=weeklyType(dayDate);if(!type)continue;if(rows.some(r=>r.contest_type===type&&r.slot_date===dayDate))continue;let opensAt=Date.parse(dayDate+'T20:00:00+07:00');if(opensAt<t)continue;events.push({id:type+':'+dayDate,title:CONTEST_LABELS[type],type,entryMode:'open',scope:'week',status:'upcoming',opensAt,startsAt:opensAt+DAILY_LOBBY_MS,endsAt:opensAt+DAILY_LOBBY_MS+10*68000,automatic:true,total:10,seconds:60,createdBy:'auto',canJoin:false})}
 for(let add=1;add<7;add++){let nextDate=new Date(Date.parse(date+'T00:00:00Z')+add*86400000).toISOString().slice(0,10);if(![0,6].includes(weekdayVN(nextDate)))continue;for(let hour of weekdayVN(nextDate)===6?[...WEEKEND_HOURS,20]:WEEKEND_HOURS){let opensAt=Date.parse(nextDate+'T'+String(hour).padStart(2,'0')+':00:00+07:00');events.push({id:'weekend-extra:'+nextDate+':'+hour,title:'Thi cuối tuần '+hour+'h',type:'weekend-extra',entryMode:'open',scope:'week',status:'upcoming',opensAt,startsAt:opensAt+DAILY_LOBBY_MS,endsAt:opensAt+DAILY_LOBBY_MS+(hour===20?5:10)*68000,automatic:true,total:hour===20?5:10,seconds:60,createdBy:'auto',canJoin:false})}}
 let officialToday=!!weeklyType(date)||rows.some(r=>r.slot_date===date&&r.contest_type!=='custom');if(!officialToday)events.push({id:'daily',title:'Thử thách Toán mỗi tối',type:'daily',entryMode:'open',scope:'daily',status:daily.status,opensAt:daily.opensAt,startsAt:daily.startsAt,endsAt:daily.endsAt,automatic:true,total:daily.total,seconds:daily.seconds,createdBy:'auto',canJoin:['waiting','running'].includes(daily.status)});
 return{serverTime:t,timezone:'Asia/Ho_Chi_Minh',weekendTimes:['09:00','11:00','15:00','17:00','20:00'],weekly:{midweek:{weekday:3,time:'20:00'},weekend:{weekday:0,time:'20:00'}},events:events.sort((a,b)=>Number(b.canJoin)-Number(a.canJoin)||a.opensAt-b.opensAt)}
}
function validateContestMeta(b,t=now()){
 let entry=b.entryMode||'code';if(!['open','code'].includes(entry))fail(400,'Chọn vào trực tiếp hoặc dùng mã phòng.');let scheduled=b.scheduledAt==null||b.scheduledAt===''?null:Number(b.scheduledAt);
 if(scheduled!==null&&(!Number.isSafeInteger(scheduled)||scheduled<t-60000||scheduled>t+366*86400000))fail(400,'Giờ thi cần từ hiện tại đến một năm tới.');if(b.autoRun&&scheduled===null)fail(400,'Chọn giờ bắt đầu khi bật thi tự động.');if(b.autoRun&&scheduled<t+DAILY_LOBBY_MS)fail(400,'Hẹn giờ bắt đầu câu hỏi sau ít nhất 5 phút để các bạn có thời gian vào phòng.');
 let date=vietnamDate(scheduled??t),type=b.weekSlot||'auto';if(type==='auto')type=b.kind==='week'?(weeklyType(date)||'custom'):'custom';if(type==='none')type='custom';if(!['custom','midweek','weekend'].includes(type))fail(400,'Buổi thi tuần không hợp lệ.');if(type!=='custom'&&(b.kind!=='week'||weeklyType(date)!==type))fail(400,'Giữa tuần chọn thứ Tư, cuối tuần chọn Chủ nhật; hoặc chọn cuộc thi riêng.');
 return{entry_mode:entry,contest_type:type,scope:['daily','week','month','term'].includes(b.kind)?b.kind:'week',slot_date:type==='custom'?null:date,opens_at:scheduled===null?t:Math.max(t,scheduled-DAILY_LOBBY_MS),scheduled_at:scheduled,auto_run:b.autoRun?1:0,created_by:'admin'}
}
const WEEKEND_HOURS=[9,11,15,17];
async function ensureWeekendSessions(env,t=now()){
 let plan=await dailyPlan(env,t);if(![0,6].includes(weekdayVN(plan.date)))return;
 let existing=await all(env.DB,'SELECT hour FROM weekend_sessions WHERE slot_date=?',plan.date),hours=new Set(existing.map(r=>r.hour));
 for(let hour of WEEKEND_HOURS){if(hours.has(hour))continue;let opens=Date.parse(plan.date+'T'+String(hour).padStart(2,'0')+':00:00+07:00'),start=Math.floor((plan.day-1)/5)*5+1,qs=makeRangeExam(start,plan.day,10).qs.map(q=>({...q,options:choices(q)})),c=code().slice(0,6),id=crypto.randomUUID();
 await env.DB.batch([env.DB.prepare('INSERT INTO rooms(code,title,questions,seconds,created_at) SELECT ?,?,?,60,? WHERE NOT EXISTS(SELECT 1 FROM weekend_sessions WHERE slot_date=? AND hour=?)').bind(c,'🌈 Thi cuối tuần '+hour+'h · Tuần '+Math.ceil(plan.day/5),JSON.stringify(qs),opens,plan.date,hour),env.DB.prepare("INSERT INTO room_settings(room_code,public_id,entry_mode,contest_type,scope,opens_at,scheduled_at,auto_run,created_by) SELECT ?,?,'open','custom','week',?,?,1,'auto' WHERE EXISTS(SELECT 1 FROM rooms WHERE code=?)").bind(c,id,opens,opens+DAILY_LOBBY_MS,c),env.DB.prepare('INSERT INTO weekend_sessions(slot_date,hour,room_code) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE code=?)').bind(plan.date,hour,c,c)])
 }
}
