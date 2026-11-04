"""Actualiza la copia distribuida con datos públicos vigentes; no inventa programación."""
import concurrent.futures
import datetime as dt
import gzip
import json
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
MAX = 40 * 1024 * 1024
NOW = dt.datetime.now(dt.timezone.utc)

def moment(value):
    return dt.datetime.strptime(value.strip(), '%Y%m%d%H%M%S %z')

def resolve_id(identifier, allowed, aliases, bases):
    if identifier in allowed: return identifier
    alias = aliases.get(identifier)
    if alias in allowed: return alias
    candidates = bases.get(identifier, []) if '@' not in identifier else []
    return candidates[0] if len(candidates) == 1 else None

def download(source):
    try:
        request = urllib.request.Request(source['url'], headers={'User-Agent': 'CristalClear-IPTV/0.3 EPG'})
        with urllib.request.urlopen(request, timeout=25) as response: data = response.read(MAX + 1)
        if len(data) > MAX: raise ValueError('La guía supera 40 MB')
        if data[:2] == b'\x1f\x8b':
            import io
            with gzip.GzipFile(fileobj=io.BytesIO(data)) as stream: data = stream.read(MAX + 1)
        if len(data) > MAX: raise ValueError('La guía descomprimida supera 40 MB')
        if b'<!ENTITY' in data or b'<!DOCTYPE' in data and b'xmltv.dtd' not in data: raise ValueError('DTD o entidades no admitidas')
        return source, ET.fromstring(data), None
    except Exception as error: return source, None, str(error)

def main():
    allowed = set(json.loads((ROOT/'web/data/allowed-ids.json').read_text()))
    bases = {}
    for identifier in allowed: bases.setdefault(identifier.split('@')[0], []).append(identifier)
    sources = json.loads((ROOT/'web/data/epg-providers.json').read_text())
    tv = ET.Element('tv', {'generator-info-name':'CristalClear public EPG snapshot','date':NOW.strftime('%Y%m%d%H%M%S +0000')})
    reports, seen, programmes, ids = [], set(), [], set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for source, document, error in pool.map(download, sources):
            count = 0
            if document is not None:
                for item in document.findall('programme'):
                    identifier = resolve_id(item.get('channel', ''), allowed, source.get('aliases', {}), bases)
                    if not identifier: continue
                    try: start, stop = moment(item.get('start','')), moment(item.get('stop',''))
                    except (ValueError, TypeError): continue
                    if stop <= start or stop < NOW - dt.timedelta(days=1) or start > NOW + dt.timedelta(days=7): continue
                    key = (identifier, item.get('start'), item.get('stop'), item.findtext('title'))
                    if key in seen: continue
                    seen.add(key); item.set('channel',identifier); programmes.append(item); ids.add(identifier); count += 1
            reports.append({'source':source['id'],'programmes':count,'error':error})
    report = {'updatedAt':NOW.isoformat(),'channels':len(ids),'programmes':len(programmes),'sources':reports}
    if programmes:
        for identifier in sorted(ids):
            element = ET.SubElement(tv,'channel',{'id':identifier}); ET.SubElement(element,'display-name').text = identifier
        tv.extend(programmes)
        (ROOT/'web/data/guide.xml').write_bytes(ET.tostring(tv,encoding='utf-8',xml_declaration=True))
    else:
        report['warning'] = 'Ninguna fuente devolvió programación vigente. Se conserva la copia existente; la UI señalará los huecos.'
    (ROOT/'web/data/guide-status.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__ == '__main__': main()
