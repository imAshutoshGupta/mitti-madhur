import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Shared "nothing here" panel for empty search results, filters and the 404 page. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  /** Fires alongside navigation, e.g. so an overlay can close itself. */
  onAction?: () => void;
  /** Tighter padding and no border, for use inside a panel. */
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "grid place-items-center px-6 py-10 text-center"
          : "border-line bg-card grid place-items-center rounded-xl border px-6 py-16 text-center"
      }
    >
      <span className="bg-cream text-brown grid size-14 place-items-center rounded-full">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="text-ink mt-4 font-serif text-2xl">{title}</h2>
      <p className="text-muted mt-2 max-w-md text-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          onClick={onAction}
          className="bg-brown hover:bg-brown-dark focus-visible:ring-brown mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
