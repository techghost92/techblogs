---
title: What Is a Database, Really?
date: 2026-08-29
excerpt: We called it "the store room" and moved on. Here's what a database actually keeps, and why it's shaped the way it is.
tag: fundamentals
author: Onkar
---

Three posts ago, we called the database "the store room" — the place the kitchen walks to when it needs to check something or write something down — and left it at that. Last time, we watched `createOrder()` hand off a finished order with one line: `Order.create({ ... })`. This post is about what's on the other side of that line.

By the end, "the database is slow" and "add a column" should be things you can picture, not just phrases developers say.

## Not a junk drawer — a set of shelves

A database doesn't keep things the way a junk drawer does, with everything piled in together. It keeps things the way a well-run store room does: labeled shelves, one shelf per kind of thing, and every item on a shelf shaped exactly the same way.

For our food delivery app, that's a few shelves:

- **restaurants** — one row per restaurant: its name, address, whether it's currently open
- **menu items** — one row per dish: which restaurant it belongs to, its name, its price
- **orders** — one row per order: who placed it, which restaurant, when, its status
- **users** — one row per person who's ever signed up

Each shelf is called a **table**. Each item on it is a **row**. And every row on a table has the same set of labeled boxes, called **columns** — every row in `orders` has a `restaurantId`, a `total`, a `status`, and nothing else, in that same order, every time. That's the whole idea of a table: consistency. If you've seen a spreadsheet, you've seen a table — a database is mostly a very fast, very strict spreadsheet.

## Asking the store room a question — queries

When the kitchen needs an answer, it doesn't wander the store room looking. It asks a precise question, called a **query**. The most common one is "give me the rows that match this":

```sql
SELECT * FROM menuItems WHERE restaurantId = 42 AND inStock = true;
```

Read that like English and it mostly already is one: *from the menu items shelf, give me every row where the restaurant is #42 and it's still in stock.* That's the query behind `GET /restaurants/42/menu` from a couple posts back — the endpoint is really just a friendly name wrapped around a query like this one.

Writing works the same way, just with a different verb:

```sql
INSERT INTO orders (restaurantId, total, status) VALUES (42, 18.50, 'confirmed');
```

That's the query hiding behind `Order.create({ ... })` from last time. The framework writes the actual `SQL` for you — `SELECT`, `INSERT`, and their siblings `UPDATE` and `DELETE` are the four verbs a database understands, the same way `GET`, `POST`, `PUT`, and `DELETE` were the four verbs an API understood. Not a coincidence — an API's job is largely to be a safe, narrow doorway in front of exactly these operations.

## Why one order touches three shelves, not one

Here's a question worth sitting with: why does the app need separate shelves for restaurants, menu items, and orders, instead of one big "everything" shelf where each order row just repeats the restaurant's name and address every time?

Because repeating information is how it goes stale. If a restaurant's address lived copied into every one of its past orders, moving locations would mean updating hundreds of old rows — or, more likely, not updating them, and now half your order history shows the wrong address. Instead, the `orders` table stores a `restaurantId`, a plain number pointing at the one true row on the `restaurants` shelf. Change the address once, in one place, and every order that ever points at restaurant #42 sees the new one automatically.

That pointer — one table referencing a row in another table by its ID — is the whole trick. It's why a menu item row doesn't repeat its restaurant's name, and why an order row doesn't repeat the customer's phone number. Each fact lives on exactly one shelf, and everything else just points to it.

## The lock on the store room door — why two people can't collide

Picture two customers tapping "Order Now" on the very last plate of the day's special, in the same second. Both requests reach `createOrder()` at nearly the same instant. Without something stopping it, both could check "is it in stock? yes," both proceed, and the restaurant ends up promising one plate to two people.

This is exactly the kind of thing the store room has to prevent, and it does it with something called a **transaction**: a group of reads and writes that the database treats as one all-or-nothing unit, and locks against interference while it's running. The second order's "check stock" has to wait until the first order's "check stock, then subtract one" fully finishes — so it sees zero left, and gets told the plate is gone, instead of both orders succeeding.

You don't see this happening. It's not a screen or a status code — it's the store room quietly making sure two people reaching for the same shelf at the same moment don't walk away with the same last item.

## Putting it together

A database is a set of tables, each one a shelf of same-shaped rows. Queries are precise questions and instructions — `SELECT`, `INSERT`, `UPDATE`, `DELETE` — that the framework mostly writes for you. Tables reference each other by ID instead of repeating information, so one fact only ever lives in one place. And transactions are the store room's way of making sure two people reaching for the same thing at once don't both walk away happy.

Next time someone says "we need to add a column," you'll know exactly what that means: a new labeled box, added to every row on one particular shelf. And next time an app tells you an item just sold out from under you, you'll know a transaction did its job — even if it didn't feel like a win in the moment.

We've now opened the API, the kitchen, and the store room. What's left is the building they all sit in — the server — and what it actually means for it to "go down."
