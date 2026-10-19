import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Shared "nothing here" panel for empty search results, filters and the 404 page. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="border-line bg-card grid place-items-center rounded-xl border px-6 py-16 text-center">
      <span className="bg-cream text-brown grid size-14 place-items-center rounded-full">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="text-ink mt-4 font-serif text-2xl">{title}</h2>
      <p className="text-muted mt-2 max-w-md text-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="bg-brown hover:bg-brown-dark mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
