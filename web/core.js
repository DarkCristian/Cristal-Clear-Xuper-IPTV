export const SOURCES=[{id:'spa',name:'Español',url:'https://iptv-org.github.io/iptv/languages/spa.m3u'},{id:'movies',name:'Películas',url:'https://iptv-org.github.io/iptv/categories/movies.m3u'}];
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
 return orderChannels(mergeChannels([spanish]).filter(c=>{
  const m=metadata[c.tvgId];
  return !urls.has(c.url)&&(!c.tvgId||!ids.has(c.tvgId))&&(!m?.languages?.length||(m.languages.includes('spa')&&!m.languages.includes('eng')));
 }).map(c=>{const m=metadata[c.tvgId]||metadata[c.tvgId.split('@')[0]]||{};return {...c,country:m.country||'ZZ',categories:m.categories?.length?m.categories:c.group.split(';').map(x=>x.trim().toLowerCase()).filter(Boolean),languages:['spa']};}));
}

const channelCollator=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
const regionNames=new Intl.DisplayNames(['es'],{type:'region'});
export function countryLabel(code){try{return !code||code==='ZZ'?'Sin país informado':regionNames.of(code)}catch{return code||'Sin país informado'}}
export function compareCountries(a,b){
 if(a===b)return 0;if(a==='AR')return -1;if(b==='AR')return 1;
 if(!a||a==='ZZ')return 1;if(!b||b==='ZZ')return -1;
 return channelCollator.compare(countryLabel(a),countryLabel(b))||channelCollator.compare(a,b);
}
export function isESPN(channel){return /(?:^|\b)ESPN(?:\b|\d)/i.test(channel.name||'')||/^ESPN/i.test(channel.tvgId||'')}
export function orderChannels(channels){
 const rank=c=>c.country==='AR'?0:isESPN(c)?1:2;
 const argentinaFeed=c=>/@Argentin(?:a|e)(?:$|[^a-z])/i.test(c.tvgId||'')?0:1;
 return [...channels].sort((a,b)=>{
  const group=rank(a)-rank(b);if(group)return group;
  if(rank(a)===1){const feed=argentinaFeed(a)-argentinaFeed(b);if(feed)return feed;}
  else {const country=compareCountries(a.country,b.country);if(country)return country;}
  return channelCollator.compare(a.name||'',b.name||'')||channelCollator.compare(a.tvgId||'',b.tvgId||'')||channelCollator.compare(a.id||'',b.id||'');
 });
}

// Catálogo unificado: español y películas; deduplicación por URL y prioridad editorial.
export function unifiedCatalog(spanish,movies,metadata={}){
 const movieUrls=new Set(movies.map(c=>c.url));
 const all=mergeChannels([spanish,movies]).map(c=>{
  const m=metadata[c.tvgId]||metadata[c.tvgId.split('@')[0]]||{};
  const categories=new Set(m.categories?.length?m.categories:c.group.split(';').map(x=>x.trim().toLowerCase()).filter(Boolean));
  if(movieUrls.has(c.url))categories.add('movies');
  return {...c,country:m.country||'ZZ',categories:[...categories]};
 });
 const rank=c=>c.country==='AR'?0:c.categories.includes('sports')?1:c.categories.includes('movies')?2:3;
 return all.sort((a,b)=>rank(a)-rank(b)||compareCountries(a.country,b.country)||channelCollator.compare(a.name,b.name));
}
