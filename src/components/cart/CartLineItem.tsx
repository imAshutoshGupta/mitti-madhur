"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Photo } from "~/components/Photo";
import { formatPrice } from "~/lib/format";
import { type ResolvedCartLine } from "~/lib/cart";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

/**
 * One cart line, shared by the drawer and the cart page so the two can never
 * disagree about price, stock wording or available actions.
 */
export function CartLineItem({
  line,
  layout = "page",
  highlighted = false,
}: {
  line: ResolvedCartLine;
  layout?: "page" | "drawer";
  highlighted?: boolean;
}) {
  const { setQuantity, removeItem, maxFor, closeCart } = useCart();
  const { item, quantity } = line;
  const max = maxFor(item.sku);
  const compact = layout === "drawer";
  const name = `${item.productName} (${item.variantLabel})`;

  return (
    <li
      className={`flex gap-3 rounded-xl p-3 transition-colors sm:gap-4 ${
        highlighted ? "bg-cream" : ""
      } ${compact ? "" : "border-line border bg-white"}`}
    >
      <Link
        href={`/shop/${item.productSlug}`}
        onClick={closeCart}
        tabIndex={-1}
        aria-hidden
        className="shrink-0"
      >
        <Photo
          src={item.image}
          alt=""
          fit="contain"
          sizes="96px"
          className={`bg-cream rounded-lg !bg-none ${compact ? "size-16" : "size-20 sm:size-24"}`}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className={compact ? "text-sm font-semibold" : "font-semibold"}>
              <Link
                href={`/shop/${item.productSlug}`}
                onClick={closeCart}
                className="hover:text-brown focus-visible:ring-brown rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {item.productName}
              </Link>
            </h3>
            <p className="text-muted text-xs">{item.variantLabel}</p>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.sku)}
            aria-label={`Remove ${name} from cart`}
            className="text-muted hover:text-accent focus-visible:ring-brown grid size-10 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <X className={compact ? "size-3.5" : "size-4"} aria-hidden />
          </button>
        </div>

        {/* Stock can move under a cart that has been sitting for a while. */}
        {max > 0 && quantity >= max && (
          <p className="text-accent mt-1 text-xs">
            {quantity >= 10
              ? "Maximum quantity per order"
              : "That is all we have in stock"}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            quantity={quantity}
            max={max}
            label={name}
            size={compact ? "sm" : "md"}
            onChange={(next) => setQuantity(item.sku, next)}
            onRemove={() => removeItem(item.sku)}
          />

          <div className="text-right">
            <p className={compact ? "text-sm font-semibold" : "font-semibold"}>
              {formatPrice(line.lineTotalInPaise)}
            </p>
            {line.lineMrpTotalInPaise > line.lineTotalInPaise && (
              <p className="text-muted text-xs line-through">
                {formatPrice(line.lineMrpTotalInPaise)}
              </p>
            )}
            {quantity > 1 && (
              <p className="text-muted text-xs">
                {formatPrice(item.priceInPaise)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
