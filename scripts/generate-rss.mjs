import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseFrontmatter } from '../src/lib/frontmatter.js';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '../src/config/site.js';

const postsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/posts');
const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/rss.xml');

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toUTCString();
}

const posts = readdirSync(postsDir)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const raw = readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = parseFrontmatter(raw);
    return {
      slug: file.replace(/\.md$/, ''),
      title: data.title || file,
      date: data.date || '',
      excerpt: data.excerpt || '',
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const items = posts
  .map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}/`;
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
  })
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
${items}
  </channel>
</rss>
`;

writeFileSync(outFile, rss);
console.log(`Generated public/rss.xml (${posts.length} post${posts.length === 1 ? '' : 's'}).`);
