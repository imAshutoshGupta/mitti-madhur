import Link from "next/link";
import { Check } from "lucide-react";
import { type CategorySlug, type SortOption } from "~/lib/products";
import { categories } from "~/lib/products.data";
import { shopHref } from "~/lib/shop-url";

/**
 * Shop filters, rendered as plain links rather than client state.
 *
 * Every filter is a `next/link` that points at the same page with different
 * query params. That keeps `/shop` a server component (no `useSearchParams`,
 * no hydration of the catalogue), makes a filtered view shareable and
 * bookmarkable, and makes the browser Back button undo a filter the way a
 * user expects. The same markup is reused inside `MobileFilterSheet`.
 */

export type ShopFiltersProps = {
  category?: CategorySlug;
  sort?: SortOption;
  inStockOnly: boolean;
  counts: Record<CategorySlug, number>;
};

const LINK_BASE =
  "focus-visible:ring-brown flex min-h-10 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";
const LINK_ACTIVE = "bg-cream text-brown font-semibold";
const LINK_IDLE = "text-ink hover:bg-cream/70";

export function ShopFilters({
  category,
  sort,
  inStockOnly,
  counts,
}: ShopFiltersProps) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const anyFilterActive = category !== undefined || inStockOnly;

  return (
    <nav aria-label="Product filters" className="text-ink">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-xl">Filters</h2>
        {anyFilterActive && (
          <Link
            href="/shop"
            className="text-brown hover:text-brown-dark focus-visible:ring-brown rounded-full px-2 py-1 text-xs font-semibold underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Clear all
          </Link>
        )}
      </div>

      <section className="mt-4">
        <h3 className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
          Categories
        </h3>
        <ul className="mt-2 space-y-0.5">
          <li>
            <Link
              href={shopHref({ sort, inStockOnly })}
              aria-current={category === undefined ? "true" : undefined}
              className={`${LINK_BASE} ${category === undefined ? LINK_ACTIVE : LINK_IDLE}`}
            >
              <span>All Products</span>
              <span className="text-muted text-xs tabular-nums">{total}</span>
            </Link>
          </li>
          {categories.map((c) => {
            const active = c.slug === category;
            return (
              <li key={c.slug}>
                <Link
                  href={shopHref({ category: c.slug, sort, inStockOnly })}
                  aria-current={active ? "true" : undefined}
                  className={`${LINK_BASE} ${active ? LINK_ACTIVE : LINK_IDLE}`}
                >
                  <span>{c.name}</span>
                  <span className="text-muted text-xs tabular-nums">
                    {counts[c.slug]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-line mt-5 border-t pt-4">
        <h3 className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
          Availability
        </h3>
        <ul className="mt-2">
          <li>
            <Link
              href={shopHref({ category, sort, inStockOnly: !inStockOnly })}
              aria-current={inStockOnly ? "true" : undefined}
              className={`${LINK_BASE} ${inStockOnly ? LINK_ACTIVE : LINK_IDLE}`}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`grid size-4 shrink-0 place-items-center rounded border ${
                    inStockOnly
                      ? "border-brown bg-brown text-white"
                      : "border-line bg-white"
                  }`}
                >
                  {inStockOnly && <Check className="size-3" />}
                </span>
                In stock only
              </span>
              <span className="text-muted text-xs">
                {inStockOnly ? "On" : "Off"}
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </nav>
  );
}
