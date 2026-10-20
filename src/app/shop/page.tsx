import { type Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { Breadcrumbs, type Crumb } from "~/components/Breadcrumbs";
import { EmptyState } from "~/components/EmptyState";
import { ProductCard } from "~/components/ProductCard";
import { MobileFilterSheet } from "~/components/shop/MobileFilterSheet";
import { ShopFilters } from "~/components/shop/ShopFilters";
import { ResultCountAnnouncer } from "~/components/shop/ResultCountAnnouncer";
import { ShopSort } from "~/components/shop/ShopSort";
import {
  isCategorySlug,
  isSortOption,
  type CategorySlug,
  type SortOption,
} from "~/lib/products";
import {
  getCategoryBySlug,
  getCategoryCounts,
  listProducts,
} from "~/lib/products.data";

type SearchParams = Record<string, string | string[] | undefined>;

type ShopPageProps = {
  /** Next.js 15 hands search params over as a promise. */
  searchParams: Promise<SearchParams>;
};

/** Next can hand back a repeated param as an array; the first entry wins. */
function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Anything unrecognised in the URL is ignored rather than thrown on, so a
 * hand-edited or stale link still renders the full catalogue.
 */
function parseFilters(params: SearchParams): {
  category: CategorySlug | undefined;
  sort: SortOption | undefined;
  inStockOnly: boolean;
} {
  const rawCategory = firstValue(params.category);
  const rawSort = firstValue(params.sort);
  return {
    category: isCategorySlug(rawCategory) ? rawCategory : undefined,
    sort: isSortOption(rawSort) ? rawSort : undefined,
    inStockOnly: firstValue(params.stock) === "in",
  };
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const { category } = parseFilters(await searchParams);
  const selected = category ? await getCategoryBySlug(category) : null;

  if (selected) {
    return {
      title: selected.name,
      description: selected.description,
    };
  }

  return {
    title: "Shop Jaggery",
    description:
      "Browse every MittiMadhur jaggery: blocks, powder, granules, liquid jaggery and flavoured blends, all chemical-free and sourced from trusted Indian farms.",
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, sort, inStockOnly } = parseFilters(await searchParams);

  const [products, counts, selectedCategory] = await Promise.all([
    listProducts({ category, sort, inStockOnly }),
    getCategoryCounts(),
    category ? getCategoryBySlug(category) : Promise.resolve(null),
  ]);

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
  ];
  if (selectedCategory) crumbs.push({ label: selectedCategory.name });

  const heading = selectedCategory ? selectedCategory.name : "Shop All Jaggery";
  const resultCount = `${products.length} ${products.length === 1 ? "product" : "products"}`;
  const activeFilterCount = (category ? 1 : 0) + (inStockOnly ? 1 : 0);

  const filters = (
    <ShopFilters
      category={category}
      sort={sort}
      inStockOnly={inStockOnly}
      counts={counts}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={crumbs} />

      <header className="mt-3 max-w-3xl">
        <h1 className="text-ink font-serif text-4xl sm:text-5xl">{heading}</h1>
        {selectedCategory && (
          <p className="text-muted mt-3 text-sm sm:text-base">
            {selectedCategory.description}
          </p>
        )}
      </header>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="sticky top-24 hidden w-64 shrink-0 self-start lg:block">
          {filters}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-line mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-3">
              <MobileFilterSheet activeFilterCount={activeFilterCount}>
                {filters}
              </MobileFilterSheet>
              {/*
                Visual only. A server-rendered live region never fires here —
                `loading.tsx` tears this subtree down on every filter change
                and the replacement arrives already populated, which does not
                announce. `ResultCountAnnouncer` is the spoken copy.
              */}
              <p
                aria-hidden="true"
                className="text-muted text-sm whitespace-nowrap"
              >
                {resultCount}
              </p>
              <ResultCountAnnouncer count={products.length} />
            </div>
            <ShopSort
              sort={sort}
              category={category}
              inStockOnly={inStockOnly}
            />
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products match those filters"
              description="Nothing in the catalogue fits this combination right now. Clear the filters to see everything we make."
              actionLabel="Clear all filters"
              actionHref="/shop"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  // Two cards per row at 375px, so only two are above the
                  // fold. Preloading four made the extra pair compete with
                  // the real LCP image.
                  priority={index < 2}
                  // Matches the ladder above, minus the 16rem sidebar and the
                  // gaps: 4 up at lg (~18vw, settling at a fixed 224px once
                  // max-w-7xl caps the container at 1280px), 3 up at sm, 2 up
                  // below that.
                  sizes="(min-width:1280px) 224px, (min-width:1024px) 18vw, (min-width:640px) 30vw, 45vw"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
