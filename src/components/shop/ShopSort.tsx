"use client";

import { useRouter } from "next/navigation";
import {
  SORT_OPTIONS,
  isSortOption,
  type CategorySlug,
  type SortOption,
} from "~/lib/products";
import { shopHref } from "~/lib/shop-url";

/**
 * Sort control for the shop grid.
 *
 * The active filters arrive as props rather than from `useSearchParams()`:
 * reading search params in a client component opts the whole route out of
 * static rendering, and the server page already has them parsed and
 * validated.
 *
 * The select lives inside a GET form pointed at `/shop`, so with JavaScript
 * disabled the browser can still submit it (via the `<noscript>` button) and
 * land on the correct URL. With JS, `onChange` navigates immediately.
 */
export function ShopSort({
  sort,
  category,
  inStockOnly,
}: {
  sort?: SortOption;
  category?: CategorySlug;
  inStockOnly: boolean;
}) {
  const router = useRouter();

  return (
    <form method="get" action="/shop" className="flex items-center gap-2">
      {category && <input type="hidden" name="category" value={category} />}
      {inStockOnly && <input type="hidden" name="stock" value="in" />}

      <label
        htmlFor="shop-sort"
        className="text-muted shrink-0 text-sm whitespace-nowrap"
      >
        Sort by
      </label>
      <select
        id="shop-sort"
        name="sort"
        value={sort ?? "featured"}
        onChange={(event) => {
          const next = event.target.value;
          router.push(
            shopHref({
              category,
              sort: isSortOption(next) ? next : undefined,
              inStockOnly,
            }),
          );
        }}
        className="border-line text-ink focus-visible:ring-brown min-h-10 rounded-full border bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <noscript>
        <button
          type="submit"
          className="bg-brown hover:bg-brown-dark focus-visible:ring-brown min-h-10 rounded-full px-4 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Apply
        </button>
      </noscript>
    </form>
  );
}
