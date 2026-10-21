#!/usr/bin/env python3
"""Selecciona entradas reales de iptv-org/epg por ID exacto y español. No busca por nombre."""
import argparse,json,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--epg-root',type=Path,required=True);p.add_argument('--output',type=Path,default=ROOT/'epg/channels.xml');p.add_argument('--limit',type=int,default=0);a=p.parse_args()
allowed=set(json.loads((ROOT/'web/data/allowed-ids.json').read_text()))
priority=['mi.tv','reportv.com.ar','programacion-tv.elpais.com','movistarplus.es','directv.com.ar','directv.com.uy','anteltv.com.uy','gatotv.com','siba.com.co','pluto.tv']
files=list((a.epg_root/'sites').glob('*/*.channels.xml'));files.sort(key=lambda f:(priority.index(f.parent.name) if f.parent.name in priority else len(priority),str(f)))
selected={}
for f in files:
 try: root=ET.parse(f).getroot()
 except ET.ParseError: continue
 for channel in root.findall('channel'):
  id=channel.get('xmltv_id');lang=channel.get('lang','').lower()
  if id in allowed and lang in ['es','spa'] and id not in selected:selected[id]=channel
items=list(selected.values());items=items[:a.limit] if a.limit else items
root=ET.Element('channels');root.extend(items);a.output.parent.mkdir(parents=True,exist_ok=True);ET.indent(root);ET.ElementTree(root).write(a.output,encoding='utf-8',xml_declaration=True)
print('Seleccionados',len(items),'de',len(selected),'IDs con guía potencial sobre',len(allowed),'IDs permitidos. Programas aún no descargados.')
