import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('draw, undo, redo, autosave, export PNG, and round-trip editing data',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');await expect(page.getByRole('heading',{name:'小さなドット、大きな世界。'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'色 #e2686f',exact:true}).click();
 const canvas=page.locator('canvas.drawing');await canvas.scrollIntoViewIfNeeded();const rect=(await canvas.boundingBox())!;
 if(testInfo.project.name==='mobile')await page.touchscreen.tap(rect.x+rect.width/64,rect.y+rect.height/64);else await canvas.click({position:{x:rect.width/64,y:rect.height/64}});
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dot-atelier-v1')!).pixels[0])).toBe('#e2686f');
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dot-atelier-v1')!).pixels[0])).toBe('');
 await page.getByRole('button',{name:'やり直す',exact:true}).click();await page.reload();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dot-atelier-v1')!).pixels[0])).toBe('#e2686f');
 const pngPromise=page.waitForEvent('download');await page.getByRole('button',{name:'PNGで保存'}).click();const png=await pngPromise;const bytes=await readFile((await png.path())!);expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');expect(bytes.readUInt32BE(16)).toBe(32);expect(bytes.readUInt32BE(20)).toBe(32);
 const alpha=await page.evaluate(()=>{const c=document.querySelector<HTMLCanvasElement>('canvas.drawing')!;return c.getContext('2d')!.getImageData(16*31,16*31,1,1).data[3];});expect(alpha).toBe(0);
 const jsonPromise=page.waitForEvent('download');await page.getByRole('button',{name:'編集データを保存',exact:true}).click();const json=await jsonPromise,exported=JSON.parse(await readFile((await json.path())!,'utf8'));expect(exported.pixels[0]).toBe('#e2686f');
 await page.getByRole('button',{name:'16 × 16',exact:true}).click();await page.getByRole('button',{name:'切り替える',exact:true}).click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dot-atelier-v1')!).size)).toBe(16);
 await page.locator('input[type=file]').setInputFiles({name:'art.dot.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.getByRole('button',{name:'切り替える',exact:true}).click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dot-atelier-v1')!).pixels[0])).toBe('#e2686f');
 await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":2}')});await expect(page.getByRole('status')).toContainText('読み込めません');
 await page.screenshot({path:`/workspace/dot-atelier/${testInfo.project.name}.png`,fullPage:true});expect(errors).toEqual([]);
});
test('templates, fill, erase, grid, zoom, and documentation',async({page},testInfo)=>{
 await page.goto('./');await page.getByRole('button',{name:/まんまるねこ/}).click();await page.getByRole('button',{name:'切り替える',exact:true}).click();await expect(page.locator('#project-name')).toHaveValue('まんまるねこ');
 await page.getByRole('button',{name:'色 #9ac8dc',exact:true}).click();await page.getByRole('button',{name:'塗りつぶし',exact:true}).click();const c=page.locator('canvas.drawing');await c.scrollIntoViewIfNeeded();const r=(await c.boundingBox())!;if(testInfo.project.name==='mobile')await page.touchscreen.tap(r.x+1,r.y+1);else await c.click({position:{x:1,y:1}});expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dot-atelier-v1')!).pixels[0])).toBe('#9ac8dc');
 await page.getByRole('button',{name:'消しゴム',exact:true}).click();await c.scrollIntoViewIfNeeded();const er=(await c.boundingBox())!;if(testInfo.project.name==='mobile')await page.touchscreen.tap(er.x+1,er.y+1);else await c.click({position:{x:1,y:1}});await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dot-atelier-v1')!).pixels[0])).toBe('');
 await page.getByRole('button',{name:'マス目',exact:true}).click();await expect(page.locator('.pixel-grid')).toHaveCount(0);await page.getByRole('button',{name:'拡大',exact:true}).click();await expect(page.locator('.zoom-controls')).toContainText('2×');
 await page.getByRole('link',{name:'使い方・プロジェクト資料 ↗'}).click();await expect(page.getByRole('heading',{name:'ひとマスから、はじめよう。'})).toBeVisible();
});
