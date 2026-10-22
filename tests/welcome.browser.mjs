import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {chromium} from 'playwright';
const root=resolve('web');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const server=createServer(async(req,res)=>{
 try { const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
 if(!path.startsWith(root+'/')){res.writeHead(403).end();return}
 res.setHeader('Content-Type',types[extname(path)]||'text/plain');res.end(await readFile(path));
 } catch {res.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
 browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
 await mkdir('build/welcome-checks',{recursive:true});
 for(const [name,width,height] of [['desktop',1280,1000],['android',390,844],['landscape',844,390]]){
  const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
  await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await page.waitForSelector('#welcome[open]');
  assert.equal(await page.locator('#skipWelcome').evaluate(e=>e===document.activeElement),true,'Saltar recibe el foco');
  const geometry=await page.evaluate(()=>{
   const r=id=>document.querySelector(id).getBoundingClientRect();
   const qr=r('.donation-qr'),donate=r('#donate'),skip=r('#skipWelcome');
   return {ordered:qr.bottom<=donate.top&&donate.bottom<=skip.top,centered:Math.abs(qr.x+qr.width/2-donate.x-donate.width/2)<2,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.ok(geometry.ordered&&geometry.centered&&!geometry.overflow,`${name}: QR → Donar → Saltar centrados, sin desborde`);
  await page.locator('#welcome').evaluate(e=>e.scrollTop=0);
  await page.screenshot({path:`build/welcome-checks/${name}-top.png`});
  const requestPromise=context.waitForEvent('request',{predicate:req=>req.url()==='https://monedita.ar/cristalcleariptv'});
  const popupPromise=page.waitForEvent('popup');await page.locator('#donate').click();const popup=await popupPromise;
  assert.equal((await requestPromise).url(),'https://monedita.ar/cristalcleariptv','Abre el destino externo correcto');await popup.close();
  assert.equal(await page.locator('#welcome').evaluate(e=>e.open),true,'Donar no impide Saltar');
  await page.screenshot({path:`build/welcome-checks/${name}-actions.png`});
  await page.locator('#skipWelcome').click();assert.equal(await page.locator('#welcome').evaluate(e=>e.open),false);
  await page.reload();assert.equal(await page.locator('#welcome').evaluate(e=>e.open),false,'Recuerda el cierre');
  await page.locator('#showWelcome').click();await page.keyboard.press('Escape');
  assert.equal(await page.locator('#welcome').evaluate(e=>e.open),false);
  assert.equal(await page.locator('#showWelcome').evaluate(e=>e===document.activeElement),true,'Restaura el foco');
  await page.locator('#showWelcome').click();await page.locator('#welcome a[href="legal.html"]').click();await page.waitForURL('**/legal.html');
  await page.locator('a[href="index.html"]').click();await page.waitForURL('**/index.html');
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS bienvenida ${name}`);
 }
 const context=await browser.newContext({serviceWorkers:'block'});
 await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 await context.addInitScript(()=>{
  Object.defineProperty(window,'localStorage',{get(){throw Error('Storage disabled')}});
  window.donationCalls=0;window.AndroidPlayer={openDonation(){window.donationCalls++}};
 });
 const page=await context.newPage();await page.goto(base);await page.waitForSelector('#welcome[open]');
 await page.locator('#donate').click();assert.equal(await page.evaluate(()=>window.donationCalls),1,'Usa navegador nativo Android');
 await page.locator('#skipWelcome').click();await page.locator('#showWelcome').click();
 await page.evaluate(()=>{window.AndroidPlayer.openDonation=()=>{throw Error('No browser')}});
 await page.locator('#donate').click();assert.equal(await page.locator('#donationStatus').isVisible(),true);
 await page.locator('#skipWelcome').click();await context.close();console.log('PASS sin almacenamiento, puente Android y error recuperable');
} finally {if(browser)await browser.close();await new Promise(done=>server.close(done));}
