// Single source of truth for site-wide identity, used by both the app
// (document.title, index.html) and build-time scripts (RSS feed,
// per-post OG meta prerendering) so they can't drift apart. No custom
// domain is set up yet (public/CNAME doesn't exist), so this points at
// the default GitHub Pages URL — update SITE_URL here if a domain is
// added later.
export const SITE_NAME = 'techblogs';
export const SITE_URL = 'https://onkar3003.github.io/techblogs';
export const SITE_DESCRIPTION = 'A blog about code, written like one.';
