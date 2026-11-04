import {test} from 'node:test';import assert from 'node:assert/strict';
import {orderGuideChannels} from '../web/channel-order.js';
const c=(id,name,base,categories=['general'])=>({id,name,tvgId:base,categories,country:'AR'});
test('variantes consecutivas, sustitutos sin robar coincidencias posteriores y sobrantes agrupados',()=>{
 const channels=[c('t1','Telefe HD','Telefe.ar@HD'),c('x1','Extra','Extra.ar@SD'),c('n','TN','TN.ar@SD',['news']),c('t2','Telefe SD','Telefe.ar@SD'),c('x2','Extra HD','Extra.ar@HD'),c('s','Noticias alternativa','Alt.ar@SD',['news'])];
 const ref={channels:[{name:'Faltante',matches:['Faltante'],categories:['news']},{name:'Telefe',matches:['Telefe'],categories:['general']},{name:'TN',matches:['TN'],categories:['news']}]};
 const result=orderGuideChannels(channels,ref);
 assert.deepEqual(result.map(x=>x.id),['s','t1','t2','n','x1','x2']);assert.equal(result[0].similarTo,'Faltante');assert.equal(result[0].name,'Noticias alternativa');assert.deepEqual(result.map(x=>x.guideNumber),[1,2,3,4,5,6]);assert.equal(channels[0].guideNumber,undefined);
});
test('ESPN 2 no se confunde con ESPN y no se pierde ningún stream',()=>{
 const list=[c('2','ESPN 2 (1080p)','ESPN2.us@Argentina',['sports']),c('1','ESPN (720p)','ESPN.us@Argentina',['sports'])];
 const result=orderGuideChannels(list,{channels:[{name:'ESPN',matches:['ESPN'],categories:['sports']},{name:'ESPN 2',matches:['ESPN2'],categories:['sports']}]});assert.deepEqual(result.map(c=>c.id),['1','2']);assert.equal(new Set(result.map(c=>c.id)).size,2);
});

test('Canal 13 extranjero no se identifica como El Trece argentino por un alias genérico',()=>{
 const ar=c('ar','El Trece','ElTrece.ar@SD');const cl={...c('cl','Canal 13 (Chile)','Canal13.cl@SD'),country:'CL'};
 const result=orderGuideChannels([cl,ar],{channels:[{name:'El Trece',matches:['ElTrece.ar','Canal 13'],categories:['general']}]});
 assert.deepEqual(result.map(c=>c.id),['ar','cl']);assert.equal(result[0].referenceName,'El Trece');assert.equal(result[1].referenceName,'');
});
