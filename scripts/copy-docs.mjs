import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist/docs', { recursive: true });
await copyFile('docs/guide.html', 'dist/docs/guide.html');
