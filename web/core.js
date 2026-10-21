export const SOURCES=[{id:'spa',name:'Español',url:'https://iptv-org.github.io/iptv/languages/spa.m3u'},{id:'eng',name:'Exclusión de inglés',url:'https://iptv-org.github.io/iptv/languages/eng.m3u'}];
export function safeURL(value) {
 try { const u=new URL(value); return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null; } catch { return null; }
}
export function parseM3U(text,source) {
 if(!text.replace(/^\uFEFF/,'').trimStart().startsWith('#EXTM3U')) throw Error('La respuesta no es una lista M3U válida');
 const channels=[]; let meta=null;
 for(const raw of text.split(/\r?\n/)) {
  const line=raw.trim();
  if(line.startsWith('#EXTINF:')) {
   // La coma del nombre se busca fuera de atributos entre comillas.
   let quoted=false, split=-1;
   for(let i=8;i<line.length;i++){if(line[i]==='"')quoted=!quoted;else if(line[i]===','&&!quoted){split=i;break;}}
   const attrs={}; for(const m of line.slice(0,split<0?line.length:split).matchAll(/([\w-]+)="([^"]*)"/g))attrs[m[1]]=m[2];
   meta={name:split<0?'Sin nombre':line.slice(split+1).trim()||'Sin nombre',tvgId:attrs['tvg-id']||'',logo:safeURL(attrs['tvg-logo'])||'',group:attrs['group-title']||'General'};
  } else if(line&&!line.startsWith('#')) {
   const url=safeURL(line); if(url&&meta)channels.push({...meta,url,id:url,sources:[source]}); meta=null;
  }
 }
 return channels;
}
export function mergeChannels(lists){
 const map=new Map();
 for(const c of lists.flat()){const prev=map.get(c.id);if(prev)prev.sources=[...new Set([...prev.sources,...c.sources])];else map.set(c.id,{...c,sources:[...c.sources]});}
 return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
}
export function filterChannels(channels,{query='',source='all',favorites=null,country='all',category='all'}={}) {
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=normalize(query);
 return channels.filter(c=>(source==='all'||c.sources.includes(source))&&(country==='all'||c.country===country)&&(category==='all'||c.categories?.includes(category))&&(!favorites||favorites.has(c.id))&&normalize(c.name+' '+c.group).includes(q));
}

export function spanishOnly(spanish,english,metadata={}){
 const urls=new Set(english.map(c=>c.url));const ids=new Set(english.map(c=>c.tvgId).filter(Boolean));
 return mergeChannels([spanish]).filter(c=>{
  const m=metadata[c.tvgId];
  return !urls.has(c.url)&&(!c.tvgId||!ids.has(c.tvgId))&&(!m?.languages?.length||(m.languages.includes('spa')&&!m.languages.includes('eng')));
 }).map(c=>{const m=metadata[c.tvgId]||metadata[c.tvgId.split('@')[0]]||{};return {...c,country:m.country||'ZZ',categories:m.categories?.length?m.categories:c.group.split(';').map(x=>x.trim().toLowerCase()).filter(Boolean),languages:['spa']};});
}
