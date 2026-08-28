---
title: What Is Authentication, Really?
date: 2026-09-19
excerpt: We called it "the ID card" and left it at that. Here's what actually happens when you log in — how a password turns into a token, and why logging out and back in fixes so many things.
tag: fundamentals
author: Onkar
---

Two posts ago, the API post named the Authorization token "the ID card" — the thing every request carries so the server knows who's asking. The backend post checked that card at the door and moved on. Neither one asked where the card comes from. This post is about the moment before all of that: the one where you type a password and, somehow, get handed a card.

By the end, "log in," "you've been logged out," and "reset your password" should be things you can explain, not just things that happen when an app decides to be difficult.

## The one time your password actually gets sent — logging in

Your password only ever travels once: the moment you submit the login form. The server receives it, and now has to answer one question — *is this the right password for this account* — without ever needing to show that password to anyone again, including itself, ten minutes from now.

That last part matters more than it sounds like it should. A server that could recover your actual password whenever it wanted is a server where one data breach hands an attacker every password it ever stored, in plain, usable form. So it doesn't keep the password around at all. It keeps something else instead.

## Storing the receipt, not the password — hashing

What actually sits in the `users` table isn't your password — it's the output of running your password through a **hash function**, a one-way scrambler. Feed it the same input, you always get the same scrambled output. But there's no operation that turns the scrambled output back into the input — not a slow one, not a fast one, none.

```js
const passwordHash = await bcrypt.hash('correct horse battery staple', 10);
// stored: '$2b$10$N9qo8uLOickgx2ZMRZoMy...' — not the password, just its receipt
```

Logging in doesn't compare passwords at all — it hashes whatever you just typed and checks whether *that* matches the stored hash:

```js
const isCorrect = await bcrypt.compare(typedPassword, storedHash);
```

This is also the honest explanation for why "forgot password" always sends you a reset *link*, never your actual password in an email. A site that can email you your real password is telling you, out loud, that it never hashed it in the first place — there'd be nothing to email you if it had.

## The card itself — what a token actually holds

Once `bcrypt.compare` comes back true, the server needs to hand you something so you don't have to retype your password on every single request. That something is the **token** from the API post — and there are two common ways to build it.

One is a **session**: the server generates a random string, saves it in a table alongside your user ID, and hands you the string. Every request after that, the server takes your string and looks it up in that table to find out who you are. It's a coat-check ticket — meaningless on its own, useful only because the counter has a matching stub.

The other is a **JWT** (JSON Web Token): instead of a random string pointing at a lookup table, the token itself carries your user ID, plus a cryptographic signature the server generated when it issued the token. Checking a JWT means recomputing that signature and confirming it matches — no database lookup required, because the card already has everything printed on it, sealed shut.

```
header.payload.signature
eyJhbGc...  eyJ1c2VySWQiOjQyfQ  8Kx3n2...
```

Same job either way — proving who's asking, without asking them to log in again on every request — just two different tradeoffs: a session needs a lookup but can be revoked instantly by deleting the row; a JWT skips the lookup but can't be un-issued early without extra machinery, since the server never has to ask anyone whether it's still valid.

## Why the card has an expiration date

A stolen token is a real risk — anyone holding it can act as you until it stops working. So tokens are built to stop working: most carry an expiration timestamp, checked right alongside the signature. Fifteen minutes, a day, a week — a short window means a stolen token is only dangerous for a short time.

That's also the real explanation behind "log out and back in" fixing so many strange app errors. Logging out throws away the current token. Logging back in runs the whole login flow again — password checked, new token issued, fresh expiration — which happens to also fix any state that only looked broken because the *old* token had quietly expired mid-session.

## Mistakes beginners make almost every time

- **Comparing passwords with plain string equality instead of a hash.** `if (password === storedPassword)` only works if the password was stored in plain text — which is the exact thing hashing exists to prevent. If you ever see a real password sitting in a database column, that's the bug, not a feature.
- **Trusting a user ID sent by the client.** Sending `{ "userId": 42, "action": "delete" }` and trusting the `42` means anyone can type a different number and act as someone else. The server should always get "who's asking" from the verified token, never from a field the request writer typed in themselves — the same "don't trust the client" lesson from the frontend post, applied to identity instead of a hidden button.
- **Treating "logged in" as forever.** Skipping expiration entirely means a token stolen once — a leaked laptop, a public computer someone forgot to log out of — works indefinitely. An expiring token turns "stolen forever" into "stolen for fifteen minutes."
- **Checking authentication in only one place.** A page that hides the "Delete Account" button for logged-out users but forgets to check the token on the actual `DELETE /account` endpoint has decorated the door without locking it — the check has to live on the backend, where it can't be skipped by editing what the UI shows.

## Putting it together

Your password gets sent exactly once, hashed on arrival, and never stored in a form anyone could read back out. A successful check earns you a token — a coat-check ticket or a sealed card, either way a stand-in for logging in again on every request — and that token carries its own expiration, so losing it doesn't mean losing your account forever. "The ID card" from the API post was always this: not a card that was always in your pocket, but one issued the moment you proved who you were, and good for only so long.

That's the last of the loose threads from the request lifecycle — how the note gets written, how it's checked, and now, how you were allowed to write it in the first place.
