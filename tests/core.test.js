import {test} from 'node:test';import assert from 'node:assert/strict';import {parseM3U,mergeChannels,filterChannels,safeURL,SOURCES,unifiedCatalog} from '../web/core.js';import {readFileSync} from 'node:fs';
test('atributos, BOM, CRLF, comas y rechazo de protocolos',()=>{const c=parseM3U('\uFEFF#EXTM3U\r\n#EXTINF:-1 tvg-id="x" group-title="Arte, TV" tvg-logo="javascript:bad",Canal, Uno\r\nhttps://example.org/live.m3u8\r\n#EXTINF:-1,Malicioso\r\njavascript:alert(1)','ar');assert.equal(c.length,1);assert.equal(c[0].group,'Arte, TV');assert.equal(c[0].name,'Canal, Uno');assert.equal(c[0].logo,'')});
test('no confunde HTML de error con M3U',()=>assert.throws(()=>parseM3U('<html>Error</html>','ar')));
test('combina URL idéntica preservando pertenencia y variantes',()=>{const a=parseM3U('#EXTM3U\n#EXTINF:-1,Cine\nhttps://example.org/a','ar');const b=parseM3U('#EXTM3U\n#EXTINF:-1,Cine\nhttps://example.org/a\n#EXTINF:-1,Cine\nhttps://example.org/b','movies');const m=mergeChannels([a,b]);assert.equal(m.length,2);assert.deepEqual(m[0].sources,['ar','movies']);assert.equal(filterChannels(m,{source:'movies',query:'cine'}).length,2);assert.equal(filterChannels(m,{favorites:new Set([m[0].id])}).length,1)});
test('busca sin distinguir tildes y descarta credenciales en URL',()=>{assert.equal(filterChannels([{name:'Películas',group:'Cine',sources:['ar']}],{query:'peliculas'}).length,1);assert.equal(safeURL('https://user:pass@example.org'),null)});
for(const s of SOURCES.filter(s=>s.id==='spa'))test('copia incluida '+s.id,()=>{const c=parseM3U(readFileSync(new URL('../web/data/'+s.id+'.m3u',import.meta.url),'utf8'),s.id);assert.ok(c.length>0);console.log(s.id,c.length,'entradas')});

import {spanishOnly} from '../web/core.js';
import {xmltvTime,nowNext} from '../web/epg.js';
test('excluye inglés por URL, ID y metadatos del feed',()=>{
 const make=(id,url)=>({tvgId:id,url,id,name:id,group:'News',sources:['spa']});
 const spa=[make('A@SD','https://example.org/a'),make('B@SD','https://example.org/b'),make('C@SD','https://example.org/c'),make('D@SD','https://example.org/d')];
 const eng=[make('B@SD','https://example.org/other'),make('E@SD','https://example.org/c')];
 const result=spanishOnly(spa,eng,{'A@SD':{country:'AR',categories:['news'],languages:['spa']},'D@SD':{languages:['spa','eng']}});
 assert.deepEqual(result.map(c=>c.tvgId),['A@SD']);assert.equal(result[0].country,'AR');
});
test('filtros de país y categoría se combinan',()=>{const cs=[{name:'Uno',group:'News',sources:['spa'],country:'AR',categories:['news']},{name:'Dos',group:'News',sources:['spa'],country:'MX',categories:['news']}];assert.equal(filterChannels(cs,{country:'AR',category:'news'}).length,1);assert.equal(filterChannels(cs,{country:'AR',category:'movies'}).length,0)});
test('XMLTV convierte offsets explícitos y rechaza fecha sin zona o inválida',()=>{assert.equal(xmltvTime('20261021180000 -0300'),Date.UTC(2026,9,21,21));assert.equal(xmltvTime('20261021230000 +0200'),Date.UTC(2026,9,21,21));assert.ok(Number.isNaN(xmltvTime('20261021180000')));assert.ok(Number.isNaN(xmltvTime('20260230000000 +0000')))});
test('EPG por ID exacto y sin reutilizar programa vencido',()=>{const map=new Map([['Canal@AR',[{start:100,stop:200,title:'Ahora'},{start:200,stop:300,title:'Después'}]]]);assert.equal(nowNext(map,'Canal@AR',150).now.title,'Ahora');assert.equal(nowNext(map,'Canal@AR',150).next.title,'Después');assert.equal(nowNext(map,'Canal',150).now,null);assert.equal(nowNext(map,'Canal@AR',350).now,null)});
test('catálogo real sin URLs ni IDs ingleses y con metadatos hispanos',()=>{const read=n=>readFileSync(new URL('../web/data/'+n,import.meta.url),'utf8');const eng=parseM3U(read('eng.m3u'),'eng');const meta=JSON.parse(read('metadata.json')).channels;const catalog=spanishOnly(parseM3U(read('spa.m3u'),'spa'),eng,meta);const urls=new Set(eng.map(c=>c.url));const ids=new Set(eng.map(c=>c.tvgId));assert.ok(catalog.length>1000);for(const c of catalog){assert.ok(!urls.has(c.url));assert.ok(!ids.has(c.tvgId));assert.ok(!meta[c.tvgId]?.languages?.includes('eng'));}console.log('Catálogo español:',catalog.length,'URLs únicas')});

