import Link from "next/link";
import { type Metadata } from "next";
import { siteConfig } from "~/config/site";

export const metadata: Metadata = {
  title: "Order not found",
  // Same rule as the order page itself: this segment is never indexed.
  robots: { index: false, follow: false },
};

/**
 * Shown for any token the lookup does not resolve.
 *
 * The wording is identical whether the token never existed, was mistyped or
 * belongs to an order the visitor cannot see — saying which would turn this
 * page into an oracle for guessing other people's order links.
 */
export default function OrderNotFound() {
  return (
    <div className="bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <h1 className="text-ink font-serif text-3xl sm:text-4xl">
          We couldn&rsquo;t find that order
        </h1>

        <p className="text-muted mt-3 max-w-md text-sm leading-relaxed">
          The link may be incomplete or mistyped, or the order may have been
          placed on a different device or browser. Order links are private, so
          they only work exactly as they were given to you.
        </p>

        <p className="text-muted mt-3 max-w-md text-sm leading-relaxed">
          If you have your order number, email{" "}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="text-brown hover:text-brown-dark focus-visible:ring-brown rounded break-all underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {siteConfig.contact.email}
          </a>{" "}
          and we will look it up for you.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/shop"
            className="bg-brown hover:bg-brown-dark focus-visible:ring-brown inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Browse the shop
          </Link>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="border-line text-ink hover:border-brown hover:text-brown focus-visible:ring-brown inline-flex min-h-11 items-center justify-center rounded-full border bg-white px-6 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Email us
          </a>
        </div>
      </div>
    </div>
  );
}
