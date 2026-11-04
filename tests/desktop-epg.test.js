import {test} from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {proxyEPG}=createRequire(import.meta.url)('../desktop/epg.cjs');
test('proxy de escritorio solo consulta fuentes EPG exactas y rechaza redirecciones',async()=>{
 let requests=0;const fetcher=async(url,options)=>{requests++;assert.equal(options.redirect,'error');assert.equal(options.credentials,'omit');return new Response('<tv/>')};
 const valid=await proxyEPG('https://www.open-epg.com/files/argentina2.xml',fetcher);assert.equal(await valid.text(),'<tv/>');
 for(const url of ['http://127.0.0.1','file:///etc/passwd','https://www.open-epg.com/files/argentina2.xml?redirect=bad','https://www.open-epg.com.evil/files/argentina2.xml'])assert.equal((await proxyEPG(url,fetcher)).status,403);
 assert.equal(requests,1);
});
test('proxy maneja errores de fuente y tamaño de descarga sin devolver contenido arbitrario',async()=>{
 assert.equal((await proxyEPG('https://www.open-epg.com/files/argentina2.xml',async()=>new Response('Bad',{status:500}))).status,502);
 assert.equal((await proxyEPG('https://www.open-epg.com/files/argentina2.xml',async()=>new Response('x',{headers:{'content-length':'999999999'}}))).status,413);
});
