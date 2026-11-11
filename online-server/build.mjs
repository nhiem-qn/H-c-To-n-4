import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('.',import.meta.url)));
import {mkdir,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist/server',{recursive:true});let bank=(await readFile('worker/bank.js','utf8')).replace(/export \{[^}]+\};?\s*$/,'');let worker=(await readFile('worker/index.js','utf8')).replace(/^import[^\n]+\n/,'');let admin=await readFile('worker/admin.html','utf8');await writeFile('dist/server/index.js',bank+'\nconst ADMIN_HTML='+JSON.stringify(admin)+';\n'+worker);
