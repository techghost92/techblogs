import MarkdownIt from 'markdown-it';
import { parseFrontmatter } from './frontmatter.js';

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

// Loads every .md file in content/posts as a raw string at build time.
// To publish a new post: add a .md file here with the frontmatter block
// below, commit, push. No route or component code needs to change.
// Required frontmatter (title, date, tag, author) is enforced by
// scripts/validate-posts.mjs, not here — this just renders what's there.
const files = import.meta.glob('../content/posts/*.md', { as: 'raw', eager: true });

function estimateReadingTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// A short, stable hash of the slug, purely decorative — nods to a commit
// hash without needing real git metadata in the browser.
function shortHash(input) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).slice(0, 7);
}

const posts = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.split('/').pop().replace(/\.md$/, '');
    const { data, content } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      excerpt: data.excerpt || '',
      tag: data.tag || '',
      author: data.author || '',
      html: md.render(content),
      readingTime: estimateReadingTime(content),
      hash: shortHash(slug),
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export function getAllPosts() {
  return posts;
}

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}
