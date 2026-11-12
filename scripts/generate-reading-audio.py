"""Maintainer only: pip install edge-tts; no synthesis dependency for children."""
import asyncio,os,json
from pathlib import Path
import edge_tts
from edge_tts import communicate
if os.environ.get('SSL_CERT_FILE'):communicate._SSL_CTX.load_verify_locations(cafile=os.environ['SSL_CERT_FILE'])
root=Path(__file__).resolve().parents[1]
entries=json.loads((root/'assets/audio/readings-source.json').read_text())
limit=asyncio.Semaphore(5)
async def record(e):
 async with limit:
  target=root/'assets/audio/readings'/e['file']
  if target.exists() and target.stat().st_size>1000:return
  for attempt in range(4):
   try:
    await asyncio.wait_for(edge_tts.Communicate(e['text'],voice='vi-VN-HoaiMyNeural',rate='+4%',pitch='+10Hz',proxy=os.environ.get('HTTPS_PROXY')).save(str(target)),120)
    if target.stat().st_size<1000:raise ValueError('empty recording')
    return
   except Exception:
    if attempt==3:raise
    await asyncio.sleep(2+attempt)
async def main():
 await asyncio.gather(*(record(e) for e in entries))
 print('PASS:',len(entries),'female HoaiMy recordings')
asyncio.run(main())
