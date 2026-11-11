// Native MP3 + verified sentence timestamps: pausing the audio also pauses the
// chalk animation. Seeking does not silently count an entire lesson as studied.
const MIAStudio=(()=>{
 let audio=null,program=[],index=0,seen=new Set(),onWrite=()=>{},onComplete=()=>{},onState=()=>{},token=0,playing=false,completionSent=false;
 function stop(){token++;playing=false;if(audio){audio.ontimeupdate=null;audio.onended=null;audio.onerror=null;audio.onloadedmetadata=null;audio.pause();audio.removeAttribute('src');audio.load();audio=null}onState('stopped')}
 function configure(rows,callbacks={}){stop();program=rows;index=0;seen=new Set();completionSent=false;onWrite=callbacks.write||(()=>{});onComplete=callbacks.complete||(()=>{});onState=callbacks.state||(()=>{});render(0)}
 function render(progress=0){if(program[index])onWrite({row:program[index],index,total:program.length,progress,seen:[...seen]})}
 function tick(){if(!audio||!program[index])return;let p=program[index],t=audio.currentTime;
  while(p&&t>=p.end-.04&&playing){seen.add(index);if(index===program.length-1){render(1);audio.pause();playing=false;onState('finished');if(seen.size===program.length&&!completionSent){completionSent=true;onComplete()};return}let next=program[index+1];index++;if(next.file!==p.file){load(true);return}p=program[index]}
  render(Math.max(0,Math.min(1,(t-p.start)/(p.end-p.start))))
 }
 async function load(autoplay=true){let p=program[index];if(!p)return;let request=++token;if(!audio||!audio.src.endsWith(p.file)){if(audio)audio.pause();audio=new Audio(p.file);audio.preload='auto';audio.ontimeupdate=tick;audio.onerror=()=>{playing=false;onState('error')}}
  audio.onended=()=>{if(request!==token)return;seen.add(index);if(index<program.length-1){index++;load(true)}else{playing=false;onState('finished');render(1);if(seen.size===program.length&&!completionSent){completionSent=true;onComplete()}}};
  const seek=()=>{if(request!==token)return;audio.currentTime=p.start;render(0)};
  if(audio.readyState>=1)seek();else audio.onloadedmetadata=seek;
  audio.playbackRate=Number(document.querySelector('#studioRate')?.value||1);playing=autoplay;onState(autoplay?'playing':'paused');
  if(autoplay)try{await audio.play()}catch{playing=false;onState('blocked')}
 }
 function start(){if(!program.length)return;if(audio&&audio.src.endsWith(program[index].file)&&audio.paused&&audio.currentTime>=program[index].start&&audio.currentTime<program[index].end){playing=true;onState('playing');audio.play().catch(()=>{playing=false;onState('blocked')})}else load(true)}
 function pause(){if(!audio)return;audio.pause();playing=false;onState('paused')}
 function jump(delta){if(!program.length)return;let was=playing;index=Math.max(0,Math.min(program.length-1,index+delta));if(was)load(true);else{if(audio)audio.pause();playing=false;render(1);onState('paused')}}
 function rate(value){if(audio)audio.playbackRate=value}
 return{configure,start,pause,jump,rate,stop}
})();
