---
title: What Is a Frontend, Really?
date: 2026-09-12
excerpt: We called it "the waiter" and left it at that. Here's what's actually happening behind the screen — state, rendering, and the parts a framework like React quietly manages for you.
tag: fundamentals
author: Onkar
---

Last time, opening the server closed the loop we started six posts ago — UI, API, backend, database, server, each one opened in turn. Except the UI never actually got opened. It got a nickname, "the waiter," and we moved on to the parts you can't see. This post finishes the job on the one part you've been staring at the whole time.

By the end, "why isn't this updating" and "the page froze" should be things you can debug, not just things that happen to you.

## The waiter's notepad — state

Everything the waiter says to you depends on one thing: what's currently written on their notepad. Two items in your cart, not three. This table, not that one. The notepad is the single source of truth for what gets shown — the waiter doesn't improvise from memory, they read it off the pad.

In a frontend, that notepad is called **state** — just plain data, held in memory, that describes the current picture: which items are in the cart, whether the menu is still loading, which restaurant you're looking at. Nothing on screen is drawn directly; it's drawn *from* state. Change what's on the notepad, and what you say next changes with it.

## Redrawing the board — rendering

Here's the part that trips people up: updating the notepad doesn't move your mouth. Something still has to look at the new notepad and say the new sentence out loud. That step — turning the current state into what's actually on the screen — is called **rendering**.

Do it by hand and you have to remember, every single place cartCount is shown, to go update that exact spot: `document.querySelector('#cart-badge').textContent = ...`. Miss one, and that one spot quietly lies to the user forever. A framework like React exists to remove that "did I remember every spot" problem: you describe what the screen should look like *for the current state*, and the framework figures out which specific pixels actually need to change and touches only those — the same way the waiter crosses out one line on the specials board instead of reprinting the whole thing.

## The menu, card by card — components

Nobody hands you the whole menu as one wall of text. It's broken into cards — one per dish, each with the same shape: a name, a price, a photo, an "Add" button. A frontend is built the same way, out of **components**: small, reusable pieces that each take some data and know how to draw themselves from it.

```jsx
function MenuItemCard({ name, price }) {
  return (
    <div className="menu-item">
      <h3>{name}</h3>
      <p>${price}</p>
      <button>Add to Cart</button>
    </div>
  );
}
```

The menu screen is just this one component, repeated once per dish with different data handed in. That's the same idea as the routing table from the backend post — one piece of code, reused for every case, instead of writing "Margherita Pizza's card" and "Garlic Bread's card" as two separate hand-written blocks.

## Taking the order — events

Tapping "Add to Cart" doesn't talk to the screen directly. It fires an **event**, and that event runs a small function whose only job is to update state — nothing more. The screen catches up on its own, because a render always follows a state change.

```jsx
function AddToCartButton() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCartCount(cartCount + 1)}>
        Add Margherita Pizza — $12
      </button>
      <span>Cart: {cartCount}</span>
    </div>
  );
}
```

`setCartCount` doesn't touch the `<span>`. It tells the framework "the notepad changed" — the framework re-runs this function, sees the new number, and updates that one `<span>`, nothing else on the page. The developer never wrote "now go update the badge" by hand; they wrote what the badge should show *given* the count, and let the framework keep it honest. Compare that to doing it with nothing but the browser's own API, no framework in the way:

```js
let cartCount = 0;
const button = document.getElementById('add-btn');
const badge = document.getElementById('cart-count');

button.addEventListener('click', () => {
  cartCount += 1;
  badge.textContent = `Cart: ${cartCount}`;
});
```

This works fine for one badge. It stops working the moment cartCount needs to show up in three places, or the button needs to disable itself past ten items — now every single spot that depends on cartCount is something a developer has to remember to update, by hand, forever. That bookkeeping is exactly what a framework takes off your plate.

## Sending the note back to the kitchen — fetching

The UI still has to actually run the messenger from two posts back. When the menu screen first opens, it has to ask the server for the current menu:

```jsx
useEffect(() => {
  async function loadMenu() {
    setLoading(true);
    const response = await fetch('/restaurants/42/menu');
    const data = await response.json();
    setMenuItems(data.items);
    setLoading(false);
  }
  loadMenu();
}, []);
```

Notice what's actually being managed here: not "the menu," but *three separate states* — loading, the items once they arrive, and implicitly, whether anything went wrong. The spinner you see while an app loads isn't a special UI trick; it's just `loading` being `true`, rendered as a spinner instead of a menu, for however long that `await` takes to come back.

## Mistakes beginners make almost every time

- **Changing state directly instead of replacing it.** `cart.push(item)` instead of `setCart([...cart, item])` mutates the notepad without telling the framework it changed — the framework never hears about it, so it never re-renders, and the screen quietly falls out of sync with the real data.
- **Forgetting the loading and error states exist.** The example above has three states, not one. Skip `loading` and the screen shows a blank menu for however long the request takes. Skip the error case and a failed request leaves the spinner spinning forever, with no way for the user to know anything went wrong.
- **Trusting the UI to enforce a rule.** Hiding the "Cancel Order" button after checkout stops an honest user from clicking it — it does nothing to stop someone from calling the API directly. The UI can hide options for convenience, but the actual rule still has to be checked in the backend, the same middleware and business logic from a few posts back. The UI is a suggestion; the server is the enforcement.
- **Giving list items no stable identity.** Render a list of cart items without a stable `key`, and the framework can lose track of which row is which when the list changes — an input mid-edit can end up attached to the wrong row, or a row's own local state can leak onto its neighbor.
- **Doing heavy work on the one thread that also draws the screen.** A browser tab has a single thread handling both your JavaScript and painting the screen, much like the single-threaded loop from the server post. A large synchronous loop — sorting a huge list, parsing a big response — blocks that thread, and the whole page stops responding to clicks or scrolling until it finishes.

## Putting it together

State is the notepad; rendering is reading it aloud onto the screen; components are the reusable cards it's built from; events update the notepad, never the screen directly. The framework's entire job is keeping those two things — what state says, and what the screen shows — from ever drifting apart, so you don't have to track it by hand. And underneath all of it, the UI is still doing exactly what the very first post called it: taking your taps, and running the messenger back and forth. You've just seen, now, what happens on this end of the note too.

Six posts, six parts, every door open. UI, API, backend, database, server — and the framework holding each one together, doing the bookkeeping so a developer can describe *what* the screen should show instead of *how* to keep it that way.
