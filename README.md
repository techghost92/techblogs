# coderscript-dev (final version — Concept B palette)

Same structure as the design you built in Claude Design — hero, about
quote, latest posts, subscribe box, footer — but reskinned with the
navy/periwinkle "Concept B" palette instead of the mint green, per your
call. Markdown-based publishing carries over unchanged.

Palette: `#141824` navy background, `#6E7BFF` periwinkle accent. Logo mark
is the chevron + cursor block from Concept B, not the mint circuit-bracket.

## Before you push this live, edit two things:

1. **Footer social links** — `src/components/Footer.jsx` has placeholder
   URLs (`instagram.com/coderscript.dev`, `github.com/onkar3003`,
   `hello@coderscript.dev`). Swap in your real ones.

2. **The subscribe form is visual only** — it doesn't collect emails yet,
   same as it was in the Claude Design mockup (`onsubmit` just prevents
   the page reload). To make it real, you'd wire the `<form>` in
   `src/pages/Home.jsx` up to a provider like Buttondown, ConvertKit, or
   Mailchimp — happy to do that when you're ready.

## Run it locally

```bash
npm install
npm run dev
```

## Publish a new post

Same as before — add a Markdown file, nothing else to touch:

```markdown
---
title: Your Post Title
date: 2026-08-10
excerpt: One or two sentences shown in the card.
tag: debugging
---

Your post content here, in normal Markdown.
```

Save it as `src/content/posts/your-slug.md`, commit, push. It appears in
"Latest posts" on the home page (top 3) and in the full archive at `/blog`.
The `tag` field is optional — if you skip it, the card shows reading time
instead.

## Logo files

`public/logo.svg` is the badge version (dark circle + mark). The mark also
renders live via `src/components/LogoMark.jsx`, used in the header (mint)
and footer (dimmed) — so if you ever want to adjust the icon itself, that's
the one file to edit; header and footer both pick up the change.

## Swapping this into your existing repo

Same process as every version so far:

1. In your local `coderscript-dev` folder, delete everything except `.git`.
2. Copy everything from this download in.
3. Edit the two things listed above first.
4. Commit and push:
   ```bash
   git add .
   git commit -m "Apply real brand design"
   git push
   ```
5. Same GitHub Actions workflow, same `coderscript.dev` domain, same DNS —
   nothing else changes.
