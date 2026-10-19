"use server";

import { createOrder } from "~/lib/orders.data";
import { type PlaceOrderResult } from "~/lib/checkout";

/**
 * Place an order.
 *
 * ON CSRF — read this before trusting it. Next's origin check only rejects a
 * request whose `Origin` header is PRESENT AND MISMATCHED. A request that
 * simply omits `Origin` — curl, a script, a bot, a native app — is accepted,
 * and the check compares against the forwarded host, so a proxy that passes a
 * client-supplied `X-Forwarded-Host` through defeats it. It stops cross-site
 * CSRF from a browser. It stops nothing else.
 *
 * A server action is also invokable from ANY path with the `Next-Action`
 * header, so a rate limit scoped to `/checkout` is bypassed by posting to `/`.
 * Any limiter must key on the action, not the route.
 *
 * `cart` is whatever the browser chose to send and is treated as hostile:
 * `createOrder` validates the shape, rejects duplicates, resolves every SKU
 * server-side and recomputes every rupee from the catalogue. No price,
 * subtotal or total in the payload is read, even if one is present.
 *
 * TODO(before launch): IP rate limiting at the edge (Vercel WAF / Cloudflare,
 * or middleware keyed on the `Next-Action` header). Deliberately NOT faked
 * in-process — a per-instance counter resets on every cold start and would
 * only create false confidence. The COD control that does bite today, a cap
 * per phone number per day, lives in `createOrder`. See
 * docs/CHECKOUT-SECURITY.md.
 */
export async function placeOrderAction(
  address: unknown,
  cart: unknown,
  idempotencyKey?: unknown,
  expectedTotalInPaise?: unknown,
): Promise<PlaceOrderResult> {
  return createOrder({ address, cart, idempotencyKey, expectedTotalInPaise });
}
