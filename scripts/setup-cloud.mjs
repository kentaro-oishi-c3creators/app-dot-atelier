import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'node:fs/promises';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Run with --env-file=cloud/.env.local');
const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:buckets,error:listError}=await admin.storage.listBuckets();
if(listError)throw new Error(`Bucket list failed (${listError.statusCode||'unknown'})`);
if(!buckets.some(b=>b.id==='dot-atelier-projects')){
 const {error}=await admin.storage.createBucket('dot-atelier-projects',{public:false,fileSizeLimit:1000000,allowedMimeTypes:['application/json']});
 if(error)throw new Error(`Bucket creation failed (${error.statusCode||'unknown'})`);
}
const publishableKey=process.env.SUPABASE_PUBLISHABLE_KEY;
if(!publishableKey?.startsWith('sb_publishable_'))throw new Error('A publishable key is required');
await writeFile(new URL('../src/cloud-config.json',import.meta.url),JSON.stringify({supabaseUrl:url,publishableKey,apiUrl:'https://app-dot-atelier-cloud.vercel.app/api/projects',googleClientId:''},null,2)+'\n');
console.log('Private bucket ready. Frontend configuration contains public values only.');
