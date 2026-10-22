// @ts-check
import { defineConfig } from 'astro/config';
import resumePdf from './integrations/resume-pdf.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://spencergilbert.dev',
  // Regenerates the resume PDF from the dev server on save. The production
  // artifact comes from `npm run render:cv`.
  integrations: [resumePdf()],
});