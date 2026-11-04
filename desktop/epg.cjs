const providers=require('../web/data/epg-providers.json');
const allowed=new Set(providers.map(p=>p.url));
exports.proxyEPG=async function(source,fetcher){
 if(!allowed.has(source))return new Response('Fuente EPG no autorizada',{status:403});
 try{
  const response=await fetcher(source,{redirect:'error',credentials:'omit',signal:AbortSignal.timeout(35000),headers:{'Accept-Encoding':'identity'}});
  if(!response.ok)return new Response('La fuente no está disponible',{status:502});
  const maximum=40*1024*1024;if(Number(response.headers.get('content-length'))>maximum)return new Response('Guía demasiado grande',{status:413});
  const reader=response.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();return new Response('Guía demasiado grande',{status:413})}chunks.push(value)}}finally{reader.releaseLock()}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  return new Response(bytes,{headers:{'Content-Type':'application/octet-stream','Cache-Control':'no-store'}});
 }catch{return new Response('No se pudo descargar la fuente EPG',{status:502})}
};
