# CLAUDE.md — Calibrated Ideas

This file governs **how** to build calibratedideas.com. The source of truth for **what** to build is [`brief.md`](./brief.md). Read the brief before doing substantial work. The voice for any prose written *as David* is defined in [`voice.md`](./voice.md).

## The two rules (non-negotiable)

1. **No invented specifications.** Never fabricate dates, version numbers, technologies, metrics, testimonials, App Store URLs, prices, or any factual claim. Where a fact is missing, leave the literal placeholder `[NEEDS INFO: …]` or `[TBD]` in the output and add it to the open-items list. Never guess. Confirmed facts (see `brief.md` Sections 2 and 11) may be used as written.
2. **UK English everywhere** — in code comments, copy, and metadata: optimise, colour, programme, behaviour, organise, licence (noun), etc.

## Project conventions

- **Stack (locked, do not substitute):** Astro static output (`output: 'static'`), TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`), MDX (`@astrojs/mdx`), npm, Node 24.14.1.
- **Package manager:** npm. Commit `package-lock.json`.
- **No analytics, no tracking, no client-side form processing.** Contact is an email link to hello@calibratedideas.com only.
- **No serverless functions.** Everything renders to static files.

## Commands

- `npm run dev` — local dev server
- `npm run build` — static build to `dist/`
- `npm run preview` — preview the built site
- `npm run lint` — `astro check` (type + content checks)
- `npm run format` — Prettier
- `npm run scrape` — run the current-site scraper (`scripts/scrape-current-site.ts`)

## Image-handling convention

- Raw scraped assets → `imported/current-site/images/` (working archive, **never shipped**, git-ignored).
- Curated, optimised assets used by the live site → `public/images/projects/<slug>/`.
- Prefer Astro's `<Image />` / `<Picture />` for anything in `src/`. Do **not** serve images out of `imported/`.

## Content model

- Projects and posts live in `src/content/` as MDX, validated by the schema in `src/content.config.ts`.
- The project `links` object supports `live`, `appStore`, and `playStore` so one schema covers web and mobile (`brief.md` Section 9). Leave unused link fields empty.
- App case studies (FeelingVault) use the **app variant** layout (device screenshots + store badge); web projects use the standard variant.

## Copy and voice

- Portfolio-led, not service-led. Understated, warm, technically credible, UK English.
- **No em dashes** anywhere in prose written as David — they are a hard AI fingerprint (`voice.md`). Use commas, semicolons, or restructure. (Em dashes are acceptable only in this kind of internal documentation, not in site copy.)
- No corporate speak, no "we don't just / it's not just", no LinkedIn hook formulas, no hollow CTA endings.
- Do not headline the FeelingVault star rating (only three ratings); describe the app plainly. See `brief.md` Section 22.

## Commit message style

- Imperative mood, concise subject (≤ ~72 chars): e.g. `Add projects index with category filtering`.
- One logical change per commit. Reference the brief section when useful: `(brief §11a)`.
- Do not commit `dist/`, `node_modules/`, or the scraped image archive.
- **Ask before publishing testimonials** (e.g. the TDI / Christine Horrocks-MacBeth testimonial) — confirm permission and accuracy first (`brief.md` Sections 6, 22).

## Accessibility and performance targets

- Semantic HTML, correct heading order, descriptive alt text, visible focus states, keyboard-navigable nav.
- Lighthouse: performance > 90, accessibility > 95. Avoid unnecessary client JavaScript; optimise images; check contrast against WCAG AA.

## Open items

Track unresolved `[NEEDS INFO]` / `[TBD]` placeholders in [`OPEN-ITEMS.md`](./OPEN-ITEMS.md). Resolve everything in `brief.md` Section 22 before the relevant work is treated as final.
