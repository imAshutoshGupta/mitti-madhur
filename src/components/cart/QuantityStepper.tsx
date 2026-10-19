"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

/**
 * Quantity control for a cart line.
 *
 * At quantity 1 the decrement button becomes a remove button, which is what
 * people expect in a cart and avoids a dead-end control at the lower bound.
 */
export function QuantityStepper({
  quantity,
  max,
  label,
  onChange,
  onRemove,
  size = "md",
}: {
  quantity: number;
  max: number;
  /** Product name, used to make each button's accessible name unique. */
  label: string;
  onChange: (quantity: number) => void;
  onRemove: () => void;
  size?: "sm" | "md";
}) {
  // 40px at BOTH sizes. These were 32px in the drawer, 4px apart, with the
  // irreversible remove action sitting immediately next to "+" — a thumb
  // landing slightly left of "+" deleted the line instead of incrementing it.
  const box = "size-10";
  const icon = size === "sm" ? "size-3.5" : "size-4";
  const atMax = quantity >= max;
  const removing = quantity <= 1;

  return (
    <div className="border-line inline-flex items-center gap-1 rounded-full border bg-white p-1">
      <button
        type="button"
        onClick={() => (removing ? onRemove() : onChange(quantity - 1))}
        aria-label={
          removing
            ? `Remove ${label} from cart`
            : `Decrease quantity of ${label}`
        }
        className={`text-ink hover:bg-cream focus-visible:ring-brown grid ${box} place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none`}
      >
        {removing ? (
          <Trash2 className={icon} aria-hidden />
        ) : (
          <Minus className={icon} aria-hidden />
        )}
      </button>

      {/* Deliberately NOT a live region. The cart drawer carries the single
          debounced role="status"; a second polite region here meant every tap
          produced two queued announcements. An element with both aria-live and
          aria-label is also a trap: several screen readers read the accessible
          NAME instead of the live text, so the number went unspoken. */}
      <output
        aria-label={`Quantity of ${label}`}
        className="min-w-8 text-center text-sm font-semibold tabular-nums"
      >
        {quantity}
      </output>

      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={atMax}
        aria-label={
          atMax
            ? `Maximum quantity of ${label} reached`
            : `Increase quantity of ${label}`
        }
        className={`text-ink hover:bg-cream focus-visible:ring-brown grid ${box} place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <Plus className={icon} aria-hidden />
      </button>
    </div>
  );
}
