# Optional maintainer command: pip install edge-tts; python scripts/generate-exam-audio.py
import asyncio,os,json,hashlib
from pathlib import Path
import edge_tts
from edge_tts import communicate
if os.environ.get('SSL_CERT_FILE'):communicate._SSL_CTX.load_verify_locations(cafile=os.environ['SSL_CERT_FILE'])
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'assets/audio/exam-source.json').read_text())
out=ROOT/'assets/audio/exam';out.mkdir(parents=True,exist_ok=True)
limit=asyncio.Semaphore(4)
async def record(e):
 async with limit:
  target=out/e['file']
  if target.exists() and target.stat().st_size>500:return
  for attempt in range(5):
   try:
    temporary=target.with_suffix('.tmp.mp3')
    await asyncio.wait_for(edge_tts.Communicate(e['text'].strip().capitalize()+('.' if e['text'][-1] not in '.!?' else ''),voice=source['voice'],rate=source['rate'],pitch=source['pitch'],proxy=os.environ.get('HTTPS_PROXY')).save(str(temporary)),timeout=60)
    if temporary.stat().st_size<500:raise ValueError('Empty audio')
    temporary.replace(target);return
   except Exception:
    if attempt==4:raise RuntimeError('Failed clip '+repr(e['text']))
    await asyncio.sleep(2+attempt*2)
async def main():
 tasks=[asyncio.create_task(record(e)) for e in source['entries']]
 for i,done in enumerate(asyncio.as_completed(tasks)):
  try:await done
  except Exception as error:print(str(error),flush=True)
  if (i+1)%25==0:print(f"Recorded {i+1}/{len(tasks)} clips",flush=True)
 missing=[e['text'] for e in source['entries'] if not (out/e['file']).exists()]
 if missing:raise RuntimeError('Missing clips: '+repr(missing))
 manifest={**{k:v for k,v in source.items() if k!='entries'},'clips':{e['key']:e['file'] for e in source['entries']},'hashes':{e['file']:hashlib.sha256((out/e['file']).read_bytes()).hexdigest() for e in source['entries']}}
 (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
 (ROOT/'exam-audio.js').write_text('const MIA_EXAM_AUDIO = '+json.dumps({k:v for k,v in manifest.items() if k!='hashes'},ensure_ascii=False)+';\n')
 print(f"DONE: {len(tasks)} HoaiMy clips, {sum(p.stat().st_size for p in out.glob('*.mp3'))/1024/1024:.1f} MiB",flush=True)
asyncio.run(main())
