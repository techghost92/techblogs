# your-blog

A tech blog built with [Astro](https://astro.build), styled like a code editor
(file-tree sidebar, tab bar, line-numbered posts).

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:4321

## Add a new post

1. Copy `src/pages/blog/hello-world.astro` to `src/pages/blog/your-slug.astro`.
2. Edit the `lines` array and the `title`/`tabLabel` props.
3. Add an entry to the `posts` array in `src/pages/blog/index.astro`.
4. Add an entry to the `posts` array in `src/components/Sidebar.astro`.

## Deploy — straight to GitHub Pages (no Vercel/Netlify needed)

This repo already includes `.github/workflows/deploy.yml`, which builds the
site and publishes it automatically on every push to `main`.

1. Create a new **public** repo on GitHub (e.g. `coderscript-dev`).
2. From inside this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/coderscript-dev.git
   git push -u origin main
   ```
3. On GitHub: repo → **Settings → Pages** → under "Build and deployment",
   set **Source** to **GitHub Actions**. That's it — the workflow will run
   automatically on this first push (check the **Actions** tab for progress).
4. Once the workflow finishes, your site is live at
   `https://YOUR_USERNAME.github.io/coderscript-dev/` — confirm that works
   before moving to your custom domain.

## Point your GoDaddy domain (coderscript.dev) at GitHub Pages

The `public/CNAME` file already tells GitHub Pages to serve your custom
domain — no need to also set it in the GitHub UI, though you can as a backup
(Settings → Pages → Custom domain).

In your GoDaddy account: **My Products → your domain → DNS → Manage DNS**,
then add these records:

| Type  | Name | Value                  | Purpose                      |
|-------|------|-------------------------|-------------------------------|
| A     | @    | `185.199.108.153`       | root domain (`coderscript.dev`) |
| A     | @    | `185.199.109.153`       | root domain (redundant)       |
| A     | @    | `185.199.110.153`       | root domain (redundant)       |
| A     | @    | `185.199.111.153`       | root domain (redundant)       |
| CNAME | www  | `YOUR_USERNAME.github.io` | `www.coderscript.dev`       |

These four `A` record IPs are GitHub Pages' standard, fixed addresses.

Steps in GoDaddy:
1. Delete any existing `A` record on `@` (GoDaddy's default parked-page record).
2. Add all four `A` records above (same name `@`, four different IPs) and the `CNAME`.
3. Save. DNS changes usually propagate in 10–60 minutes, sometimes up to 24–48 hours.
4. Back on GitHub → Settings → Pages, wait for "DNS check successful" and tick
   **Enforce HTTPS** once it's available (GitHub issues the certificate automatically).

Note: if your repo is `YOUR_USERNAME.github.io` itself (a user/org site) rather
than a project repo, GitHub Pages serves it at the domain root with no
subpath — either works fine with a custom domain.
