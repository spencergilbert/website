//
// Astro integration: regenerate public/spencer-gilbert-cv.pdf from the running
// dev server whenever a file under src/ changes, so `npm run dev` updates the
// PDF on save.
//
// This prints the *dev* page (fast, no build) — it's a live preview. The
// production artifact is still produced by `npm run render:cv`, which builds
// first. Playwright is imported lazily so it isn't pulled into the config load.
import { isAbsolute, join, sep } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { chromiumLaunchOptions } from '../scripts/chromium.mjs';

export default function resumePdf() {
  let server;
  let logger;
  let root;
  let out;
  let port = 4321;
  let running = false;
  let queued = false;
  let timer;

  const url = () => {
    const local = server?.resolvedUrls?.local?.[0];
    return local ? `${local}resume/` : `http://localhost:${port}/resume/`;
  };

  const render = async () => {
    const { chromium } = await import('playwright');
    await mkdir(dirname(out), { recursive: true });
    const browser = await chromium.launch(chromiumLaunchOptions());
    try {
      const page = await browser.newPage();
      await page.goto(url(), { waitUntil: 'load' });
      await page.pdf({
        path: out,
        tagged: true,
        outline: true,
        preferCSSPageSize: true,
        printBackground: true,
      });
    } finally {
      await browser.close();
    }
  };

  const run = async (reason) => {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    try {
      logger.info(`resume PDF: ${reason}`);
      await render();
      logger.info('resume PDF: wrote public/spencer-gilbert-cv.pdf');
    } catch (error) {
      logger.warn(`resume PDF failed: ${error.message}`);
    } finally {
      running = false;
      if (queued) {
        queued = false;
        await run('change during render');
      }
    }
  };

  return {
    name: 'resume-pdf',
    hooks: {
      'astro:server:setup': (options) => {
        server = options.server;
        logger = options.logger;
        root = server.config.root;
        out = join(root, 'public', 'spencer-gilbert-cv.pdf');
        const srcPrefix = join(root, 'src') + sep;

        server.watcher.on('all', (_event, changed) => {
          const file = isAbsolute(changed) ? changed : join(root, changed);
          if (!file.startsWith(srcPrefix)) return;
          clearTimeout(timer);
          timer = setTimeout(
            () => run(`change: ${file.slice(root.length + 1)}`),
            250,
          );
        });
      },
      'astro:server:start': (options) => {
        port = options.address.port;
        run('initial render');
      },
      'astro:server:done': () => {
        clearTimeout(timer);
      },
    },
  };
}