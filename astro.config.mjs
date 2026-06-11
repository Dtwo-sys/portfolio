// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Astro static output — produces plain HTML/CSS/JS for Hostinger shared hosting.
// See brief.md Section 2 and Section 8.
//
// One codebase, two targets:
//   - GitHub Pages preview:  base '/portfolio', site https://dtwo-sys.github.io
//     (CI passes --site/--base from configure-pages; the env-var defaults below
//     match it, so a plain `npm run build` also produces a preview build).
//   - Hostinger production:  PUBLIC_BASE_PATH='/' PUBLIC_SITE_URL='https://calibratedideas.com'
//     (scripts/sync-local.ps1 -Build sets these automatically).
// Canonicals, OG URLs, sitemap and RSS all derive from `site`, so neither
// host nor sub-path is hard-coded anywhere in src/.
const base = process.env.PUBLIC_BASE_PATH ?? '/portfolio';
const site =
  process.env.PUBLIC_SITE_URL ??
  (base === '/' ? 'https://calibratedideas.com' : 'https://dtwo-sys.github.io');

export default defineConfig({
  site,
  base,
  // The site links with trailing slashes throughout; make that the one
  // canonical form (Apache's mod_dir 301s the non-slash variant to match).
  trailingSlash: 'always',
  output: 'static',
  integrations: [mdx(), sitemap()],
  vite: {
    // Cast: @tailwindcss/vite ships its own Vite types which differ from the
    // Vite bundled with Astro. Type-only mismatch; the build is unaffected.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  image: {
    // Keep image processing local and predictable for the static build.
    responsiveStyles: true,
  },
});
