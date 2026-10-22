#!/usr/bin/env node
//
// Build the site, then print its /resume page to a PDF with headless Chromium.
// One renderer: the PDF is the same HTML/CSS the site serves, so the two
// cannot drift.
//
// It always builds first because the PDF is derived from the built page — a
// stale dist/ would otherwise silently produce a stale PDF.
//
//   node scripts/render-cv.mjs            build once, print once
//   node scripts/render-cv.mjs --watch    re-run whenever src/ changes
//
// Needs `npx playwright install chromium` once.
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync, watch } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const out = join(root, 'public', 'spencer-gilbert-cv.pdf');
const watchMode = process.argv.includes('--watch');

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

async function render() {
  execFileSync(join(root, 'node_modules', '.bin', 'astro'), ['build'], {
    cwd: root,
    stdio: 'inherit',
  });

  if (!existsSync(join(dist, 'resume', 'index.html'))) {
    throw new Error('build did not produce dist/resume/index.html');
  }

  // Any port, served from dist/, so absolute asset paths resolve like production.
  const server = createServer(async (req, res) => {
    let pathname = decodeURIComponent(
      new URL(req.url ?? '/', 'http://x').pathname,
    );
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

  // The build copied the *previous* PDF from public/ into dist/ before this
  // run, so refresh it there too — dist/ is what the deployed site serves.
  await copyFile(out, join(dist, 'spencer-gilbert-cv.pdf'));
  console.log('wrote', out);
}

if (watchMode) {
  const src = join(root, 'src');
  let running = false;
  let queued = false;

  const run = async (reason) => {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    try {
      console.log(`[render:cv] ${reason}`);
      await render();
    } catch (error) {
      console.error(`[render:cv] failed: ${error.message}`);
    } finally {
      running = false;
      if (queued) {
        queued = false;
        await run('change during render');
      }
    }
  };

  await run('initial render');

  let timer;
  watch(src, { recursive: true }, (_event, filename) => {
    clearTimeout(timer);
    timer = setTimeout(() => run(`change: ${filename ?? src}`), 200);
  });

  console.log(`[render:cv] watching ${src} (Ctrl+C to stop)`);
} else {
  await render();
}