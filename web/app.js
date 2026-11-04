import {orderGuideChannels} from './channel-order.js';
import {createGuideView} from './guide-view.js';
import {pruneGuide,guideCoverage} from './epg-grid.js';
import {readGuideCache,writeGuideCache} from './epg-cache.js';
import {fetchGuide} from './epg-fetch.js';
import {parseXMLTV,nowNext,mergeGuides,readXMLTV} from './epg.js';
import {SOURCES,parseM3U,mergeChannels,filterChannels,unifiedCatalog,safeURL,compareCountries} from './core.js';
const $=id=>document.getElementById(id);
let epgProviders=[],guideSources=new Map(),epgUpdatedAt=0,epgBusy=false;
const guideView=createGuideView({getChannels:()=>filterChannels(channels,{query:$('query').value,country,category,favorites:onlyFavorites?favorites:null}),onPlay:play,onRefresh:updateGuides});
let metadata={},catalogInfo=null,guide=new Map(),currentChannel=null,epgSequence=0;
let playbackEngine=readJSON('cristal.playerEngine','auto');
let channels=[],country='all',category='all',onlyFavorites=false,limit=80,hls=null,videojsPlayer=null,generation=0;
function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
let saved=readJSON('cxtv.favorites',[]);
const favorites=new Set(Array.isArray(saved)?saved.filter(x=>typeof x==='string'):[]);
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
async function loadSource(s){
 let failure='';
 try{
  const r=await fetch(s.url,{signal:AbortSignal.timeout(18000),cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);
  const text=await r.text();const data=parseM3U(text,s.id);if(!data.length)throw Error('Lista vacía');save('cristal.v2.cache.'+s.id,{text,date:new Date().toISOString()});return {data,label:`${s.name}: actualizada (${data.length})`};
 }catch(e){failure=e.message}
 const cache=readJSON('cristal.v2.cache.'+s.id,null);
 if(cache?.text){try{const data=parseM3U(cache.text,s.id);if(data.length)return {data,label:`${s.name}: caché ${cache.date} · no se pudo actualizar (${failure})`}}catch{}}
 try {const r=await fetch(`data/${s.id}.m3u`);if(!r.ok)throw Error('No hay copia');const data=parseM3U(await r.text(),s.id);if(!data.length)throw Error('Copia vacía');return {data,label:`${s.name}: copia incluida del 21/10/2026 · no se pudo actualizar (${failure})`};}
 catch{return {data:[],label:`${s.name}: no disponible (${failure})`}}
}
async function refresh(){
 $('refresh').disabled=true;$('status').textContent='Actualizando canales en español y películas…';
 try{const results=await Promise.all(SOURCES.map(loadSource));try{const r=await fetch('data/metadata.json');catalogInfo=await r.json();metadata=catalogInfo.channels||{}}catch{} channels=unifiedCatalog(results[0].data,results[1].data,metadata);try{const response=await fetch('data/channel-order.json');if(response.ok)channels=orderGuideChannels(channels,await response.json())}catch{}fillFacets();$('status').textContent=results.map(x=>x.label).join(' / ')+' · Catálogo con orden de referencia Flow adaptado; los similares conservan su nombre real.';render();await initProviders();updateGuides()}
 finally{$('refresh').disabled=false}
}
function render(){
 const list=filterChannels(channels,{query:$('query').value,country,category,favorites:onlyFavorites?favorites:null});
 $('count').textContent=`${list.length} señales`;$('channels').replaceChildren();
 if(!list.length){const p=document.createElement('p');p.textContent='No hay canales con estos filtros.';$('channels').append(p)}
 for(const c of list.slice(0,limit)){
  const card=document.createElement('article');card.className='card';
  const tune=document.createElement('button');tune.className='tune';tune.title=c.name;
  if(c.logo){const img=document.createElement('img');img.src=c.logo;img.loading='lazy';img.alt='';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>img.remove());tune.append(img)}
  const name=document.createElement('span');name.textContent=(c.guideNumber?c.guideNumber+' · ':'')+c.name;const tag=document.createElement('span');tag.className='tag';tag.textContent=countryName(c.country)+' · '+c.categories.map(categoryName).join(', ')+(c.similarTo?' · Similar a '+c.similarTo:'');name.append(tag);tune.append(name);tune.onclick=()=>play(c);
  const star=document.createElement('button');star.className='star';star.textContent=favorites.has(c.id)?'★':'☆';star.setAttribute('aria-label','Favorito: '+c.name);star.setAttribute('aria-pressed',String(favorites.has(c.id)));
  star.onclick=()=>{favorites.has(c.id)?favorites.delete(c.id):favorites.add(c.id);save('cxtv.favorites',[...favorites]);render()};card.append(tune,star);$('channels').append(card);
 }
 $('more').hidden=list.length<=limit;guideView.render();
}
function reset(){generation++;if(videojsPlayer){videojsPlayer.dispose();videojsPlayer=null}$('video').hidden=false;if(hls){hls.destroy();hls=null}$('video').pause();$('video').removeAttribute('src');$('video').load();$('quality').replaceChildren(new Option('Automática','-1'));}
async function play(c){
 reset();$('playerPanel').hidden=false;currentChannel=c;renderGuide();$('playerPanel').scrollIntoView({behavior:'smooth',block:'start'});const myGeneration=generation;const v=$('video');$('current').textContent=c.name;$('placeholder').hidden=true;$('placeholder').style.display='none';$('playStatus').textContent='Conectando…';
 if(window.AndroidPlayer){window.AndroidPlayer.play(c.url,c.name);$('playStatus').textContent='Abierto en reproductor Android. Volvé con Atrás.';return}
 if(['https:','cxtv:'].includes(location.protocol)&&c.url.startsWith('http:')){$('playStatus').textContent='Esta señal usa HTTP. La web HTTPS puede bloquearla; probá la app Android.';return}
 const start=()=>v.play().catch(()=>{if(myGeneration===generation)$('playStatus').textContent='Usá el botón de reproducción. Si falla, la señal puede estar caída o restringida.'});
 const isHls=/\.m3u8(?:[?#]|$)/i.test(c.url);
 const nativeHls=!!v.canPlayType('application/vnd.apple.mpegurl');
 const hlsAvailable=!!window.Hls?.isSupported();
 if(playbackEngine==='videojs'){
  if(typeof window.videojs!=='function'){$('playStatus').textContent='Video.js no está instalado en este paquete. Recompilá la aplicación.';return}
  v.hidden=true;const external=document.createElement('video');external.id='videojs-playback';external.className='video-js vjs-default-skin';external.setAttribute('playsinline','');external.style.cssText='width:100%;height:100%;position:absolute;inset:0';v.parentElement.append(external);
  const p=window.videojs(external,{controls:true,autoplay:false,preload:'auto',fluid:false,html5:{vhs:{overrideNative:true}}});videojsPlayer=p;
  p.ready(()=>{if(myGeneration!==generation)return;p.src({src:c.url,type:isHls?'application/x-mpegURL':/\.mpd(?:[?#]|$)/i.test(c.url)?'application/dash+xml':'video/mp4'});p.play()?.catch?.(()=>{if(myGeneration===generation)$('playStatus').textContent='Video.js: no se pudo iniciar la señal.'})});
  p.on('error',()=>{if(myGeneration===generation)$('playStatus').textContent='Video.js: stream incompatible o no disponible.'});return;
 }
 if(playbackEngine==='hls'&&!isHls){$('playStatus').textContent='HLS.js requiere una señal HLS (.m3u8). Seleccioná Automático o HTML5 para este canal.';return}
 if(playbackEngine==='html5'||(playbackEngine==='auto'&&(nativeHls||!isHls))){v.src=c.url;await start()}
 else if(hlsAvailable){
  const player=new Hls({maxBufferLength:20,backBufferLength:20,capLevelToPlayerSize:true});hls=player;
  player.on(Hls.Events.MANIFEST_PARSED,()=>{if(myGeneration!==generation)return;for(const [i,l] of player.levels.entries())$('quality').add(new Option(`${l.height||'?'}p · ${Math.round(l.bitrate/1000)} kb/s`,String(i)));start()});
  player.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal&&myGeneration===generation){$('playStatus').textContent='No se pudo reproducir: señal caída, CORS, restricción regional o códec incompatible.';player.destroy();if(hls===player)hls=null}});
  player.loadSource(c.url);player.attachMedia(v);
 }else if(playbackEngine==='hls'||(isHls&&!nativeHls)){
  $('playStatus').textContent='El motor HLS.js no está disponible en este dispositivo o navegador.';
 }else{v.src=c.url;await start()}
}
if(!['auto','hls','html5','videojs'].includes(playbackEngine))playbackEngine='auto';
$('engine').value=playbackEngine;
if(window.AndroidPlayer)$('engine').closest('label').hidden=true;
$('engine').onchange=()=>{
 playbackEngine=$('engine').value;save('cristal.playerEngine',playbackEngine);
 if(currentChannel)play(currentChannel);
};
$('video').addEventListener('playing',()=>{$('playStatus').textContent='En vivo'});
$('video').addEventListener('error',()=>{$('playStatus').textContent='Error de reproducción: verificá disponibilidad y compatibilidad de la señal.'});
$('quality').onchange=()=>{if(hls)hls.currentLevel=Number($('quality').value)};
$('closePlayer').onclick=()=>{reset();window.AndroidPlayer?.stop();currentChannel=null;$('playerPanel').hidden=true;renderGuide();document.querySelector('.catalog').scrollIntoView({behavior:'smooth',block:'start'})};
$('stop').onclick=()=>{reset();window.AndroidPlayer?.stop();$('playStatus').textContent='Reproducción detenida';$('placeholder').style.display='grid'};
$('fullscreen').onclick=()=>{(videojsPlayer?.el()||$('video')).requestFullscreen?.().catch(()=>{$('playStatus').textContent='Pantalla completa no disponible'})};
$('refresh').onclick=refresh;$('query').oninput=()=>{limit=80;render()};$('more').onclick=()=>{limit+=80;render()};
$('country').onchange=()=>{country=$('country').value;limit=80;render()};$('category').onchange=()=>{category=$('category').value;limit=80;render()};
$('favorites').onclick=()=>{onlyFavorites=!onlyFavorites;$('favorites').setAttribute('aria-pressed',String(onlyFavorites));render()};
// Navegación espacial para control remoto y teclado. No captura flechas en campos de edición o video.
document.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]')||document.activeElement?.closest('#guidePanel'))return;
 if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)||['INPUT','SELECT','VIDEO'].includes(document.activeElement?.tagName))return;
 const current=document.activeElement,r=current?.getBoundingClientRect();if(!r)return;
 const cx=r.x+r.width/2,cy=r.y+r.height/2;let best=null,score=Infinity;
 for(const el of document.querySelectorAll('button,input,select,video')){if(el===current||el.disabled||!el.getClientRects().length)continue;const t=el.getBoundingClientRect(),dx=t.x+t.width/2-cx,dy=t.y+t.height/2-cy;const horizontal=e.key==='ArrowRight'||e.key==='ArrowLeft';const forward=e.key==='ArrowRight'?dx:e.key==='ArrowLeft'?-dx:e.key==='ArrowDown'?dy:-dy;if(forward<=1)continue;const lateral=Math.abs(horizontal?dy:dx);const n=forward+lateral*3;if(n<score){score=n;best=el}}
 if(best){e.preventDefault();best.focus();best.scrollIntoView({block:'nearest'})}
});
if('serviceWorker' in navigator&&['http:','https:'].includes(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});


