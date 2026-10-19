import type { ReactNode } from "react";
import { Breadcrumbs } from "~/components/Breadcrumbs";
import { formatIndianDate } from "~/lib/format";

/**
 * Shared shell for the four policy pages.
 *
 * No @tailwindcss/typography in this project, so readable prose defaults are
 * set here once rather than being re-typed on every heading in four files.
 */
export function PolicyPage({
  title,
  intro,
  lastUpdated,
  children,
}: {
  title: string;
  intro: string;
  /** ISO date. Rendered deterministically — never toLocaleDateString. */
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />

      <h1 className="text-ink mt-3 font-serif text-4xl sm:text-5xl">{title}</h1>
      <p className="text-ink/80 mt-4 text-base leading-relaxed">{intro}</p>
      <p className="text-muted mt-2 text-xs">
        Last updated {formatIndianDate(lastUpdated) ?? lastUpdated}
      </p>

      <div
        className={[
          "mt-8 space-y-6 text-sm leading-relaxed",
          "[&_h2]:text-ink [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl",
          "[&_h3]:text-ink [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold",
          "[&_p]:text-ink/80",
          "[&_ul]:text-ink/80 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
          "[&_ol]:text-ink/80 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
          "[&_a]:text-brown [&_a]:underline [&_a]:underline-offset-4",
          "[&_strong]:text-ink [&_strong]:font-semibold",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
