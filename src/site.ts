/*
  Central site configuration. Keep factual contact details here so they are
  defined once. Anything unconfirmed stays a [NEEDS INFO] placeholder per
  CLAUDE.md rule 1 — do not invent handles or URLs.
*/

export const SITE = {
  name: 'Calibrated Ideas',
  author: 'David Southworth',
  url: 'https://calibratedideas.com',
  email: 'hello@calibratedideas.com',
  // Default metadata (brief.md Section 16).
  title:
    'Calibrated Ideas | Digital projects, technical writing and creative tools by David Southworth',
  description:
    'Portfolio of David Southworth, bringing together web projects, mobile apps, AI-assisted tools, technical writing, photography, poetry and practical digital work.',
} as const;

export const NAV: { label: string; href: string }[] = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Photography', href: '/photography/' },
  { label: 'About', href: '/about/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/contact/' },
];

/*
  Social links. Confirm handles from the current-site scrape before publishing
  (brief.md Section 22). Entries with an empty `href` are not rendered.
*/
export const SOCIAL: { label: string; href: string }[] = [
  { label: 'Email', href: 'mailto:hello@calibratedideas.com' },
  // Confirmed from the current-site scrape (2026-06-08).
  { label: 'Bluesky', href: 'https://bsky.app/profile/davidsouthworth.bsky.social' },
  { label: 'Instagram', href: 'https://www.instagram.com/david_j_southworth/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/david-southworth/' },
];

/*
  Person structured data, shared by the home and About pages. `site` is the
  per-target Astro.site so the URL is correct for preview and production.
*/
export function personSchema(site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.author,
    url: site ? new URL(import.meta.env.BASE_URL, site).href : SITE.url,
    email: `mailto:${SITE.email}`,
    sameAs: SOCIAL.filter((s) => s.href.startsWith('https://')).map((s) => s.href),
  };
}
