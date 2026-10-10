import test from 'node:test';
import assert from 'node:assert/strict';
import { blank, flood, line, template, validateProject } from '../src/pixels';
test('templates are valid and survive an export/import round trip',()=>{for(const kind of ['character','cat','heart','blank']){const p=template(kind);assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);}});
test('fill stays inside its boundary and does not wrap rows',()=>{const p=blank(16);for(let y=0;y<16;y++)p[y*16+8]='#263044';const r=flood(p,16,0,'#ffffff');assert.equal(r[7],'#ffffff');assert.equal(r[8],'#263044');assert.equal(r[9],'');assert.equal(r[16],'#ffffff');assert.equal(p[0],'');});
test('fast strokes interpolate continuous cells in either direction',()=>{assert.deepEqual(line(0,0,3,3),[[0,0],[1,1],[2,2],[3,3]]);assert.deepEqual(line(3,0,0,0),[[3,0],[2,0],[1,0],[0,0]]);});
test('import rejects wrong size, invalid colors, and unsupported versions',()=>{const p=template('cat');for(const bad of [{...p,size:100},{...p,pixels:['red']},{...p,version:2},{...p,pixels:p.pixels.map(()=>'<script>')}])assert.throws(()=>validateProject(bad));});
