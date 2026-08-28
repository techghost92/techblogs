---
title: What Is the Event Loop, Really?
date: 2026-10-17
excerpt: The server post warned about "blocking the loop." The frontend post warned about "the one thread that also draws the screen." Neither one explained what that thread is actually doing between requests. This post does.
tag: fundamentals
author: Onkar
---

Two warnings from earlier in this series have been sitting there unexplained: the server post's "a heavy synchronous loop freezes every other request," and the frontend post's "a browser tab has a single thread handling both your JavaScript and painting the screen." Both assumed you already knew what that one thread was doing the rest of the time. This post is that explanation.

By the end, "why did my `await` not actually wait" and "why did the page freeze" should trace back to one specific, picturable mechanism.

## The todo list that never skips ahead

JavaScript runs on a single thread — one **call stack**, executing one thing at a time, top to bottom, and nothing else happens until the current thing finishes completely. Think of it as a todo list you're not allowed to reorder: you can't start item four until item three is fully done, no matter how long item three takes.

```js
console.log('1');
console.log('2');
console.log('3');
```

Nothing surprising here — this just runs in order, because none of it needs to wait on anything. The interesting part starts the moment one line *does* need to wait.

## Async doesn't mean "a second worker"

Here's the misconception this post exists to fix: `fetch()`, reading a file, and a database query all feel like they're happening "at the same time" as everything else, so it's natural to assume JavaScript spun up a second thread to handle them. It didn't. There's still only one thread.

What actually happens: when your code hits something that has to wait on the outside world — a network response, a timer, a disk read — it hands that waiting off to the runtime (the browser or Node itself) and immediately moves on to the *next* line, without blocking. The call stack never sits there idle waiting for a `fetch` to come back.

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');

// prints: 1, 3, 2
```

That's not a typo. Even with a delay of `0`, `'2'` prints last. The `setTimeout` callback doesn't get handed a spot on the stack right now — it gets parked, and the stack keeps running everything already queued in front of it first.

## Where "parked" things go — the queue

Once the timer fires, or the fetch resolves, or the file finishes reading, the callback that was waiting on it doesn't jump straight onto the call stack. It gets placed into a **queue** instead. The **event loop** itself has exactly one repeating job: check whether the call stack is completely empty, and if it is, take the next thing off the queue and run it.

That's the whole mechanism — a chef who sets a timer, moves straight on to the next dish instead of standing at the oven watching it, and only comes back to check the timer once the dish in front of them is actually finished. Nothing about a promise or a `setTimeout` runs "in the background" on some other thread; it runs on the exact same single thread, just later, once the stack has room for it.

Promises jump this queue slightly ahead of things like `setTimeout` — a resolved promise's `.then()` gets handled sooner than a pending timer callback would, even one set for `0`ms — but the core rule doesn't change: nothing runs until whatever's currently on the stack finishes.

## Now the earlier warnings make sense

Go back to the server post's warning: a heavy synchronous loop — sorting a huge array, parsing a massive JSON body — sits on the call stack the entire time it runs. The event loop can't check the queue, because its one rule is "wait for the stack to be empty," and a long synchronous loop keeps it busy. Every other request this server is supposed to be handling — timers, incoming connections, database callbacks — sits parked in the queue, un-run, until that one loop finally finishes.

The frontend post's warning is the exact same mechanism in the browser: painting the screen and responding to clicks both go through this same single thread and the same queue. A big synchronous computation in your component doesn't just delay your own code — it delays every click, every scroll, every repaint on the entire page, because none of it can run until the stack clears.

## Mistakes beginners make almost every time

- **Forgetting `await` and assuming the next line already has the data.** An `async` function call without `await` doesn't pause anything — the next line runs immediately, often before the value you wanted has actually arrived, producing a `Promise` where you expected real data.
- **Assuming `async` functions run in parallel automatically.** Calling three `async` functions one after another with `await` in front of each still runs them one at a time, in order — each one waits for the previous one's queue turn before starting. Real parallelism needs `Promise.all([...])`, kicking all three off before awaiting any of them.
- **Trusting `setTimeout(fn, 0)` to mean "run immediately."** As shown above, it means "run as soon as the stack is empty and the queue reaches this callback" — not now, and not even necessarily before a Promise's callback that was queued after it.
- **Running a large synchronous operation and being surprised the whole app hangs.** `JSON.parse()` on a huge payload, a big unindexed in-memory sort, a giant loop — all of it blocks the one stack everything else depends on, whether that's other users' requests on a server or your own page's ability to respond to a click.

## Putting it together

There's one call stack, one queue, and one loop whose entire job is moving the next queued thing onto the stack once it's empty. "Async" was never a second thread quietly doing your work in parallel — it's a promise that your code will get its turn again once whatever it's waiting on is ready, and once everything already ahead of it in line has finished. Both warnings from earlier in this series were really the same sentence: don't make the one thread hold the stack longer than it has to, because everything else — every other request, every click, every repaint — is waiting its turn in that same queue.
