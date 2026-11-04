const normalize=value=>(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\([^)]*\)/g,'').replace(/\b(?:hd|sd|fhd|uhd|4k|\d{3,4}p)\b/g,'').replace(/[^a-z0-9]/g,'');
const family=c=>c.tvgId?.split('@')[0]||normalize(c.name);
function keys(c){const base=(c.tvgId||'').split('@')[0];return new Set([normalize(c.name),normalize(base),normalize(base.replace(/\.[a-z]{2,3}$/,''))])}
export function orderGuideChannels(channels,reference){
 const slots=reference?.channels||[],indexed=channels.map((c,index)=>({c,index,keys:keys(c)}));
 const matching=slots.map(slot=>{const names=new Set(slot.matches.map(normalize));return indexed.filter(x=>[...x.keys].some(k=>names.has(k)))});
 const reserved=new Set(matching.flat().map(x=>x.c.id)),used=new Set(),out=[];
 const emit=(group,slot,similar=false)=>{for(const {c} of group.sort((a,b)=>(a.c.country==='AR'?0:1)-(b.c.country==='AR'?0:1)||a.index-b.index)){if(used.has(c.id))continue;used.add(c.id);out.push({...c,guideNumber:out.length+1,referenceName:slot?.name||'',similarTo:similar?slot.name:''})}};
 slots.forEach((slot,i)=>{
  const exact=matching[i].filter(x=>!used.has(x.c.id));if(exact.length){emit(exact,slot);return}
  const candidates=indexed.filter(x=>!used.has(x.c.id)&&!reserved.has(x.c.id)&&(x.c.categories||[]).some(category=>slot.categories.includes(category))).sort((a,b)=>(a.c.country==='AR'?0:1)-(b.c.country==='AR'?0:1)||a.index-b.index);
  const chosen=candidates[0];if(chosen)emit(candidates.filter(x=>family(x.c)===family(chosen.c)),slot,true);
 });
 for(const item of indexed){if(used.has(item.c.id))continue;emit(indexed.filter(x=>!used.has(x.c.id)&&family(x.c)===family(item.c)),null)}
 return out;
}
