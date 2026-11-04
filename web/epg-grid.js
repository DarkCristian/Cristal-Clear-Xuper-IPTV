// Modelo sin DOM: recorta intervalos y resuelve solapamientos por prioridad.
export const HOUR=3600000;
export function timelineSegments(programmes,start,end){
 const candidates=programmes.filter(p=>Number.isFinite(p.start)&&Number.isFinite(p.stop)&&p.stop>p.start&&p.stop>start&&p.start<end);
 const points=[...new Set([start,end,...candidates.flatMap(p=>[Math.max(start,p.start),Math.min(end,p.stop)])])].sort((a,b)=>a-b);
 const result=[];
 for(let i=0;i<points.length-1;i++){
  const a=points[i],b=points[i+1];
  const program=candidates.filter(p=>p.start<=a&&p.stop>=b).sort((x,y)=>(x.priority||0)-(y.priority||0)||y.start-x.start)[0]||null;
  const last=result.at(-1);
  if(last&&last.program===program)last.stop=b;else result.push({start:a,stop:b,program});
 }
 return result;
}
export function pruneGuide(guide,now=Date.now()){
 return new Map([...guide].map(([id,items])=>[id,items.filter(p=>p.stop>now-24*HOUR&&p.start<now+7*24*HOUR)]).filter(([,items])=>items.length));
}
export function guideCoverage(guide,channels,now=Date.now()){
 const ids=new Set(channels.map(c=>c.tvgId).filter(Boolean));let available=0,current=0,programmes=0,lastStop=0;
 for(const id of ids){const items=(guide.get(id)||[]).filter(p=>p.stop>now);if(items.length)available++;if(items.some(p=>p.start<=now&&p.stop>now))current++;programmes+=items.length;for(const p of items)lastStop=Math.max(lastStop,p.stop)}
 return {total:ids.size,available,current,programmes,lastStop};
}
