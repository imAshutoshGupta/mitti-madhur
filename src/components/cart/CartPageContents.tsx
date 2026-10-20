"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "~/components/EmptyState";
import { CartChangeNotice } from "~/components/cart/CartChangeNotice";
import { CartLineItem } from "~/components/cart/CartLineItem";
import { useCart } from "~/components/cart/CartProvider";
import { formatPrice } from "~/lib/format";

/**
 * Everything on /cart that depends on the stored cart.
 *
 * Three distinct states, in order of precedence:
 *   1. not hydrated  -> skeleton (never the empty state; see below)
 *   2. hydrated, no lines -> empty state, no summary column
 *   3. hydrated, lines -> line list + sticky summary
 *
 * The `role="status"` region lives at the TOP level, outside all three, because
 * removing the last line swaps the whole subtree for the empty state. A live
 * region that unmounts along with the thing that changed announces nothing.
 */
export function CartPageContents() {
  const { lines, totals, hydrated } = useCart();
  const [announcement, setAnnouncement] = useState("");

  const previousCount = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const emptyRef = useRef<HTMLDivElement>(null);
  // Only move focus for a removal the customer just performed, never on the
  // first paint of a page they have merely navigated to.
  const shouldRefocus = useRef(false);

  const lineCount = lines.length;

  useEffect(() => {
    if (!hydrated) return;
    const previous = previousCount.current;
    previousCount.current = lineCount;
    if (previous === null || lineCount >= previous) return;

    setAnnouncement(
      lineCount === 0
        ? "Your cart is empty."
        : `Item removed. ${lineCount} ${lineCount === 1 ? "item" : "items"} remaining.`,
    );
    shouldRefocus.current = true;
  }, [lineCount, hydrated]);

  // Focus has to land somewhere deliberate after a removal: the control the
  // customer activated has just been destroyed along with its row, and the
  // browser's fallback is <body>, which dumps a keyboard user at the very top
  // of the document.
  useEffect(() => {
    if (!shouldRefocus.current) return;
    shouldRefocus.current = false;
    (lineCount === 0 ? emptyRef.current : headingRef.current)?.focus();
  }, [lineCount]);

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  if (!hydrated) return <CartSkeleton />;

  const notice = <CartChangeNotice placement="cart" className="mb-4" />;

  if (lineCount === 0) {
    return (
      <>
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
        <div className="mt-8" ref={emptyRef} tabIndex={-1}>
          {notice}
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Nothing here yet. Pick a block, powder or granule jaggery from the shop and it will show up right here."
            actionLabel="Browse Jaggery"
            actionHref="/shop"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="mt-8">
        {notice}

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          {/* Mobile stacks in source order, so the lines come first. */}
          <section aria-labelledby="cart-lines-heading" className="min-w-0">
            <div className="border-line mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <h2
                id="cart-lines-heading"
                ref={headingRef}
                tabIndex={-1}
                className="text-ink text-sm font-semibold focus:outline-none"
              >
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}{" "}
                in your cart
              </h2>
              <ClearCartControl onCleared={() => announce("Cart cleared.")} />
            </div>

            <ul className="space-y-3">
              {lines.map((line) => (
                <CartLineItem key={line.sku} line={line} />
              ))}
            </ul>
          </section>

          <OrderSummary
            itemCount={totals.itemCount}
            subtotalInPaise={totals.subtotalInPaise}
            savingsInPaise={totals.savingsInPaise}
          />
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Clear cart
// ---------------------------------------------------------------------------

/**
 * Two-step inline confirm rather than `window.confirm`.
 *
 * Clearing is destructive and the trigger sits a thumb's width from the
 * quantity steppers, so a mis-tap is cheap to make and expensive to undo —
 * there is no undo. A native dialog would do the job but it blocks the main
 * thread, cannot be styled, and on mobile Safari is easy to dismiss blind.
 */
function ClearCartControl({ onCleared }: { onCleared: () => void }) {
  const { clearCart } = useCart();
  const [confirming, setConfirming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  /**
   * Focus moves from an EFFECT, not from the click handler.
   *
   * Cancelling used to call `triggerRef.current?.focus()` inline, but while
   * `confirming` is true the trigger is unmounted, so React has already set
   * that ref to null and the `?.` swallowed it — focus silently fell to
   * <body> on cancel, on Escape and on confirm alike. By the time an effect
   * keyed on `confirming` runs, the correct button exists again.
   */
  useEffect(() => {
    if (confirming) {
      confirmRef.current?.focus();
    } else if (wasConfirming.current) {
      triggerRef.current?.focus();
    }
    wasConfirming.current = confirming;
  }, [confirming]);

  const cancel = useCallback(() => setConfirming(false), []);

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        className="text-muted hover:text-accent focus-visible:ring-brown inline-flex min-h-10 items-center rounded-full px-3 text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Clear cart
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Confirm clearing the cart"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          cancel();
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-ink text-sm font-medium">Are you sure?</span>
      <button
        ref={confirmRef}
        type="button"
        onClick={() => {
          clearCart();
          setConfirming(false);
          // The list is about to be replaced by the empty state; without this
          // a screen-reader user gets no feedback at all for an irreversible
          // action. The parent owns the live region because this component
          // unmounts with the list.
          onCleared();
        }}
        className="bg-accent focus-visible:ring-accent inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Yes, clear
      </button>
      <button
        type="button"
        onClick={cancel}
        className="border-line text-ink focus-visible:ring-brown hover:bg-cream inline-flex min-h-10 items-center rounded-full border bg-white px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Cancel
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function OrderSummary({
  itemCount,
  subtotalInPaise,
  savingsInPaise,
}: {
  itemCount: number;
  subtotalInPaise: number;
  savingsInPaise: number;
}) {
  return (
    <section
      aria-labelledby="order-summary-heading"
      className="border-line rounded-xl border bg-white p-5 lg:sticky lg:top-24"
    >
      <h2 id="order-summary-heading" className="text-ink font-serif text-2xl">
        Order Summary
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          {/* "Items", not "Subtotal": the emphasis row below is the subtotal,
              and printing the same label and figure twice read as a bug. */}
          <dt className="text-muted">Items ({itemCount})</dt>
          <dd className="text-ink font-medium tabular-nums">
            {formatPrice(subtotalInPaise)}
          </dd>
        </div>

        {savingsInPaise > 0 && (
          <div className="text-leaf flex items-baseline justify-between gap-3">
            <dt>You save</dt>
            <dd className="font-medium tabular-nums">
              {formatPrice(savingsInPaise)}
            </dd>
          </div>
        )}

        {/* The figure and the final total are shown on /checkout. */}
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Shipping</dt>
          <dd className="text-muted">Calculated at checkout</dd>
        </div>

        <div className="border-line border-t pt-3">
          <div className="flex items-baseline justify-between gap-3">
            {/*
              Labelled "Subtotal", not "Total": shipping is not included yet,
              so this is not the amount that will be charged.
            */}
            <dt className="text-ink text-base font-semibold">Subtotal</dt>
            <dd className="text-ink text-base font-semibold tabular-nums">
              {formatPrice(subtotalInPaise)}
            </dd>
          </div>
          <p className="text-muted mt-1 text-xs">
            Shipping calculated at checkout.
          </p>
        </div>
      </dl>

      <Link
        href="/checkout"
        className="bg-brown hover:bg-brown-dark focus-visible:ring-brown mt-5 flex min-h-10 w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Proceed to Checkout
      </Link>

      <Link
        href="/shop"
        className="border-line text-ink hover:bg-cream focus-visible:ring-brown mt-3 flex min-h-10 w-full items-center justify-center rounded-full border bg-white px-6 py-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Continue Shopping
      </Link>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/**
 * Shown until the stored cart has been read.
 *
 * It matters that this is NOT the empty state: the server has no way to know
 * what is in localStorage, so a visitor with a full cart would otherwise be
 * told their cart is empty for a frame or two before their items appeared.
 * The shape mirrors the real layout so nothing jumps on hydration.
 */
function CartSkeleton() {
  return (
    <div className="mt-8">
      <div
        aria-hidden
        className="grid items-start gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="min-w-0">
          <div className="border-line mb-4 flex items-center justify-between gap-3 border-b pb-3">
            <div className="bg-line/60 h-4 w-40 animate-pulse rounded" />
            <div className="bg-line/60 h-4 w-20 animate-pulse rounded" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="border-line flex gap-3 rounded-xl border bg-white p-3 sm:gap-4"
              >
                <div className="bg-line/60 size-20 shrink-0 animate-pulse rounded-lg sm:size-24" />
                <div className="min-w-0 flex-1">
                  <div className="bg-line/60 h-4 w-2/5 animate-pulse rounded" />
                  <div className="bg-line/60 mt-2 h-3 w-1/4 animate-pulse rounded" />
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="bg-line/60 h-10 w-28 animate-pulse rounded-full" />
                    <div className="bg-line/60 h-4 w-16 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-line rounded-xl border bg-white p-5 lg:sticky lg:top-24">
          <div className="bg-line/60 h-7 w-40 animate-pulse rounded" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="bg-line/60 h-3 w-24 animate-pulse rounded" />
                <div className="bg-line/60 h-3 w-16 animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="border-line mt-3 border-t pt-3">
            <div className="flex items-center justify-between gap-3">
              <div className="bg-line/60 h-4 w-20 animate-pulse rounded" />
              <div className="bg-line/60 h-4 w-20 animate-pulse rounded" />
            </div>
          </div>
          <div className="bg-line/60 mt-5 h-12 w-full animate-pulse rounded-full" />
          <div className="bg-line/60 mt-3 h-12 w-full animate-pulse rounded-full" />
        </div>
      </div>

      <span role="status" className="sr-only">
        Loading your cart
      </span>
    </div>
  );
}
