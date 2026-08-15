---
title: What Is an API, Really?
date: 2026-08-15
excerpt: API gets thrown around a lot — "hit the API," "the API is down." Here's what's actually inside that note the messenger carries back and forth.
tag: fundamentals
author: Onkar
---

Last time, we met the five parts every app is built from, and called the API "the messenger" — the thing that carries your tap on "Order Now" from the screen to the server, and carries the reply back. That's a fine mental picture, but it leaves the messenger's note unopened. What's actually written on it?

This post opens that note. By the end, "hit the API" and "the API is down" should mean something specific to you, not just a phrase you've heard developers use.

## A request is just an address with a verb

When the UI wants something from the server, it sends a **request**. A request is really just two things glued together: an address, and a verb describing what to do at that address.

The address is called an **endpoint** — a specific URL that does one job and nothing else. For our food delivery app, the endpoint to look at restaurant #42's menu might look like this:

```
GET /restaurants/42/menu
```

`GET` is the verb — it means "give me this, don't change anything." There are a handful of verbs, and each one maps to something you'd recognize:

- **GET** — fetch something, unchanged (loading the menu)
- **POST** — create something new (placing an order)
- **PUT** — update something that already exists (changing your delivery address)
- **DELETE** — remove something (canceling that order)

Notice the pattern: the address says *what* you're talking about, the verb says *what you want to do to it*. `GET /restaurants/42/menu` and `POST /restaurants/42/menu` are different requests to the same address — one reads the menu, the other would try to create a menu, which is why an app only exposes the verbs that actually make sense for each endpoint.

## The envelope — JSON

A `GET` request doesn't usually need to carry extra information — the address says it all. But `POST /orders`, placing an order, needs to describe *what* you're ordering. That description travels inside the request as **JSON** — a simple, text-based way of writing down data that both the UI and the server agree to use.

An order might travel as something like this:

```json
{
  "restaurantId": 42,
  "items": [
    { "name": "Margherita Pizza", "quantity": 1 },
    { "name": "Garlic Bread", "quantity": 2 }
  ],
  "deliverTo": "12 Maple Street"
}
```

That's the whole note the messenger is carrying: what to order, how many, and where it's going. JSON looks intimidating the first time you see it, but it's really just labeled boxes — a name, and a value in that box. Nothing more mysterious than a form you'd fill out on paper.

## The ID card — headers

A request carries one more thing besides the address, the verb, and the JSON: **headers**. If the JSON is the letter inside the envelope, headers are what's written on the outside — information about the request itself, not what it's asking for.

The header that matters most: **Authorization**. When you log into the food app, the server hands your phone a **token** — a long, random string that works like an ID card. From then on, every request your phone sends carries that token in its Authorization header, whether it's loading the menu or placing an order. The server checks that card before it does anything else.

This is what a `401` is actually reacting to. No token, or an expired one, and the server stops you at the door — it won't even look at what you're asking for. That's also why logging out and back in "fixes" so many mysterious app errors: it throws away the old ID card and gets you a fresh one.

## The reply — status codes

The server sends something back too, and it also follows a pattern: a **status code**, plus usually some JSON of its own.

You've seen status codes before, even if you didn't know the name — `404` is the most famous one, the "page not found" you get when a link is broken. A few you'll run into constantly:

- **200** — success, here's your answer
- **201** — success, and something new was created (your order went through)
- **400** — you sent something wrong (missing an item, bad formatting)
- **401** — you're not logged in, or not allowed to do this
- **404** — that address doesn't exist
- **500** — the server broke while handling your request

Think back to the waiter analogy from last time: the status code is the look on the waiter's face before they even say anything. `200` is a nod and a smile. `404` is "we don't have a table by that name." `500` is the waiter dropping the tray in the kitchen doorway — something went wrong on their end, not yours.

## One door, one job

A useful habit once you start noticing endpoints: each one is a single, narrow door. `GET /restaurants/42/menu` only ever returns a menu. It doesn't also let you place an order, cancel one, or check your account balance — those live behind their own doors: `POST /orders`, `DELETE /orders/981`, `GET /account/balance`.

This is on purpose, for the same reason the five layers from last time stay separated: it keeps each piece predictable. A developer reading `DELETE /orders/981` doesn't need to guess what it does — the address and the verb already told them.

## APIs aren't just inside one app

Here's the part that surprises people: APIs aren't only the private messenger running between your food app's UI and its own server. Companies expose their APIs to *other* companies on purpose.

That "Pay with card" screen in the food app almost certainly isn't built by the food delivery company at all — it's a `POST` request to a payment company's API, one they built specifically so other apps could plug into it. The map showing the delivery route is often another company's API too. Your one order might involve four or five different companies' APIs, each answering its own narrow set of questions, all stitched together behind a UI that looks like a single app.

## Putting it together

An API request is an address (the endpoint) plus a verb (GET, POST, PUT, DELETE), sometimes carrying JSON with more detail. The reply is a status code, telling you plainly whether it worked, and usually some JSON of its own with the actual answer.

Next time someone says "the API is down," you can ask the sharper question: down as in nothing responds at all, or down as in it's replying with 500s? Those are two very different problems, and now you know exactly what's being described either way.
