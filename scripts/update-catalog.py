#!/usr/bin/env python3
"""Actualiza snapshots oficiales y metadatos. Python 3 + curl. No agrega señales fuera de spa."""
import argparse,json,re,subprocess,tempfile
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--input-dir',type=Path);args=parser.parse_args()
urls={'spa.m3u':'https://iptv-org.github.io/iptv/languages/spa.m3u','eng.m3u':'https://iptv-org.github.io/iptv/languages/eng.m3u','channels.json':'https://iptv-org.github.io/api/channels.json','feeds.json':'https://iptv-org.github.io/api/feeds.json','countries.json':'https://iptv-org.github.io/api/countries.json','categories.json':'https://iptv-org.github.io/api/categories.json'}
with tempfile.TemporaryDirectory() as tmp:
 data={}
 for name,url in urls.items():
  f=(args.input_dir/name) if args.input_dir else Path(tmp)/name
  if not args.input_dir:subprocess.run(['curl','-fsSL','--max-time','90',url,'-o',str(f)],check=True)
  data[name]=f.read_text(encoding='utf-8-sig')
  if name.endswith('.m3u') and not data[name].startswith('#EXTM3U'):raise ValueError('Invalid M3U '+name)
 channels={c['id']:c for c in json.loads(data['channels.json'])};feeds={f"{f['channel']}@{f['id']}":f for f in json.loads(data['feeds.json'])}
 ids=set(re.findall(r'tvg-id="([^"]+)"',data['spa.m3u']));metadata={}
 for id in ids:
  c=channels.get(id.split('@')[0],{});feed=feeds.get(id,{})
  metadata[id]={'country':c.get('country','ZZ'),'categories':c.get('categories',[]),'languages':feed.get('languages',[])}
 out=ROOT/'web/data';out.mkdir(exist_ok=True)
 for name in ['spa.m3u','eng.m3u']:(out/name).write_text(data[name])
 payload={'generatedAt':datetime.now(timezone.utc).isoformat(),'channels':metadata,'countries':json.loads(data['countries.json']),'categories':json.loads(data['categories.json']),'sources':urls}
 (out/'metadata.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')))
 print('Updated:',len(ids),'IDs españoles; idioma verificado por feed cuando está disponible')

subprocess.run(['node',str(ROOT/'scripts/catalog-report.mjs')],check=True,cwd=ROOT)
