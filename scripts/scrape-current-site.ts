/*
  scrape-current-site.ts — archive the current calibratedideas.com before the
  rebuild (brief.md Section 10).

  What it does:
    - fetches the listed pages with a plain HTTP request,
    - extracts title, headings, paragraphs, lists, links, image URLs + alt text,
    - writes each page as Markdown to imported/current-site/<page>.md,
    - downloads images into imported/current-site/images/ (original filenames),
    - writes assets.json and manifest.json.

  It is polite: a short delay between requests and a descriptive user-agent.

  IMPORTANT (brief §3 / §22): if the current site renders its content with
  JavaScript, a plain fetch will return an almost-empty shell. The script
  detects this case and prints a clear warning recommending a Playwright pass.
  It does NOT invent content. Unknown facts stay unknown.

  Run with: npm run scrape
*/

import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { join, extname, basename } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

const PAGES = [
  { name: 'home', url: 'https://calibratedideas.com/' },
  { name: 'about', url: 'https://calibratedideas.com/about' },
  { name: 'legal', url: 'https://calibratedideas.com/legal' },
  // Extended pass — photography and blog (brief §22, confirmed from scrape).
  { name: 'personal', url: 'https://calibratedideas.com/personal' },
  { name: 'blog', url: 'https://calibratedideas.com/blog' },
];

