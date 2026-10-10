import { validateProject, type Project } from './pixels';
export function serializeProject(p:Project):string{return JSON.stringify(p,null,2);}
export function parsePastedProject(text:string):Project{
 if(new TextEncoder().encode(text).length>1000000)throw new Error('1MB以下のJSONを貼り付けてください。');
 const raw=text.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i,'$1');
 try{return validateProject(JSON.parse(raw));}catch{throw new Error('JSONを読み込めません。version・size・pixelsの件数と色を確認してください。');}
}
export function makePrompt(p:Project,request:string):string{
 return `DOT ATELIERで編集できるドット絵のJSONを作ってください。\n\n希望：\n${request.trim()||'下の雛形を使ってキャラクターを作ってください。'}\n\n必須の形式：\n- versionは1。nameは80文字以内。sizeは${p.size}。\n- pixelsは${p.size*p.size}件をすべて出力。左上から右へ、次の行へ並べる。\n- 透明なマスは空文字列 ""。色は #rrggbb の6桁HEX文字列。\n- ぼかしやアンチエイリアスを使わず、少ない色で輪郭・表情を分かりやすく。\n- pixelsを省略・短縮せず、コメントや説明、Markdownのコード囲みを付けず、JSONオブジェクトだけを返す。\n- 現在の絵を修正する場合は、希望に関係のないマスをできるだけ維持する。\n\n元データ（この形式のまま作成・編集）：\n${serializeProject(p)}\n\n返されたJSONはDOT ATELIERの「AIのJSONを貼り付け」に入れて読み込みます。`;
}
function fence(text:string):string{const runs=text.match(/`+/g)??[];return '`'.repeat(Math.max(3,...runs.map(x=>x.length+1)));}
export function makeMarkdown(p:Project,prompt:string):string{
 const json=serializeProject(p),pf=fence(prompt),jf=fence(json);
 return `# DOT ATELIER 制作メモ\n\n## 作品情報\n\n- サイズ：${p.size} × ${p.size} px\n- 編集形式：JSON（version 1）\n\n## AIに渡すプロンプト\n\n${pf}text\n${prompt}\n${pf}\n\n## 選択した編集データ / JSON雛形\n\n${jf}json\n${json}\n${jf}\n\n## 再開方法\n\nJSON部分をDOT ATELIERの「AIのJSONを貼り付け」に入れて読み込みます。作品名はJSONのnameにあります。\n\n作品の自動保存はこの端末のブラウザ内です。JSON・Markdown・PNGのファイルは端末のダウンロード先に保存されます。\n`;
}
