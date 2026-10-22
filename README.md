# spencergilbert.dev

The site is a **hand-drafted sketch on dot paper** — the drafting table, not
the napkin. Architectural lettering for display type, mono for labels, clean
sans for body copy. Warm paper, ink lines, one redline accent.

### Paper & ink

- Warm dot-paper background. Hand-ruled header, section, and footer lines;
  no gradients, glows, or glass.
- The timeline rail reads as one attempted hand line with a visible redraw,
  one card per role with hand ticks and dots.
- Sketch styles are scoped to `body.sketch`, so the resume page never sees
  them. Motion is subtle and opt-in; every animation is behind
  `@supports` and `prefers-reduced-motion`.

### The resume stays a document

- Resume links point straight at the PDF. The resume page itself is unstyled
  paper: plain, factual lines, every job with 2–3 outcomes and a measured
  effect where one exists.
- The PDF is ATS-safe (tagged, real Unicode text) and is literally the same
  page as the HTML resume.
- Fast, accessible, no layout shift, works without JavaScript.

## Deploy plan

1. Run `npm run render:cv` (Chromium is a CI dependency:
   `npx playwright install --with-deps chromium`). It builds the site, prints
   the PDF, and writes it into `dist/`.
2. Publish `dist/` to Cloudflare Pages with `wrangler pages deploy`.

## Still open

- **Real resume content** — roles, contact, and metrics are placeholders.
- **Repo host and CI.** The repo lives under `tangled.org` and mirrors to
  GitHub (`spencergilbert/website`), so Cloudflare Pages' Git integration can
  target it. Otherwise deploy `dist/` with `wrangler pages deploy` from
  CI/manually.
- **Does the `spencergilbert.dev` zone move to Cloudflare?** Needed before the
  apex can point at Pages.

## License

MIT-0
