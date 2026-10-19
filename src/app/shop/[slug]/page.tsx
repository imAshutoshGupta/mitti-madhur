import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Flame, Leaf, Sprout, Truck } from "lucide-react";
import { Breadcrumbs } from "~/components/Breadcrumbs";
import { ProductCard } from "~/components/ProductCard";
import { Reveal } from "~/components/Reveal";
import { SectionHeading } from "~/components/SectionHeading";
import { ProductBuyBox } from "~/components/product/ProductBuyBox";
import { ProductDetailsTabs } from "~/components/product/ProductDetailsTabs";
import { ProductGallery } from "~/components/product/ProductGallery";
import { paiseToRupees, toJsonLd } from "~/lib/format";
import { type Product } from "~/lib/products";
import {
  categories,
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "~/lib/products.data";
import { shopHref } from "~/lib/shop-url";

const SITE_URL = "https://mittimadhur.in";

/**
 * Only claims that are true of the site as it stands today, and that the
 * homepage hero already makes, so the two cannot contradict each other.
 *
 * TODO(step 2/3): restore shipping and secure-checkout badges once those exist.
 */
const trustItems = [
  { icon: Leaf, title: "100% Natural", note: "No chemicals" },
  { icon: Sprout, title: "From Trusted Farmers", note: "Fair sourcing" },
  { icon: Truck, title: "Pan-India Delivery", note: "Safe & reliable" },
  { icon: Flame, title: "Traditionally Made", note: "Slow-cooked in batches" },
];

/**
 * The catalogue is a fixed list, so generateStaticParams below enumerates every
 * valid slug and anything else is a hard 404 from the router.
 *
 * Measured reason this is not left on the default `true`: with on-demand
 * rendering, a request for an unknown slug rendered notFound() and the result
 * was served as `200 OK` with `x-nextjs-cache: HIT`, which would let crawlers
 * index unlimited bogus URLs as real pages.
 *
 * Because the router rejects unknown slugs before entering this segment, a
 * segment-level not-found.tsx would be dead code — the root not-found.tsx
 * handles them instead. The notFound() call below is kept as a guard.
 *
 * TODO(step 5): when products come from the database this must become `true`
 * again (so new products resolve without a rebuild). When flipping it, verify
 * with `curl -I` that an unknown slug really returns 404 and not a cached 200,
 * and add a short `revalidate` so a deleted product stops being served.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await getAllProducts();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
      description: "This product is no longer available.",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | MittiMadhur`,
      description: product.shortDescription,
      url: `/shop/${product.slug}`,
      images: [{ url: product.images[0], alt: product.name }],
    },
  };
}

/** Schema.org Product, built entirely from the catalogue record. */
function buildJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((src) => `${SITE_URL}${src}`),
    sku: product.variants[0].sku,
    brand: { "@type": "Brand", name: "MittiMadhur" },
    category: categories.find((c) => c.slug === product.category)?.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.sku,
      name: `${product.name} — ${variant.label}`,
      url: `${SITE_URL}/shop/${product.slug}`,
      priceCurrency: "INR",
      price: paiseToRupees(variant.priceInPaise).toFixed(2),
      availability:
        variant.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    })),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const related = await getRelatedProducts(product, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(buildJsonLd(product)) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(category
              ? [
                  {
                    label: category.name,
                    href: shopHref({ category: category.slug }),
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} alt={product.name} />
          <ProductBuyBox product={product} />
        </div>

        <ul className="border-line mt-10 grid grid-cols-1 gap-x-8 gap-y-4 rounded-2xl border bg-white px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, note }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="text-leaf bg-cream grid size-9 shrink-0 place-items-center rounded-full">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-xs leading-tight">
                <span className="text-ink block font-semibold">{title}</span>
                <span className="text-muted">{note}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <ProductDetailsTabs product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <SectionHeading
            eyebrow="More to explore"
            title="You May Also Like"
            linkLabel="View All"
            href="/shop"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08} className="h-full">
                <ProductCard
                  product={p}
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
