import test from 'node:test';
import assert from 'node:assert/strict';
import {template} from '../src/pixels';
import {makePrompt,makeMarkdown,parsePastedProject} from '../src/handoff';
test('AI round-trip accepts plain and fenced JSON while rejecting abbreviated pixels',()=>{const p=template('cat');assert.deepEqual(parsePastedProject(JSON.stringify(p)),p);assert.deepEqual(parsePastedProject('```json\n'+JSON.stringify(p)+'\n```'),p);assert.throws(()=>parsePastedProject(JSON.stringify({...p,pixels:['#ffffff']})));});
test('prompt contains the complete input and canvas constraints, Markdown preserves edited prompts',()=>{const p=template('heart');const prompt=makePrompt(p,'青色にしてください');assert.ok(prompt.includes('1024件'));assert.ok(prompt.includes('青色にしてください'));assert.ok(prompt.includes(JSON.stringify(p,null,2)));const md=makeMarkdown(p,prompt+'\n```text\n追記\n```');assert.ok(md.includes('````text'));assert.ok(md.includes(JSON.stringify(p,null,2)));});
