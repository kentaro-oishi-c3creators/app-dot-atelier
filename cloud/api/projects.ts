import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { validateProject } from '../lib/project.js';
type Request = IncomingMessage & { body?: unknown };
const bucket='dot-atelier-projects';
const allowed=new Set(['https://kentaro-oishi-c3creators.github.io','http://localhost:5174']);
export default async function handler(req:Request,res:ServerResponse){
 res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
 const origin=req.headers.origin;
 if(origin && !allowed.has(origin)){res.statusCode=403;res.end();return;}
 if(origin)res.setHeader('Access-Control-Allow-Origin',origin);
 res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
 res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, OPTIONS');
 const send=(status:number,data:unknown)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
 if(req.method==='OPTIONS'){res.statusCode=204;res.end();return;}
 if(!['GET','POST','PUT','DELETE'].includes(req.method||'')){send(405,{error:'この操作は使えません。'});return;}
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key){send(503,{error:'保存先の接続設定がありません。'});return;}
 const token=req.headers.authorization;
 if(!token?.startsWith('Bearer ')){send(401,{error:'ログインしてください。'});return;}
 try{
  const auth=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:token},signal:AbortSignal.timeout(15000)});
  if(!auth.ok){send(401,{error:'ログインの有効期限が切れました。もう一度ログインしてください。'});return;}
  const user=await auth.json() as {id:string};
  if(!/^[0-9a-f-]{36}$/i.test(user.id)){send(401,{error:'ログインを確認できません。'});return;}
  const headers={apikey:key,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY||key}`};
  const storage=async(path:string,init:RequestInit={})=>fetch(`${url}/storage/v1/${path}${!init.method?`?cacheNonce=${randomUUID()}`:''}`,{...init,cache:'no-store',headers:{...headers,...init.headers},signal:AbortSignal.timeout(15000)});
  const id=new URL(req.url||'/', 'https://app.local').searchParams.get('id');
  if(id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)){send(400,{error:'作品IDが違います。'});return;}
  const path=(item:string)=>`${bucket}/${user.id}/${item}.json`;
  if(req.method==='GET' && id){
   const result=await storage(`object/${path(id)}`);
   if(!result.ok){send(result.status===404||result.status===400?404:502,{error:'作品を読み込めませんでした。'});return;}
   send(200,{id,project:validateProject(await result.json())});return;
  }
  if(req.method==='GET'){
   const result=await storage(`object/list/${bucket}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefix:user.id,limit:100,sortBy:{column:'updated_at',order:'desc'}})});
   if(!result.ok)throw new Error('list');
   const files=await result.json() as {name:string;updated_at:string}[];
   const items=await Promise.all(files.filter(f=>/^[0-9a-f-]{36}\.json$/i.test(f.name)).map(async f=>{const item=f.name.slice(0,-5),r=await storage(`object/${path(item)}`);if(!r.ok)throw new Error('read');return {id:item,updatedAt:f.updated_at,project:validateProject(await r.json())};}));
   send(200,{items});return;
  }
  if(req.method==='DELETE'){
   if(!id){send(400,{error:'作品を選んでください。'});return;}
   const result=await storage(`object/${bucket}`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[`${user.id}/${id}.json`]})});
   if(!result.ok)throw new Error('delete');send(200,{ok:true});return;
  }
  if(req.method==='PUT' && !id){send(400,{error:'作品を選んでください。'});return;}
  if(Number(req.headers['content-length']||0)>1000000){send(413,{error:'編集データが大きすぎます。'});return;}
  let project;
  try{project=validateProject(typeof req.body==='string'?JSON.parse(req.body):req.body);}catch{send(400,{error:'編集データの形式が違います。'});return;}
  const item=req.method==='PUT'?id!:randomUUID();
  if(req.method==='PUT'){
   const existing=await storage(`object/${path(item)}`);
   if(!existing.ok){send(404,{error:'上書きする作品が見つかりません。'});return;}
  }else{
   const list=await storage(`object/list/${bucket}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefix:user.id,limit:101})});
   if(!list.ok)throw new Error('list');if((await list.json()).length>=100){send(409,{error:'保存できる作品は100件です。不要な作品を削除してください。'});return;}
  }
  const result=await storage(`object/${path(item)}`,{method:'POST',headers:{'Content-Type':'application/json','Cache-Control':'max-age=0','x-upsert':req.method==='PUT'?'true':'false'},body:JSON.stringify(project)});
  if(!result.ok)throw new Error('save');send(200,{id:item});
 }catch{send(502,{error:'クラウドと通信できませんでした。少し待ってからもう一度お試しください。'});}
}
