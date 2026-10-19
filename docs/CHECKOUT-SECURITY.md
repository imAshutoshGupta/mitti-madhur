# Checkout security requirements

Read this before writing any checkout, order or payment code.

Today the cart is entirely client-side. Price, stock and the per-line quantity
cap are enforced in the browser, which means **the current cart is a suggestion,
not a fact**. `MAX_PER_LINE`, `maxPerLine` and every price in the serialised
catalogue are editable from devtools in about ten seconds.

That is acceptable while nothing can be bought. It stops being acceptable the
moment an order can be created. The classic Indian-storefront fraud is a POST
straight to the cart or order endpoint carrying `{sku, quantity: 1000, price: 1}`.

There is a second, quieter problem. The catalogue is **frozen at build time**:
every route is prerendered with `s-maxage=31536000` and nothing in `src/` sets
`revalidate`. So the prices and stock the browser clamps against are whatever
was true at `next build`. Even with no tampering at all, a cart can hold a
quantity that exceeds real stock, at a price that is no longer the price.

## The rule

The client sends `[{ sku, quantity }]` and **nothing else**. Never a price,
never a line total, never a subtotal. If a price or total appears in a request
body, discard it before parsing — do not "validate" it against the server
figure, because that turns a silent correction into an oracle an attacker can
probe.

## Order of checks when creating an order

1. **Associate the cart with a server-side session or order record first**, so
   steps 2-7 run against state the client cannot edit between them.
2. **Validate shape.** Array; at most ~50 lines; each `sku` a string matching
   the SKU charset; each `quantity` an integer via `Number.isInteger` —
   *reject*, do not coerce or clamp. Reject duplicate SKUs rather than summing
   them.
3. **Resolve every SKU against the live store** with `Object.hasOwn` (or a real
   query), in one query, inside a transaction. An unresolvable SKU fails the
   whole order.
4. **Re-read the price from the store at this instant.** `priceInPaise` and
   `mrpInPaise` from the database row — never from the request, never from a
   cached catalogue object, never from the prerendered payload. Recompute line
   totals and the subtotal in integer paise, server-side.
5. **Re-check and reserve stock atomically.** A conditional decrement
   (`UPDATE ... SET stock = stock - :q WHERE sku = :sku AND stock >= :q`) with
   the affected row count checked, or `SELECT ... FOR UPDATE`. A read-then-write
   check lets two concurrent checkouts both pass. The reservation must hold for
   the payment window and expire if payment never completes.
6. **Apply shipping and tax server-side** from a server rate table keyed by the
   server-resolved destination. Accept a coupon *code* only — resolve its value,
   eligibility, per-customer usage count and expiry server-side. Never accept a
   client-supplied shipping cost or discount amount.
7. **Persist an immutable order record before contacting the gateway**: order
   id, per-line `{sku, unit_price_paise, quantity, line_total_paise}`, subtotal,
   shipping, tax, `amount_paise`, currency, gateway order id. This row — not the
   session, not the cart, not anything the browser can reach — is the single
   source of truth for what was owed.

## What the payment webhook must do

The webhook is the actual trust boundary. Everything above it is advisory.

- **Verify the signature first**, against the **raw request body**, before any
  JSON parsing or body-parser middleware can rewrite it, using a constant-time
  comparison (`crypto.timingSafeEqual`). A webhook that fails verification is
  discarded, and its body is never logged at info level.
- **Look up the order by the gateway's reference id**, then require
  `webhook.amount === order.amount_paise` and
  `webhook.currency === order.currency` as **exact** equality. Not `>=`, not
  "within tolerance". A mismatch marks the order `payment_mismatch`, does not
  fulfil, and alerts — it is the signature of a tampered client or a replayed
  payment for a different order.
- **Require the gateway's terminal success status**, not merely `created` or
  `authorized`. Capture explicitly if the gateway separates authorize and
  capture.
- **Be idempotent**, keyed on the gateway event id, inside the same transaction
  that flips order status — a redelivered webhook must not decrement stock or
  trigger fulfilment twice.
- Only then does the step-5 reservation become a permanent decrement. Release
  it on failure or expiry.
- The customer's post-payment redirect is a **UI hint only**. Fulfilment is
  driven by the webhook, never by the browser arriving at `/order/success`.

## Storage boundary

`mm.cart.v2` in localStorage holds `{ savedAt, lines: [{sku, quantity}] }` and
must keep holding only that.

**Do not extend it** with a name, phone number, email, shipping address or
anything order-related. Those belong in a server-side session keyed by an
`HttpOnly; Secure; SameSite=Lax` cookie. "Just cache the address so they don't
retype it" looks like a one-line change to this key and is the exact mistake to
avoid — localStorage is readable by any script on the origin and persists on
shared devices with no expiry beyond the 30-day stamp.
