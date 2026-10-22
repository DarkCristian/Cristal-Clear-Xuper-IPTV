import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
import {cp,mkdir,copyFile} from 'node:fs/promises';
// Video.js se distribuye localmente: Manifest V3 no admite scripts CDN.
// Versión fijada para builds reproducibles (actualizar tras validar compatibilidad).
await mkdir('web/vendor',{recursive:true});
for(const [name,url] of Object.entries({
 'video.min.js':'https://cdn.jsdelivr.net/npm/video.js@8.23.4/dist/video.min.js',
 'video-js.min.css':'https://cdn.jsdelivr.net/npm/video.js@8.23.4/dist/video-js.min.css'
})){
 let present=false;try{present=(await stat('web/vendor/'+name)).size>1000}catch{}
 if(!present){const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('Video.js download failed: '+response.status+' '+url);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<1000)throw Error('Video.js asset unexpectedly empty: '+name);await writeFile('web/vendor/'+name,bytes)}
}
await mkdir('build/extension',{recursive:true});await cp('web','build/extension',{recursive:true});await cp('extension','build/extension',{recursive:true});
await mkdir('android/app/src/main/assets/www',{recursive:true});await cp('web','android/app/src/main/assets/www',{recursive:true});
console.log('Extensión: build/extension. Android: assets actualizados.');
