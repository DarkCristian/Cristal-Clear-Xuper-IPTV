import {test} from 'node:test';
import assert from 'node:assert/strict';
import {timelineSegments,guideCoverage,pruneGuide,HOUR} from '../web/epg-grid.js';
test('línea de tiempo recorta programas y representa huecos sin inventar títulos',()=>{
 const p={start:-HOUR,stop:HOUR,title:'Real'};const result=timelineSegments([p],0,3*HOUR);
 assert.deepEqual(result,[{start:0,stop:HOUR,program:p},{start:HOUR,stop:3*HOUR,program:null}]);
 assert.equal(p.start,-HOUR);
});
test('programas superpuestos respetan la prioridad de la fuente y nunca pisan celdas',()=>{
 const a={start:0,stop:2*HOUR,priority:1,title:'Respaldo'},b={start:HOUR,stop:3*HOUR,priority:0,title:'Principal'};
 const result=timelineSegments([a,b],0,4*HOUR);
 assert.deepEqual(result.map(x=>[x.start/HOUR,x.stop/HOUR,x.program?.title]),[[0,1,'Respaldo'],[1,3,'Principal'],[3,4,undefined]]);
 assert.equal(result.reduce((s,p)=>s+p.stop-p.start,0),4*HOUR);
});
test('cobertura no cuenta programas vencidos ni duplica variantes de un mismo feed',()=>{
 const guide=new Map([['a',[{start:0,stop:2*HOUR}]],['b',[{start:0,stop:HOUR/2}]]]);
 assert.deepEqual(guideCoverage(guide,[{tvgId:'a'},{tvgId:'a'},{tvgId:'b'}],HOUR),{total:2,available:1,current:1,programmes:1,lastStop:2*HOUR});
 assert.equal(pruneGuide(guide,30*HOUR).size,0);
});
test('rechaza intervalos inválidos y cubre una ventana completamente vacía',()=>{
 assert.deepEqual(timelineSegments([{start:1,stop:0},{start:NaN,stop:1}],0,HOUR),[{start:0,stop:HOUR,program:null}]);
});
