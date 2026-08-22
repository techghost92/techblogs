---
title: What Is a Backend, Really?
date: 2026-08-22
excerpt: We called it "the kitchen" and moved on. Here's what actually happens between the API handing over an order and a reply coming back.
tag: fundamentals
author: Onkar
---

Two posts ago, we split an app into five parts and called the backend "the kitchen" — the place where the real work happens, once the messenger (the API) delivers the order. That was enough to get the shape of things, but it skipped the part where the cooking actually happens.

This post opens the kitchen door. By the end, "business logic" and "the framework handles that" should be things you can picture, not just phrases.

## The order board — routing

`POST /orders` arrives at the server. Before anything else can happen, something has to answer one question: *which piece of code is supposed to handle this?*

That's **routing**. The framework keeps a list — an order board — matching each endpoint and verb to a specific function:

```
GET    /restaurants/42/menu   →  getMenu()
POST   /orders                →  createOrder()
DELETE /orders/981            →  cancelOrder()
```

Routing is just a lookup. It doesn't know what a restaurant is or what "closed" means — it only knows that a `POST` to `/orders` means "run `createOrder()` and hand it what came in the request." Everything with actual judgment happens after this handoff.

## The line cooks before the chef — middleware

Before `createOrder()` sees the order, it usually passes through a line of checks called **middleware** — small functions that each look at the request, decide whether it's allowed to continue, and pass it along if so.

Think of it as the sous chefs checking a ticket before it ever reaches the chef:

- **Is there a valid ID card?** — this is where that Authorization token from last post gets checked. No token, or an expired one, and the request is turned away right here with a `401`. `createOrder()` never even runs.
- **Is the ticket legible?** — is the JSON shaped the way it's supposed to be? Missing a required field gets rejected with a `400` before any real work starts.
- **Log it** — a line noting that this request happened, for whoever's watching the kitchen later.

Middleware runs the same way for every order, which is the point. The framework provides this line of checks so a developer doesn't write "check the token" by hand inside every single handler — that's the "pre-built kitchen equipment" from last time, doing its job.

## The recipe — business logic

Once an order clears the line, it reaches the actual recipe: the **business logic**. This is the one part of the backend that's specific to *this* app and nobody else's — the rules that make a food delivery app a food delivery app, rather than a generic order-taker.

For `createOrder()`, that might mean, in order:

1. Is restaurant #42 still open right now?
2. Is every item in the order still on the menu, and in stock?
3. Does the total match what the UI said the customer would pay?
4. Is the delivery address inside a zone this restaurant actually serves?

None of this is provided by the framework — it can't be, because it's specific to running a restaurant. The framework hands `createOrder()` a clean, already-checked request; what to *do* with it is the developer's problem to solve, one `if` at a time.

## Calling back to the store room

Somewhere in that recipe, the backend needs to check the store room and write to it — "is this menu item still available," "save this new order." That's the database, and here the framework earns its keep again.

Without it, talking to a database means writing raw query language by hand every time. With it, a developer usually writes something closer to plain code:

```js
const order = await Order.create({
  restaurantId: 42,
  items: cart,
  deliverTo: address,
});
```

That one line is the framework translating "create an order" into whatever the database actually needs to hear, and translating the database's answer back into something the rest of the code can use. It's the same idea as the framework handling logins — the developer describes *what* they want, and the framework handles *how*.

## Plating the reply

Once the recipe finishes, someone has to turn the result back into the reply the API promised: a status code, plus usually some JSON. `createOrder()` finishing successfully becomes:

```
201 Created
{ "orderId": 981, "status": "confirmed", "eta": "32 min" }
```

This is the framework again — it takes whatever `createOrder()` returns and serializes it into JSON, attaches the right status code, and sends it back through the API to the UI. The handler itself usually just says "here's the order, here's a 201" and lets the framework do the wrapping.

## One request, start to finish

Put it all together, and one tap on "Order Now" walks through the kitchen like this:

1. **Routing** finds `createOrder()` for `POST /orders`.
2. **Middleware** checks the ID card and the shape of the ticket.
3. **Business logic** applies the actual rules — open, in stock, correct price, valid address.
4. The **database** gets read from and written to along the way.
5. The result gets **plated** into a status code and JSON, and handed back to the API.

Five small stages, each trusting the one before it did its job. Routing doesn't check tokens. Middleware doesn't know what a restaurant is. Business logic doesn't know how the database stores anything. That's the same separation-of-concerns idea from the very first post, just one layer deeper.

## Why this matters

Next time an app hangs on "Placing your order...", you now have real questions to ask instead of just waiting: is it stuck at the ID check, is it slow because the recipe is doing something expensive, or is it waiting on the store room to answer? "The backend is slow" stops being one vague complaint and starts being five specific places to look.

We've now opened the API and the kitchen. The store room is next — what a database actually keeps, and why it's shaped the way it is.
