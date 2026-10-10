// Live verification against the protected Vercel API. Creates disposable users,
// sends no email, and removes every test object/user in finally.
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID} from 'node:crypto';
const run=promisify(execFile),directory=await mkdtemp(join(tmpdir(),'dot-cloud-check-'));
const url=process.env.SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY,pub=process.env.SUPABASE_PUBLISHABLE_KEY;
assert(url&&secret&&pub,'Load cloud/.env.local');
const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),users=[],clients=[];
let item;
async function api(method='GET',id,token,body,origin){
 const header=join(directory,`${randomUUID()}.headers`);
 await writeFile(header,['Content-Type: application/json',...(token?[`Authorization: Bearer ${token}`]:[]),...(origin?[`Origin: ${origin}`]:[])].join('\n'),{mode:0o600});
 const args=['curl',`/api/projects${id?'?id='+id:''}`,'--scope','isiken-c3creators','--','--silent','--show-error','--request',method,'--header',`@${header}`,'--write-out','\n%{http_code}'];
 if(body!==undefined){const file=join(directory,`${randomUUID()}.json`);await writeFile(file,JSON.stringify(body),{mode:0o600});args.push('--data-binary',`@${file}`);}
 const {stdout}=await run('vercel',args,{cwd:new URL('../cloud/',import.meta.url),maxBuffer:1000000,timeout:60000});
 const cut=stdout.lastIndexOf('\n'),raw=stdout.slice(0,cut).trim();return {status:Number(stdout.slice(cut+1)),body:raw?JSON.parse(raw):null};
}
try{
 for(let i=0;i<2;i++){
  const email=`dot-test-${randomUUID()}@example.com`,password=randomUUID()+randomUUID();
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});assert(!error&&data.user,'Test user creation failed');users.push(data.user.id);
  const client=createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}});clients.push(client);
  const {error:login}=await client.auth.signInWithPassword({email,password});assert(!login,'Test login failed');
 }
 const tokens=await Promise.all(clients.map(async c=>(await c.auth.getSession()).data.session.access_token));
 assert.equal((await api()).status,401);
 assert.equal((await api('GET',undefined,tokens[0],undefined,'https://untrusted.example')).status,403);
 const project={version:1,name:'Disposable verification',size:16,pixels:Array(256).fill('')};project.pixels[0]='#80b6a0';
 const saved=await api('POST',undefined,tokens[0],project,'https://kentaro-oishi-c3creators.github.io');assert.equal(saved.status,200);item=saved.body.id;
 assert.deepEqual((await api('GET',item,tokens[0])).body.project,project);
 assert((await api('GET',undefined,tokens[0])).body.items.some(i=>i.id===item));
 assert.equal((await api('GET',item,tokens[1])).status,404);
 assert.equal((await api('PUT',item,tokens[1],project)).status,404);
 await api('DELETE',item,tokens[1]);assert.equal((await api('GET',item,tokens[0])).status,200);
 assert.equal((await api('PUT',item,tokens[0],{...project,pixels:[]})).status,400);
 project.name='Verified overwrite';assert.equal((await api('PUT',item,tokens[0],project)).status,200);
 assert.equal((await api('GET',item,tokens[0])).body.project.name,project.name);
 const anonymous=createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}});
 assert((await anonymous.storage.from('dot-atelier-projects').download(`${users[0]}/${item}.json`)).error,'Private storage must deny anonymous downloads');
 assert((await clients[0].storage.from('dot-atelier-projects').download(`${users[0]}/${item}.json`)).error,'Direct storage must deny client downloads');
 assert.equal((await api('DELETE',item,tokens[0])).status,200);
 assert.equal((await api('GET',item,tokens[0])).status,404);
 console.log('PASS: live login, create/list/read/update/delete, invalid JSON, foreign-owner isolation, anonymous denial, private storage, CORS.');
}finally{
 if(item&&users[0])await admin.storage.from('dot-atelier-projects').remove([`${users[0]}/${item}.json`]);
 for(const client of clients)await client.auth.signOut();
 for(const id of users){const {error}=await admin.auth.admin.deleteUser(id);if(error)console.error('Test-user cleanup needs attention.');}
 await rm(directory,{recursive:true,force:true});
}
