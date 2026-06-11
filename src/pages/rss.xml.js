import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../site';

/*
  Blog feed at /rss.xml, following the official Astro RSS recipe. Item links
  are base-relative; rss() resolves them against `site`, so the feed is
  correct for both the GitHub Pages preview and the production domain.
*/
export async function GET(context) {
  const posts = (await getCollection('posts'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return rss({
    title: `Blog | ${SITE.name}`,
    description:
      'Occasional writing on technology, astronomy, temperature metrology, creativity and photography.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `${base}/blog/${post.id}/`,
    })),
  });
}
