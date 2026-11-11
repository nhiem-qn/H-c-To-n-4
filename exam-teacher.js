// All bundled clips use the same female HoaiMy voice as MIA's lesson recordings.
// Questions are assembled from phrases and spoken numbers; no key or speech service is needed at runtime.
const ExamTeacher=(()=>{
 function normalize(text){return String(text||'').normalize('NFC').replace(/\b\d{1,3}(?:[ \u00a0]\d{3})+\b/g,m=>m.replace(/\s/g,''))
  .replace(/mm²/g,' mi li mét vuông ').replace(/cm²/g,' xăng ti mét vuông ').replace(/dm²/g,' đề xi mét vuông ').replace(/m²/g,' mét vuông ').replace(/km/g,' ki lô mét ').replace(/kg/g,' ki lô gam ').replace(/cm/g,' xăng ti mét ').replace(/dm/g,' đề xi mét ').replace(/mm/g,' mi li mét ')
  .replace(/(?<=[\d)])\s*:\s*(?=[\d(a-z])/gi,' chia ').replace(/[×*]/g,' nhân ').replace(/[−–]/g,' trừ ').replace(/\+/g,' cộng ').replace(/=/g,' bằng ').replace(/</g,' nhỏ hơn ').replace(/>/g,' lớn hơn ').replace(/\//g,' phần ').replace(/°/g,' độ ').replace(/%/g,' phần trăm ').replace(/[…]/g,' chỗ trống ').replace(/\.{2,}/g,' chỗ trống ').replace(/\?/g,' ').replace(/\.(?!\d)|(?<!\d)\./g,' ').replace(/[();:!"“”]/g,' ').replace(/\s+/g,' ').trim()}
 function numbers(value){let s=String(value),out=[];if(s[0]==='-'){out.push('âm');s=s.slice(1)}let [whole,decimal]=s.split(/[,.]/),n=Number(whole);if(!Number.isSafeInteger(n)||n<0)return[];
  function group(x,full){let a=[];if(x>=100||full){a.push(String(Math.floor(x/100)),'trăm');x%=100;if(x>0&&x<10)a.push('lẻ')}if(x||!a.length)a.push(String(x));return a}
  if(n===0)out.push('0');else{let groups=[];while(n){groups.push(n%1000);n=Math.floor(n/1000)}for(let i=groups.length-1;i>=0;i--)if(groups[i]){out.push(...group(groups[i],i<groups.length-1));if(i)out.push(['','nghìn','triệu','tỷ','nghìn tỷ','triệu tỷ'][i])}}
  if(decimal){out.push('phẩy');out.push(...decimal.split(''))}return out.filter(Boolean)
 }
 function parts(text){let normalized=normalize(text),result=[],re=/-?\d+(?:[,.]\d+)?/g,last=0;for(let m of normalized.matchAll(re)){let phrase=normalized.slice(last,m.index).trim().replace(/^[,\s]+|[,\s]+$/g,'');if(phrase)result.push(phrase);result.push(...numbers(m[0]));last=m.index+m[0].length}let end=normalized.slice(last).trim().replace(/^[,\s]+|[,\s]+$/g,'');if(end)result.push(end);return result}
 let ctx=null,sources=[],generation=0,enabled=true,cache=new Map(),note=()=>{};
 function stop(){generation++;for(let s of sources){try{s.stop()}catch{}}sources=[];if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel()}
 function unlock(){try{let Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ctx=ctx||new Audio();ctx.resume().catch(()=>{})}catch{}}
 function setEnabled(value){enabled=!!value;if(!enabled)stop();else unlock();return enabled}
 function trimmed(b){let a=b.getChannelData(0),start=0,end=a.length;const frame=256,threshold=.005;function audible(i){let sum=0,n=Math.min(frame,a.length-i);for(let j=0;j<n;j++)sum+=a[i+j]*a[i+j];return Math.sqrt(sum/n)>threshold}while(start+frame<end&&!audible(start))start+=frame;while(end-frame>start&&!audible(end-frame))end-=frame;start=Math.max(0,start-Math.round(b.sampleRate*.035));end=Math.min(a.length,end+Math.round(b.sampleRate*.09));return{audio:b,offset:start/b.sampleRate,duration:(end-start)/b.sampleRate}}
 async function buffer(file){if(!cache.has(file)){let promise=fetch('assets/audio/exam/'+file).then(r=>{if(!r.ok)throw Error('audio');return r.arrayBuffer()}).then(b=>ctx.decodeAudioData(b)).then(trimmed);cache.set(file,promise);promise.catch(()=>cache.delete(file))}return cache.get(file)}
 async function nativeSequence(files,request){let audio=new Audio(),index=0;sources.push({stop(){audio.onended=null;audio.pause();audio.removeAttribute('src');audio.load()}});audio.onended=()=>{if(request!==generation)return;if(++index<files.length){audio.src='assets/audio/exam/'+files[index];audio.play().catch(()=>note('Bấm nghe lại đề để tiếp tục nghe cô nhé.'))}};audio.src='assets/audio/exam/'+files[0];await audio.play();note('Cô Mi A đang đọc bằng giọng nữ Hoài My.');return true}
 async function speak(text,fullKey=null){if(!enabled)return false;stop();let request=generation;unlock();let catalog=typeof MIA_EXAM_AUDIO!=='undefined'?MIA_EXAM_AUDIO:null,list=fullKey?[fullKey]:parts(text),files=list.map(p=>catalog?.clips[p]);
  if(typeof location!=='undefined'&&location.protocol==='file:'&&typeof Audio!=='undefined'&&files.length&&files.every(Boolean)){try{return await nativeSequence(files,request)}catch{note('Bấm nghe lại đề để cho phép phát âm thanh.');return false}}
  if(!ctx||ctx.state!=='running'){note('Bấm «Bật cô đọc đề» để nghe giọng cô Mi A.');return false}
  if(files.length&&files.every(Boolean)){try{let data=await Promise.all(files.map(buffer));if(request!==generation)return false;let time=ctx.currentTime+.04;for(let b of data){let s=ctx.createBufferSource();s.buffer=b.audio;s.connect(ctx.destination);s.start(time,b.offset,b.duration);time+=b.duration+.04;sources.push(s)}note('Cô Mi A đang đọc bằng giọng nữ Hoài My.');return true}catch{if(request!==generation)return false}}
  // Only a confirmed female Vietnamese device voice may replace a missing clip.
  if(typeof TeacherVoice!=='undefined'&&typeof speechSynthesis!=='undefined'){let voice=TeacherVoice.choose(speechSynthesis.getVoices(),typeof state!=='undefined'?state.voice:'',typeof state!=='undefined'?state.voiceConfirmedURI:'');if(voice){let u=new SpeechSynthesisUtterance(normalize(text));u.voice=voice;u.lang='vi-VN';u.rate=.98;u.pitch=1.08;speechSynthesis.speak(u);note('Cô Mi A đang đọc câu hỏi.');return true}}
  note('Chưa tải được giọng đọc. Em có thể đọc đề và lời nhắc trên bảng.');return false
 }
 function onStatus(fn){note=fn}
 return{normalize,numbers,parts,unlock,stop,speak,setEnabled,onStatus}
})();
// Pure timeline: deduplicate polling, prioritize a late arrival, never hint after submission.
const ExamCoach=(()=>{
 function create(){let key='',seen=new Set();return{reset(){key='';seen.clear()},step(d,time){let r=d?.room,q=d?.question;if(!r)return null;let next=r.code+':'+r.index+':'+r.deadline;if(next!==key){key=next;seen.clear()}function once(type){if(seen.has(type))return null;seen.add(type);return type}
  if(r.status==='ended'||r.revealed||time>=r.deadline&&r.status==='running')return once('end');
  if(r.status!=='running'||!q||d.submitted)return null;
  let remaining=(r.deadline-time)/1000,half=r.seconds/2,urgent=Math.min(10,r.seconds/4);
  if(remaining<=urgent){seen.add('read');seen.add('hint');return once('urgent')}
  if(remaining<=half){seen.add('read');if(q.hint)return once('hint');return null}
  return once('read')
 }}}
 return{create}
})();
