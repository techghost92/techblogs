import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseFrontmatter } from '../src/lib/frontmatter.js';
import { ALLOWED_TAGS } from '../src/lib/tags.js';

const REQUIRED_FIELDS = ['title', 'date', 'tag', 'author'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const postsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/posts');
const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'));

let errors = [];

for (const file of files) {
  const raw = readFileSync(path.join(postsDir, file), 'utf8');
  const { data } = parseFrontmatter(raw);

  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) errors.push(`${file}: missing "${field}"`);
  }

  if (data.date && !DATE_RE.test(data.date)) {
    errors.push(`${file}: "date" must be YYYY-MM-DD, got "${data.date}"`);
  }

  if (data.tag && !ALLOWED_TAGS.includes(data.tag)) {
    errors.push(`${file}: tag "${data.tag}" is not in the allowed list (${ALLOWED_TAGS.join(', ')})`);
  }
}

if (errors.length > 0) {
  console.error(`Post validation failed (${errors.length} problem${errors.length === 1 ? '' : 's'}):\n`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`Post validation passed (${files.length} post${files.length === 1 ? '' : 's'} checked).`);
