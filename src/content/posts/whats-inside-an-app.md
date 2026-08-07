---
title: What's Really Inside an App?
date: 2026-08-07
excerpt: Every app you open — a food delivery app, a chat app, anything — is really four or five smaller parts working together. Here's what those parts are, using a real app as the example.
tag: fundamentals
author: Onkar
---

Open any app on your phone. A food delivery app, a chat app, a shopping app — doesn't matter which one. What you see on the screen is just one small part of it. Behind that screen, there are more parts working together, and each one has its own job.

This post is not about one language or one tool. It's about the parts every app has in common — website, mobile app, or desktop software. Once you can see these parts, any app becomes easier to understand, no matter who built it or what they built it with.

Let's use a food delivery app as our example — the kind where you browse restaurants, pick a dish, and tap to order. You've used one before, so it'll be easy to follow.

![The five layers of an app, stacked: UI, API, Backend and Framework, Database, Server](/images/posts/whats-inside-an-app/layers-stack.svg)

*The five layers, stacked. We'll go through each one, top to bottom.*

## 1. The part you touch — the UI

UI means **User Interface**. It's simply everything you can see and tap: the list of restaurants, the menu, the "Add to Cart" button, the price shown at checkout.

The UI's only job is to show you information and take your taps, clicks, and typing. It does not decide anything on its own. When you tap "Order Now," the UI doesn't know how to actually place your order — it just passes your tap forward to the next part.

Think of the UI as a waiter standing at your table. The waiter takes your order and shows you the menu, but the waiter doesn't cook the food.

## 2. The messenger — the API

API stands for **Application Programming Interface**. That sounds complicated, but the idea is simple: the API is the messenger between the UI (your phone screen) and the part that does the actual work (which usually lives on a computer far away, called a **server**).

When you tap "Order Now," here's what really happens:

1. The UI collects what you ordered.
2. It sends that as a request through the API — like handing a note to the messenger.
3. The messenger runs to the server, delivers the note, and waits.
4. The server sends a reply back — "Order confirmed" or "Sorry, that item is out of stock."
5. The messenger brings the reply back, and the UI shows it to you.

That round trip usually happens in less than a second. Every time you see a loading spinner on an app, that's the messenger running back and forth.

## 3. The kitchen — backend logic and the framework

The **backend** is where the real work happens — the kitchen, in our restaurant example. This is the part you never see. It decides things like: Is this restaurant still open? Is this dish still available? Is the price correct? Should this order be sent to the restaurant's tablet?

Now, here's where the **framework** comes in. A framework is a ready-made toolkit that developers use to build the backend faster, instead of building every single thing from raw materials.

Think of it this way: a restaurant kitchen doesn't forge its own knives or build its own stove from scratch. It buys equipment that already works, and the chef focuses on cooking. A framework is like that kitchen equipment for developers — things like checking who's logged in, saving data, or handling many orders at once are already built. The developer doesn't rewrite those from zero for every app; they use the framework and focus on the actual rules of their business, like "this restaurant closes at 11 PM."

Popular examples you may have heard of: Express or NestJS for Node.js, Django or Flask for Python, Spring for Java. Different tools, same idea — pre-built kitchen equipment.

## 4. The store room — the database

Somewhere, all this information has to be kept: every restaurant, every menu item, every price, every order you've ever placed. That's the **database** — the store room.

When the kitchen (backend) needs to check something — "does this user have this address saved?" — it walks to the store room, looks it up, and comes back with the answer. When you place an order, the kitchen writes it down in the store room so it isn't lost, even if you close the app right after.

Without a database, an app would forget everything the moment you closed it. Your order history, your saved addresses, your account — all of that lives in a database somewhere.

## 5. The building — the server

All of this — the kitchen, the store room — has to physically run somewhere. That "somewhere" is a **server**: a powerful computer, usually sitting in a data center, that stays switched on all day and night so the app is always available.

You never see this part or touch it directly. It's the restaurant building itself — the place that houses the kitchen and the store room, keeps the lights on, and lets the waiter walk in and out with orders.

## Putting it all together

Here's the whole trip, one more time, using our food delivery app:

![Diagram of one tap traveling from the UI, through the API, into the server where the backend, framework, and database work, then the reply traveling back up to the UI](/images/posts/whats-inside-an-app/request-flow.svg)

*One tap. One round trip through every layer, and back.*

Every layer has one job, and it trusts the next layer to do its job well. The UI doesn't know how orders are stored. The database doesn't know what a button looks like. That separation is on purpose — it's what lets a big team of developers work on the same app without stepping on each other's toes. One person can rebuild the entire UI without touching the database, and no one else even notices.

## Why this matters

You don't need to be a developer to find this useful. The next time an app is slow, you now know it's probably the messenger (API) waiting on a reply, or the kitchen (backend) doing something heavy, or the store room (database) being searched. The next time someone says "the server is down," you know exactly what building they mean.

That's really it. UI, API, backend and framework, database, server. Five simple parts, and nearly every app you've ever used is built from some version of them.
