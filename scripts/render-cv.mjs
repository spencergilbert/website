#!/usr/bin/env node
//
// Print the built /resume page to a PDF with headless Chromium. One renderer:
// the PDF is the same HTML/CSS the site serves, so the two cannot drift.
//
// Needs `npm run build` first, and `npx playwright install chromium` once.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const out = join(root, 'public', 'spencer-gilbert-cv.pdf');

if (!existsSync(join(dist, 'resume', 'index.html'))) {
  console.error('dist/resume/index.html is missing — run `npm run build` first.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// Any port, served from dist/, so absolute asset paths resolve like production.
const server = createServer(async (req, res) => {
  let pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = normalize(join(dist, pathname));
  if (!file.startsWith(dist)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/resume/`, { waitUntil: 'load' });
  await mkdir(dirname(out), { recursive: true });
  await page.pdf({
    path: out,
    tagged: true,
    outline: true,
    preferCSSPageSize: true,
    printBackground: true,
  });
} finally {
  await browser.close();
  server.close();
}

console.log('wrote', out);