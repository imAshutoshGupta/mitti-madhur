import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="text-brown/25 font-serif text-7xl leading-none sm:text-8xl">
          404
        </p>

        <h1 className="text-ink mt-4 font-serif text-3xl sm:text-4xl">
          We couldn&rsquo;t find that page
        </h1>

        <p className="text-muted mt-3 max-w-md text-sm">
          The link may be out of date, or the page may have moved. Nothing is
          broken — let&rsquo;s get you back to something sweeter.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="bg-brown hover:bg-brown-dark focus-visible:ring-brown inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Back to home
          </Link>
          <Link
            href="/shop"
            className="border-line text-ink hover:border-brown hover:text-brown focus-visible:ring-brown inline-flex min-h-11 items-center justify-center rounded-full border bg-white px-6 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    </div>
  );
}
