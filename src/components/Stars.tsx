import { Star } from "lucide-react";
import { formatCount, formatRating } from "~/lib/format";

/** Read-only star rating. Rounds to the nearest half star. */
export function Stars({
  rating,
  reviewCount,
  size = "sm",
  showNumber = true,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showNumber?: boolean;
}) {
  const box = size === "sm" ? "size-3.5" : "size-4";
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex gap-0.5 text-amber-400"
        role="img"
        aria-label={`Rated ${formatRating(rating)} out of 5${
          reviewCount === undefined ? "" : ` from ${reviewCount} reviews`
        }`}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rounded >= i;
          const half = !filled && rounded >= i - 0.5;
          return (
            <span key={i} className="relative inline-block">
              <Star className={`${box} text-amber-400/30`} aria-hidden />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? "50%" : "100%" }}
                  aria-hidden
                >
                  <Star className={`${box} fill-current`} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showNumber && (
        // The wrapper above already announces "Rated 4.8 out of 5 from 412
        // reviews", so this visible copy is decorative for a screen reader.
        <span className="text-muted text-xs" aria-hidden="true">
          {formatRating(rating)}
          {reviewCount !== undefined && ` (${formatCount(reviewCount)})`}
        </span>
      )}
    </div>
  );
}
