import {readFile,stat,appendFile} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../build/extension/',import.meta.url));
async function requireFile(path){
 const full=resolve(root,path),rel=relative(root,full);
 if(rel.startsWith('..')||isAbsolute(rel)||!(await stat(full)).isFile())throw Error('Archivo inválido o ausente en el paquete de extensión: '+path);
}
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
if(manifest.manifest_version!==3)throw Error('Se requiere Manifest V3');
await requireFile(manifest.background.service_worker);
for(const icon of Object.values(manifest.icons||{}))await requireFile(icon);
for(const file of ['index.html','app.js','core.js','epg.js','style.css','vendor/hls.min.js','data/metadata.json','data/spa.m3u','data/eng.m3u','data/epg-providers.json','INSTALAR-CHROME.txt'])await requireFile(file);
const html=await readFile(resolve(root,'index.html'),'utf8');
for(const match of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)){const path=match[1];if(!/^(?:https?:|data:|#)/.test(path))await requireFile(path)}
console.log('PASS: manifest.json en la raíz; background, iconos, interfaz y datos presentes.');
if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'## Extensión Chrome / Edge\nPaquete independiente validado: `manifest.json` en la raíz del ZIP de `cristal-clear-extension-chrome`. La web se entrega por separado.\n');
