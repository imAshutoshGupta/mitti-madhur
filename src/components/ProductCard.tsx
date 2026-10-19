import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { formatPrice } from "~/lib/format";
import {
  defaultVariant,
  discountPercent,
  isInStock,
  type Product,
} from "~/lib/products";
import { AddToCartButton } from "./cart/AddToCartButton";
import { Photo } from "./Photo";
import { Stars } from "./Stars";

/**
 * The one product card used by the homepage, the shop grid, search results and
 * "related products", so those four never drift apart visually.
 *
 * The whole card is clickable via a stretched link on the title; the CTA sits
 * above it with `relative z-10`. A single-variant product adds to the cart
 * straight from the card; a multi-variant one links to the product page, where
 * a size has to be picked anyway.
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw",
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
}) {
  // Same rule the product page uses, so the price on the card is the price
  // the customer lands on. See defaultVariant's docblock.
  const variant = defaultVariant(product);
  const discount = discountPercent(variant);
  const available = isInStock(product);
  const multipleSizes = product.variants.length > 1;
  const href = `/shop/${product.slug}`;

  return (
    <article className="border-line group relative flex h-full flex-col rounded-xl border bg-white p-3 transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative">
        <Photo
          src={product.images[0]}
          alt={product.name}
          fit="contain"
          priority={priority}
          className="bg-cream aspect-square rounded-lg !bg-none"
          sizes={sizes}
        />
        {discount > 0 && available && (
          <span className="bg-accent absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
            {discount}% OFF
          </span>
        )}
        {!available && (
          <span className="absolute inset-0 grid place-items-center rounded-lg bg-white/70">
            <span className="bg-ink/80 rounded-full px-3 py-1 text-[11px] font-semibold text-white">
              Out of Stock
            </span>
          </span>
        )}
      </div>

      {/* 40px touch target (the icon itself stays 16px). It is absolutely
          positioned with z-10 so it sits above the title's stretched link
          instead of a near-miss tap navigating to the product page, and it is
          pinned top-right, clear of the discount badge at top-left. */}
      <button
        type="button"
        aria-label={`Save ${product.name} to wishlist`}
        className="text-ink/70 hover:text-accent absolute top-1.5 right-1.5 z-10 grid size-10 place-items-center"
      >
        <Heart className="size-4" />
      </button>

      <h3 className="mt-3 text-sm font-semibold">
        <Link href={href} className="after:absolute after:inset-0">
          {product.name}
        </Link>
      </h3>

      <p className="text-muted mt-0.5 text-xs">
        {multipleSizes
          ? `${product.variants.length} sizes · from ${variant.label}`
          : variant.label}
      </p>

      <div className="mt-1.5">
        <Stars rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
        <span className="font-semibold">
          {formatPrice(variant.priceInPaise)}
        </span>
        {discount > 0 && (
          <span className="text-muted text-xs line-through">
            {formatPrice(variant.mrpInPaise)}
          </span>
        )}
      </p>

      {/* mt-auto keeps the CTAs aligned across cards of differing title length */}
      <div className="mt-auto pt-3">
        {available ? (
          multipleSizes ? (
            // A size genuinely has to be chosen, so the CTA still navigates.
            <Link
              href={href}
              className="bg-brown hover:bg-brown-dark focus-visible:ring-brown relative z-10 flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ShoppingCart className="size-3.5" aria-hidden />
              Choose Size
            </Link>
          ) : (
            // One variant, nothing to choose: add straight from the card. This
            // card stays a server component — AddToCartButton is the client
            // boundary, which is exactly where it belongs.
            <AddToCartButton
              sku={variant.sku}
              productName={product.name}
              variantLabel={variant.label}
              size="sm"
              fullWidth
            />
          )
        ) : (
          <span className="border-line text-muted flex w-full items-center justify-center gap-2 rounded-full border py-2 text-xs font-semibold">
            Out of Stock
          </span>
        )}
      </div>
    </article>
  );
}
