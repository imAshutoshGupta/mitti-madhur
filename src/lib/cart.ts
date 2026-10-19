// Cart state, reducer and pure money helpers.
//
// Client-safe: no catalogue data, no server imports.
//
// DESIGN NOTE — what is persisted.
// A cart line stores ONLY { sku, quantity }. It deliberately does not store
// the price, name or image. Everything a line displays, and every rupee of the
// total, is re-resolved from `CartCatalogue` on each render, and that catalogue
// is built on the server. So a price change, a rename or a stock movement is
// picked up immediately, and a customer can never check out against a stale
// price they happen to have in localStorage from last week. When a real backend
// arrives the same rule holds: the client sends SKUs and quantities, the server
// decides what they cost. The full set of server-side checks that checkout
// must perform is written down in docs/CHECKOUT-SECURITY.md — read it before
// writing any order or payment code.
//
// The persisted value must keep holding ONLY { savedAt, lines:[{sku,quantity}] }.
// No name, phone, email or address: those belong in a server-side session
// behind an HttpOnly cookie, not in storage any script on the origin can read.

/** Hard cap per line, regardless of how deep stock is. */
export const MAX_PER_LINE = 10;

/** Bumped if the persisted shape ever changes, so old carts are discarded. */
const STORAGE_KEY = "mm.cart.v2";
const LEGACY_STORAGE_KEYS = ["mm.cart.v1"];

/** A cart older than this is forgotten rather than resurrected. */
const MAX_CART_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** Everything the browser needs to render and price one SKU. Server-provided. */
export type CartSku = {
  sku: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  image: string;
  priceInPaise: number;
  mrpInPaise: number;
  /**
   * How many of this SKU one order may contain: min(stock, MAX_PER_LINE).
   *
   * Deliberately NOT the raw stock figure. This object is serialised into every
   * page, so shipping real inventory counts would publish per-SKU stock levels
   * site-wide — poll the homepage hourly and the deltas are your sales volume.
   * Clamped to 0..MAX_PER_LINE, which is all the UI ever needed.
   */
  maxPerLine: number;
};

export type CartCatalogue = Record<string, CartSku>;

export type CartLine = { sku: string; quantity: number };

/** A line storage offered that the cart could not honour, and why. */
export type RemovedCartLine = {
  sku: string;
  name: string;
  reason: "out-of-stock" | "unavailable" | "reduced";
  /** Quantity actually kept (0 when the line was dropped entirely). */
  quantity: number;
};

export type CartState = { lines: CartLine[]; removed: RemovedCartLine[] };

export const emptyCart: CartState = { lines: [], removed: [] };

export type CartAction =
  | { type: "add"; sku: string; quantity: number }
  | { type: "setQuantity"; sku: string; quantity: number }
  | { type: "remove"; sku: string }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] }
  /** Re-clamp the existing lines, e.g. after the catalogue changed. */
  | { type: "reconcile" }
  | { type: "dismissNotice" };

/**
 * Look a SKU up WITHOUT walking the prototype chain.
 *
 * `catalogue[sku]` on a plain object resolves inherited members, so a SKU of
 * "toString" or "constructor" returns a truthy function, sails past an
 * `if (!item)` guard and produces NaN totals. No caller can supply such a SKU
 * today (they are all server-written literals), but a "buy it again" list or
 * an `?add=<sku>` deep link would make `?add=toString` a one-click crash.
 */
export function lookupSku(
  catalogue: CartCatalogue,
  sku: string,
): CartSku | undefined {
  if (!Object.hasOwn(catalogue, sku)) return undefined;
  const item = catalogue[sku];
  // Guard the shape too: this object crossed the server/client boundary.
  return item && typeof item.priceInPaise === "number" ? item : undefined;
}

/** Highest quantity allowed for a SKU: its stock, capped by the per-line limit. */
export function maxQuantityFor(item: CartSku | undefined): number {
  if (!item || !Number.isFinite(item.maxPerLine)) return 0;
  return Math.max(0, Math.min(item.maxPerLine, MAX_PER_LINE));
}

/**
 * The reducer needs the catalogue to clamp against live stock, so it is built
 * per-catalogue rather than being a bare function.
 *
 * Every path clamps. An unknown or out-of-stock SKU is dropped rather than
 * stored, so a cart can never hold something unbuyable. Anything dropped or
 * reduced is recorded in `state.removed` so the UI can SAY so — silently
 * deleting a line a customer added yesterday, and overwriting storage so the
 * evidence is gone, is not acceptable behaviour.
 */