const categoryLabels={animation:'Animación',auto:'Autos',business:'Negocios',classic:'Clásicos',comedy:'Comedia',cooking:'Cocina',culture:'Cultura',documentary:'Documentales',education:'Educación',entertainment:'Entretenimiento',family:'Familia',general:'General',interactive:'Interactivos',kids:'Infantiles',legislative:'Legislativos',lifestyle:'Estilo de vida',movies:'Películas',music:'Música',news:'Noticias',outdoor:'Aire libre',public:'Públicos',relax:'Relax',religious:'Religión',science:'Ciencia',series:'Series',shop:'Compras',sports:'Deportes',travel:'Viajes',weather:'Clima',undefined:'Sin categoría'};
function categoryName(id){return categoryLabels[id]||id}
function countryName(id){try{return id==='ZZ'?'Sin país informado':new Intl.DisplayNames(['es'],{type:'region'}).of(id)}catch{return id}}
function fillFacets(){
 const countries=[...new Set(channels.map(c=>c.country))].sort(compareCountries);
 const categories=[...new Set(channels.flatMap(c=>c.categories))].sort((a,b)=>categoryName(a).localeCompare(categoryName(b),'es'));
 $('country').replaceChildren(new Option('Todos los países','all'));for(const id of countries)$('country').add(new Option(countryName(id),id));
 $('category').replaceChildren(new Option('Todas las categorías','all'));for(const id of categories)$('category').add(new Option(categoryName(id),id));
 if(!countries.includes(country))country='all';if(!categories.includes(category))category='all';$('country').value=country;$('category').value=category;
}
function allowedEPG(){return new Set(channels.map(c=>c.tvgId).filter(Boolean))}
function renderGuide(){
 guideView.setGuide(guide,epgUpdatedAt);
 const box=$('guideNow');box.replaceChildren();if(!currentChannel){box.textContent='Elegí un canal para consultar su guía.';return}
 const {now,next}=nowNext(guide,currentChannel.tvgId);
 const format=p=>new Date(p.start).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
 for(const text of [now?`Ahora · ${format(now)} — ${now.title}`:'Ahora · Sin Informar',next?`Después · ${format(next)} — ${next.title}`:'Después · Sin Informar']){const p=document.createElement('p');p.textContent=text;box.append(p)}
}
function acceptGuide(text,label,aliases={},key=label){
 const parsed=pruneGuide(parseXMLTV(text,allowedEPG(),aliases));
 if(!parsed.size)throw Error('Sin programación vigente para los canales del catálogo');
 guideSources.delete(key);guideSources.set(key,parsed);guide=pruneGuide(mergeGuides([...guideSources.values()].reverse()));epgUpdatedAt=Date.now();renderGuide();
 return parsed.size;
}
function sourceStatus(message){$('epgStatus').textContent=message;$('guideSources').textContent=message}
async function updateGuides(){
 if(epgBusy)return;epgBusy=true;const seq=++epgSequence;$('refreshGuide').disabled=true;sourceStatus('Actualizando programación…');const results=[];
 try{
  if(!guide.size){try{const cached=await readGuideCache();if(seq!==epgSequence)return;if(cached?.entries){const ids=allowedEPG();guide=pruneGuide(new Map(cached.entries.filter(([id])=>ids.has(id))));guideSources.set('cache',guide);epgUpdatedAt=cached.updatedAt||0;renderGuide()}}catch{}}
  const sources=[{name:'Guía incluida',url:'data/guide.xml',aliases:{},local:true},...epgProviders];
  const custom=readJSON('cristal.epgUrl','');if(custom&&!sources.some(p=>p.url===custom))sources.push({name:'Guía personalizada',url:custom,aliases:{}});
  for(const source of sources){
   if(seq!==epgSequence)return;
   try{const response=source.local?await fetch(source.url,{cache:'no-store'}):await fetchGuide(source.url);if(!response.ok)throw Error('HTTP '+response.status);const text=await readXMLTV(response);if(seq!==epgSequence)return;const count=acceptGuide(text,source.name,source.aliases,source.url);results.push(source.name+': '+count+' señales');}
   catch(error){results.push(source.name+': no disponible ('+error.message+')')}
   const coverage=guideCoverage(guide,channels);sourceStatus(`${coverage.available} señales con próximos programas. `+results.join(' · '));await new Promise(r=>setTimeout(r,0));
  }
  if(guide.size)await writeGuideCache(guide,epgUpdatedAt).catch(()=>{});
 }finally{epgBusy=false;$('refreshGuide').disabled=false;if(seq===epgSequence){renderGuide();const coverage=guideCoverage(guide,channels);sourceStatus(`${coverage.available} señales con próximos programas. `+results.join(' · '))}}
}
async function loadGuide(custom=false,included=false){
 const seq=++epgSequence;const url=included?'':custom?$('epgUrl').value.trim():readJSON('cristal.epgUrl','');
 if(custom&&!safeURL(url)){sourceStatus('Ingresá una URL HTTP o HTTPS válida.');return}
 sourceStatus('Cargando XMLTV…');
 try{const response=url?await fetchGuide(url):await fetch('data/guide.xml');if(!response.ok)throw Error('HTTP '+response.status);const text=await readXMLTV(response);if(seq!==epgSequence)return;const provider=epgProviders.find(p=>p.url===url);const count=acceptGuide(text,'Guía externa',provider?.aliases||{},url||'included');if(custom)save('cristal.epgUrl',url);sourceStatus('Guía cargada: '+count+' señales con datos recientes.');await writeGuideCache(guide,epgUpdatedAt).catch(()=>{});}
 catch(error){if(seq===epgSequence)sourceStatus('Guía no disponible: '+error.message+'. Podés importar un XMLTV.')}
}
async function importGuide(file,aliases={}){
 if(!file)return;if(file.size>40*1024*1024){sourceStatus('El XMLTV supera 40 MB');return}
 const seq=++epgSequence;try{const text=await readXMLTV(file);if(seq!==epgSequence)return;const count=acceptGuide(text,'Archivo '+file.name,aliases,'file');sourceStatus('Archivo importado: '+count+' señales.');await writeGuideCache(guide,epgUpdatedAt).catch(()=>{});}catch(error){sourceStatus(error.message)}
}
$('epgUrl').value=readJSON('cristal.epgUrl','');$('gridEpgUrl').value=$('epgUrl').value;$('loadEpg').onclick=()=>loadGuide(true);
$('gridLoadEpg').onclick=()=>{$('epgUrl').value=$('gridEpgUrl').value;loadGuide(true)};
$('epgFile').onchange=()=>importGuide($('epgFile').files[0],epgProviders.find(p=>p.id===$('epgProvider').value)?.aliases||{});$('gridEpgFile').onchange=()=>importGuide($('gridEpgFile').files[0],epgProviders.find(p=>p.id===$('gridProvider').value)?.aliases||{});
setInterval(renderGuide,60000);setInterval(updateGuides,4*60*60*1000);

const backTop=$('backTop');
window.addEventListener('scroll',()=>{backTop.hidden=window.scrollY<350},{passive:true});
backTop.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
refresh();

async function initProviders(){
 try{const r=await fetch('data/epg-providers.json');if(!r.ok)throw Error('No hay índice de proveedores');epgProviders=await r.json();$('epgProvider').replaceChildren(new Option('URL personalizada o archivo',''));for(const p of epgProviders)$('epgProvider').add(new Option(p.name,p.id));const current=epgProviders.find(p=>p.url===$('epgUrl').value.trim());$('epgProvider').value=current?.id||'';$('gridProvider').replaceChildren(new Option('Elegir fuente',''));for(const p of epgProviders)$('gridProvider').add(new Option(p.name,p.id))}catch{epgProviders=[]}
}
$('gridProvider').onchange=()=>{const p=epgProviders.find(p=>p.id===$('gridProvider').value);if(p)$('gridEpgUrl').value=p.url};
$('epgProvider').onchange=()=>{const p=epgProviders.find(p=>p.id===$('epgProvider').value);if(p)$('epgUrl').value=p.url};
