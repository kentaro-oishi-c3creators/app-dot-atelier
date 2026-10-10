export type Project = { version: 1; name: string; size: number; pixels: string[] };
export const palette = ['#263044','#59607b','#ffffff','#e7dfce','#f7ceaa','#e7a17c','#c27561','#744951','#e2686f','#f4ac8f','#f7d878','#d0df8a','#80b6a0','#458d8d','#9ac8dc','#627dad','#a996c9','#cc9dbb'];
export function blank(size=32): string[] { return Array(size*size).fill(''); }
export function template(kind: string): Project {
 const size=32, pixels=blank(size);
 const rect=(x:number,y:number,w:number,h:number,c:string)=>{ for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)pixels[j*size+i]=c; };
 const ink='#263044', skin='#f7ceaa', hair='#744951';
 if(kind==='character'){
 rect(12,4,8,2,ink);rect(10,6,12,7,ink);rect(11,6,10,5,hair);rect(9,11,14,7,ink);rect(10,12,12,5,skin);rect(12,10,8,7,skin);rect(12,7,3,4,hair);rect(15,7,6,3,hair);rect(12,12,2,2,ink);rect(18,12,2,2,ink);rect(15,15,2,1,'#c27561');rect(11,18,10,7,ink);rect(12,18,8,6,'#80b6a0');rect(9,19,2,5,ink);rect(10,20,2,3,skin);rect(21,19,2,5,ink);rect(20,20,2,3,skin);rect(12,24,3,4,ink);rect(17,24,3,4,ink);rect(11,28,4,2,hair);rect(17,28,4,2,hair);rect(14,19,4,2,'#d0df8a');
 } else if(kind==='cat') {
 rect(8,9,5,7,ink);rect(19,9,5,7,ink);rect(9,10,3,5,'#e7a17c');rect(20,10,3,5,'#e7a17c');rect(7,15,18,10,ink);rect(9,13,14,13,ink);rect(9,16,14,8,'#f7d878');rect(10,14,12,11,'#f7d878');rect(10,18,3,3,ink);rect(19,18,3,3,ink);rect(15,21,2,2,'#c27561');rect(12,22,2,1,'#e7a17c');rect(18,22,2,1,'#e7a17c');
 } else if(kind==='heart') {
 const rows=['  xxx   xxx  ',' xxxxx xxxxx ','xxxxxxxxxxxxx','xxxxxxxxxxxxx',' xxxxxxxxxxx ','  xxxxxxxxx  ','   xxxxxxx   ','    xxxxx    ','     xxx     ','      x      '];
 rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='x')rect(3+x*2,6+y*2,2,2,'#e2686f');}));rect(9,10,2,4,'#f4ac8f');
 }
 return { version:1, name:kind==='character'?'はじめての冒険者':kind==='cat'?'まんまるねこ':kind==='heart'?'小さなハート':'新しい作品', size,pixels };
}
export function validateProject(value: unknown): Project {
 if(!value || typeof value!=='object')throw new Error('編集データの形式が違います。');
 const p=value as Project;
 if(p.version!==1 || ![16,32,64].includes(p.size) || typeof p.name!=='string' || p.name.length>80 || !Array.isArray(p.pixels) || p.pixels.length!==p.size*p.size || !p.pixels.every(c=>typeof c==='string'&&(c===''||/^#[0-9a-f]{6}$/i.test(c))))throw new Error('この編集データは読み込めません。');
 return {version:1,name:p.name,size:p.size,pixels:[...p.pixels]};
}
export function line(x0:number,y0:number,x1:number,y1:number): [number,number][] {
 const result:[number,number][]=[]; const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
 while(true){result.push([x0,y0]);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}
 return result;
}
export function flood(pixels:string[],size:number,index:number,color:string):string[]{
 const target=pixels[index]; if(target===color)return pixels;
 const next=[...pixels], stack=[index];next[index]=color;
 while(stack.length){const i=stack.pop()!;const x=i%size,y=Math.floor(i/size);for(const n of [x>0?i-1:-1,x<size-1?i+1:-1,y>0?i-size:-1,y<size-1?i+size:-1])if(n>=0&&next[n]===target){next[n]=color;stack.push(n);}}
 return next;
}
