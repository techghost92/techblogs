# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal blog (React SPA, statically built) published to GitHub Pages. Posts are plain Markdown files committed to the repo — there is no CMS and no database. Content is rendered to HTML at *build time*, so the deployed site ships as static assets with no runtime fetches.

## Commands

```bash
npm install
npm run dev              # Vite dev server, http://localhost:5173/techblogs/
npm run build             # outputs to dist/
npm run preview           # serve the production build locally
npm run validate:posts    # lint every post's frontmatter, exit 1 on failure
```

There is no test suite and no lint script — `validate:posts` is the only automated check in this repo, and it also runs as a CI step (`.github/workflows/deploy.yml`) before every build, so a bad post fails CI rather than silently deploying.

Note the dev server is reachable at `/techblogs/`, not `/` — `vite.config.js` sets `base: '/techblogs/'` because the site is served from a GitHub Pages subpath, not a custom domain (there's no `public/CNAME` file).

## Publishing a post

Add a Markdown file to `src/content/posts/` — the filename becomes the URL slug (`four-hour-timezone-bug.md` → `/blog/four-hour-timezone-bug`). No route or component code needs to change; `src/lib/posts.js` picks it up automatically via `import.meta.glob`.

Required frontmatter:

```markdown
---
title: Your Post Title
date: 2026-08-10
excerpt: One or two sentences shown on the card.
tag: debugging
author: Onkar
---
```

- `title`, `date`, `tag`, `author` are all required and enforced by `npm run validate:posts`; `excerpt` is optional.
- `date` must be `YYYY-MM-DD`.
- `tag` must be one of the closed vocabulary in `src/lib/tags.js` (currently: ai, python, javascript, typescript, nodejs, reactjs, html, css, java, meta, debugging, tooling, fundamentals). Add the tag there first — a post using a tag not in that list fails validation.
- The frontmatter parser (`src/lib/frontmatter.js`) is deliberately minimal: one `key: value` per line, no nested YAML, no lists, quotes stripped. It's shared between the runtime (`posts.js`) and `scripts/validate-posts.mjs` on purpose, so the two can't drift apart — don't reimplement parsing in one place only.

Convention observed so far: each post is its own branch (`content/<slug>`) with its own PR merged into `master`, one post per PR.

## Architecture

**Content pipeline** (`src/lib/posts.js`): `import.meta.glob('../content/posts/*.md', { as: 'raw', eager: true })` pulls every post into the bundle at build time. Each file is parsed for frontmatter, rendered with `markdown-it` (`html: false`), and exposed via `getAllPosts()`, `getPostBySlug()`, `getPostsByTag()`, `getTagCounts()`. Because this all happens at build time, adding a post is purely a content change — never touch routing or components to publish something.

**Routing** (`src/App.jsx`): `/`, `/blog`, `/blog/tag/:tag`, `/blog/:slug`, all wrapped in `BaseLayout` (header + `<Outlet />` + footer). `PostPage.jsx` redirects unknown slugs to `/blog`.

**Rendering post HTML**: `PostPage.jsx` injects rendered Markdown via `dangerouslySetInnerHTML`. This is safe only because post content is Markdown this repo owns and `markdown-it` is configured with `html: false` — if posts ever come from an external/untrusted source, this needs sanitization before it's safe.

**GitHub Pages SPA routing**: GitHub Pages serves static files only, so a direct load of `/blog/some-post` would normally 404. `public/404.html` catches the miss, encodes the path into a query string, and redirects to `index.html`, which decodes it back before React Router mounts. This is the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) technique — both files implement opposite halves of the same handshake and must stay in sync if either is touched.

**Deployment** (`.github/workflows/deploy.yml`): on every push to `master` — `npm install` → `npm run validate:posts` → `npm run build` → upload `dist/` to GitHub Pages. Also runs (build only, no deploy) on PRs against `master`.

**Site identity** (`src/config/site.js`): `SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION` — the single source of truth for the app's `document.title` calls, `index.html`'s default meta tags, and both build scripts below. Update it here (e.g. when a custom domain is added; there's currently no `public/CNAME`, so the site is served at `onkar3003.github.io/techblogs`), not in multiple files.

**RSS and per-post OG tags**: `npm run build` runs two extra steps via npm's `pre`/`post` script hooks (`package.json`), invisible unless you look:

- `prebuild` → `scripts/generate-rss.mjs` reads post frontmatter and writes `public/rss.xml`, which `vite build` then copies into `dist/` like any other public asset.
- `postbuild` → `scripts/generate-static-pages.mjs` takes the just-built `dist/index.html` (already has resolved, hashed asset paths) as a template and stamps out `dist/blog/<slug>/index.html` per post with that post's title/description/OG/Twitter tags baked in. This exists because the site is a client-only SPA with no server — crawlers that don't execute JS (Slack/Twitter/etc. link unfurlers) would otherwise only ever see the generic homepage tags. Once React mounts, behavior is unchanged from before; this only affects what a crawler or fresh page-load sees pre-JS.

Both scripts reuse `parseFrontmatter` from `src/lib/frontmatter.js`, the same parser `posts.js` and `validate-posts.mjs` use — keep it that way rather than reimplementing frontmatter parsing a fourth time.

**Styling**: no CSS framework — a single hand-written stylesheet (`src/styles/global.css`) driven by custom properties defined at the top of the file. Warm off-white background (`#FBF9F4`), indigo accent (`#4F46E5`) — a light theme chosen for long-form reading comfort over the site's original dark navy. Change values there once and the whole site follows.

**Logo**: a solid squircle badge with a white terminal-prompt glyph (chevron + cursor block) — a filled shape stays legible down to favicon size, where a thin outline mark doesn't. Drawn inline in JSX (`src/components/LogoMark.jsx`); its `color` prop sets the badge fill (full accent in the header/hero, dimmed in the footer). Two copies live outside the app and do **not** update automatically when `LogoMark.jsx` changes: `public/logo.svg` (standalone badge) and `public/favicon.png` (180×180 raster with transparent corners) — regenerate both by hand if the mark changes again.

## Known gaps

- The subscribe form (`src/pages/Home.jsx`) is visual only — its `onSubmit` just calls `preventDefault()`; no emails are collected anywhere. Wiring it up means picking a provider (Buttondown, ConvertKit, Mailchimp, etc.).
