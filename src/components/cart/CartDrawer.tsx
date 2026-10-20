"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { formatPrice } from "~/lib/format";
import { lockBodyScroll, trapTabKey } from "~/lib/modal";
import { useCart } from "./CartProvider";
import { CartChangeNotice } from "./CartChangeNotice";
import { CartLineItem } from "./CartLineItem";
import { EmptyState } from "~/components/EmptyState";

/**
 * Slide-out cart, mounted once in the root layout and driven entirely by
 * `isOpen` / `closeCart()` from `CartProvider` — nothing else opens or closes
 * it, so "add to cart" anywhere on the site lands in the same panel.
 *
 * Rendering is all-or-nothing: closed means `null`, not a translated-off-screen
 * panel. A hidden-but-mounted drawer keeps its links and buttons in the tab
 * order and in the accessibility tree, which is the classic offscreen-menu bug.
 *
 * ANIMATION NOTE. The entrance is animated, the exit is not. An exit animation
 * needs `AnimatePresence`, which keeps the panel mounted (and focusable) after
 * `isOpen` goes false, and the focus trap / focus restore would then have to
 * race the animation to decide when the dialog is really gone. Correctness over
 * polish: the panel leaves the tree the moment the cart closes.
 */
export function CartDrawer() {
  const { lines, totals, hydrated, isOpen, closeCart, lastAddedSku, removed } =
    useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const openedAtPath = useRef(pathname);
  const titleId = useId();
  const reduce = useReducedMotion();

  // Rendered empty and filled in by the effect below: a live region that is
  // inserted into the DOM already populated is not announced by most screen
  // readers, because nothing changed after it started being observed.
  const [announcement, setAnnouncement] = useState("");

  const { itemCount, subtotalInPaise, savingsInPaise } = totals;

  // A link inside the drawer (a product title on a line) navigates without
  // closing it, which would leave this `aria-modal` panel mounted over the new
  // page with body scroll still locked and the focus trap still armed. Closing
  // on pathname change covers every link in here, now and later, the same way
  // Navbar closes its mobile menu.
  useEffect(() => {
    if (pathname === openedAtPath.current) return;
    openedAtPath.current = pathname;
    closeCart();
  }, [pathname, closeCart]);

  useEffect(() => {
    if (!isOpen || !hydrated) {
      // Cleared on close so that reopening an unchanged cart still announces.
      setAnnouncement("");
      return;
    }
    // Debounced: polite live regions QUEUE rather than replace, so one
    // announcement per "+" tap makes a run of taps back up further and further
    // behind the user. This is the only live region in the cart — the quantity
    // stepper deliberately has none.
    const id = window.setTimeout(() => {
      const removalNote =
        removed.length > 0
          ? `${removed.length} ${removed.length === 1 ? "item" : "items"} in your cart changed. `
          : "";
      setAnnouncement(
        itemCount === 0
          ? `${removalNote}Your cart is empty.`
          : `${removalNote}${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart. Subtotal ${formatPrice(subtotalInPaise)}.`,
      );
    }, 500);
    return () => window.clearTimeout(id);
  }, [isOpen, hydrated, itemCount, subtotalInPaise, removed.length]);

  // Escape, the Tab trap, the body scroll lock and focus restore all share one
  // effect so that every one of them is undone by the same cleanup — including
  // on unmount, which is the case a separate "restore on close" handler misses.
  useEffect(() => {
    if (!isOpen) return;

    // Captured before focus moves into the panel, so it is genuinely whatever
    // the customer was on: the navbar cart button, an "Add to cart" on a card,
    // the buy box on a product page.
    const previouslyFocused = document.activeElement;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      } else if (event.key === "Tab" && panelRef.current) {
        trapTabKey(event, panelRef.current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const unlockScroll = lockBodyScroll();
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      // Send focus back where it came from, but only if that element is still
      // a real, attached element — the control that opened the drawer may have
      // unmounted in the meantime (a filter change, a client navigation).
      if (
        previouslyFocused instanceof HTMLElement &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
      // `.focus()` on a DISABLED element is a silent no-op, and the add that
      // opened this drawer is exactly what disables its own opener once the
      // per-line cap is reached — so the guard above is not enough and focus
      // would land on <body>. Fall back to the navbar cart link, which is
      // always present and is where the customer conceptually now is.
      if (document.activeElement === document.body) {
        document.querySelector<HTMLElement>('header a[href="/cart"]')?.focus();
      }
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  // Before hydration the cart is empty because storage has not been read yet,
  // not because the customer has nothing in it. Showing the shell and waiting
  // avoids flashing "Your cart is empty" over a cart that is about to appear.
  const showEmptyState = hydrated && lines.length === 0;
  const hasLines = lines.length > 0;

  const transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* A <button> rather than a div-with-onClick so the click target is a
          real control. It is NOT a keyboard/AT affordance: it sits outside
          [role="dialog"], so aria-modal hides it from assistive tech, and the
          Tab trap only cycles focusables within the panel. The header's close
          button is the keyboard and screen-reader exit. */}
      <motion.button
        type="button"
        onClick={closeCart}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transition}
        className="bg-ink/50 absolute inset-0 h-full w-full cursor-default"
      >
        <span className="sr-only">Close cart</span>
      </motion.button>

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reduce ? false : { x: "100%" }}
        animate={{ x: 0 }}
        transition={transition}
        className="bg-card border-line absolute inset-y-0 right-0 flex w-full flex-col border-l shadow-xl focus:outline-none sm:max-w-md"
      >
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <div className="border-line flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-ink font-serif text-xl">
              Your Cart
            </h2>
            {hydrated && (
              <p className="text-muted text-xs">
                {itemCount === 0
                  ? "No items yet"
                  : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="text-muted hover:text-ink focus-visible:ring-brown grid size-10 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">Close cart</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          <CartChangeNotice placement="drawer" className="mx-2 mt-2 mb-3" />

          {hasLines && (
            <ul className="divide-line divide-y">
              {lines.map((line) => (
                <CartLineItem
                  key={line.sku}
                  line={line}
                  layout="drawer"
                  highlighted={line.sku === lastAddedSku}
                />
              ))}
            </ul>
          )}

          {showEmptyState && (
            <EmptyState
              compact
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Chemical-free jaggery, straight from the farm. Pick a block and it will show up here."
              actionLabel="Browse Jaggery"
              actionHref="/shop"
              onAction={closeCart}
            />
          )}
        </div>

        <div className="border-line bg-card border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {hasLines && (
            <>
              <dl className="space-y-1 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="text-ink text-base font-semibold">
                    {formatPrice(subtotalInPaise)}
                  </dd>
                </div>
                {savingsInPaise > 0 && (
                  <div className="text-leaf flex items-baseline justify-between gap-3">
                    <dt>You save</dt>
                    <dd className="font-semibold">
                      {formatPrice(savingsInPaise)}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="text-muted mt-2 text-xs">
                Shipping calculated at checkout
              </p>
            </>
          )}

          {/* View Cart and Checkout share a row so the footer stays two rows
              tall: on a short landscape phone a third row squeezed the line
              list to nothing. */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {hasLines && (
              <>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="border-line text-ink hover:bg-cream focus-visible:ring-brown inline-flex min-h-10 items-center justify-center rounded-full border bg-white px-4 py-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="bg-brown hover:bg-brown-dark focus-visible:ring-brown inline-flex min-h-10 items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Checkout
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={closeCart}
              className="border-line text-ink hover:bg-cream focus-visible:ring-brown col-span-2 inline-flex min-h-10 items-center justify-center rounded-full border bg-white px-6 py-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
