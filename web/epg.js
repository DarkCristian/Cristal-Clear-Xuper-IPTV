export function xmltvTime(value){
 const m=/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-])(\d{2})(\d{2})$/.exec(value||'');if(!m)return NaN;
 const [y,mo,d,h,mi,se]=m.slice(1,7).map(Number);if(mo<1||mo>12||d<1||d>31||h>23||mi>59||(se||0)>59||Number(m[8])>23||Number(m[9])>59)return NaN;
 const utc=Date.UTC(y,mo-1,d,h,mi,se||0);const date=new Date(utc);if(date.getUTCFullYear()!==y||date.getUTCMonth()!==mo-1||date.getUTCDate()!==d)return NaN;
 return utc-(m[7]==='+'?1:-1)*(Number(m[8])*60+Number(m[9]))*60000;
}
export function parseXMLTV(text,allowedIds){
 if(text.length>40*1024*1024)throw Error('La guía supera 40 MB');
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('XMLTV con DTD o entidades externas no permitido');
 const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror')||doc.documentElement.tagName!=='tv')throw Error('XMLTV inválido');
 const guide=new Map();
 for(const p of doc.querySelectorAll('programme')){
  const id=p.getAttribute('channel');if(!allowedIds.has(id))continue;
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
 return {now:entries.find(p=>p.start<=now&&p.stop>now)||null,next:entries.find(p=>p.start>now)||null};
}
