import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
import {cp,mkdir,copyFile} from 'node:fs/promises';
await mkdir('build/extension',{recursive:true});await cp('web','build/extension',{recursive:true});await cp('extension','build/extension',{recursive:true});
await mkdir('android/app/src/main/assets/www',{recursive:true});await cp('web','android/app/src/main/assets/www',{recursive:true});
console.log('Extensión: build/extension. Android: assets actualizados.');
