export type Project = { version: 1; name: string; size: number; pixels: string[] };
export function validateProject(value: unknown): Project {
 if(!value || typeof value!=='object')throw new Error('編集データの形式が違います。');
 const p=value as Project;
 if(p.version!==1 || ![16,32,64].includes(p.size) || typeof p.name!=='string' || p.name.length>80 || !Array.isArray(p.pixels) || p.pixels.length!==p.size*p.size || !p.pixels.every(c=>typeof c==='string'&&(c===''||/^#[0-9a-f]{6}$/i.test(c))))throw new Error('この編集データは読み込めません。');
 return {version:1,name:p.name,size:p.size,pixels:[...p.pixels]};
}
