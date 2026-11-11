# Optional maintainer tool: pip install edge-tts; python scripts/generate-lesson-audio.py
import asyncio,os,sys,json,re,hashlib,time
from pathlib import Path
import edge_tts
from edge_tts import communicate
if os.environ.get('SSL_CERT_FILE'):communicate._SSL_CTX.load_verify_locations(cafile=os.environ['SSL_CERT_FILE'])
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/audio'
OUT.mkdir(parents=True,exist_ok=True)
import subprocess
export="const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);for(const f of ['data.js','guides.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);process.stdout.write(JSON.stringify(vm.runInContext('LESSONS.map(l=>({...l,guide:G[l.key]}))',c)))"
lessons=json.loads(subprocess.check_output(['node','-e',export],cwd=ROOT,text=True))
semaphore=asyncio.Semaphore(4)

def spoken(text):
 text=re.sub(r'\b\d{1,3}(?: \d{3})+\b',lambda m:m[0].replace(' ',''),text)
 text=re.sub(r'(?<=[0-9)])\s*:\s*(?=[0-9(a-z])',' chia ',text)
 for a,b in [('mm²',' mi li mét vuông '),('cm²',' xăng ti mét vuông '),('dm²',' đề xi mét vuông '),('m²',' mét vuông '),('°',' độ '),('×',' nhân '),('−',' trừ '),('+',' cộng '),('=',' bằng '),('<',' nhỏ hơn '),('>',' lớn hơn '),('/',' phần ')]:text=text.replace(a,b)
 return text

async def record(l):
 async with semaphore:
  g=l['guide'];text=f"Chào em! Cô là Mi A. Hôm nay mình cùng học bài {l['id']}: {l['title']}. Điều em cần nhớ là: {g['rule']} "
  text+=' '.join(f"Bước {i+1}. {s}" for i,s in enumerate(g['steps']))
  text+=f" Cùng quan sát ví dụ với cô nhé. {g['example']} Cô nhắc em một mẹo: {g['mistake']} Em lấy giấy nháp, thử lại ví dụ rồi học trang sách cùng cô nhé!"
  text=spoken(text);path=OUT/f"bai-{l['id']}.mp3";temporary=path.with_suffix(".tmp.mp3")
  for attempt in range(3):
   try:
    await asyncio.wait_for(edge_tts.Communicate(text,voice='vi-VN-HoaiMyNeural',rate='+4%',pitch='+10Hz',proxy=os.environ.get('HTTPS_PROXY')).save(str(temporary)),timeout=90)
    if temporary.stat().st_size<1000:raise ValueError('Empty recording')
    temporary.replace(path)
    print(f"Recorded {l['id']}/73: {path.stat().st_size} bytes",flush=True)
    return {'lesson':l['id'],'title':l['title'],'guide':g,'file':path.name,'voice':'vi-VN-HoaiMyNeural','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'text':text}
   except Exception as e:
    if attempt==2:raise RuntimeError(f"Lesson {l['id']}: {type(e).__name__}: {str(e)[:180]}")
    await asyncio.sleep(2*(attempt+1))
async def main():
 rows=await asyncio.gather(*(record(l) for l in lessons))
 (OUT/'manifest.json').write_text(json.dumps({'voice':'vi-VN-HoaiMyNeural','gender':'female','rate':'+4%','pitch':'+10Hz','lessons':rows},ensure_ascii=False,indent=2))
 print(f"DONE: {len(rows)} female recordings, {sum((OUT/r['file']).stat().st_size for r in rows)/1024/1024:.1f} MiB",flush=True)
asyncio.run(main())
