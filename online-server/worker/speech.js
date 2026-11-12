// Authenticated teaching audio; welcome names are resolved by the room endpoint.
async function teachingAudio(env,actor,name,input){
 if(typeof input!=='string'||!input.trim()||input.length>200)fail(400,'Đoạn đọc cần có 1–200 kí tự.');
 await rateLimit(env,'voice:'+actor,80);
 let text=input;if(name)text=text.replaceAll(name,'em');text=text.replace(/https?:\/\/\S+|[\w.+-]+@[\w.-]+\.[a-z]+/gi,'').trim();
 if(!text)fail(400,'Không có nội dung để đọc.');
 const cache=typeof caches!=='undefined'?caches.default:null,key=cache?new Request('https://mia-voice-cache.invalid/'+await hash(text)):null;
 if(cache){try{let hit=await cache.match(key);if(hit)return new Response(hit.body,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=3600'}})}catch{}}
 const url=new URL('https://translate.google.com/translate_tts');url.search=new URLSearchParams({ie:'UTF-8',client:'tw-ob',tl:'vi',q:text});
 let response;try{response=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'MIA-Tutor/1.0'}})}catch{fail(503,'Giọng đọc online tạm bận. Con thử lại nhé.')}
 if(!response.ok||!response.headers.get('content-type')?.startsWith('audio/'))fail(503,'Giọng đọc online tạm bận. Con thử lại nhé.');
 let audio=await response.arrayBuffer();if(audio.byteLength<500||audio.byteLength>2000000)fail(503,'Không tải được âm thanh.');
 if(cache){try{await cache.put(key,new Response(audio.slice(0),{headers:{'Content-Type':'audio/mpeg','Cache-Control':'public, max-age=3600'}}))}catch{}}
 return new Response(audio,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=3600'}});
}
