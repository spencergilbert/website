import { parse } from 'yaml';
import { z } from 'zod';
// Vite's `?raw` import gives us the file as a string and watches it in dev,
// so there is no content-collection loader or generated types to maintain.
import raw from '../data/resume.yaml?raw';

// A zod subset of the JSON Resume schema (https://jsonresume.org/). The full
// schema lives in the editor via the `$schema` directive in the YAML; this is
// the part the site actually renders, kept in sync by hand.

const basicsSchema = z.object({
  name: z.string(),
  label: z.string(),
  // Home-page hero line. Kept separate from `summary`, which is the resume's
  // professional pitch. JSON Resume allows extras on `basics`.
  hook: z.string().nullish(),
  email: z.string().nullish(),
  url: z.string().nullish(),
  // Paragraphs are separated by newlines in the JSON Resume summary string.
  summary: z.string().nullish(),
  profiles: z
    .array(
      z.object({
        network: z.string(),
        username: z.string().nullish(),
        url: z.string().nullish(),
      }),
    )
    .default([]),
});

const workSchema = z.object({
  name: z.string(),
  position: z.string(),
  startDate: z.string(),
  // Absent for a current role; JSON Resume has no "present" token.
  endDate: z.string().nullish(),
  location: z.string().nullish(),
  highlights: z.array(z.string()).default([]),
  // Set `resume: false` to keep an entry in the data (and the home timeline)
  // but omit it from the resume page and PDF. Included by default.
  resume: z.boolean().default(true),
  // Site-only story fields, shown on the home timeline, never on the PDF.
  chapter: z.string().nullish(),
  aside: z.string().nullish(),
});

const skillSchema = z.object({
  name: z.string(),
  keywords: z.array(z.string()).default([]),
});

const eduSchema = z.object({
  institution: z.string(),
  area: z.string(),
  studyType: z.string(),
});

const resumeSchema = z.object({
  basics: basicsSchema,
  work: z.array(workSchema).default([]),
  skills: z.array(skillSchema).default([]),
  education: z.array(eduSchema).default([]),
});

export const resume = resumeSchema.parse(parse(raw));

export type Resume = z.infer<typeof resumeSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type Work = z.infer<typeof workSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Education = z.infer<typeof eduSchema>;

/** Newest first. */
export const byNewest = (entries: Work[]): Work[] =>
  [...entries].sort((a, b) => b.startDate.localeCompare(a.startDate));

/** Split the JSON Resume summary string into paragraphs. */
export const summaryParagraphs = (basics: Basics): string[] =>
  (basics.summary ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
