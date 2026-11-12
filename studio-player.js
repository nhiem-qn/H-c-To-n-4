// Speech, chalk and thinking breaks share one playback state.
const MIAStudio=(()=>{
 let audio=null,program=[],index=0,seen=new Set(),onWrite=()=>{},onComplete=()=>{},onState=()=>{},token=0,playing=false,completionSent=false,gap=null,timer=null;
 function cancelTimer(){clearTimeout(timer);timer=null}
 function stop(){token++;playing=false;cancelTimer();gap=null;if(audio){audio.ontimeupdate=null;audio.onended=null;audio.onerror=null;audio.onloadedmetadata=null;audio.pause();audio.removeAttribute('src');audio.load();audio=null}onState('stopped')}
 function configure(rows,callbacks={}){stop();program=rows;index=0;seen=new Set();completionSent=false;onWrite=callbacks.write||(()=>{});onComplete=callbacks.complete||(()=>{});onState=callbacks.state||(()=>{});render(0)}
 function render(progress=0){if(program[index])onWrite({row:program[index],index,total:program.length,progress,seen:[...seen]})}
 function breakLength(row){if(Number.isFinite(row.pauseAfter))return Math.max(0,Math.min(15000,row.pauseAfter));let title=row.title||'';return /thử một ví dụ|con thử|em thử|tự làm/i.test(title)?6000:/ví dụ|cô giải|cách làm/i.test(title)?4000:3000}
 function finish(){playing=false;cancelTimer();gap=null;audio?.pause();render(1);onState('finished');if(seen.size===program.length&&!completionSent){completionSent=true;onComplete()}}
 function advance(){gap=null;index++;load(true)}
 function runBreak(){if(!gap)return;cancelTimer();playing=true;let current=gap;current.until=Date.now()+current.left;current.shown=null;
  function count(){if(!playing||gap!==current)return;current.left=Math.max(0,current.until-Date.now());if(!current.left){advance();return}let seconds=Math.ceil(current.left/1000);if(current.shown!==seconds){current.shown=seconds;onState('thinking',{seconds})}timer=setTimeout(count,Math.min(250,current.left))}count()
 }
 function endStep(){if(!playing||gap||!program[index])return;seen.add(index);audio?.pause();render(1);if(index===program.length-1){finish();return}gap={left:breakLength(program[index]),until:0};runBreak()}
 function tick(){if(!audio||!program[index]||!playing||gap)return;let p=program[index],t=audio.currentTime;if(t>=p.end-.04){endStep();return}render(Math.max(0,Math.min(1,(t-p.start)/(p.end-p.start))))}
 async function load(autoplay=true){let p=program[index];if(!p)return;cancelTimer();gap=null;let request=++token;
  if(!audio||!audio.src.endsWith(p.file)){if(audio){audio.ontimeupdate=null;audio.onended=null;audio.onloadedmetadata=null;audio.onerror=null;audio.pause()}audio=new Audio(p.file);audio.preload='auto'}
  audio.ontimeupdate=()=>{if(request===token)tick()};audio.onerror=()=>{if(request!==token)return;playing=false;onState('error')};audio.onended=()=>{if(request===token)endStep()};
  const seek=()=>{if(request!==token)return;audio.currentTime=p.start;render(0)};
  if(audio.readyState>=1)seek();else audio.onloadedmetadata=seek;
  audio.playbackRate=Number(document.querySelector('#studioRate')?.value||.85);playing=autoplay;onState(autoplay?'playing':'paused');
  if(autoplay)try{await audio.play()}catch{if(request!==token)return;playing=false;onState('blocked')}
 }
 function start(){if(!program.length||playing)return;if(gap){runBreak();return}if(audio&&audio.src.endsWith(program[index].file)&&audio.paused&&audio.currentTime>=program[index].start&&audio.currentTime<program[index].end-.04){playing=true;onState('playing');let request=token;audio.play().catch(()=>{if(request!==token)return;playing=false;onState('blocked')})}else load(true)}
 function pause(){if(!audio&&!gap)return;if(gap&&playing)gap.left=Math.max(0,gap.until-Date.now());cancelTimer();audio?.pause();playing=false;onState('paused')}
 function jump(delta){if(!program.length)return;let was=playing;cancelTimer();gap=null;index=Math.max(0,Math.min(program.length-1,index+delta));load(was)}
 function rate(value){if(audio&&Number.isFinite(value)&&value>=.5&&value<=1.5)audio.playbackRate=value}
 return{configure,start,pause,jump,rate,stop};
})();
