# Calibrated Ideas

Portfolio site for David Southworth (D²), built with Astro (static output), TypeScript, Tailwind CSS v4 and MDX. See `CLAUDE.md` for working conventions and `brief.md` for the content brief.

## One codebase, two deployment targets

| Target | Host | Base path | Site URL |
| --- | --- | --- | --- |
| Preview | GitHub Pages | `/portfolio` | `https://dtwo-sys.github.io` |
| Production | Hostinger (FTP, static files) | `/` | `https://calibratedideas.com` |

`astro.config.mjs` reads two environment variables, defaulting to the preview target:

- `PUBLIC_BASE_PATH` — `/portfolio` (default) or `/`
- `PUBLIC_SITE_URL` — defaults to `https://dtwo-sys.github.io`; when `PUBLIC_BASE_PATH` is `/` the default switches to `https://calibratedideas.com`

Canonical URLs, Open Graph tags, the sitemap, robots.txt and the RSS feed all derive from these settings. No host or sub-path is hard-coded in `src/`; internal links use `import.meta.env.BASE_URL`.

## Build commands

Preview build (what CI does on every push to `main`; the workflow also passes `--site`/`--base` explicitly from `configure-pages`):

```sh
npm run build
```

Production build (root base, real domain), Windows PowerShell:

```powershell
$env:PUBLIC_BASE_PATH = '/'; $env:PUBLIC_SITE_URL = 'https://calibratedideas.com'; npm run build
```

or POSIX:

```sh
PUBLIC_BASE_PATH=/ PUBLIC_SITE_URL=https://calibratedideas.com npm run build
```

### Building from this Google Drive folder

Google Drive cannot host `node_modules`, so builds run on a local copy. The helper script syncs source to `%LOCALAPPDATA%\ci-build\calibratedideas`, builds there **with the production settings above applied automatically**, and can copy `dist/` back:

```powershell
pwsh ./scripts/sync-local.ps1 -Build   # sync + production build
pwsh ./scripts/sync-local.ps1 -Back    # copy built dist/ back to Drive, ready for FTP
```

Deploying to Hostinger means uploading the **contents** of `dist/` to the web root by FTP, including the `.htaccess` file (it carries the custom 404 rule).

## Other commands

- `npm run dev` — local dev server (serves under `/portfolio/` because of the preview default)
- `npm run preview` — preview the built site
- `npm run lint` — `astro check`
- `npm run format` — Prettier
