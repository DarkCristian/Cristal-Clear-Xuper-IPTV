import {HOUR,timelineSegments,guideCoverage} from './epg-grid.js';
const $=id=>document.getElementById(id);
const format=t=>new Date(t).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
export function createGuideView({getChannels,onPlay,onRefresh}){
 let guide=new Map(),start=Math.floor(Date.now()/(HOUR/2))*(HOUR/2)-HOUR/2,limit=40,updatedAt=0,selected=null;
 const dateValue=t=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 function show(mode){const active=mode==='guide';$('catalogView').hidden=active;$('guidePanel').hidden=!active;$('viewChannels').setAttribute('aria-pressed',String(!active));$('viewGuide').setAttribute('aria-pressed',String(active));if(active)render()}
 $('viewChannels').onclick=()=>show('channels');$('viewGuide').onclick=()=>show('guide');
 $('guidePrev').onclick=()=>{start-=6*HOUR;render()};$('guideNext').onclick=()=>{start+=6*HOUR;render()};
 $('guideNowButton').onclick=()=>{start=Math.floor(Date.now()/(HOUR/2))*(HOUR/2)-HOUR/2;render()};
 $('guideDate').onchange=()=>{const value=$('guideDate').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return;const [y,m,d]=value.split('-').map(Number);start=new Date(y,m-1,d).getTime();render()};
 $('guideOnlyData').onchange=()=>{limit=40;render()};$('guideMore').onclick=()=>{limit+=40;render()};$('refreshGuide').onclick=onRefresh;
 $('programmeClose').onclick=()=>$('programmeDialog').close();$('programmePlay').onclick=()=>{const c=selected;$('programmeDialog').close();if(c)onPlay(c)};
 function details(c,p){selected=c;$('programmeTitle').textContent=p.title;$('programmeChannel').textContent=c.name;$('programmeTime').textContent=new Date(p.start).toLocaleDateString('es-AR')+' · '+format(p.start)+' – '+format(p.stop);$('programmeDescription').textContent=p.description||'Sin descripción disponible.';$('programmeDialog').showModal()}
 function render(){
  if($('guidePanel').hidden)return;
  const end=start+6*HOUR,now=Date.now();let channels=getChannels();const coverage=guideCoverage(guide,channels,now);
  $('guideCoverage').textContent=`${coverage.available} de ${coverage.total} señales con próximos programas · ${coverage.current} con información ahora`+(updatedAt?' · Última carga: '+new Date(updatedAt).toLocaleString('es-AR'):' · Todavía sin guía actualizada');
  if($('guideOnlyData').checked)channels=channels.filter(c=>(guide.get(c.tvgId)||[]).some(p=>p.stop>start&&p.start<end));
  $('guideDate').value=dateValue(start);$('guideWindow').textContent=new Date(start).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})+' · '+format(start)+' – '+format(end)+' · Horarios de tu dispositivo';
  const container=$('guideGrid'),scrollLeft=container.scrollLeft,scrollTop=container.scrollTop;container.replaceChildren();
  if(!channels.length){const p=document.createElement('p');p.textContent='No hay canales con estos filtros o con datos para este horario.';container.append(p);$('guideMore').hidden=true;return}
  const table=document.createElement('table');table.className='guide-table';const caption=document.createElement('caption');caption.className='sr-only';caption.textContent='Programación por canal. Los horarios corresponden a tu dispositivo.';table.append(caption);
  const cols=document.createElement('colgroup');cols.append(document.createElement('col'),document.createElement('col'));table.append(cols);
  const head=table.createTHead().insertRow();const corner=document.createElement('th');corner.scope='col';corner.textContent='Canal';head.append(corner);const times=document.createElement('th');times.scope='col';const bar=document.createElement('div');bar.className='guide-timeline';bar.style.height='42px';for(let i=0;i<6;i++){const time=document.createElement('span');time.className='guide-hour';time.style.left=(i*180+6)+'px';time.textContent=format(start+i*HOUR);bar.append(time)}times.append(bar);head.append(times);
  const body=table.createTBody();
  for(const c of channels.slice(0,limit)){
   const row=body.insertRow(),label=document.createElement('th');label.scope='row';const tune=document.createElement('button');tune.className='guide-channel';tune.type='button';tune.textContent=(c.guideNumber?c.guideNumber+' · ':'')+c.name;if(c.similarTo){const note=document.createElement('small');note.textContent='Similar a '+c.similarTo;tune.append(note)}tune.title='Ver '+c.name+' en vivo';tune.onclick=()=>onPlay(c);label.append(tune);row.append(label);
   const cell=row.insertCell(),line=document.createElement('div');line.className='guide-timeline';
   for(const segment of timelineSegments(guide.get(c.tvgId)||[],start,end)){
    const p=segment.program,element=document.createElement(p?'button':'span');element.className=p?'guide-slot'+(p.start<=now&&p.stop>now?' current':''):'guide-gap';element.style.left=((segment.start-start)/HOUR*180)+'px';element.style.width=Math.max(0,(segment.stop-segment.start)/HOUR*180-2)+'px';
    if(p){element.type='button';element.title=c.name+' · '+format(p.start)+' – '+format(p.stop)+' · '+p.title;const title=document.createElement('strong');title.textContent=p.title;const time=document.createElement('time');time.textContent=format(p.start)+' – '+format(p.stop);element.append(title,time);element.onclick=()=>details(c,p);element.setAttribute('aria-label',element.title)}else element.textContent='Sin información';line.append(element);
   }
   if(now>=start&&now<end){const marker=document.createElement('span');marker.className='guide-now-line';marker.style.left=((now-start)/HOUR*180)+'px';marker.setAttribute('aria-hidden','true');line.append(marker)}cell.append(line);
  }
  container.append(table);container.scrollLeft=scrollLeft;container.scrollTop=scrollTop;$('guideMore').hidden=channels.length<=limit;
 }
 return {render,setGuide(value,time){guide=value;updatedAt=time;render()},reset(){limit=40;render()}};
}
