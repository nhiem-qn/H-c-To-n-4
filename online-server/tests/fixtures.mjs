import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {pbkdf2Sync,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import worker from '../dist/server/index.js';
export const base='https://api.mia.example.test',front='https://nhiem-qn.github.io',TEST_PASSWORD='Only_For_Test_Fixture_2026!';
export function fixture(){const sql=new DatabaseSync(':memory:');for(let f of ['0000_mia.sql','0001_standalone_admin.sql','0002_import_checkpoint.sql','0003_daily_exams.sql','0004_learning_indexes.sql','0005_contest_schedule.sql'])sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 class Statement{constructor(q,a=[]){this.q=q;this.args=a}bind(...a){return new Statement(this.q,a)}async first(){return sql.prepare(this.q).get(...this.args)||null}async all(){return{results:sql.prepare(this.q).all(...this.args)}}async run(){return{meta:{changes:Number(sql.prepare(this.q).run(...this.args).changes)}}}}
 let batchTail=Promise.resolve();
 const salt=randomBytes(16).toString('hex');let env={APP_URL:front+'/H-c-To-n-4/',ADMIN_USERNAME:'mia-admin',ADMIN_PASSWORD_SALT:salt,ADMIN_PASSWORD_HASH:pbkdf2Sync(TEST_PASSWORD,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex'),ADMIN_EMAIL:'old-owner@example.test',DB:{prepare:q=>new Statement(q),async batch(items){let job=batchTail.then(async()=>{sql.exec('BEGIN');try{let out=[];for(let s of items)out.push(await s.run());sql.exec('COMMIT');return out}catch(error){sql.exec('ROLLBACK');throw error}});batchTail=job.catch(()=>{});return job}}};
 async function call(path,method='GET',data,token=null,expected=200,extraHeaders={}){let r=await worker.fetch(new Request(base+path,{method,headers:{Origin:front,...(data?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...extraHeaders},body:data?JSON.stringify(data):undefined}),env,{});let out=await r.json();assert.equal(r.status,expected,JSON.stringify(out));return out}
 return{env,sql,call}}
