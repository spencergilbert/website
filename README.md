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

## Deploy

Pushing to `main` runs `.tangled/workflows/deploy.yml` on the repository's
spindle. The workflow installs with `npm ci`, runs `npm run render:cv` to build
the site and print the resume PDF, then uploads `dist/` to Cloudflare Pages with
`wrangler pages deploy` (direct upload).

Requirements:

- A spindle selected under **Settings → Pipelines** that supports the `microvm`
  engine.
- `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` stored as pipeline secrets
  in the same place.
- The Pages project must already exist; `wrangler pages deploy` only creates one
  interactively.

Locally, `npm run render:cv` still builds and prints the PDF against the
Playwright-managed Chromium. The workflow swaps in the NixOS Chromium through
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` (see `scripts/chromium.mjs`).

## Still open

- **Real resume content** — roles, contact, and metrics are placeholders.
- **Does the `spencergilbert.dev` zone move to Cloudflare?** Needed before the
  apex can point at Pages.

## License

MIT-0
