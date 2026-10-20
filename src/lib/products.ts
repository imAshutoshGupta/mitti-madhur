// Catalogue types and pure helpers.
//
// This module is deliberately DATA-FREE so that "use client" components can
// import from it safely. The catalogue itself and every accessor live in
// ./products.data.ts, which is marked `server-only`.
//
// Money is stored as INTEGER PAISE (₹120 -> 12000) so that totals, discounts
// and tax never hit floating-point rounding, and so the values can be handed
// straight to a payment gateway later. Render with `formatPrice` from ~/lib/format.

export const CATEGORY_SLUGS = [
  "jaggery-blocks",
  "jaggery-powder",
  "jaggery-granules",
  "liquid-jaggery",
  "flavoured-jaggery",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type Category = {
  slug: CategorySlug;
  name: string;
  note: string;
  description: string;
  image: string;
};

export type ProductVariant = {
  /** Stock-keeping unit. Stable id a cart line will reference. */
  sku: string;
  /** e.g. "500 g", "1 kg", "500 ml" */
  label: string;
  priceInPaise: number;
  mrpInPaise: number;
  stock: number;
};

export type NutritionRow = { label: string; value: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  shortDescription: string;
  description: string;
  /** Non-empty tuple so `images[0]` is always defined under noUncheckedIndexedAccess. */
  images: [string, ...string[]];
  variants: [ProductVariant, ...ProductVariant[]];
  rating: number;
  reviewCount: number;
  badges: string[];
  nutrition: NutritionRow[];
  ingredients: string;
  bestSeller: boolean;
  /** ISO date, used for the "Newest" sort. */
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Variant selection
// ---------------------------------------------------------------------------

/**
 * THE variant a product is represented by: the cheapest one a customer can
 * actually buy, falling back to the cheapest overall when everything is sold out.
 *
 * This is the single source of truth, and it must stay that way. Product cards,
 * the price shown in listings, the price/rating sorts and the size preselected
 * on the product page all call this. When the card and the product page picked
 * their variant by different rules, a product whose cheapest size was sold out
 * advertised the unbuyable price on the card (with its discount badge) and then
 * showed a higher one on click.
 */
export function defaultVariant(product: Product): ProductVariant {
  const inStock = product.variants.filter((v) => v.stock > 0);
  // `variants` is a non-empty tuple, so `candidates` is never empty.
  const candidates = inStock.length > 0 ? inStock : product.variants;
  return candidates.reduce((lowest, v) =>
    v.priceInPaise < lowest.priceInPaise ? v : lowest,
  );
}

export function isInStock(product: Product): boolean {
  return product.variants.some((v) => v.stock > 0);
}

export function discountPercent(variant: ProductVariant): number {
  if (variant.mrpInPaise <= variant.priceInPaise) return 0;
  return Math.round(
    ((variant.mrpInPaise - variant.priceInPaise) / variant.mrpInPaise) * 100,
  );
}

// ---------------------------------------------------------------------------
// Sorting and filtering vocabulary (shared by the server page and the client
// sort control, hence its home in this data-free module)
// ---------------------------------------------------------------------------

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export function isSortOption(value: string | undefined): value is SortOption {
  return SORT_OPTIONS.some((o) => o.value === value);
}

export function isCategorySlug(
  value: string | undefined,
): value is CategorySlug {
  return CATEGORY_SLUGS.some((slug) => slug === value);
}

export type ListProductsOptions = {
  category?: CategorySlug;
  sort?: SortOption;
  inStockOnly?: boolean;
  maxPriceInPaise?: number;
};
