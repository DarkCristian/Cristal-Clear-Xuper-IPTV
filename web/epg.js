export function xmltvTime(value){
 const m=/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-])(\d{2})(\d{2})$/.exec(value||'');if(!m)return NaN;
 const [y,mo,d,h,mi,se]=m.slice(1,7).map(Number);if(mo<1||mo>12||d<1||d>31||h>23||mi>59||(se||0)>59||Number(m[8])>23||Number(m[9])>59)return NaN;
 const utc=Date.UTC(y,mo-1,d,h,mi,se||0);const date=new Date(utc);if(date.getUTCFullYear()!==y||date.getUTCMonth()!==mo-1||date.getUTCDate()!==d)return NaN;
 return utc-(m[7]==='+'?1:-1)*(Number(m[8])*60+Number(m[9]))*60000;
}
export function parseXMLTV(text,allowedIds,aliases={}){
 const resolve=makeEPGResolver(allowedIds,aliases);
 if(text.length>40*1024*1024)throw Error('La guía supera 40 MB');
 text=text.replace(/<!DOCTYPE\s+tv\s+SYSTEM\s+["']xmltv\.dtd["']\s*>/gi,'');
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('XMLTV con DTD o entidades externas no permitido');
 const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror')||doc.documentElement.tagName!=='tv')throw Error('XMLTV inválido');
 const guide=new Map();
 for(const p of doc.querySelectorAll('programme')){
  const id=resolve(p.getAttribute('channel'));if(!id)continue;
  const start=xmltvTime(p.getAttribute('start')),stop=xmltvTime(p.getAttribute('stop'));if(!Number.isFinite(start)||!Number.isFinite(stop)||stop<=start)continue;
  const titles=[...p.querySelectorAll('title')];const t=titles.find(x=>['es','spa','es-AR','es-ES','es-MX'].includes(x.getAttribute('lang')))||titles[0];
  const program={start,stop,title:t?.textContent?.trim()||'Sin título',description:p.querySelector('desc')?.textContent?.trim()||''};
  if(!guide.has(id))guide.set(id,[]);guide.get(id).push(program);
 }
 for(const [id,list] of guide){const unique=new Map(list.map(p=>[p.start+':'+p.stop+':'+p.title,p]));guide.set(id,[...unique.values()].sort((a,b)=>a.start-b.start));}
 return guide;
}
export function nowNext(guide,id,now=Date.now()){
 const entries=guide.get(id)||[];
 return {now:entries.filter(p=>p.start<=now&&p.stop>now).sort((a,b)=>(a.priority||0)-(b.priority||0)||b.start-a.start)[0]||null,next:entries.filter(p=>p.start>now).sort((a,b)=>a.start-b.start||(a.priority||0)-(b.priority||0))[0]||null};
}

// ID base compatible solo si identifica exactamente un feed permitido. Nunca compara nombres.
export function makeEPGResolver(allowedIds,aliases={}){
 const byBase=new Map();for(const id of allowedIds){const base=id.split('@')[0];const list=byBase.get(base)||[];list.push(id);byBase.set(base,list)}
 return id=>{if(allowedIds.has(id))return id;const alias=Object.hasOwn(aliases,id)?aliases[id]:null;if(alias&&allowedIds.has(alias))return alias;if(!id||id.includes('@'))return null;const matches=byBase.get(id)||[];return matches.length===1?matches[0]:null};
}
export function mergeGuides(sources){
 const merged=new Map();let priority=0;
 for(const guide of sources){for(const [id,programmes] of guide){const list=merged.get(id)||[];for(const p of programmes)list.push({...p,priority});merged.set(id,list)}priority++}
 for(const [id,list] of merged){const seen=new Set();merged.set(id,list.filter(p=>{const key=p.start+':'+p.stop+':'+p.title;if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>a.start-b.start||(a.priority||0)-(b.priority||0)))}return merged;
}
const MAX_XML_BYTES=40*1024*1024;
async function boundedBytes(stream){
 const reader=stream.getReader();let total=0,chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_XML_BYTES){await reader.cancel();throw Error('La guía supera 40 MB')}chunks.push(value)}}finally{reader.releaseLock()}
 const result=new Uint8Array(total);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length}return result;
}
export async function readXMLTV(input){
 let bytes=await boundedBytes(input.body||input.stream());
 if(bytes[0]===0x1f&&bytes[1]===0x8b){if(typeof DecompressionStream==='undefined')throw Error('Este dispositivo necesita importar XML sin comprimir');bytes=await boundedBytes(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')))}
 return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
