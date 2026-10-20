"use client";

import { AlertTriangle, X } from "lucide-react";
import { type RemovedCartLine } from "~/lib/cart";
import { useCart } from "./CartProvider";

type Placement = "drawer" | "cart" | "checkout";

/**
 * Tells the customer which cart lines could not be honoured (sold out,
 * discontinued, or reduced to the per-line cap) and lets them dismiss it.
 * Silently changing a cart the customer built is not acceptable, so the drawer,
 * the cart page and checkout all show this. Renders nothing when there is
 * nothing to report.
 *
 * `className` carries the outer margins, which differ per placement.
 */
export function CartChangeNotice({
  placement,
  className = "",
}: {
  placement: Placement;
  className?: string;
}) {
  const { removed, dismissNotice } = useCart();
  if (removed.length === 0) return null;

  const compact = placement === "drawer";

  return (
    <div
      className={`border-line bg-cream rounded-xl border ${compact ? "p-3" : "p-4"} ${className}`}
    >
      <div className={`flex ${compact ? "gap-2" : "gap-3"}`}>
        <AlertTriangle
          className={`text-accent mt-0.5 shrink-0 ${compact ? "size-4" : "size-5"}`}
          aria-hidden
        />
        <ul
          className={`text-ink min-w-0 flex-1 space-y-1 ${compact ? "text-xs" : "text-sm"}`}
        >
          {removed.map((entry) => (
            <li key={entry.sku}>{describe(entry, placement)}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={dismissNotice}
          className="text-muted hover:text-ink focus-visible:ring-brown grid size-10 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden />
          <span className="sr-only">
            {placement === "checkout"
              ? "Dismiss notice"
              : "Dismiss cart notice"}
          </span>
        </button>
      </div>
    </div>
  );
}

function describe(entry: RemovedCartLine, placement: Placement): string {
  if (entry.reason === "reduced") {
    return `We reduced ${entry.name} to ${entry.quantity} — that is the maximum per order.`;
  }

  const removedFrom = {
    drawer: "",
    cart: " from your cart",
    checkout: " from this order",
  }[placement];

  if (entry.reason === "unavailable") {
    return `${entry.name} is no longer available and was removed${removedFrom}.`;
  }
  const soldOut = placement === "checkout" ? "sold out" : "is out of stock";
  return `${entry.name} ${soldOut} and was removed${removedFrom}.`;
}
