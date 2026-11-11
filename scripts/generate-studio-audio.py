# Maintainer tool: pip install edge-tts; python scripts/generate-studio-audio.py
import asyncio,os,json,re,hashlib
from pathlib import Path
import edge_tts
from edge_tts import communicate
if os.environ.get('SSL_CERT_FILE'):communicate._SSL_CTX.load_verify_locations(cafile=os.environ['SSL_CERT_FILE'])
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/audio/studio';source=json.loads((ROOT/'assets/audio/studio-source.json').read_text());limit=asyncio.Semaphore(7)
def norm(s):return re.sub(r'[^\w]','',s.lower(),flags=re.UNICODE)
async def record(topic):
 async with limit:
  text='. '.join(p['spoken'].rstrip('. ') for p in topic['parts'])+'.';digest=hashlib.sha256(text.encode()).hexdigest()[:14];file=topic['key']+'-'+digest+'.mp3';target=OUT/file;meta=target.with_suffix('.json')
  if target.exists() and meta.exists():return json.loads(meta.read_text())
  for attempt in range(4):
   try:
    boundaries=[];temporary=target.with_suffix('.tmp.mp3')
    async def synth():
     with temporary.open('wb') as audio:
      async for chunk in edge_tts.Communicate(text,voice=source['voice'],rate=source['rate'],pitch=source['pitch'],boundary='SentenceBoundary',proxy=os.environ.get('HTTPS_PROXY')).stream():
       if chunk['type']=='audio':audio.write(chunk['data'])
       elif chunk['type']=='SentenceBoundary':boundaries.append({k:chunk[k] for k in ['text','offset','duration']})
    await asyncio.wait_for(synth(),timeout=180)
    if temporary.stat().st_size<1000:raise ValueError('Empty audio')
    # Edge may split a long teaching sentence into several metadata sentences.
    # Align the full normalized text first, then locate each source part boundary.
    expected=[norm(p['spoken']) for p in topic['parts']];spoken=[norm(b['text']) for b in boundaries]
    if ''.join(expected)!=''.join(spoken):raise ValueError('Sentence metadata does not match the complete lesson text')
    positions=[];cursor=0
    for b,words in zip(boundaries,spoken):positions.append((cursor,cursor+len(words),b));cursor+=len(words)
    spans=[];cursor=0
    def at(position,end=False):
     for lo,hi,b in positions:
      if lo<=position<hi or end and position==hi:
       ratio=(position-lo)/max(1,hi-lo);return (b['offset']+ratio*b['duration'])/10000000
     b=boundaries[-1];return (b['offset']+b['duration'])/10000000
    for words in expected:
     spans.append({'start':at(cursor),'end':at(cursor+len(words),True)});cursor+=len(words)
    for i in range(len(spans)-1):spans[i]['end']=spans[i+1]['start']
    temporary.replace(target);result={'file':file,'spans':spans,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'seconds':spans[-1]['end']};meta.write_text(json.dumps(result));print('Recorded '+topic['key']+': '+str(round(result['seconds']))+' sec, '+str(len(spans))+' matched steps',flush=True);return result
   except Exception as error:
    print('Retry '+topic['key']+': '+str(error)[:180],flush=True)
    if attempt==3:raise RuntimeError(topic['key']+': '+str(error))
    await asyncio.sleep(3+attempt*3)
async def main():
 results=await asyncio.gather(*(record(t) for t in source['topics']),return_exceptions=True)
 errors=[str(r) for r in results if isinstance(r,Exception)]
 if errors:raise RuntimeError('\n'.join(errors))
 manifest={**{k:v for k,v in source.items() if k!='topics'},'topics':{t['key']:r for t,r in zip(source['topics'],results)}}
 (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));(ROOT/'studio-audio.js').write_text('const MIA_STUDIO_AUDIO = '+json.dumps(manifest,ensure_ascii=False)+';\n');print('DONE '+str(len(results))+' synchronized female lessons',flush=True)
asyncio.run(main())
