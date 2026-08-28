---
title: What Is Git, Really?
date: 2026-10-24
excerpt: This series has mostly covered what happens once your code is running. This one is about what happens before that — how "git add", "git commit", and a branch actually work, not just the commands that make the red text go away.
tag: tooling
author: Onkar
---

Most of this series has been about a request's journey once code is already running somewhere. This post is about the step before all of that even exists: how your code gets tracked, saved, and shared in the first place — and what a "branch" or a "commit" actually *is*, underneath the commands you've probably already memorized without quite trusting.

By the end, `git add`, `git commit`, and `git branch` should be three specific, separate actions you can picture — not a ritual you perform until the error goes away.

## A photo album, not a list of edits

The most common wrong mental model: that Git stores a list of line-by-line changes, like a very long "track changes" history in a word processor. It doesn't. Every commit is a full **snapshot** of your entire project at that moment — Git is closer to a photo album than a diff log. It's smart enough not to waste space re-storing files that didn't change between photos, but conceptually, each commit is a complete picture, not a delta.

That's why Git can jump to any past commit instantly and show you the *entire* project exactly as it was — it isn't replaying a stack of edits to reconstruct that moment, it's just opening that photo.

## Three places your work can be

A file in a Git project is always in one of three places, and most of the confusion beginners run into is really just not knowing which of the three a file is currently sitting in:

1. **Working directory** — the actual files on your disk, as you're editing them right now. Nothing here is tracked by history yet.
2. **Staging area** (the "index") — a holding pen for changes you've explicitly marked as "include this in the next commit." `git add <file>` is the only thing that moves a change here.
3. **Repository** — the permanent history of commits. `git commit` is the only thing that takes what's staged and seals it into a new snapshot.

Think of it as writing a letter (working directory), putting the finished pages into an envelope (staging), and actually sealing and dating that envelope (committing). `git status` is just Git telling you, at any moment, which of the three each file currently sits in.

## What a commit actually is

A commit isn't just "a snapshot" in isolation — it also carries a message, an author, a timestamp, and, critically, a pointer to the commit that came right before it. That last part is what turns a pile of snapshots into a **history**: each commit points backward to its parent, forming a chain you can walk from the very first commit up to the latest one.

Each commit gets identified by a long hash, like `a3f9c21`, computed from its contents — which is also why editing history (like an amended commit) always produces a *new* hash, rather than quietly modifying the old one in place. The old snapshot doesn't get edited; a new one gets created next to it.

## A branch is just a sticky note, not a copy

Here's the single biggest misconception worth fixing: creating a branch does **not** copy your codebase. A branch is just a movable label pointing at one specific commit — nothing more. `git branch feature-x` creates a sticky note called `feature-x`, currently stuck on whatever commit you're standing on. `git checkout feature-x` (or `git switch feature-x`) just moves your "you are here" marker — called `HEAD` — to that sticky note instead.

```bash
git init
git add index.html
git commit -m "First commit"

git branch feature-login       # a new sticky note, same commit as main
git checkout feature-login     # HEAD now points at feature-login

# ...make changes, then...
git add .
git commit -m "Add login form" # feature-login moves forward; main doesn't
```

That's the whole trick behind how branches can be created instantly, even on a massive project — there's no copying involved, just a new label pointing at the commit you're already on. Committing while on that branch only ever moves *that* sticky note forward; every other branch's label stays exactly where it was.

## Merging — reuniting two histories

`git merge feature-login` (run while standing on `main`) folds the commits made on `feature-login` back into `main`. If nothing on `main` changed in the meantime, this is a **fast-forward** — `main`'s sticky note just slides up to match `feature-login`'s, since there's nothing to combine. If both branches picked up separate commits, Git creates a new **merge commit** — one snapshot with two parents instead of one, stitching both histories together at that point.

A **merge conflict** happens when the same lines in the same file were changed differently on both sides, and Git genuinely can't guess which version you want — it stops and asks you to pick, or combine them, by hand.

## Mistakes beginners make almost every time

- **Committing secrets or `node_modules`.** A `.env` file with real API keys, once committed, is in the permanent history — deleting it in a later commit doesn't remove it from the earlier snapshot anyone can still check out. This is exactly the "never hardcode secrets" lesson from the server post, with a much less forgiving failure mode: a leaked key in Git history usually has to be rotated, not just deleted.
- **Running `git add .` on autopilot.** It stages *everything* changed in the working directory, including files you didn't mean to include — a debug `console.log`, a stray config file, a half-finished experiment in an unrelated part of the code.
- **Writing commit messages like "fix" or "updates."** A commit message is the label on that sealed envelope — six months later, `git log` is often the only record of *why* something changed, not just what.
- **Force-pushing without knowing what it discards.** `git push --force` overwrites the remote history with your local one, silently discarding any commits that existed on the remote but not locally — including a teammate's work you haven't pulled yet.
- **Treating `git pull` as one simple action.** It's really two steps combined — fetch the latest remote history, then merge it into your current branch — and the merge half can conflict exactly like any other merge, which is why a `pull` can suddenly demand you resolve something.

## Putting it together

A commit is a complete snapshot with a pointer to its parent, not a diff. A branch is a movable label on one of those commits, not a copy of anything. `add` moves work into staging; `commit` seals staging into a permanent snapshot; `merge` reunites two chains of commits, either by sliding a label forward or by creating a new commit with two parents. None of it is magic — it's a chain of photographs and a handful of sticky notes, and now you know exactly what each command is actually doing to them.
