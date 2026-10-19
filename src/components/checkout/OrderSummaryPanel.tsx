"use client";

import { useId } from "react";
import Link from "next/link";
import { Photo } from "~/components/Photo";
import { useCart } from "~/components/cart/CartProvider";
import { formatPrice } from "~/lib/format";
import {
  amountToFreeShipping,
  FREE_SHIPPING_THRESHOLD_PAISE,
  orderTotals,
} from "~/lib/orders";

/**
 * The review column on /checkout.
 *
 * Read-only on purpose. The cart page owns editing; repeating steppers and
 * remove buttons here would let someone change the order out from under the
 * form they are halfway through filling in, and the whole point of a review
 * surface is that it holds still. Changing anything is one link away.
 *
 * Every figure is derived, never hand-rolled: the subtotal and savings come
 * from the cart, shipping and the total come from the helpers in ~/lib/orders,
 * so this panel and the server agree by construction. It is still only a
 * preview — `createOrder` recomputes all of it from the catalogue.
 */
export function OrderSummaryPanel() {
  const { lines, totals } = useCart();
  const headingId = useId();

  const subtotalInPaise = totals.subtotalInPaise;
  const { shippingInPaise, totalInPaise } = orderTotals(subtotalInPaise);
  const toFreeShipping = amountToFreeShipping(subtotalInPaise);

  return (
    <section
      aria-labelledby={headingId}
      className="border-line rounded-xl border bg-white p-5 lg:sticky lg:top-24"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={headingId} className="text-ink font-serif text-2xl">
          Order Summary
        </h2>
        <Link
          href="/cart"
          className="text-brown hover:text-brown-dark focus-visible:ring-brown inline-flex min-h-10 items-center rounded-full text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Edit cart
        </Link>
      </div>

      <ul className="border-line mt-4 space-y-3 border-b pb-4">
        {lines.map((line) => (
          <li key={line.sku} className="flex items-center gap-3">
            <Photo
              src={line.item.image}
              alt=""
              fit="contain"
              sizes="56px"
              className="bg-cream size-14 shrink-0 rounded-lg !bg-none"
            />
            <div className="min-w-0 flex-1">
              <p className="text-ink truncate text-sm font-medium">
                {line.item.productName}
              </p>
              <p className="text-muted text-xs">
                {line.item.variantLabel} &times; {line.quantity}
              </p>
            </div>
            <p className="text-ink shrink-0 text-sm font-medium tabular-nums">
              {formatPrice(line.lineTotalInPaise)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Items ({totals.itemCount})</dt>
          <dd className="text-ink font-medium tabular-nums">
            {formatPrice(subtotalInPaise)}
          </dd>
        </div>

        {totals.savingsInPaise > 0 && (
          <div className="text-leaf flex items-baseline justify-between gap-3">
            <dt>You save</dt>
            <dd className="font-medium tabular-nums">
              {formatPrice(totals.savingsInPaise)}
            </dd>
          </div>
        )}

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Shipping</dt>
          {shippingInPaise === 0 ? (
            <dd className="text-leaf font-semibold">FREE</dd>
          ) : (
            <dd className="text-ink font-medium tabular-nums">
              {formatPrice(shippingInPaise)}
            </dd>
          )}
        </div>

        <div className="border-line border-t pt-3">
          <div className="flex items-baseline justify-between gap-3">
            {/*
              "Total to pay", not "Subtotal". On /cart shipping is genuinely
              unknown, so naming a total there would have been a guess; here
              the address is being collected and the rate is settled, so this
              is the figure the customer will hand over at the door.
            */}
            <dt className="text-ink text-base font-semibold">Total</dt>
            <dd className="text-ink text-base font-semibold tabular-nums">
              {formatPrice(totalInPaise)}
            </dd>
          </div>
        </div>
      </dl>

      {toFreeShipping > 0 && (
        <p className="bg-cream text-ink mt-4 rounded-lg px-3 py-2 text-xs">
          Spend {formatPrice(FREE_SHIPPING_THRESHOLD_PAISE)} or more and
          delivery is free.
        </p>
      )}

      <p className="text-muted mt-3 text-xs">
        Prices include GST. No hidden charges.
      </p>
    </section>
  );
}
