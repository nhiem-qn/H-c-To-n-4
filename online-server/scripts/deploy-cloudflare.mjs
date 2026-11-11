import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {ensureWorkersSubdomain} from './cloudflare-onboarding.mjs';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const token=process.env.CLOUDFLARE_API_TOKEN,account=process.env.CLOUDFLARE_ACCOUNT_ID,password=process.env.MIA_ADMIN_PASSWORD;
const workerName=process.env.MIA_WORKER_NAME||'mia-online',username=process.env.MIA_ADMIN_USERNAME||'admin';
const repo=process.env.GITHUB_REPOSITORY||'nhiem-qn/H-c-To-n-4',repoParts=repo.split('/');
const appUrl=process.env.MIA_APP_URL||`https://${repoParts[0]}.github.io/${repoParts[1]}/`;
function check(){
 if(!token||!account||!password)throw Error('Thiếu GitHub Secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID hoặc MIA_ADMIN_PASSWORD.');
 if(!/^[a-f0-9]{32}$/i.test(account))throw Error('CLOUDFLARE_ACCOUNT_ID cần là Account ID 32 kí tự của Cloudflare.');
 if(/[\r\n\0]/.test(password))throw Error('MIA_ADMIN_PASSWORD không được chứa kí tự xuống dòng.');
 if(password.length<12||password.length>256)throw Error('MIA_ADMIN_PASSWORD cần có 12–256 kí tự.');
 if(!/^[a-z][a-z0-9-]{1,50}$/.test(workerName))throw Error('MIA_WORKER_NAME cần là tên chữ thường, số và dấu gạch ngang.');
 if(username.trim().length<2||username.length>40)throw Error('MIA_ADMIN_USERNAME cần có 2–40 kí tự.');
 if(new URL(appUrl).protocol!=='https:'||new URL(appUrl).search||new URL(appUrl).hash)throw Error('MIA_APP_URL phải dùng HTTPS và không chứa dấu ? hoặc #.');
}
async function cf(path,method='GET',data){const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+account+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});let d=await r.json();if(!r.ok||!d.success){let codes=(d.errors||[]).map(e=>Number(e.code)),detail=(d.errors||[]).map(e=>String(e.message||'')).join('; ');for(let value of [token,password,account])if(value)detail=detail.replaceAll(value,'[redacted]');let error=Error(`Cloudflare ${method} ${path}: HTTP ${r.status} (${codes.join(',')}). ${detail}`);error.status=r.status;error.codes=codes;throw error}return d.result}
const wrangler=fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url));
function run(args,input){let childEnv={...process.env,WRANGLER_SEND_METRICS:'false',CI:'true'};delete childEnv.MIA_ADMIN_PASSWORD;const r=spawnSync(process.execPath,[wrangler,...args],{encoding:'utf8',input,env:childEnv,maxBuffer:20*1024*1024});if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);if(r.status!==0)throw Error('Wrangler không hoàn tất. Xem thông báo của bước vừa chạy.')}
async function smoke(apiUrl){
 const headers={Origin:apiUrl,'Content-Type':'application/json'};
 for(let attempt=0;attempt<12;attempt++){
  let adminToken;
  try{let health=await fetch(apiUrl+'/api/health',{cache:'no-store'});let h=await health.json();if(!health.ok||h.authMode!=='standalone')throw Error('Health chưa sẵn sàng.');let login=await fetch(apiUrl+'/api/admin-auth/login',{method:'POST',headers,body:JSON.stringify({username,password})});let auth=await login.json();if(!login.ok||!auth.token)throw Error('Đăng nhập admin chưa sẵn sàng.');adminToken=auth.token;let session=await fetch(apiUrl+'/api/admin/session',{headers:{Origin:apiUrl,Authorization:'Bearer '+adminToken}});if(!session.ok)throw Error('Không xác minh được quyền admin.');let logout=await fetch(apiUrl+'/api/admin-auth/logout',{method:'POST',headers:{Origin:apiUrl,Authorization:'Bearer '+adminToken}});if(!logout.ok)throw Error('Không kết thúc được phiên kiểm tra.');console.log('PASS: máy chủ độc lập, đăng nhập admin và đăng xuất đã hoạt động.');return}catch(e){if(adminToken)await fetch(apiUrl+'/api/admin-auth/logout',{method:'POST',headers:{Origin:apiUrl,Authorization:'Bearer '+adminToken}}).catch(()=>{});if(attempt===11)throw Error('Chưa xác minh được bản triển khai. config.js chưa được đổi; ứng dụng giữ máy chủ trước đó.');await new Promise(r=>setTimeout(r,5000))}
 }
}
check();console.log('Đang chuẩn bị Cloudflare Worker và D1 thuộc tài khoản của bạn...');
let candidate='mia-'+repoParts[0].toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,20)+'-'+randomBytes(3).toString('hex');
let subdomain=await ensureWorkersSubdomain(cf,candidate);
let dbName=workerName+'-db',database=null;
for(let page=1;page<=100;page++){let rows=await cf('/d1/database?per_page=100&page='+page);database=rows.find(d=>d.name===dbName);if(database||rows.length<100)break}
if(!database)database=await cf('/d1/database','POST',{name:dbName});
const databaseId=database.uuid||database.id;if(!databaseId)throw Error('Cloudflare chưa trả về ID cơ sở dữ liệu.');
const config={name:workerName,main:'dist/server/index.js',compatibility_date:'2025-01-01',workers_dev:true,triggers:{crons:['0 13 * * *']},vars:{AUTH_MODE:'standalone',APP_URL:appUrl,ADMIN_USERNAME:username},d1_databases:[{binding:'DB',database_name:dbName,database_id:databaseId,migrations_dir:'drizzle'}]};
writeFileSync('wrangler.generated.json',JSON.stringify(config,null,2));
run(['d1','migrations','apply','DB','--remote','--config','wrangler.generated.json']);
run(['deploy','--config','wrangler.generated.json']);
const salt=randomBytes(16).toString('hex'),passwordHash=pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
run(['secret','bulk','--config','wrangler.generated.json'],JSON.stringify({ADMIN_PASSWORD_HASH:passwordHash,ADMIN_PASSWORD_SALT:salt}));
const apiUrl=`https://${workerName}.${subdomain.subdomain}.workers.dev`;
await smoke(apiUrl);
const publicConfig={apiUrl,mode:'standalone',appUrl,adminUsername:username};
writeFileSync('../config.js','// Public settings only. Passwords and API tokens are stored as server/GitHub secrets.\nwindow.MIA_SERVER_CONFIG = '+JSON.stringify(publicConfig,null,2)+';\n');
if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`api_url=${apiUrl}\nadmin_url=${appUrl}admin.html\n`);
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## MIA đã triển khai độc lập\n\n- Máy chủ: ${apiUrl}\n- Admin trên GitHub Pages: ${appUrl}admin.html\n- Tên admin: ${username}\n- Mật khẩu: giá trị bạn đặt trong MIA_ADMIN_PASSWORD (không hiển thị ở đây).\n\nconfig.js chỉ được cập nhật sau khi đăng nhập admin thử thành công. Nếu có dữ liệu cũ, nhập bản sao vào DB trống trước khi thêm học sinh mới.\n`);
console.log('Đã chuẩn bị cấu hình công khai mới:',apiUrl);
