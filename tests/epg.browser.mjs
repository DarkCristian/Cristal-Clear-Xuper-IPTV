import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
const root=resolve('web'),types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!p.startsWith(root+'/')){res.writeHead(403).end();return}res.setHeader('Content-Type',types[extname(p)]||'text/plain');res.end(await readFile(p))}catch{res.writeHead(404).end()}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));const base=`http://127.0.0.1:${server.address().port}`;
const provider='https://www.open-epg.com/files/argentina2.xml';
const now=Date.now(),stamp=t=>new Date(t).toISOString().replace(/[-:T]/g,'').slice(0,14)+' +0000';
const xml=`<tv><programme channel="Telefe.ar@SD" start="${stamp(now-3600000)}" stop="${stamp(now+3600000)}"><title>Programa de prueba ahora</title><desc>&lt;img src=x onerror=alert(1)&gt;</desc></programme><programme channel="Telefe.ar@SD" start="${stamp(now+3600000)}" stop="${stamp(now+10800000)}"><title>Programa futuro de prueba</title></programme><programme channel="TN.ar@SD" start="${stamp(now-3600000)}" stop="${stamp(now+7200000)}"><title>Noticias de prueba</title></programme></tv>`;
const playlist='#EXTM3U\n#EXTINF:-1 tvg-id="Telefe.ar@SD" group-title="General",Telefe SD\nhttps://example.test/telefe-sd.m3u8\n#EXTINF:-1 tvg-id="Telefe.ar@HD" group-title="General",Telefe HD\nhttps://example.test/telefe-hd.m3u8\n#EXTINF:-1 tvg-id="TN.ar@SD" group-title="Noticias",TN\nhttps://example.test/tn.m3u8\n#EXTINF:-1 tvg-id="Extra.ar@SD" group-title="Kids",Canal adicional\nhttps://example.test/extra.m3u8';
const metadata={channels:Object.fromEntries([['Telefe.ar@SD','general'],['Telefe.ar@HD','general'],['TN.ar@SD','news'],['Extra.ar@SD','kids']].map(([id,category])=>[id,{country:'AR',categories:[category]}]))};
let browser;
try{
 browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});await mkdir('build/epg-checks',{recursive:true});
 for(const [name,width,height] of [['desktop',1366,900],['android',390,844]]){
  let offline=false;const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
  await context.route('**/*',async route=>{
   const url=route.request().url();
   if(url.includes('/languages/spa.m3u')||url===base+'/data/spa.m3u')return route.fulfill({body:playlist});
   if(url.includes('/categories/movies.m3u'))return route.fulfill({body:'#EXTM3U\n'});
   if(url===base+'/data/metadata.json')return route.fulfill({json:metadata});
   if(url===base+'/data/epg-providers.json')return route.fulfill({json:[{id:'test',name:'Fuente de prueba',url:provider,aliases:{}}]});
   if(url===base+'/data/guide.xml')return route.fulfill({body:offline?'<tv/>':xml,contentType:'application/xml'});
   if(url===provider)return route.fulfill({status:offline?503:200,body:offline?'Unavailable':xml,contentType:'application/xml'});
   return url.startsWith(base)?route.continue():route.abort();
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('#skipWelcome').click();
  await page.waitForFunction(()=>document.querySelector('#guideSources').textContent.includes('Fuente de prueba: 2 señales'));
  await page.locator('#viewGuide').click();await page.waitForSelector('.guide-slot');
  assert.equal(await page.locator('.guide-table tbody tr').count(),4);
  assert.ok(await page.locator('.guide-gap').count()>0,'Huecos explícitos');
  assert.match(await page.locator('#guideCoverage').textContent(),/2 de 4 señales/);
  assert.ok(await page.locator('.guide-slot.current').count()>0);
  await page.locator('.guide-slot').filter({hasText:'Programa de prueba ahora'}).click();
  assert.equal(await page.locator('#programmeDialog').evaluate(e=>e.open),true);assert.equal(await page.locator('#programmeDescription img').count(),0,'La descripción es texto, no HTML');await page.locator('#programmeClose').click();
  await page.screenshot({path:`build/epg-checks/${name}.png`});
  if(name==='android')assert.ok(await page.locator('#guideGrid').evaluate(e=>e.scrollWidth>e.clientWidth),'La línea de tiempo permite desplazamiento horizontal en móvil');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'La grilla no desborda la página');
  const oldWindow=await page.locator('#guideWindow').textContent();await page.locator('#guideNext').click();assert.notEqual(await page.locator('#guideWindow').textContent(),oldWindow);await page.locator('#guideNowButton').click();
  await page.locator('#guideOnlyData').check();assert.equal(await page.locator('.guide-table tbody tr').count(),2);await page.locator('#guideOnlyData').uncheck();
  await page.locator('#query').fill('TN');assert.equal(await page.locator('.guide-table tbody tr').count(),1);await page.locator('#query').fill('');
  const scroll=await page.locator('#guideGrid').evaluate(e=>{e.scrollLeft=500;return e.scrollLeft});await page.locator('#guideNowButton').click();assert.equal(await page.locator('#guideGrid').evaluate(e=>e.scrollLeft),scroll);
  await page.locator('.guide-config summary').click();await page.locator('#gridEpgFile').setInputFiles({name:'test.xml',mimeType:'application/xml',buffer:Buffer.from(xml)});await page.waitForFunction(()=>document.querySelector('#guideSources').textContent.includes('Archivo importado'));
  offline=true;await page.reload();await page.locator('#skipWelcome').click();await page.locator('#viewGuide').click();await page.waitForFunction(()=>document.querySelector('#refreshGuide').disabled===false&&document.querySelector('#guideSources').textContent.includes('no disponible'));
  assert.ok(await page.locator('.guide-slot').count()>0,'Se conserva guía en caché aunque fallen las fuentes');
  assert.deepEqual(errors,[]);await context.close();console.log('PASS grilla, filtros, detalle seguro, importación y caché '+name);
 }
 const context=await browser.newContext();const page=await context.newPage();await page.goto(base+'/legal.html');
 await page.evaluate(()=>{window.AndroidPlayer={fetchEpg(url,id){window.dispatchEvent(new CustomEvent('native-epg',{detail:{id,body:btoa('<tv/>')}}))}}});
 const value=await page.evaluate(async url=>{const {fetchGuide}=await import('/epg-fetch.js');return (await fetchGuide(url)).text()},provider);assert.equal(value,'<tv/>');await context.close();console.log('PASS transporte EPG nativo Android');
}finally{if(browser)await browser.close();await new Promise(done=>server.close(done))}
