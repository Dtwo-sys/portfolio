import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/*
  Content model (brief.md Section 9).
  The `links` object covers both web projects and mobile apps via
  live / appStore / playStore, so one schema serves every case study.
  Leave unknown facts as "[TBD]" strings rather than inventing them.
*/

const projectCategories = [
  'Web builds',
  'AI and tools',
  'Mobile apps',
  'Technical writing',
  'Creative projects',
  'Radio / hobby projects',
  'Photography / poetry',
] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.string().default('[TBD]'),
      type: z.string(),
      // Live | iOS only | Not publicly released | Archived, etc.
      status: z.string().default('[TBD]'),
      role: z.string().default('[TBD]'),
      summary: z.string(),
      categories: z.array(z.enum(projectCategories)).default([]),
      technologies: z.array(z.string()).default(['[TBD]']),
      links: z
        .object({
          live: z.string().url().or(z.literal('')).default(''),
          appStore: z.string().url().or(z.literal('')).default(''),
          playStore: z.string().url().or(z.literal('')).default(''),
        })
        .default({ live: '', appStore: '', playStore: '' }),
      // 'web' standard variant or 'app' device-screenshot variant.
      variant: z.enum(['web', 'app']).default('web'),
      featured: z.boolean().default(false),
      order: z.number().default(99),
      // Optional so a project can ship before its hero image is curated.
      image: image().optional(),
      imageAlt: z.string().default(''),
      // App variant: ordered device screenshots.
      screenshots: z
        .array(z.object({ src: image(), alt: z.string() }))
        .default([]),
      // Flags any unresolved facts on this case study (brief.md Section 22).
      draft: z.boolean().default(false),
    }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroImageAlt: z.string().default(''),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, posts };
export { projectCategories };