import {makeEPGResolver,mergeGuides,readXMLTV} from '../web/epg.js';
import {gzipSync} from 'node:zlib';
test('resuelve bases únicas y aliases explícitos sin mezclar variantes',()=>{const resolve=makeEPGResolver(new Set(['A24.ar@SD','La1.es@SD','La1.es@UHD','ATV.pe@SD']),{'LA1.TV':'La1.es@SD','foreign':'English.us@SD'});assert.equal(resolve('A24.ar'),'A24.ar@SD');assert.equal(resolve('La1.es'),null);assert.equal(resolve('LA1.TV'),'La1.es@SD');assert.equal(resolve('A24.ar@HD'),null);assert.equal(resolve('foreign'),null);assert.equal(resolve('constructor'),null)});
test('combina fuentes con prioridad y respaldo para huecos',()=>{const primary=new Map([['A',[{start:120,stop:200,title:'Fuente elegida'}]]]);const fallback=new Map([['A',[{start:100,stop:200,title:'Respaldo'},{start:210,stop:300,title:'Siguiente'}]]]);const merged=mergeGuides([primary,fallback]);assert.equal(nowNext(merged,'A',150).now.title,'Fuente elegida');assert.equal(nowNext(merged,'A',110).now.title,'Respaldo');assert.equal(nowNext(merged,'A',150).next.title,'Siguiente')});
test('lee XML y gzip por firma, no solo por extensión',async()=>{const xml='<?xml version="1.0"?><tv></tv>';assert.equal(await readXMLTV(new Response(xml)),xml);assert.equal(await readXMLTV(new Blob([gzipSync(xml)])),xml)});
test('rechaza gzip corrupto y descompresión mayor al límite',async()=>{await assert.rejects(()=>readXMLTV(new Blob([Uint8Array.from([31,139,0,0])])));const bomb=gzipSync(Buffer.alloc(40*1024*1024+1,65));await assert.rejects(()=>readXMLTV(new Blob([bomb])),/40 MB/)});
test('fuentes revisadas no agregan canales al catálogo',()=>{const providers=JSON.parse(readFileSync(new URL('../web/data/epg-providers.json',import.meta.url),'utf8'));const allowed=new Set(JSON.parse(readFileSync(new URL('../web/data/allowed-ids.json',import.meta.url),'utf8')));assert.equal(providers.length,6);for(const p of providers){assert.ok(p.url.startsWith('https://'));for(const target of Object.values(p.aliases))assert.ok(allowed.has(target),target)}});

test('catálogo unificado prioriza Argentina, deportes y películas sin duplicar URL',()=>{
 const mk=(name,url,id,group)=>parseM3U(`#EXTM3U\n#EXTINF:-1 tvg-id="${id}" group-title="${group}",${name}\n${url}`,'spa')[0];
 const ar=mk('Argentina','https://example.org/ar','ar','General');const sport=mk('Deportes','https://example.org/sports','sports','Sports');const movie=mk('Cine','https://example.org/movies','movies','Movies');
 const result=unifiedCatalog([sport,ar,movie],[movie],{ar:{country:'AR'},sports:{country:'MX'},movies:{country:'ES'}});
 assert.deepEqual(result.map(c=>c.name),['Argentina','Deportes','Cine']);assert.equal(result.length,3);assert.ok(result[2].categories.includes('movies'));
});
