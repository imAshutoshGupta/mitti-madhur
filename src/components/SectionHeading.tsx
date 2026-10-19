import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Shared section header with an optional "View All" style link.
 *
 * `href` has no default: a `"#"` fallback used to ship a dead link that also
 * scrolled to the top of the page. It stays optional only because two callers
 * (Recipes, Benefits) advertise a label for a destination that does not exist
 * yet — rather than render a link to nowhere, the label is simply not drawn
 * until those routes land. The link itself is `next/link`, so "View All" keeps
 * the client router instead of re-downloading the document.
 */
export function SectionHeading({
  eyebrow,
  title,
  linkLabel,
  href,
}: {
  eyebrow: string;
  title: string;
  linkLabel?: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div>
        <p className="text-accent text-xs font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h2 className="text-ink mt-1 font-serif text-3xl sm:text-4xl">
          {title}
        </h2>
      </div>
      {linkLabel && href && (
        <Link
          href={href}
          className="text-brown hover:text-brown-dark flex shrink-0 items-center gap-1 text-sm font-medium"
        >
          {linkLabel} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
