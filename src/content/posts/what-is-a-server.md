---
title: What Is a Server, Really?
date: 2026-09-05
excerpt: We called it "the building" and left it closed. Here's what's actually running inside, in Node.js and Java, and where beginners usually get it wrong.
tag: fundamentals
author: Onkar
---

Four posts ago, the server was "the building" — the thing that houses the kitchen and the store room and keeps the lights on, but that we never actually opened. We've since opened the API, the kitchen, and the store room. This post opens the building.

By the end, "the server is down" should split into several different, specific problems in your head, and you should be able to write the smallest possible server yourself — in Node.js or Java — and see exactly where it can go wrong.

## What's actually running

Strip away the framework, and a server is one program that never exits. It does one thing, over and over, forever: wait for a request to arrive on a **port** (a numbered door on the building), read it, run some code, and write a reply back. That loop — listen, read, respond, repeat — is the entire job. Everything else we've covered (routing, middleware, business logic, the database) is code that runs *during* that one step in the middle.

Here's that loop with nothing hidden, in both languages.

### Node.js, with nothing but the standard library

```js
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/restaurants/42/menu') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ items: ['Margherita Pizza', 'Garlic Bread'] }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

### Java, with nothing but the standard library

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class Server {
  public static void main(String[] args) throws Exception {
    HttpServer server = HttpServer.create(new InetSocketAddress(3000), 0);

    server.createContext("/restaurants/42/menu", exchange -> {
      if (!"GET".equals(exchange.getRequestMethod())) {
        exchange.sendResponseHeaders(405, -1);
        exchange.close();
        return;
      }
      byte[] body = "{\"items\":[\"Margherita Pizza\",\"Garlic Bread\"]}"
          .getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().set("Content-Type", "application/json");
      exchange.sendResponseHeaders(200, body.length);
      exchange.getResponseBody().write(body);
      exchange.close();
    });

    server.setExecutor(null);
    server.start();
    System.out.println("Server listening on port 3000");
  }
}
```

Run either one, visit the URL, and you've built the entire loop by hand: no Express, no Spring, no database — just a program sitting there, listening on a port. Everything Express or Spring gives you — routing tables, middleware chains, JSON parsing, error handling — is pre-built equipment wrapped around this exact loop, the same "kitchen equipment" idea from the backend post. A framework doesn't replace this loop. It just saves you from writing the `if (req.url === ...)` chain by hand for every endpoint you have.

## What "down" actually means

"The server is down" gets used for at least four different failures, and they call for different fixes:

- **The process isn't running at all.** It crashed, or was never started. Nothing answers, ever — the door isn't just locked, the building isn't there.
- **The process is running but can't listen.** Usually something else already grabbed that port, or the process doesn't have permission to use it. It exists, but never opens for business.
- **The process is up and listening, but something it depends on isn't.** The database is unreachable, or a payment API it calls is timing out. Requests come in, but the code hangs waiting on an answer that never comes, until it eventually replies with a `500` or nothing at all.
- **The process is up and everything it needs is reachable — it's just slow.** Not down, just doing something expensive (an unindexed database query, a huge response body) and taking its time about it. This is the one people most often misdiagnose as "down."

Same sharpening move as the `404` vs `500` distinction from the API post: "down" isn't one problem, it's four, and the fix for "nobody started the process" is nothing like the fix for "the database fell over."

## One building isn't enough — scaling out

Both examples above run as a single process on a single machine, which means they have a single ceiling: however many requests one process can handle at once is the app's entire capacity. Get more customers than that, and the fix usually isn't a bigger building — it's more of them.

Run several copies of the exact same server — same code, same port, different machines — and put one more piece in front of them: a **load balancer**. It's the only address the UI or a DNS name actually points to; every request lands there first, and it hands each one off to whichever backend copy is free, the way a host seats each new table at whichever server has room.

This is invisible from the UI's side on purpose. It still sends one request to one address and gets one reply — it has no idea whether that reply came from building #1 or building #7, and it shouldn't need to. That's the same separation-of-concerns idea running one layer higher: the UI doesn't know how many servers exist any more than it knows how the database stores a row.

It does mean one thing has to change in how you write the server, though: nothing about handling a request should assume "the same building answers next time." If one request saves something in that process's own memory expecting to read it back on the *next* request, and the load balancer happens to route that next request to a different copy, the data simply isn't there. Anything that needs to persist between requests belongs in the database or a shared cache — never in a single server's memory — precisely because you no longer know, or control, which building answers next.

## Precautions worth taking from the start

A few habits that matter even for a server this small, because beginners consistently skip them until something breaks:

- **Always send a response, on every path.** Both examples above end every branch with `res.end(...)` or `exchange.close()`. A request that never gets a reply doesn't just fail politely — it hangs until the client gives up, tying up resources the whole time.
- **Never trust the port, host, or secrets to be hardcoded.** `3000` is fine to write in a blog post; a real server reads its port, database URL, and API keys from environment variables, so the same code can run in development and production without editing the source.
- **Set timeouts on anything you call.** If the server calls a database or another API and that call can hang forever, your server can hang forever too, one request at a time, until it's out of capacity to accept new ones.
- **Never send raw error details back to the client.** An unhandled exception can carry a stack trace, a file path, sometimes a piece of a database query. Log the full detail on the server; the client gets a plain `500` and nothing else.
- **Validate input before you act on it**, the same "is the ticket legible" check from the middleware post — assume every field in a request body can be missing, the wrong type, or actively malicious, because eventually one will be.

## Mistakes beginners make almost every time

- **Blocking the loop with synchronous work.** Node.js handles many requests on one thread by switching between them while each waits on I/O — but only if nothing hogs that thread. A heavy synchronous loop, or a synchronous file read, freezes every other request on the server until it finishes, not just the one that triggered it.
- **Letting one unhandled error take the whole process down.** In Node, an unhandled promise rejection or a thrown error outside a `try/catch` can crash the entire process — every in-flight request, not just the broken one. In Java, an uncaught exception on a request thread usually just fails that one request, which is safer, but only if you're not accidentally sharing state across threads that a crashed thread leaves half-updated.
- **Forgetting the server has more than one request in flight at once.** A global or static variable that one request writes to and another reads from is a race waiting to happen — two customers' orders can bleed into each other. This is the same problem the database's transactions solved for the store room; your server code needs the same discipline for anything it holds in memory.
- **Testing only the happy path.** The examples above return a `404` for anything that isn't the one route we wrote — try that yourself with a typo'd URL or the wrong HTTP verb before you ship, because a real user will find it within the first day.
- **Never closing what you open.** A database connection, a file handle, a background timer — anything opened and not closed eventually exhausts a limit (too many open files, too many connections) and takes the whole server down with it, slowly enough that it's confusing to debug.

## Putting it together

A server is a program that never exits, looping on listen-read-respond, on a port. Everything from routing to the database sits inside that loop, and a framework is just pre-built scaffolding around it, not a replacement for it. "Down" is really four different failures wearing one word. And the mistakes that take a server down in production are rarely exotic — they're an unhandled error, a forgotten timeout, a blocked thread, or a response that never gets sent.

That closes the loop we opened five posts ago: UI, API, backend, database, server — five parts, and now you've seen what's actually running inside every one of them.
