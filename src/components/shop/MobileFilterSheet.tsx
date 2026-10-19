"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SlidersHorizontal, X } from "lucide-react";

/** Everything that can hold focus inside the panel. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Tailwind's `lg`. The trigger and the sheet are both `lg:hidden`. */
const LG_QUERY = "(min-width: 1024px)";

function focusableWithin(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    // `hidden`/`display:none` descendants report no layout boxes.
    (element) => element.getClientRects().length > 0,
  );
}

/**
 * Bottom sheet that holds the shop filters below the `lg` breakpoint.
 *
 * The filter links themselves are passed in as `children` so that the server
 * component `ShopFilters` stays the single source of truth — the sheet owns
 * open/close behaviour only, never a second copy of the markup. Because every
 * child is a navigation link, a click anywhere inside the panel that lands on
 * an anchor closes the sheet (event delegation, since the children are server
 * rendered and cannot be handed an onClick).
 */
export function MobileFilterSheet({
  activeFilterCount,
  children,
}: {
  activeFilterCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      // `aria-modal="true"` promises the rest of the page is inert, so Tab has
      // to be kept inside the panel: without this, focus walks out behind the
      // scrim onto content the screen reader has been told is hidden and that
      // the body scroll lock makes unreachable.
      const panel = panelRef.current;
      if (!panel) return;

      const items = focusableWithin(panel);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        // Nothing tabbable inside: keep focus on the panel itself.
        event.preventDefault();
        panel.focus();
        return;
      }

      const active = document.activeElement;
      const inside = active instanceof Node && panel.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first || active === panel) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // Remember whatever the body already had so unmounting or closing never
    // leaves the page stuck, and never clobbers a value someone else set.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  // The trigger and the sheet are `lg:hidden`, but `open` and the body scroll
  // lock are not: widening past `lg` with the sheet open would otherwise hide
  // the panel and its close button while leaving the page unscrollable with no
  // way back. Closing on the breakpoint restores the scroll lock's cleanup.
  useEffect(() => {
    if (!open) return;

    const query = window.matchMedia(LG_QUERY);
    if (query.matches) {
      close();
      return;
    }

    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };
    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
    };
  }, [open, close]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen(true);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="border-line text-ink focus-visible:ring-brown flex min-h-10 items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters
        {activeFilterCount > 0 && (
          // Hidden from assistive tech: the sr-only line below says the same
          // thing in a sentence, and both would read as "Filters 1 1 filter
          // active".
          <span
            aria-hidden="true"
            className="bg-brown grid size-5 place-items-center rounded-full text-[11px] font-bold text-white"
          >
            {activeFilterCount}
          </span>
        )}
        <span className="sr-only">
          {activeFilterCount === 0
            ? "no filters active"
            : `${activeFilterCount} ${activeFilterCount === 1 ? "filter" : "filters"} active`}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={close}
            className="bg-ink/50 absolute inset-0 h-full w-full cursor-default"
          >
            <span className="sr-only">Close filters</span>
          </button>

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(event) => {
              if (
                event.target instanceof HTMLElement &&
                event.target.closest("a")
              ) {
                close();
              }
            }}
            className="border-line absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border-t bg-white shadow-xl focus:outline-none"
          >
            <div className="border-line flex items-center justify-between gap-2 border-b px-4 py-3">
              <h2 id={titleId} className="font-serif text-xl">
                Filter products
              </h2>
              <button
                type="button"
                onClick={close}
                className="text-muted hover:text-ink focus-visible:ring-brown grid size-10 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <X className="size-5" aria-hidden />
                <span className="sr-only">Close filters</span>
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
