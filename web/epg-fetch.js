const nativeSources=new Set([
 'https://www.tdtchannels.com/epg/TV.xml',
 'https://www.open-epg.com/files/argentina2.xml',
 'https://www.open-epg.com/files/spain1.xml',
 'https://www.open-epg.com/files/mexico1.xml',
 'https://www.open-epg.com/files/peru1.xml',
 'https://epgshare01.online/epgshare01/epg_ripper_ES1.xml.gz'
]);
let sequence=0;
export function fetchGuide(url){
 if(nativeSources.has(url)&&location.protocol==='cxtv:')return fetch('/epg-fetch?url='+encodeURIComponent(url),{signal:AbortSignal.timeout(40000),cache:'no-store'});
 if(!nativeSources.has(url)||typeof window.AndroidPlayer?.fetchEpg!=='function')return fetch(url,{signal:AbortSignal.timeout(30000),cache:'no-store'});
 return new Promise((resolve,reject)=>{
  const id=String(++sequence);
  const finish=()=>{clearTimeout(timer);window.removeEventListener('native-epg',receive)};
  const receive=event=>{
   if(event.detail?.id!==id)return;
   finish();if(event.detail.error){reject(Error(event.detail.error));return}
   try{const raw=atob(event.detail.body);const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));resolve(new Response(bytes))}catch(error){reject(error)}
  };
  const timer=setTimeout(()=>{finish();reject(Error('Tiempo de espera agotado'))},45000);
  window.addEventListener('native-epg',receive);
  try{window.AndroidPlayer.fetchEpg(url,id)}catch(error){finish();reject(error)}
 });
}