export function makeCartReducer(catalogue: CartCatalogue) {
  const clamp = (sku: string, quantity: number): number => {
    if (!Number.isFinite(quantity)) return 0;
    return Math.min(
      Math.max(0, Math.trunc(quantity)),
      maxQuantityFor(lookupSku(catalogue, sku)),
    );
  };

  /** Re-clamp a whole list, reporting what had to change. */
  const reconcile = (incoming: CartLine[]): CartState => {
    const lines: CartLine[] = [];
    const removed: RemovedCartLine[] = [];
    for (const line of incoming) {
      if (lines.some((l) => l.sku === line.sku)) continue;
      const item = lookupSku(catalogue, line.sku);
      const quantity = clamp(line.sku, line.quantity);
      if (quantity > 0) {
        lines.push({ sku: line.sku, quantity });
        if (quantity < Math.trunc(line.quantity)) {
          removed.push({
            sku: line.sku,
            name: item
              ? `${item.productName} (${item.variantLabel})`
              : line.sku,
            reason: "reduced",
            quantity,
          });
        }
        continue;
      }
      // Only report a genuine loss, not a line that was already zero.
      if (Math.trunc(line.quantity) > 0) {
        removed.push({
          sku: line.sku,
          name: item ? `${item.productName} (${item.variantLabel})` : line.sku,
          reason: item ? "out-of-stock" : "unavailable",
          quantity: 0,
        });
      }
    }
    return { lines, removed };
  };

  return function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
      case "add": {
        const existing = state.lines.find((l) => l.sku === action.sku);
        const wanted = (existing?.quantity ?? 0) + action.quantity;
        const quantity = clamp(action.sku, wanted);
        // `!(q > 0)` rather than `q === 0` so a NaN fails CLOSED.
        if (!(quantity > 0)) return state;
        return {
          ...state,
          lines: existing
            ? state.lines.map((l) =>
                l.sku === action.sku ? { ...l, quantity } : l,
              )
            : [...state.lines, { sku: action.sku, quantity }],
        };
      }
      case "setQuantity": {
        const quantity = clamp(action.sku, action.quantity);
        if (!(quantity > 0)) {
          return {
            ...state,
            lines: state.lines.filter((l) => l.sku !== action.sku),
          };
        }
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.sku === action.sku ? { ...l, quantity } : l,
          ),
        };
      }
      case "remove":
        return {
          ...state,
          lines: state.lines.filter((l) => l.sku !== action.sku),
        };
      case "clear":
        return emptyCart;
      case "hydrate":
        // Storage is untrusted: it may hold SKUs that no longer exist, or
        // quantities above what is now in stock.
        return reconcile(action.lines);
      case "reconcile": {
        // The catalogue changed under a cart that is already loaded.
        //
        // Notices MERGE rather than replace. This action fires right after
        // hydrate (the `hydrated` flag flips and the catalogue effect runs),
        // and hydrate's lines are already clamped, so a replacing reconcile
        // produced an empty `removed` and silently wiped the very notice
        // hydrate had just raised.
        const next = reconcile(state.lines);
        const merged = [...state.removed];
        for (const entry of next.removed) {
          if (!merged.some((r) => r.sku === entry.sku)) merged.push(entry);
        }
        return { lines: next.lines, removed: merged };
      }
      case "dismissNotice":
        return state.removed.length === 0 ? state : { ...state, removed: [] };
    }
  };
}

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

export type ResolvedCartLine = {
  sku: string;
  quantity: number;
  item: CartSku;
  lineTotalInPaise: number;
  lineMrpTotalInPaise: number;
};

/** Join cart lines against the catalogue, dropping anything unresolvable. */
export function resolveCart(
  state: CartState,
  catalogue: CartCatalogue,
): ResolvedCartLine[] {
  const resolved: ResolvedCartLine[] = [];
  for (const line of state.lines) {
    const item = lookupSku(catalogue, line.sku);
    if (!item) continue;
    resolved.push({
      sku: line.sku,
      quantity: line.quantity,
      item,
      lineTotalInPaise: item.priceInPaise * line.quantity,
      lineMrpTotalInPaise: item.mrpInPaise * line.quantity,
    });
  }
  return resolved;
}

export type CartTotals = {
  itemCount: number;
  subtotalInPaise: number;
  mrpTotalInPaise: number;
  savingsInPaise: number;
};

/** All integer paise in, all integer paise out — no rounding anywhere. */
export function cartTotals(lines: ResolvedCartLine[]): CartTotals {
  let itemCount = 0;
  let subtotalInPaise = 0;
  let mrpTotalInPaise = 0;
  for (const line of lines) {
    itemCount += line.quantity;
    subtotalInPaise += line.lineTotalInPaise;
    mrpTotalInPaise += line.lineMrpTotalInPaise;
  }
  return {
    itemCount,
    subtotalInPaise,
    mrpTotalInPaise,
    savingsInPaise: Math.max(0, mrpTotalInPaise - subtotalInPaise),
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/**
 * Read the stored cart.
 *
 * Everything here is defensive on purpose: localStorage throws in private mode
 * and when site data is blocked, the JSON may be anything, and the value may
 * have been hand-edited. A bad read returns an empty cart rather than throwing
 * and taking the whole page down with it.
 */
export function readStoredCart(): CartLine[] {
  try {
    // Any older-format cart is dropped rather than migrated; the shapes are
    // small and pre-launch, and a bad migration is worse than an empty cart.
    for (const legacy of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(legacy);
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return [];
    }

    const { savedAt, lines } = parsed as Record<string, unknown>;

    // A cart abandoned months ago should not reappear, especially on a shared
    // device where the next person did not put it there.
    if (typeof savedAt !== "number" || !Number.isFinite(savedAt)) return [];
    if (Date.now() - savedAt > MAX_CART_AGE_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    if (!Array.isArray(lines)) return [];
    const result: CartLine[] = [];
    for (const entry of lines) {
      if (typeof entry !== "object" || entry === null) continue;
      const { sku, quantity } = entry as Record<string, unknown>;
      if (typeof sku !== "string" || sku.length === 0) continue;
      if (typeof quantity !== "number" || !Number.isFinite(quantity)) continue;
      result.push({ sku, quantity: Math.trunc(quantity) });
    }
    return result;
  } catch {
    return [];
  }
}

export function writeStoredCart(lines: CartLine[]): void {
  try {
    if (lines.length === 0) {
      // Don't leave an empty record behind, and don't create one on a pristine
      // visit where the customer has touched nothing.
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), lines }),
    );
  } catch {
    // Quota exceeded or storage blocked. The in-memory cart still works for
    // this session, which is better than breaking the page over a failed write.
  }
}

/** Exported so other tabs can be listened to by key. */
export const CART_STORAGE_KEY = STORAGE_KEY;
