// Money and display formatting.
//
// Prices are integer paise everywhere in this codebase. These helpers are the
// only place that should turn them into something a human reads.

/**
 * Group digits the Indian way: last three, then pairs. 1234567 -> "12,34,567".
 *
 * Written by hand rather than via Intl so that the server and the browser
 * always produce byte-identical output. Intl locale data can differ between
 * Node and a given browser, and a mismatch mid-render is a hydration error.
 */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

/** 12000 -> "₹120", 1234500 -> "₹12,345", 12050 -> "₹120.50" */
export function formatPrice(paise: number): string {
  // Fail loudly rather than rendering "₹NaN" to a customer. A non-finite value
  // here means a bug upstream (a Decimal object from a DB driver, a bad parse);
  // on a server-rendered page this surfaces as the error boundary, which is a
  // far better outcome than a live storefront quietly showing a broken price.
  if (!Number.isFinite(paise)) {
    throw new TypeError(
      `formatPrice: expected a finite number, got ${String(paise)}`,
    );
  }
  const negative = paise < 0;
  const abs = Math.round(Math.abs(paise));
  const rupees = Math.floor(abs / 100);
  const remainder = abs % 100;
  const body =
    groupIndian(String(rupees)) +
    (remainder === 0 ? "" : "." + String(remainder).padStart(2, "0"));
  return `${negative ? "-" : ""}₹${body}`;
}

/** Paise -> whole rupees, for places that need a number rather than a string. */
export function paiseToRupees(paise: number): number {
  if (!Number.isFinite(paise)) {
    throw new TypeError(
      `paiseToRupees: expected a finite number, got ${String(paise)}`,
    );
  }
  return paise / 100;
}

/** "4.8" — one decimal place, no trailing ".0" surprises. */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** 412 -> "412", 1250 -> "1.3k" (one decimal, rounded) */
export function formatCount(count: number): string {
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

/**
 * Serialise a value for embedding in a <script type="application/ld+json">.
 *
 * `JSON.stringify` escapes quotes and backslashes but NOT `<`, `>` or `/`, and
 * `dangerouslySetInnerHTML` escapes nothing. The HTML parser ends a <script>
 * element at the first literal `</script`, regardless of JSON string context —
 * so a product description containing `</script><script>…` would close the
 * block early and execute as markup.
 *
 * That is harmless while the catalogue is author-written TypeScript, but these
 * pages are statically generated, so once the data is admin- or supplier-fed
 * the payload would be baked into a cached HTML file served to every visitor.
 * `\u003c` is valid JSON, so consumers (including Google's parser) read the
 * identical string. Use this for EVERY JSON-LD block.
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** IST is UTC+5:30 and has no DST, so this is a true constant. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * "2026-10-20" or "2026-10-20T19:05:00.000Z" -> "20 October 2026".
 *
 * Hand-rolled rather than `toLocaleDateString` for the same reason as
 * `formatPrice`: Intl locale data can differ between Node and a browser, and a
 * mismatch mid-render is a hydration error.
 *
 * A full timestamp is shifted into IST first. Orders are stored as UTC, so one
 * placed at 00:30 IST would otherwise display as the previous day to every
 * Indian customer looking at it.
 *
 * Returns null for anything unparseable, so callers decide the fallback rather
 * than rendering "Invalid Date".
 */
export function formatIndianDate(iso: string): string | null {
  // A date-only string has no timezone, so read it literally; shifting it
  // would move it a day.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    const name = MONTHS[Number(month) - 1];
    return name ? `${Number(day)} ${name} ${year}` : null;
  }

  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  const ist = new Date(ms + IST_OFFSET_MS);
  const name = MONTHS[ist.getUTCMonth()];
  return name ? `${ist.getUTCDate()} ${name} ${ist.getUTCFullYear()}` : null;
}
