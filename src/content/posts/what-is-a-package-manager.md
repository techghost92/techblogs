---
title: What Is a Package Manager, Really?
date: 2026-10-31
excerpt: The Git post tracked the code you wrote. This one is about the other kind of code in every project — the code you didn't — and what "npm install" is actually doing when it runs.
tag: tooling
author: Onkar
---

The Git post covered how your own code gets tracked. Almost nothing you build is *only* your own code, though — a real project pulls in dozens, sometimes hundreds, of other people's libraries, and something has to keep track of exactly which versions, and exactly how they depend on each other. That something is the **package manager** — `npm` for Node.js, `pip` for Python, and the idea is the same either way.

By the end, `package.json`, `node_modules`, and the lockfile should be three specific, separate things you can point to — not one undifferentiated folder you're afraid to look inside.

## Nobody builds their own oven

Almost no project writes everything from scratch. Need to hash a password, like the authentication post covered? Someone's already written and battle-tested a library for that. Parse a date, format currency, make an HTTP request with retries built in — all of it exists already, published as a **package**, ready to be pulled into your project instead of rebuilt from raw ingredients every time.

A package manager is what makes "pulling it in" a one-line command instead of manually downloading a zip file, ensuring it doesn't clash with everything else you already depend on.

## The shopping list — package.json

`package.json` doesn't contain any of that other code. It's a **shopping list** — a plain text file naming which packages your project wants, and roughly which versions are acceptable:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "bcrypt": "^5.1.0"
  }
}
```

That `^` matters. `^4.18.2` doesn't mean "exactly this version" — it means "this version, or any newer one that doesn't change the first number," following a convention called **semantic versioning (semver)**: `MAJOR.MINOR.PATCH`, where a bump to `MAJOR` signals "this might break things that depended on the old behavior," and `MINOR`/`PATCH` bumps are supposed to be safe.

## Where the actual groceries end up — node_modules

Running `npm install` reads that shopping list and actually goes and gets everything on it, placing the real code inside a `node_modules` folder. But it doesn't stop at your direct dependencies — `express` itself depends on other packages, which depend on still others. `npm install` walks that entire chain, called the **dependency tree**, and downloads every package anywhere in it. That's the honest explanation for why `node_modules` on even a small project can balloon to hundreds of megabytes: you didn't ask for all of that directly, but your handful of direct dependencies did, several layers down.

## The part that actually keeps a team in sync — the lockfile

Here's the detail that trips up most beginners: `package.json` alone does **not** guarantee two people get identical code. `^4.18.2` is a *range*, and a package's maintainers can publish `4.18.3` next week — perfectly within that range, but still a different file than what you tested against.

That's what the **lockfile** (`package-lock.json` for npm, `yarn.lock` for Yarn) exists to fix. Where `package.json` says "anything compatible with `^4.18.2`," the lockfile records the *exact* version — and the exact versions of every package in the entire dependency tree — that actually got installed the first time. Commit the lockfile alongside `package.json`, and everyone who runs `npm install` afterward — a teammate, a CI pipeline, your own machine six months later — gets the precise same code, not just "something compatible."

This is the same problem the authentication post's token expiration was solving in a different shape: a range that can quietly resolve to something new later is exactly the kind of drift a lockfile pins down.

## Mistakes beginners make almost every time

- **Committing `node_modules` to Git.** The Git post already flagged this in passing — here's the actual reason: `node_modules` is entirely regenerable from `package.json` and the lockfile, so committing it just bloats the repository's history with files nobody needs to track, when `npm install` can reproduce the exact same folder on demand.
- **Not committing the lockfile.** The opposite mistake, and arguably worse: skip the lockfile, and you've given up the one guarantee that everyone gets the same dependency versions, reintroducing the exact "works on my machine" bug the lockfile exists to prevent.
- **Assuming any semver-compatible update is automatically safe.** `MINOR` and `PATCH` bumps are only "supposed to be" non-breaking — maintainers make mistakes, and a `^` range means your project can silently pick up a broken patch release the next time the lockfile gets regenerated.
- **Ignoring `npm audit` warnings.** Some published packages have known security vulnerabilities. The package manager can tell you when one of your dependencies — even a deeply nested one you never directly chose — has a disclosed problem; the warning is worth reading, not reflexively silencing.
- **Confusing a global install with a project one.** `npm install -g <package>` installs a command-line tool available anywhere on your machine; `npm install <package>` (no `-g`) adds it to *this* project's `node_modules` and `package.json`. Mixing the two up is why "it works in my terminal but not when a teammate clones the repo" happens so often — a global install isn't part of the project at all.

## Putting it together

`package.json` is what you're asking for; `node_modules` is what actually got fetched, dependencies and their own dependencies included; the lockfile is what pins the exact versions everyone should get, so "compatible" doesn't quietly turn into "different." Three files, three separate jobs — and now, the next time `npm install` runs for thirty seconds and changes a folder you've never opened, you know exactly what it just did.
