// Post-build step: GitHub Pages serves static files only, and this is a
// client-only SPA with no server, so social/link-preview crawlers never run
// the JS that would set per-post <title>/description via document.title.
// This script takes the already-built dist/index.html (which has the
// resolved asset paths) as a template and stamps out a real
// dist/blog/<slug>/index.html per post with that post's title, description,
// and Open Graph/Twitter tags baked in. Once React mounts, the app behaves
// exactly as before — this only changes what a crawler or fresh page-load
// sees before JS runs.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseFrontmatter } from '../src/lib/frontmatter.js';
import { SITE_NAME, SITE_URL } from '../src/config/site.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(root, '../src/content/posts');
const distDir = path.join(root, '../dist');
const template = readFileSync(path.join(distDir, 'index.html'), 'utf8');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceMeta(html, matchAttr, matchValue, newContent) {
  const re = new RegExp(`(<meta ${matchAttr}="${matchValue}" content=")[^"]*("\\s*/?>)`);
  return html.replace(re, `$1${newContent}$2`);
}

function renderPostHtml(post) {
  const title = `${post.title} — ${SITE_NAME}`;
  const description = escapeHtml(post.excerpt || '');
  const url = `${SITE_URL}/blog/${post.slug}/`;

  let html = template;
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:type', 'article');
  html = replaceMeta(html, 'property', 'og:title', escapeHtml(title));
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'property', 'og:url', url);
  html = replaceMeta(html, 'name', 'twitter:title', escapeHtml(title));
  html = replaceMeta(html, 'name', 'twitter:description', description);
  html = html.replace(
    '</head>',
    `<meta property="article:published_time" content="${post.date}" /></head>`
  );
  return html;
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
  });

for (const post of posts) {
  const dir = path.join(distDir, 'blog', post.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), renderPostHtml(post));
}

console.log(`Generated ${posts.length} static post page${posts.length === 1 ? '' : 's'} with per-post OG tags.`);