const OUT_DIR = join(process.cwd(), 'imported', 'current-site');
const IMG_DIR = join(OUT_DIR, 'images');
const UA =
  'CalibratedIdeasArchiver/1.0 (own-site migration; contact hello@calibratedideas.com)';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PageRecord {
  name: string;
  url: string;
  title: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  lists: string[][];
  links: { text: string; href: string }[];
  images: { src: string; alt: string }[];
  jsRendered: boolean;
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

function absolute(href: string, base: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function extract(html: string, page: { name: string; url: string }): PageRecord {
  const root = parse(html);
  // Drop noise that pollutes the archive.
  root.querySelectorAll('script, style, noscript, svg').forEach((el) => el.remove());

  const title = clean(root.querySelector('title')?.text ?? '');

  const headings = root
    .querySelectorAll('h1, h2, h3, h4')
    .map((h) => ({ level: Number(h.tagName.substring(1)), text: clean(h.text) }))
    .filter((h) => h.text);

  const paragraphs = root
    .querySelectorAll('p')
    .map((p) => clean(p.text))
    .filter((t) => t.length > 0);

  const lists = root
    .querySelectorAll('ul, ol')
    .map((list) =>
      list
        .querySelectorAll('li')
        .map((li) => clean(li.text))
        .filter(Boolean)
    )
    .filter((items) => items.length > 0);

  const links = root
    .querySelectorAll('a')
    .map((a) => ({ text: clean(a.text), href: absolute(a.getAttribute('href') ?? '', page.url) }))
    .filter((l) => l.href && l.href.startsWith('http'));

  const images = root
    .querySelectorAll('img')
    .map((img: HTMLElement) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      return { src: absolute(src, page.url), alt: clean(img.getAttribute('alt') ?? '') };
    })
    .filter((i) => i.src && i.src.startsWith('http'));

  // Heuristic: a JS-rendered SPA returns an almost-empty body shell.
  const bodyText = clean(root.querySelector('body')?.text ?? '');
  const jsRendered = bodyText.length < 200 && paragraphs.length < 2;

  return { ...page, title, headings, paragraphs, lists, links, images, jsRendered };
}

function toMarkdown(rec: PageRecord): string {
  const lines: string[] = [];
  lines.push(`# ${rec.title || rec.name}`);
  lines.push('');
  lines.push(`> Source: ${rec.url}`);
  lines.push(`> Archived: ${new Date().toISOString()}`);
  if (rec.jsRendered) {
    lines.push('>');
    lines.push('> WARNING: this page looks JavaScript-rendered; content may be incomplete.');
    lines.push('> Re-scrape with a headless browser (Playwright) to capture it fully.');
  }
  lines.push('');

  for (const h of rec.headings) {
    lines.push(`${'#'.repeat(Math.min(h.level + 1, 6))} ${h.text}`);
    lines.push('');
  }
  if (rec.paragraphs.length) {
    lines.push('## Paragraphs');
    lines.push('');
    rec.paragraphs.forEach((p) => {
      lines.push(p);
      lines.push('');
    });
  }
  if (rec.lists.length) {
    lines.push('## Lists');
    lines.push('');
    rec.lists.forEach((items) => {
      items.forEach((i) => lines.push(`- ${i}`));
      lines.push('');
    });
  }
  if (rec.links.length) {
    lines.push('## Links');
    lines.push('');
    rec.links.forEach((l) => lines.push(`- [${l.text || l.href}](${l.href})`));
    lines.push('');
  }
  if (rec.images.length) {
    lines.push('## Images');
    lines.push('');
    rec.images.forEach((i) => lines.push(`- ![${i.alt}](${i.src})`));
    lines.push('');
  }
  return lines.join('\n');
}

async function downloadImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (!res.ok || !res.body) return null;
    let name = basename(new URL(url).pathname);
    if (!name || !extname(name)) name = `image-${Date.now()}${extname(name) || '.bin'}`;
    const dest = join(IMG_DIR, name);
    await pipeline(Readable.fromWeb(res.body as any), createWriteStream(dest));
    return name;
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  console.log('Archiving current site -> imported/current-site/\n');

  const records: PageRecord[] = [];
  const allImages = new Map<string, string>(); // url -> local filename (or '')

  for (const page of PAGES) {
    process.stdout.write(`Fetching ${page.url} ... `);
    try {
      const res = await fetch(page.url, { headers: { 'user-agent': UA } });
      if (!res.ok) {
        console.log(`HTTP ${res.status} — skipped`);
        continue;
      }
      const html = await res.text();
      const rec = extract(html, page);
      records.push(rec);
      await writeFile(join(OUT_DIR, `${page.name}.md`), toMarkdown(rec), 'utf8');
      console.log(
        `ok (${rec.paragraphs.length} paragraphs, ${rec.images.length} images)` +
          (rec.jsRendered ? '  [!] looks JS-rendered' : '')
      );
      for (const img of rec.images) if (!allImages.has(img.src)) allImages.set(img.src, '');
    } catch (err) {
      console.log(`failed: ${(err as Error).message}`);
    }
    await sleep(1500); // be polite
  }

  // Download images.
  console.log(`\nDownloading ${allImages.size} image(s) ...`);
  for (const url of allImages.keys()) {
    const name = await downloadImage(url);
    allImages.set(url, name ?? '');
    process.stdout.write(name ? '.' : 'x');
    await sleep(400);
  }
  console.log('');

  // assets.json
  const assets = {
    images: [...allImages.entries()].map(([src, file]) => ({
      src,
      file: file || null,
      downloaded: Boolean(file),
    })),
  };
  await writeFile(join(OUT_DIR, 'assets.json'), JSON.stringify(assets, null, 2), 'utf8');

  // manifest.json (brief §10 shape)
  const manifest = {
    sourceUrl: 'https://calibratedideas.com/',
    scrapedAt: new Date().toISOString(),
    pages: records.map((r) => ({
      name: r.name,
      url: r.url,
      title: r.title,
      jsRendered: r.jsRendered,
      counts: {
        headings: r.headings.length,
        paragraphs: r.paragraphs.length,
        lists: r.lists.length,
        links: r.links.length,
        images: r.images.length,
      },
    })),
    images: assets.images,
    links: records.flatMap((r) => r.links.map((l) => ({ page: r.name, ...l }))),
  };
  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const anyJs = records.some((r) => r.jsRendered);
  console.log('\nDone. Archive in imported/current-site/');
  if (anyJs) {
    console.log(
      '\n[!] One or more pages look JavaScript-rendered. The plain-fetch archive may be\n' +
        '    incomplete. Add Playwright and re-run for those pages (brief §3 / §22).'
    );
  }
  console.log(
    '\nReminder: treat scraped text as source material, not final copy, and confirm\n' +
      'the Photography / Blog / TDI URLs and social handles found here (brief §22).'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
