// Keyboard and scroll helpers for the site's modal panels (the cart drawer and
// the mobile filter sheet).
//
// Each panel keeps its own open/close effect, so its whole lifecycle — and the
// order its cleanup runs in — reads in one place. These are the parts that
// used to be copied between them.

/** Everything that can hold focus. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keep Tab and Shift+Tab cycling inside `panel`. Call it from a keydown
 * handler when the key is Tab.
 *
 * `aria-modal="true"` promises the rest of the page is inert, so focus must not
 * walk out behind the scrim onto content the screen reader has been told is
 * hidden and the scroll lock has made unreachable.
 */
export function trapTabKey(event: KeyboardEvent, panel: HTMLElement): void {
  // Queried on every Tab rather than cached: removing a cart line or hitting a
  // stock cap changes which controls exist while the panel is open.
  // `hidden`/`display:none` descendants report no layout boxes.
  const items = Array.from(
    panel.querySelectorAll<HTMLElement>(FOCUSABLE),
  ).filter((element) => element.getClientRects().length > 0);
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
}

/**
 * Stop the page behind a modal from scrolling. Returns the function that
 * undoes it. That restores whatever value was there before rather than
 * clearing it, so closing never clobbers a value something else set.
 */
export function lockBodyScroll(): () => void {
  const previous = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = previous;
  };
}
