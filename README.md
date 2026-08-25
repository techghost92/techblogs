# Notes from the terminal

A personal blog about code, built as a React single-page app and published as
static files to GitHub Pages at
[onkar3003.github.io/techblogs](https://onkar3003.github.io/techblogs).

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
serve that build locally. `build` automatically runs two extra steps via npm's
`pre`/`post` script hooks:

- **prebuild** — [scripts/generate-rss.mjs](scripts/generate-rss.mjs) reads
  every post's frontmatter and writes `public/rss.xml`, which `vite build`
  then copies into `dist/` like any other public asset.
- **postbuild** — [scripts/generate-static-pages.mjs](scripts/generate-static-pages.mjs)
  takes the just-built `dist/index.html` (which has the real, hashed asset
  paths) as a template and stamps out `dist/blog/<slug>/index.html` per post,
  with that post's title, description, and Open Graph/Twitter tags baked in.
  This site is a client-only SPA with no server, so without this step,
  crawlers that don't run JS (link unfurlers in Slack/Twitter/etc.) would
  only ever see the generic homepage tags. Once React mounts, the app behaves
  exactly as it did before — this only changes what a crawler or a fresh
  page-load sees before JS runs.

Both scripts, along with `index.html`'s own default meta tags, read site name,
URL, and description from [src/config/site.js](src/config/site.js) — update
values there (e.g. when a custom domain is added) rather than in multiple
places.

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
to `master`: `npm install`, `npm run validate:posts`, `npm run build`, then
upload `dist/` to GitHub Pages. There's no custom domain set up (no
`public/CNAME` file), so the site is served at its default GitHub Pages URL —
see [src/config/site.js](src/config/site.js) for the canonical URL used by RSS
and OG tags.

GitHub Pages serves static files only, so a direct load of `/blog/some-post`
would 404. [public/404.html](public/404.html) catches the miss, encodes the
requested path into a query string, and redirects to `index.html`, which decodes
it back before React Router mounts — so the address bar stays clean. This is the
[spa-github-pages](https://github.com/rafgraph/spa-github-pages) technique;
both halves must stay in sync if you touch either file.

## Branding

Warm off-white background `#FBF9F4`, indigo accent `#4F46E5`. Both live as
custom properties at the top of
[global.css](src/styles/global.css#L3-L16), along with the rest of the
palette — change them there and the whole site follows.

The logo is a solid squircle badge with a white terminal-prompt glyph
(chevron + cursor block) — a filled shape reads clearly down to favicon
size, where a thin outline mark loses definition. It's drawn inline by
[LogoMark.jsx](src/components/LogoMark.jsx) (`color` prop sets the badge
fill; full accent in the header and hero, dimmed in the footer). Edit that
one component and every in-app use updates. Two copies exist outside the
app and do **not** update automatically when `LogoMark.jsx` changes:
[public/logo.svg](public/logo.svg) (standalone badge) and
[public/favicon.png](public/favicon.png) (180×180 raster, transparent
corners) — regenerate both by hand if the mark changes again.

## Known gaps

- **The subscribe form is visual only.** The `onSubmit` in
  [Home.jsx](src/pages/Home.jsx#L64) just calls `preventDefault()` — no emails
  are collected anywhere. Point the form at a provider (Buttondown, ConvertKit,
  Mailchimp) to make it real.
