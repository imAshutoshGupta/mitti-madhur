import { type CategorySlug, type SortOption } from "./products";

export type ShopFilters = {
  category?: CategorySlug;
  sort?: SortOption;
  inStockOnly?: boolean;
};

/**
 * The ONE place a /shop URL is built.
 *
 * Every filter link, the sort control, the footer, the homepage category tiles
 * and the product-page breadcrumb go through this. Previously two components
 * carried byte-identical copies of this logic and four more interpolated
 * `?category=${slug}` by hand, which meant a new filter dimension would have
 * been silently dropped by whichever site forgot it — resetting the customer's
 * other filters on navigation.
 *
 * `featured` is the default sort and is omitted, so the cleared URL is exactly
 * `/shop` rather than `/shop?sort=featured`.
 */
export function shopHref({ category, sort, inStockOnly }: ShopFilters): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (sort && sort !== "featured") params.set("sort", sort);
  if (inStockOnly) params.set("stock", "in");
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}
