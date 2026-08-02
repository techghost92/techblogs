# coderscript.dev

A personal blog about code, built as a React single-page app and published as
static files to GitHub Pages at [coderscript.dev](https://coderscript.dev).

Posts are plain Markdown files in the repo. Adding one is a commit — there's no
CMS, no database, and no build step to run by hand.

## Stack

| Piece | What it does |
| --- | --- |
| [Vite 5](https://vitejs.dev) | Dev server and production bundler |
| React 18 | UI |
| react-router-dom 6 | Client-side routing (`/`, `/blog`, `/blog/:slug`) |
| markdown-it | Renders post Markdown to HTML at build time |
| GitHub Actions + Pages | Builds and deploys on every push to `master` |

No CSS framework — styling is a single hand-written stylesheet,
[global.css](src/styles/global.css), driven by custom properties.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts: `npm run build` (outputs to `dist/`) and `npm run preview` to
serve that build locally.

## Publish a post

Add a Markdown file to [src/content/posts/](src/content/posts/) — the filename
becomes the URL slug, so `four-hour-timezone-bug.md` is served at
`/blog/four-hour-timezone-bug`.

```markdown
---
title: Your Post Title
date: 2026-08-10
excerpt: One or two sentences shown on the card.
tag: debugging
author: Onkar
---

Your post content here, in normal Markdown.
```

Before committing, run:

```bash
npm run validate:posts
```

This checks every post in [src/content/posts](src/content/posts) and fails
(exit 1) if any is missing `title`, `date`, `tag`, or `author`, has a
malformed date, or uses a `tag` outside the allowed list in
[src/lib/tags.js](src/lib/tags.js). It also runs automatically as a step in
[deploy.yml](.github/workflows/deploy.yml), so a bad post fails CI rather than
silently deploying.

Commit and push. The post appears in "Latest posts" on the home page (newest
three) and in the full archive at `/blog`, sorted newest first.

Frontmatter notes:

- All four fields — `title`, `date`, `tag`, `author` — are required and
  enforced by `npm run validate:posts`. `excerpt` is optional; missing `title`
  falls back to the slug.
- `date` must be `YYYY-MM-DD`.
- `tag` must be one of the values in [src/lib/tags.js](src/lib/tags.js)
  (currently: ai, python, javascript, typescript, nodejs, reactjs, html, css,
  java, meta, debugging, tooling). This is a closed vocabulary on purpose —
  it's the list a future tag-filtered `/blog` view would filter by. Add a new
  tag to that file (not just to a post) before using it.
- The parser in [frontmatter.js](src/lib/frontmatter.js) is deliberately
  small: one `key: value` per line, no nested YAML, no lists. Quotes around a
  value are stripped. Shared between the runtime ([posts.js](src/lib/posts.js))
  and [scripts/validate-posts.mjs](scripts/validate-posts.mjs) so they can't
  drift apart.

## How it's wired

[src/lib/posts.js](src/lib/posts.js) is the core of the content pipeline. It
uses Vite's `import.meta.glob(..., { eager: true })` to pull every `.md` file
into the bundle at build time, parses the frontmatter, renders the body with
markdown-it, and exports `getAllPosts()` / `getPostBySlug()`. Because this runs
at build time, the deployed site ships as static assets with no runtime fetches.

```
src/
├── main.jsx              # React root + BrowserRouter
├── App.jsx               # routes
├── layouts/BaseLayout    # header + <Outlet /> + footer
├── pages/
│   ├── Home.jsx          # hero, about quote, latest 3 posts, subscribe box
│   ├── BlogIndex.jsx     # full archive
│   └── PostPage.jsx      # single post; unknown slug redirects to /blog
├── components/           # Header, Footer, PostCard, LogoMark
├── content/posts/*.md    # the blog itself
└── styles/global.css     # all styling, one file
```

Post HTML is injected with `dangerouslySetInnerHTML` in
[PostPage.jsx](src/pages/PostPage.jsx#L32). That's safe here because the content
is Markdown this repo owns, and markdown-it is configured with `html: false`.
If posts ever come from an outside source, sanitize before rendering.

## Deployment

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs on every push
to `master`: `npm install`, `npm run build`, then upload `dist/` to GitHub
Pages. The custom domain comes from [public/CNAME](public/CNAME).

GitHub Pages serves static files only, so a direct load of `/blog/some-post`
would 404. [public/404.html](public/404.html) catches the miss, encodes the
requested path into a query string, and redirects to `index.html`, which decodes
it back before React Router mounts — so the address bar stays clean. This is the
[spa-github-pages](https://github.com/rafgraph/spa-github-pages) technique;
both halves must stay in sync if you touch either file.

## Branding

Navy background `#141824`, periwinkle accent `#6E7BFF`. Both live as custom
properties at the top of [global.css](src/styles/global.css#L4-L14), along with
the rest of the palette — change them there and the whole site follows.

The chevron-plus-cursor mark is drawn inline by
[LogoMark.jsx](src/components/LogoMark.jsx), used at full accent color in the
header and dimmed in the footer. Edit that one component and both update.
[public/logo.svg](public/logo.svg) is the standalone badge version (dark circle
+ mark) for use outside the app; it does not update automatically.

## Known gaps

- **The subscribe form is visual only.** The `onSubmit` in
  [Home.jsx](src/pages/Home.jsx#L64) just calls `preventDefault()` — no emails
  are collected anywhere. Point the form at a provider (Buttondown, ConvertKit,
  Mailchimp) to make it real.
- No RSS feed, no per-post `<meta>` / Open Graph tags (page titles are set via
  `document.title` only), no tag filtering or pagination on the archive.
