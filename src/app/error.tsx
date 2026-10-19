"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

/**
 * Route-level error boundary. Next.js requires this to be a client component.
 *
 * We deliberately never render `error.message` or the stack: in production
 * React replaces the message with a generic string, but in development (and
 * for errors thrown in the browser) it is the raw text, which can leak server
 * internals. The `digest` is safe and is what support will ask for.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="bg-card border-line text-accent grid size-14 place-items-center rounded-full border">
          <AlertTriangle className="size-6" aria-hidden />
        </span>

        <h1 className="text-ink mt-5 font-serif text-3xl sm:text-4xl">
          Something went wrong on our end
        </h1>

        <p className="text-muted mt-3 max-w-md text-sm">
          This one is on us, not on you. Try again in a moment — if it keeps
          happening, head back home and we&rsquo;ll sort it out.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={reset}
            className="bg-brown hover:bg-brown-dark focus-visible:ring-brown inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border-line text-ink hover:border-brown hover:text-brown focus-visible:ring-brown inline-flex min-h-11 items-center justify-center rounded-full border bg-white px-6 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="text-muted mt-8 text-xs">
            Reference code: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  );
}
