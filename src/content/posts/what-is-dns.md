---
title: What Is DNS, Really?
date: 2026-09-26
excerpt: The server post mentioned "a DNS name" pointing at a load balancer and moved on. Here's the part before everything else in this series even starts — what actually happens between typing a URL and a page loading.
tag: fundamentals
author: Onkar
---

Every post in this series has started from the same unspoken assumption: that a request already knows which address to go to. The server post got close to admitting there's a step before that — "the only address... a DNS name actually points to" — and moved straight past it. This post is that step. It's what happens in the half-second before any of the last seven posts even begin.

By the end, "the site is down" and "I just changed my domain, why doesn't it work yet" should split into specific, answerable questions.

## Names are for people, addresses are for computers

Every server on the internet is really just reachable by a number, called an **IP address** — something like `142.250.80.14`. Computers are perfectly happy typing that into a request. People are not; nobody memorizes a string of numbers for every site they visit.

**DNS** — the Domain Name System — is the translation step in between. You type `techblogs.example`, and before your browser can send a single request, something has to answer one question: *what IP address does that name actually point to right now?* That translation happens on every single page load, for every domain, quietly, before the "actual" request in the API post even leaves your device.

## Not one phonebook — a chain of them

Here's the part that surprises people: no single computer holds the entire internet's phonebook. Instead, answering "what's the IP for `techblogs.example`" means asking a short chain of specialists, each one narrowing the question down:

1. Your device asks a **resolver** (usually run by your ISP or a public one like `8.8.8.8`) — "do you already know this one?"
2. If not, the resolver asks a **root server** — "who handles `.example` addresses?"
3. That points to a **TLD server** for `.example`, which answers "who handles `techblogs.example` specifically?"
4. That points to the **authoritative server** for `techblogs.example` — the one place that actually knows the real, current answer, because whoever owns that domain configured it there.

That whole chain, several hops across the internet, usually finishes in a few milliseconds — you never see it happen, the same way you never see the API's status code being generated behind a loading spinner.

## Why it doesn't ask every single time — caching

Running that whole chain on every page load would be wasteful, so the answer gets **cached** at almost every step along the way: your browser remembers it, your operating system remembers it, your resolver remembers it. Each cached copy comes with a **TTL** (time to live) — a number of seconds after which that copy is considered stale and has to be looked up fresh.

This is the honest explanation behind "I changed my DNS settings and nothing happened yet." It's not broken — the old answer is still sitting in a cache somewhere between you and the authoritative server, and it won't ask again until that TTL runs out. A low TTL (say, 300 seconds) means changes show up fast everywhere; a high one (a full day) means fewer lookups but a much slower rollout when something actually changes. This delay, waiting for every cache in the chain to expire and refresh, is what people mean by **DNS propagation**.

## Seeing the lookup happen

You can run this exact lookup yourself, outside a browser entirely:

```bash
dig techblogs.example +short
# 142.250.80.14
```

Or the same idea from inside Node.js, the same standard-library style as the raw server example from a few posts back:

```js
const dns = require('dns');

dns.lookup('techblogs.example', (err, address) => {
  console.log(address); // '142.250.80.14'
});
```

Nothing about this involves loading a webpage — no HTML, no CSS, nothing from the API or backend posts. It's purely the name-to-address step, isolated from everything that happens after it.

## Mistakes beginners make almost every time

- **Treating "DNS is down" and "the server is down" as the same problem.** They're two separate systems that can fail independently. DNS resolving successfully to an IP address that then refuses the connection is a server problem; a domain that won't resolve to *any* IP at all is a DNS problem — same symptom in the browser, completely different place to look.
- **Expecting a DNS change to be instant.** Lowering the TTL has to happen *before* the change, and even then, every cache holding the old TTL's value keeps it until that old value expires — you cannot force every resolver on the internet to drop what it's holding.
- **Confusing a domain with the server behind it.** Buying a domain name doesn't create a server, and pointing a domain at an IP doesn't move your code there — DNS only tells the world where to knock. What answers the knock is everything the rest of this series has already covered.
- **Not realizing your own machine caches too.** "It works on my laptop but not my phone" right after a DNS change is often just your laptop still holding the old cached answer from before you made the change.

## Putting it together

DNS is the phonebook step that turns a name a person can read into an address a computer can connect to — a short chain of specialized servers, each one narrowing the question, with caching and a TTL at every layer to keep it fast. It's not part of the request itself; it's the lookup that has to finish *before* any request — the API call, the login, all of it — can even begin.

Now that the very first step is open, the next one is what happens the instant that connection starts: how "http" becomes "https," and what that lock icon in the address bar is actually promising you.
