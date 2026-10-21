import {test} from 'node:test';
import assert from 'node:assert/strict';
import {orderChannels,compareCountries,filterChannels,isESPN,parseM3U,spanishOnly} from '../web/core.js';
import {readFileSync} from 'node:fs';
test('Argentina, ESPN argentino, resto ESPN y países agrupados con orden natural',()=>{
 const channels=[
  {id:'es',name:'Canal 10',country:'ES'},
  {id:'us',name:'ESPN 2',country:'US',tvgId:'ESPN2.us@South'},
  {id:'mx',name:'Canal',country:'MX'},
  {id:'ar',name:'Telefe',country:'AR'},
  {id:'feed',name:'ESPN 2',country:'US',tvgId:'ESPN2.us@Argentina'},
  {id:'cl',name:'Canal',country:'CL'},
  {id:'es2',name:'Canal 2',country:'ES'},
  {id:'unknown',name:'A',country:'ZZ'}
 ];
 const ordered=orderChannels(channels);
 assert.deepEqual(ordered.map(c=>c.id),['ar','feed','us','cl','es2','es','mx','unknown']);
 assert.equal(channels[0].id,'es');
 assert.deepEqual(filterChannels(ordered,{country:'ES'}).map(c=>c.id),['es2','es']);
 assert.deepEqual(['ZZ','MX','ES','AR','CL'].sort(compareCountries),['AR','CL','ES','MX','ZZ']);
});
test('catálogo real conserva Argentina primero y bloque ESPN antes del resto',()=>{
 const read=n=>readFileSync(new URL('../web/data/'+n,import.meta.url),'utf8');
 const catalog=spanishOnly(parseM3U(read('spa.m3u'),'spa'),parseM3U(read('eng.m3u'),'eng'),JSON.parse(read('metadata.json')).channels);
 const ar=catalog.filter(c=>c.country==='AR');
 const espn=catalog.filter(c=>c.country!=='AR'&&isESPN(c));
 assert.ok(ar.length>0);assert.ok(espn.length>0);
 assert.deepEqual(catalog.slice(0,ar.length),ar);
 assert.deepEqual(catalog.slice(ar.length,ar.length+espn.length),espn);
 const remainder=catalog.slice(ar.length+espn.length);
 const countries=remainder.map(c=>c.country).filter((c,i,a)=>i===0||c!==a[i-1]);
 assert.equal(new Set(countries).size,countries.length);
 assert.deepEqual(countries,[...countries].sort(compareCountries));
});
