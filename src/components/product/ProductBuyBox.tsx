"use client";

import { useEffect, useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { Stars } from "~/components/Stars";
import { formatPrice } from "~/lib/format";
import { defaultVariant, discountPercent, type Product } from "~/lib/products";

/** Hard cap per line regardless of how deep the stock is. */
const MAX_PER_ORDER = 10;

export function ProductBuyBox({ product }: { product: Product }) {
  const [sku, setSku] = useState(() => defaultVariant(product).sku);
  const [quantity, setQuantity] = useState(1);

  // `variants` is a non-empty tuple, so [0] is a safe fallback for a stale sku.
  const selected =
    product.variants.find((v) => v.sku === sku) ?? product.variants[0];

  // A new size is a new stock ceiling, so the old count no longer applies.
  useEffect(() => {
    setQuantity(1);
  }, [sku]);

  const soldOut = selected.stock === 0;
  const discount = discountPercent(selected);
  const maxQuantity = Math.max(1, Math.min(selected.stock, MAX_PER_ORDER));

  return (
    <div>
      <h1 className="text-ink font-serif text-3xl sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-3">
        <Stars
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="md"
        />
      </div>

      {product.badges.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {product.badges.map((badge) => (
            <li
              key={badge}
              className="bg-cream text-brown rounded-full px-3 py-1 text-xs font-semibold"
            >
              {badge}
            </li>
          ))}
        </ul>
      )}

      <p className="text-ink/80 mt-4 text-sm leading-relaxed">
        {product.shortDescription}
      </p>

      <fieldset className="mt-6">
        <legend className="text-ink text-sm font-semibold">Size</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.variants.map((variant) => {
            const unavailable = variant.stock === 0;
            const active = variant.sku === selected.sku;
            return (
              <label
                key={variant.sku}
                className={`border-line has-[:focus-visible]:ring-brown relative flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 ${
                  unavailable
                    ? "text-muted cursor-not-allowed bg-white line-through"
                    : active
                      ? "border-brown bg-brown text-white"
                      : "hover:border-brown bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={variant.sku}
                  checked={active}
                  disabled={unavailable}
                  onChange={() => {
                    setSku(variant.sku);
                  }}
                  className="sr-only"
                />
                <span>{variant.label}</span>
                {unavailable && (
                  <span className="text-muted text-[11px] no-underline">
                    Sold out
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="border-line mt-6 rounded-xl border bg-white p-4">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-ink font-serif text-3xl">
            {formatPrice(selected.priceInPaise)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-muted text-sm line-through">
                {formatPrice(selected.mrpInPaise)}
              </span>
              <span className="bg-accent rounded-full px-2 py-0.5 text-[11px] font-bold text-white">
                {discount}% OFF
              </span>
            </>
          )}
        </p>
        <p className="text-muted mt-1 text-xs">Inclusive of all taxes</p>

        <p className="mt-3 text-sm font-medium">
          {soldOut ? (
            <span className="text-muted">Out of stock</span>
          ) : selected.stock <= 10 ? (
            <span className="text-accent">
              Only {selected.stock} left in stock
            </span>
          ) : (
            <span className="text-leaf inline-flex items-center gap-1.5">
              <Check className="size-4" aria-hidden />
              In stock
            </span>
          )}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span id="qty-label" className="text-ink text-sm font-semibold">
            Quantity
          </span>
          <div className="border-line flex items-center gap-1 rounded-full border bg-white p-1">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={soldOut || quantity <= 1}
              onClick={() => {
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="text-ink hover:bg-cream focus-visible:ring-brown grid size-10 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <output
              aria-live="polite"
              aria-labelledby="qty-label"
              className="min-w-10 text-center text-sm font-semibold tabular-nums"
            >
              {quantity}
            </output>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={soldOut || quantity >= maxQuantity}
              onClick={() => {
                setQuantity((q) => Math.min(maxQuantity, q + 1));
              }}
              className="text-ink hover:bg-cream focus-visible:ring-brown grid size-10 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* TODO(step 2): wire to the cart store and enable. */}
        <button
          type="button"
          disabled
          aria-describedby="cart-pending-note"
          className="bg-line text-muted mt-5 flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
        >
          <ShoppingCart className="size-4" aria-hidden />
          {soldOut ? "Out of Stock" : "Add to Cart"}
        </button>
        <p
          id="cart-pending-note"
          className="text-muted mt-2 text-center text-xs"
        >
          Cart and checkout are arriving in the next update.
        </p>
      </div>

      <p className="text-muted mt-4 text-xs">SKU: {selected.sku}</p>
    </div>
  );
}
