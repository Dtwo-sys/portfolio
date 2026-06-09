# Open items — unresolved facts

Every `[NEEDS INFO: …]` and `[TBD]` in the codebase is tracked here. Nothing in this list should be treated as final, and none of it may be guessed (CLAUDE.md rule 1). Grouped by `brief.md` Section 22.

## Current site (brief §3 / §10) — scraped 2026-06-08
- [x] **Current platform/CMS** — resolved: **Zyro** site builder (assets from `assets.zyrosite.com`; Zyro is now part of Hostinger). Pages are server-rendered, so the plain-fetch scraper is sufficient; no Playwright needed.
- [x] **Photography** — resolved: standalone gallery page at `/photography/` (created). 7 source photos from scrape temporarily using Zyro CDN URLs; copy curated versions to `public/images/photography/` and replace CDN `src` with local paths + Astro `<Image>` when ready. Alt text for most images `[NEEDS INFO: add meaningful alt text per image]`.
- [x] **Blog URL** — `/blog` was empty at archive time (no posts). Nothing to migrate. Writing starts fresh in the new `/notes/` section.
- [x] **Liminal Light confirmed facts** — written for 60th birthday; Amazon link `https://amzn.to/46663tp`; Tim Nash (Nomad Podcast) review quote captured and added to MDX. Amazon link available to add to frontmatter when wanted.
- [x] **Thermal Developments International URL** — `https://www.t-d-i.co.uk/` confirmed.
- Note: also found personal site `https://davidsouthworth.net` (counselling); current copyright reads "© 2025".

## Social handles (brief §6) — scraped 2026-06-08
- [x] **Bluesky** — `https://bsky.app/profile/davidsouthworth.bsky.social` (wired into src/site.ts).
- [x] **Instagram** — `https://www.instagram.com/david_j_southworth/` (wired into src/site.ts).
- [x] **LinkedIn** — `https://www.linkedin.com/in/david-southworth/` (wired into src/site.ts).

## FeelingVault (brief §11a / §22)
- [x] **Show 5.0 star rating?** — Yes, approved. Added to MDX (2026-06-08).
- [x] **Launch year** — 2026 confirmed. Updated in MDX.
- [ ] **Built with** — Expo (React Native) listed as "still to confirm". Left `[TBD]` in MDX.
- [ ] **Assets** — device-framed screenshots + icon to drop into `public/images/projects/feelingvault/`. (You drop them; I wire them up.)

## Between the Waves (brief §11b)
- [ ] **Built with** — "hand-built HTML, CSS, JS, no framework" listed as still to confirm. Left `[TBD]`.
- [ ] **Assets** — Northumberland coast photography for `public/images/projects/between-the-waves/`.

## Per-project tech stacks (brief §6 / §20 / §22)
- [x] **UncertaintyCalc** — year 2025 (hackathon), role: designer and developer. Stack still `[TBD]`.
- [x] **Calibration.info** — year 2025. Stack still `[TBD]`.
- [x] **QSY.to** — year ~1998, role: creator. Stack still `[TBD]`.
- [x] **VintageRadio.info** — year 1998, role: creator. Stack still `[TBD]`.
- [x] **Liminal Light** — year 2024, Amazon link confirmed. Stack/platform still `[TBD]`.
- [x] **TDI** — year 2025, role: web developer and LinkedIn campaign lead. Testimonial published. Stack still `[TBD]`.

## Years / roles
- [x] Most years and roles now confirmed (2026-06-08). Remaining `[TBD]` fields are tech stacks only.

## Design / brand
- [x] Palette — resolved: evolved away from navy/gold to warm monochrome + "tide" teal accent (brief §7 gave permission to propose).

## Build / environment
- [x] **node_modules on Google Drive** — resolved. DriveFS file-locking corrupts installs and blocks junctions, so the Drive folder is the canonical source and all npm/build work runs on a local copy at `%LOCALAPPDATA%\ci-build\calibratedideas` via `scripts/sync-local.ps1` (`-Install`, `-Build`, `-Back`). See CLAUDE.md is not updated for this; see the project memory note.
