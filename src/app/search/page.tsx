import Link from "next/link";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { Breadcrumbs } from "~/components/Breadcrumbs";
import { EmptyState } from "~/components/EmptyState";
import { ProductCard } from "~/components/ProductCard";
import { SearchBox } from "~/components/search/SearchBox";
import { getAllCategories, searchProducts } from "~/lib/products.data";
import { shopHref } from "~/lib/shop-url";

export const metadata: Metadata = {
  title: "Search",
  // Result pages are infinite and thin; keep them out of the index but let
  // crawlers follow through to the product pages they link to.
  robots: { index: false, follow: true },
};

/** Longest query we will echo back on screen. Anything past this is elided. */
const MAX_DISPLAY_QUERY = 72;

/**
 * Hard cap applied BEFORE the query reaches the data layer — not a display
 * concern.
 *
 * Two reasons it belongs on the server side of the boundary: it bounds the
 * cache-key space (an unbounded `q` gives an attacker an unlimited supply of
 * unique URLs, every one of which misses any CDN cache and reaches the
 * origin), and it bounds the cost of the query itself once `searchProducts`
 * is a database call rather than a scan of ~17 objects in memory. Collapsing
 * internal whitespace does the same job for `?q=a++++++b`-style padding: it
 * normalises many URLs onto one key.
 *
 * 128 characters is far beyond any real product query (the longest product
 * name in the catalogue is ~40).
 */
const MAX_QUERY = 128;

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** trim -> collapse internal whitespace -> cap length. */
function normaliseQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY).trim();
}

async function CategoryLinks({ label }: { label: string }) {
  const categories = await getAllCategories();
  return (
    <div>
      <h2 className="text-muted text-sm font-medium">{label}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={shopHref({ category: c.slug })}
              className="border-line hover:border-brown hover:text-brown focus-visible:ring-brown inline-flex min-h-10 items-center rounded-full border bg-white px-4 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = normaliseQuery(firstParam(params.q));

  // Display truncation is separate from (and tighter than) MAX_QUERY: it is
  // about the line not blowing out, not about cost. Rendered as a plain React
  // text child, so React escapes it for us, and the `break-words` below
  // handles a single very long unbroken token.
  const displayQuery =
    query.length > MAX_DISPLAY_QUERY
      ? `${query.slice(0, MAX_DISPLAY_QUERY)}…`
      : query;

  const results = query ? await searchProducts(query) : [];

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Search" }]}
        />

        <h1 className="text-ink mt-4 font-serif text-4xl">Search</h1>

        <div className="mt-6 max-w-2xl">
          <SearchBox defaultQuery={query} />
        </div>

        {!query ? (
          <div className="mt-10 space-y-8">
            <p className="text-muted max-w-xl text-sm">
              Type what you are after — a format like powder or granules, a
              flavour like cardamom, or just “jaggery” — and we will find it.
            </p>
            <CategoryLinks label="Browse by category" />
            <p className="text-sm">
              <Link
                href="/shop"
                className="text-brown hover:text-brown-dark focus-visible:ring-brown inline-flex min-h-10 items-center font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
              >
                Or browse all products
              </Link>
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="mt-10 space-y-8">
            <EmptyState
              icon={SearchX}
              title="No matches found"
              description={`Nothing in the catalogue matches “${displayQuery}”. Try a shorter or more general word — or browse the full range.`}
              actionLabel="Browse all products"
              actionHref="/shop"
            />
            <CategoryLinks label="You might be looking for" />
          </div>
        ) : (
          <>
            <p className="text-muted mt-8 text-sm break-words">
              {results.length === 1 ? "1 result" : `${results.length} results`}{" "}
              for <span className="text-ink font-medium">“{displayQuery}”</span>
            </p>

            {/*
              The cards emit <h3>, and this page's only other heading is the
              <h1>; without this the outline skips a level. Visually hidden
              because the result count above already says the same thing.
            */}
            <h2 className="sr-only">Search results</h2>

            {/*
              The ladder below is 2/3/5 columns; ProductCard's default `sizes`
              ("(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw") is the
              matching one, so no override is passed. Only the first two cards
              are above the fold at 375px, so only those two preload.
            */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {results.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={i < 2}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
