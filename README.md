# spencergilbert.dev

The design is **calm, professional, and doesn't take itself too seriously.**

### Calm

- One accent color. Warm neutral background. No gradients, glows, or glass.
- Generous whitespace; a single thin vertical line is the whole timeline motif.
- Motion is subtle and opt-in; every animation is behind
  `@supports` and `prefers-reduced-motion`.
- The page should read as a document, not an app.

### Professional

- Resume lines are plain, factual, and numeric. Every job gets 2–3 outcomes
  with a measured effect where one exists.
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
- **Repo host and CI.** The repo lives under `tangled.org`, but Cloudflare Pages'
  Git integration targets GitHub/GitLab (verify). Either deploy `dist/` with
  `wrangler pages deploy` from CI/manually, or mirror to GitHub.
- **Does the `spencergilbert.dev` zone move to Cloudflare?** Needed before the
  apex can point at Pages.
