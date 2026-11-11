import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import worker from '../online-server/dist/server/index.js';
import {fixture,base,front,TEST_PASSWORD} from '../online-server/tests/fixtures.mjs';
const html=readFileSync('admin.html','utf8');const code=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!m[1].includes('src=')).map(m=>m[2]).join('\n');new vm.Script(code);
function page(mode='standalone'){
 let db=fixture(),requests=0,storage=new Map(),nodes=new Map();const get=key=>{if(!nodes.has(key)){let classes=new Set(key==='#adminContent'||key==='#legacyNotice'?['hidden']:[]);nodes.set(key,{textContent:'',innerHTML:'',value:'',hidden:false,options:[],classList:{add:s=>classes.add(s),remove:s=>classes.delete(s),contains:s=>classes.has(s)},scrollIntoView(){}})}return nodes.get(key)};
 let context={console,URL,Date,JSON,Math,Blob,window:{MIA_SERVER_CONFIG:{apiUrl:base,mode,appUrl:front+'/H-c-To-n-4/',adminUsername:'mia-admin'}},location:{href:front+'/H-c-To-n-4/admin.html'},document:{querySelector:get},sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setInterval(){return 1},clearInterval(){},setTimeout(){return 1},clearTimeout(){},FormData:class{constructor(form){this.form=form}get(name){return this.form.data[name]}},fetch:async(url,init={})=>{requests++;return worker.fetch(new Request(url,{...init,headers:{...init.headers,Origin:front}}),db.env,{})}};vm.createContext(context);vm.runInContext(code,context);return{db,context,get,storage,requests:()=>requests,async settle(){await new Promise(setImmediate)}}
}
let p=page();await p.settle();assert.equal(p.get('#adminUsername').value,'mia-admin');assert(p.get('#adminContent').classList.contains('hidden'));
let form={data:{username:'mia-admin',password:'incorrect'},elements:{password:{value:'incorrect'}}},button={disabled:false};await p.get('#adminLoginForm').onsubmit({preventDefault(){},submitter:button,target:form});assert(p.get('#loginStatus').textContent.includes('không đúng'));assert.equal(p.storage.size,0);
form.data.password=TEST_PASSWORD;form.elements.password.value=TEST_PASSWORD;await p.get('#adminLoginForm').onsubmit({preventDefault(){},submitter:button,target:form});assert(!p.get('#adminContent').classList.contains('hidden'));assert.equal(form.elements.password.value,'');assert.equal(p.storage.size,1);assert.equal(p.get('#adminLogoutButton').hidden,false);
await vm.runInContext('logoutAdmin()',p.context);assert.equal(p.storage.size,0);assert(p.get('#adminContent').classList.contains('hidden'));assert.equal(p.get('#adminLogoutButton').hidden,true);
let legacy=page('legacy');await legacy.settle();assert.equal(legacy.requests(),0,'legacy page does not send a password to the old platform');assert(legacy.get('#legacyNotice').innerHTML.includes('Deploy MIA độc lập'));assert(legacy.get('#adminLoginForm').classList.contains('hidden'));
console.log('PASS: GitHub admin page password login/logout, API authorization, per-tab token, cleared password field and safe legacy transition.');
