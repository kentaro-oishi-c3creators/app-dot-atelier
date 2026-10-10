import {test,expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
test('live account saves, reloads, opens, overwrites and deletes its private work',async({page})=>{
 test.skip(process.env.CLOUD_LIVE!=='1','Requires configured cloud and Vercel CLI authentication');test.setTimeout(180000);
 const url=process.env.SUPABASE_URL!,admin=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const email=`dot-browser-${randomUUID()}@example.com`,password=randomUUID()+randomUUID();
 const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});expect(error).toBeNull();const user=data.user!;
 const directory=await mkdtemp(join(tmpdir(),'dot-browser-check-'));
 try{
  // Relay to the real services; Vercel CLI authenticates through its platform
  // protection. No protection credential is put in browser code or artifacts.
  await page.route(`${url}/**`,async route=>{
   const req=route.request(),response=await fetch(req.url(),{method:req.method(),headers:req.headers(),body:req.postData()||undefined});
   const headers=Object.fromEntries(response.headers);delete headers['content-encoding'];delete headers['content-length'];await route.fulfill({status:response.status,headers,body:await response.text()});
  });
  await page.route('https://app-dot-atelier-cloud.vercel.app/api/projects**',async route=>{
   const req=route.request(),header=join(directory,randomUUID()+'.headers');
   await writeFile(header,Object.entries(req.headers()).filter(([k])=>['authorization','content-type','origin'].includes(k)).map(([k,v])=>`${k}: ${v}`).join('\n'),{mode:0o600});
   const args=['curl',new URL(req.url()).pathname+new URL(req.url()).search,'--scope','isiken-c3creators','--','--silent','--request',req.method(),'--header','@'+header,'--write-out','\n%{http_code}'];
   if(req.postData()){const body=join(directory,randomUUID()+'.json');await writeFile(body,req.postData()!,{mode:0o600});args.push('--data-binary','@'+body);}
   const {stdout}=await run('vercel',args,{cwd:join(process.cwd(),'cloud'),timeout:60000,maxBuffer:1000000});const cut=stdout.lastIndexOf('\n');await route.fulfill({status:Number(stdout.slice(cut+1)),contentType:'application/json',body:stdout.slice(0,cut)});
  });
  await page.goto('./');await page.getByLabel('メールアドレス',{exact:true}).fill(email);await page.getByLabel('パスワード（8文字以上）').fill(password);await page.getByRole('button',{name:'ログイン',exact:true}).click();
  await expect(page.getByText('ログイン中：'+email,{exact:true})).toBeVisible();
  await page.getByLabel('作品名').fill('端末をまたぐテスト');await page.getByRole('button',{name:'クラウドに新しく保存',exact:true}).click();
  const card=page.locator('.cloud-card').filter({hasText:'端末をまたぐテスト'});await expect(card).toBeVisible({timeout:45000});
  await page.getByLabel('作品名').fill('端末内の別作品');await page.reload();await expect(card).toBeVisible({timeout:45000});
  await card.getByRole('button',{name:'開く',exact:true}).click();await page.getByRole('button',{name:'切り替える',exact:true}).click();await expect(page.getByLabel('作品名')).toHaveValue('端末をまたぐテスト');
  await page.getByLabel('作品名').fill('上書き後の作品');page.once('dialog',d=>d.accept());await card.getByRole('button',{name:'現在の作品で上書き',exact:true}).click();
  const updated=page.locator('.cloud-card').filter({hasText:'上書き後の作品'});await expect(updated).toBeVisible({timeout:45000});
  page.once('dialog',d=>d.accept());await updated.getByRole('button',{name:'削除',exact:true}).click();await expect(updated).toHaveCount(0,{timeout:45000});
  await page.getByRole('button',{name:'ログアウト',exact:true}).click();await expect(page.getByRole('button',{name:'ログイン',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{
  const {data:files}=await admin.storage.from('dot-atelier-projects').list(user.id);
  if(files?.length)await admin.storage.from('dot-atelier-projects').remove(files.map(f=>`${user.id}/${f.name}`));
  await admin.auth.admin.deleteUser(user.id);await rm(directory,{recursive:true,force:true});
 }
});
