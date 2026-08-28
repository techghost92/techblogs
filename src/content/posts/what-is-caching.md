---
title: What Is Caching, Really?
date: 2026-10-10
excerpt: The HTTPS post promised to explain why the second visit to a page is so often instant. Here's the answer — and it's the same idea the server post named "a shared cache" and never opened.
tag: fundamentals
author: Onkar
---

The first time you open a page, everything runs: DNS resolves, HTTPS negotiates, the request travels all the way to the backend and back. Visit the same page a minute later, and half of that seems to just... not happen. Nothing about the internet got faster in that minute. What changed is that a copy of the answer was already sitting close by, and nobody had to go get a fresh one.

By the end, "why is this suddenly showing old data" should be a specific, findable bug — not a mystery.

## Keeping a photocopy instead of a fresh trip

A **cache** is just a saved copy of something, kept somewhere faster to reach than the original source, so the next request for the same thing doesn't have to redo the work that produced it the first time. Your browser caches images, stylesheets, and scripts the first time it downloads them from a site. Visit a second page on that same site, and the logo, the CSS, the JS bundle — none of that gets re-downloaded, because a copy is already sitting on your own disk.

This is exactly the store room analogy from the database post, one level up: instead of walking back to the shelf every time someone asks the same question, you write the answer on a sticky note and hand out the sticky note until it's no longer trustworthy.

## How long to trust the copy — the same idea as a DNS TTL

The DNS post explained TTL — how long a cached IP address is trusted before it has to be looked up fresh. A web cache uses the exact same idea, just for a different kind of answer. When a server sends back an image or a script, it can attach a `Cache-Control` header telling the browser how long to trust its own copy:

```
Cache-Control: max-age=86400
```

That's "trust this copy for 86,400 seconds — one day — before asking me again." For a logo that never changes, that number can be huge. For something that changes constantly, the server can say `max-age=0` or `no-store`, meaning "don't bother keeping a copy at all, always come back and ask." The server gets to decide how cacheable each thing is, response by response.

## Caching isn't just in the browser

The browser is the most visible cache, but it's rarely the one that matters most for how an app actually performs under load. Picture `GET /restaurants/42/menu` from the API post, hit ten thousand times a minute during lunch. Running the full chain every single time — middleware, business logic, a database query — for the exact same answer, over and over, is wasted work.

So a **server-side cache** — often a separate, very fast in-memory store like Redis — sits between the backend and the database. The first request runs the real query and stores the result there. Every request after that, until the cached copy expires, gets the answer straight from that fast in-memory store, and the database never even hears about it:

```js
async function getMenu(restaurantId) {
  const cached = await cache.get(`menu:${restaurantId}`);
  if (cached) return cached;

  const menu = await Menu.find({ restaurantId }); // the real, slow query
  await cache.set(`menu:${restaurantId}`, menu, { ttl: 60 });
  return menu;
}
```

Same `max-age` idea as the HTTP header — a `ttl` of 60 means the database only actually gets queried once every minute, no matter how many customers ask for that menu in between.

## The hard part — knowing when a copy has gone stale

Caching a value that never changes is easy. The genuinely hard part is what happens when it does change: the restaurant marks a dish out of stock, but the cached menu still says it's available for up to another 59 seconds. That gap between "the real data changed" and "the cached copy catches up" is called **staleness**, and every caching strategy is really just a set of tradeoffs about how much staleness a given piece of data can tolerate.

Some values get **invalidated** on write instead of waiting out the clock — the moment `updateMenuItem()` runs, it also deletes that menu's cached entry, forcing the very next request to fetch a fresh copy and re-cache it. Others just accept a short window of staleness because it's cheap and harmless — nobody's hurt if a follower count is 30 seconds behind.

## Mistakes beginners make almost every time

- **Caching something that's different per user.** Cache a page or an API response by URL alone, and if that response secretly depends on who's asking — an account balance, a personalized feed — every user who hits it next gets *someone else's* cached answer. Anything user-specific needs the user's identity as part of the cache key, not just the endpoint.
- **Forgetting to invalidate on write.** Updating a database row without also clearing or updating its cached copy means the app now serves two different answers depending purely on luck — whichever code path a given request happens to take.
- **Caching an error response.** A `500` cached with the same TTL as a real answer means an outage that lasted five seconds can look like it lasted a full cache lifetime to everyone who got that cached failure.
- **No limit on how much gets cached.** An in-memory cache with no size cap and no eviction policy just grows forever, and "unbounded cache" is really just a slow, complicated way of writing a memory leak.

## Putting it together

Caching is the same trade every time: a saved copy, a length of time it's trusted for, and a plan for what happens once that trust runs out. The browser does it with `Cache-Control` and a `max-age`; a backend does it with an in-memory store and a `ttl`; DNS did the exact same thing, several posts ago, for IP addresses. It's one idea, reused at every layer of everything this series has covered — and the price of getting it wrong is never "too slow," it's "confidently wrong for a little while."
