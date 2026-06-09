// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Astro static output — produces plain HTML/CSS/JS for Hostinger shared hosting.
// See brief.md Section 2 and Section 8.
export default defineConfig({
  site: 'https://calibratedideas.com',
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
