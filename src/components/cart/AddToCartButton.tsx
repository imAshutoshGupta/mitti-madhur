"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart, useCartQuantity } from "./CartProvider";

/** How long the "Added" confirmation stays up before reverting. */
const ADDED_FEEDBACK_MS = 1500;

type AddToCartButtonProps = {
  sku: string;
  /** Used for the accessible name — several of these can share one page. */
  productName: string;
  /** The size/pack label, e.g. "500 g". Also part of the accessible name. */
  variantLabel: string;
  /** How many to add per click. Defaults to one. */
  quantity?: number;
  /** Caller-side disable (e.g. the buy box already knows the variant is out). */
  disabled?: boolean;
  /** "sm" matches the product card's CTA, "md" the product page buy box. */
  size?: "sm" | "md";
  className?: string;
  fullWidth?: boolean;
};

/**
 * The one Add to Cart control, shared by the product card and the buy box so
 * the two cannot drift apart.
 *
 * HYDRATION. The cart is read from localStorage after mount, so `hydrated` is
 * false for the server render and the first paint, and every cart-derived
 * label would otherwise disagree between the two HTML trees. While it is false
 * this renders the plain "Add to Cart" label — the same markup the server
 * produced — and only switches to the count-aware labels afterwards. The
 * stock cap (`maxFor`) comes from the server-built catalogue, not from
 * storage, so the sold-out branch is identical on both sides and is safe to
 * render before hydration.
 */
export function AddToCartButton({
  sku,
  productName,
  variantLabel,
  quantity = 1,
  disabled = false,
  size = "md",
  className = "",
  fullWidth = false,
}: AddToCartButtonProps) {
  const { addItem, maxFor, hydrated } = useCart();
  const inCart = useCartQuantity(sku);
  const [justAdded, setJustAdded] = useState(false);

  // A ref, not state: the pending timeout is not rendered, and it has to be
  // reachable from the unmount cleanup to be cancelled.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel on unmount, otherwise the callback fires setState on a component
  // that is gone — e.g. a card unmounted by a filter change mid-confirmation.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  // The buy box reuses ONE instance across variant changes — only `sku` and
  // `variantLabel` change. Without this reset, switching size inside the 1.5s
  // window left "Added" on screen and re-fired the live region with the new
  // variant's name, telling the customer a pack went in that never did.
  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setJustAdded(false);
  }, [sku]);

  const max = maxFor(sku);
  const soldOut = max === 0;
  // Only meaningful once storage has been read; before that `inCart` is 0 for
  // everything, which would wrongly read as "room left" on a full line.
  const atMaximum = hydrated && inCart >= max;

  const handleClick = useCallback(() => {
    addItem(sku, quantity);
    // Clear first so a rapid second click restarts the window rather than
    // leaving the original timeout to cut the new confirmation short.
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    setJustAdded(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setJustAdded(false);
    }, ADDED_FEEDBACK_MS);
  }, [addItem, sku, quantity]);

  const isDisabled = disabled || soldOut || atMaximum;

  let label: string;
  if (soldOut) {
    label = "Out of Stock";
  } else if (justAdded) {
    label = "Added";
  } else if (atMaximum) {
    label = "Maximum in cart";
  } else if (hydrated && inCart > 0) {
    label =
      size === "sm"
        ? `Add another (${inCart})`
        : `Add another · ${inCart} in cart`;
  } else {
    label = "Add to Cart";
  }

  let accessibleName: string;
  if (soldOut) {
    accessibleName = `${productName} (${variantLabel}) is out of stock`;
  } else if (atMaximum) {
    accessibleName = `Maximum quantity of ${productName} (${variantLabel}) is already in your cart`;
  } else if (hydrated && inCart > 0) {
    accessibleName = `Add ${productName} (${variantLabel}) to cart, ${inCart} already in cart`;
  } else {
    accessibleName = `Add ${productName} (${variantLabel}) to cart`;
  }

  const sizeClasses =
    size === "sm"
      ? "min-h-10 py-2 px-3 text-xs gap-2"
      : "min-h-12 px-6 text-sm gap-2";
  const iconClasses = size === "sm" ? "size-3.5" : "size-4";
  const toneClasses = isDisabled
    ? "bg-line text-muted cursor-not-allowed"
    : "bg-brown hover:bg-brown-dark text-white";

  return (
    <>
      <button
        type="button"
        disabled={isDisabled}
        aria-label={accessibleName}
        onClick={handleClick}
        className={`focus-visible:ring-brown relative z-10 flex items-center justify-center rounded-full font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${sizeClasses} ${toneClasses} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
      >
        {justAdded && !soldOut ? (
          <Check className={iconClasses} aria-hidden />
        ) : (
          <ShoppingCart className={iconClasses} aria-hidden />
        )}
        {label}
      </button>
      {/* The button's accessible name is an aria-label, so its visible text is
          never announced. This carries the confirmation to screen readers
          without making the name itself flicker between states. */}
      <span role="status" aria-live="polite" className="sr-only">
        {justAdded ? `${productName} (${variantLabel}) added to cart` : ""}
      </span>
    </>
  );
}
