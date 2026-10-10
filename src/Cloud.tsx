import { useEffect, useRef, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import config from './cloud-config.json';
import { validateProject, type Project } from './pixels';
import Drive from './Drive';
const client=createClient(config.supabaseUrl,config.publishableKey);
type Item={id:string;updatedAt:string;project:Project};
function Preview({project}:{project:Project}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current;if(!c)return;c.width=c.height=project.size;const ctx=c.getContext('2d')!;ctx.clearRect(0,0,c.width,c.height);project.pixels.forEach((color,i)=>{if(color){ctx.fillStyle=color;ctx.fillRect(i%project.size,Math.floor(i/project.size),1,1);}});},[project]);
 return <canvas className="cloud-preview" ref={ref} aria-label={project.name}/>;
}
export default function Cloud({project,onImport}:{project:Project;onImport:(p:Project)=>void}){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[items,setItems]=useState<Item[]>([]),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[recovery,setRecovery]=useState(false);
 const generation=useRef(0),identity=useRef<string|undefined>(undefined);
 useEffect(()=>{
  let live=true;
  const receive=(next:Session|null)=>{if(identity.current!==next?.user.id){generation.current++;setItems([]);identity.current=next?.user.id;}setSession(next);setReady(true);};
  client.auth.getSession().then(({data,error})=>{if(live){if(error)setMessage('ログインを確認できませんでした。');receive(data.session);}});
  const {data}=client.auth.onAuthStateChange((event,next)=>{if(!live)return;receive(next);if(event==='PASSWORD_RECOVERY')setRecovery(true);});
  return()=>{live=false;generation.current++;data.subscription.unsubscribe();};
 },[]);
 async function request(method:string,id?:string,p?:Project){
  const {data,error}=await client.auth.getSession();if(error||!data.session)throw new Error('ログインしてください。');
  const r=await fetch(config.apiUrl+(id?`?id=${encodeURIComponent(id)}`:''),{method,headers:{Authorization:`Bearer ${data.session.access_token}`,...(p?{'Content-Type':'application/json'}:{})},body:p?JSON.stringify(p):undefined,signal:AbortSignal.timeout(30000)});
  const result=await r.json();if(!r.ok)throw new Error(result.error||'クラウドと通信できませんでした。');return result;
 }
 async function refresh(){const stamp=generation.current,result=await request('GET');if(stamp===generation.current)setItems(result.items.map((i:Item)=>({...i,project:validateProject(i.project)})));}
 useEffect(()=>{if(!session)return;void refresh().catch(()=>setMessage('作品一覧を読み込めませんでした。「一覧を更新」をお試しください。'));},[session?.user.id]);
 async function action(fn:()=>Promise<void>){setBusy(true);setMessage('');try{await fn();}catch(e){setMessage(e instanceof Error?e.message:'通信できませんでした。');}finally{setBusy(false);}}
 async function login(register=false){await action(async()=>{
  const {error,data}=register?await client.auth.signUp({email,password,options:{emailRedirectTo:'https://kentaro-oishi-c3creators.github.io/app-dot-atelier/'}}):await client.auth.signInWithPassword({email,password});
  if(error){setMessage(register?'登録できませんでした。メール形式・8文字以上のパスワードを確認し、少し待ってお試しください。':'ログインできませんでした。メール・パスワード・確認メールの承認を確認してください。');return;}
  setPassword('');setMessage(register&&!data.session?'確認メールを送りました。メールのリンクを開いて登録を完了してください。':'ログインしました。');
 });}
 return <section className="panel cloud-section" aria-labelledby="cloud-title"><p className="eyebrow">YOUR WORK, ANYWHERE</p><h2 id="cloud-title">作品をクラウドに残そう。</h2><p>保存先を選んで、スマホでもパソコンでも続きを。クラウドには保存ボタンを押した時点の作品が残ります。</p><div className="cloud-columns"><section><h3>アプリの作品一覧</h3><p>メールアドレスでログインして、あなた専用の一覧に保存します。最大100件。</p>{!ready?<p>ログインを確認しています…</p>:session?<><p className="cloud-account">ログイン中：{session.user.email}</p>{recovery?<form onSubmit={e=>{e.preventDefault();void action(async()=>{const {error}=await client.auth.updateUser({password});if(error)throw new Error('パスワードを変更できませんでした。');setPassword('');setRecovery(false);setMessage('パスワードを変更しました。');});}}><label>新しいパスワード<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} className="secondary">パスワードを変更</button></form>:null}<div className="cloud-actions"><button className="primary" disabled={busy||items.length>=100} onClick={()=>void action(async()=>{await request('POST',undefined,project);await refresh();setMessage('クラウドに新しく保存しました。');})}>クラウドに新しく保存</button><button className="secondary" disabled={busy} onClick={()=>void action(refresh)}>一覧を更新</button><button className="text-button" disabled={busy} onClick={()=>void action(async()=>{const {error}=await client.auth.signOut();if(error)throw error;setRecovery(false);setMessage('ログアウトしました。');})}>ログアウト</button></div><div className="cloud-list">{items.length===0?<p>保存した作品はまだありません。</p>:items.map(item=><article key={item.id} className="cloud-card"><Preview project={item.project}/><div><strong>{item.project.name||'名前のない作品'}</strong><small>{item.project.size} × {item.project.size} · {new Date(item.updatedAt).toLocaleString('ja-JP')}</small><div className="cloud-actions"><button className="secondary" disabled={busy} onClick={()=>onImport(item.project)}>開く</button><button className="text-button" disabled={busy} onClick={()=>{if(confirm(`「${item.project.name}」を現在の作品で上書きしますか？`))void action(async()=>{await request('PUT',item.id,project);await refresh();setMessage('上書き保存しました。');});}}>現在の作品で上書き</button><button className="text-button" disabled={busy} onClick={()=>{if(confirm(`「${item.project.name}」をクラウドから削除しますか？この操作は元に戻せません。`))void action(async()=>{await request('DELETE',item.id);await refresh();setMessage('クラウドから削除しました。');});}}>削除</button></div></div></article>)}</div></>:<><form onSubmit={e=>{e.preventDefault();void login();}} className="cloud-login"><label>メールアドレス<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>パスワード（8文字以上）<input type="password" autoComplete="current-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><div className="cloud-actions"><button className="primary" disabled={busy}>ログイン</button><button className="secondary" type="button" disabled={busy||password.length<8||!email} onClick={()=>void login(true)}>新しく登録</button></div></form><button className="text-button" disabled={busy||!email} onClick={()=>void action(async()=>{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:'https://kentaro-oishi-c3creators.github.io/app-dot-atelier/'});if(error)throw new Error('再設定メールを送れませんでした。少し待ってお試しください。');setMessage('登録済みの場合、パスワード再設定メールが届きます。');})}>パスワードを忘れたとき</button></>}{busy?<p>通信中…</p>:null}<p className="cloud-message" role="status">{message}</p></section><Drive project={project} onImport={onImport}/></div></section>;
}
