import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  checkoutCartSchema,
  shippingAddressSchema,
  type CheckoutFieldErrors,
  type PlaceOrderResult,
} from "./checkout";
import { formatPrice } from "./format";
import { orderTotals, type Order, type OrderLine } from "./orders";
import { products } from "./products.data";

/**
 * Order persistence.
 *
 * DEV STORE — a JSON file under .data/ (gitignored). It exists so the whole
 * checkout flow is genuinely end-to-end today: an order is written, read back
 * by the confirmation page, and survives a dev-server restart.
 *
 * It is NOT production storage. It has no transactions, so the atomic stock
 * reservation that docs/CHECKOUT-SECURITY.md requires cannot be implemented
 * here — see the note in `createOrder`. Step 5 replaces the two functions at
 * the bottom of this file with database calls and nothing else changes.
 *
 * A serverless filesystem is read-only apart from /tmp, so this will not
 * persist on Vercel. That is fine for a pre-database build and is exactly why
 * it is marked temporary.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

/**
 * Serialises read-modify-write so two concurrent orders cannot clobber each
 * other's file. Single-process only — another reason this is not production
 * storage.
 */
let writeChain: Promise<unknown> = Promise.resolve();
function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.catch(() => undefined);
  return run;
}

/** Refuse to grow without bound while this is a flat file. */
const MAX_STORED_ORDERS = 5_000;
/** Cap on COD orders from one phone number per day. */
const MAX_ORDERS_PER_PHONE_PER_DAY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Read the store.
 *
 * Distinguishes "no file yet" from "file is unreadable" and THROWS on the
 * latter. Returning [] for a corrupt file was actively dangerous: the next
 * append would write a one-element array over the top and silently destroy
 * every order already taken.
 */
async function readAll(): Promise<Order[]> {
  let raw: string;
  try {
    raw = await readFile(ORDERS_FILE, "utf8");
  } catch (error) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return []; // genuinely empty: no order has ever been placed
    }
    throw error;
  }
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Order store is not an array; refusing to overwrite it");
  }
  return parsed as Order[];
}

/**
 * Append atomically: write a temp file, then rename over the target.
 *
 * `writeFile` truncates before writing, so a crash mid-write (deploy, SIGKILL,
 * full disk) leaves a half-written file. rename(2) is atomic on POSIX, so a
 * reader sees either the old complete file or the new one, never a torn one.
 */
async function persist(all: Order[]): Promise<void> {
  if (all.length > MAX_STORED_ORDERS) {
    throw new Error("Order store is full");
  }
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${ORDERS_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(all), "utf8");
  await rename(tmp, ORDERS_FILE);
}

/** Human-facing: MM-7K2QF4H9. Avoids I/O/0/1 so it can be read aloud. */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function orderNumber(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return `MM-${out}`;
}

// ---------------------------------------------------------------------------
// Order creation
// ---------------------------------------------------------------------------

export type CreateOrderInput = {
  address: unknown;
  cart: unknown;
  /**
   * Stable per-attempt key from the client.
   *
   * If the write succeeded but the response was lost (timeout, dropped mobile
   * connection), the customer retries and would otherwise place a SECOND real
   * COD order — two deliveries and two cash collections to unwind by phone.
   * Replaying the same key returns the original order instead.
   */
  idempotencyKey?: unknown;
  /**
   * The total the customer actually saw on the button, in paise.
   *
   * Used ONLY to detect that the page priced the order differently from the
   * server — never to price anything. On a mismatch the order is REJECTED and
   * the customer re-reviews. This is not a violation of the "never trust a
   * client-sent total" rule: the number is compared, never charged, and a
   * rejection reveals nothing the catalogue does not already show publicly.
   */
  expectedTotalInPaise?: unknown;
};

/**
 * Turn a cart into an order, trusting the client for NOTHING but SKUs and
 * quantities.
 *
 * Implements as much of docs/CHECKOUT-SECURITY.md as is possible without a
 * database. Specifically implemented here: shape validation (reject, never
 * coerce), duplicate rejection, server-side SKU resolution, server-side price
 * re-read, server-side total recomputation, and a stock check.
 *
 * NOT implemented, and blocking before real money: the atomic stock
 * RESERVATION of step 5 in that document. The check below is a plain
 * read-then-write, so two simultaneous orders for the last pack can both
 * succeed. That needs a transactional conditional decrement, which needs the
 * database.
 */
export async function createOrder({
  address,
  cart,
  idempotencyKey,
  expectedTotalInPaise,
}: CreateOrderInput): Promise<PlaceOrderResult> {
  const errors: CheckoutFieldErrors = {};

  const parsedAddress = shippingAddressSchema.safeParse(address);
  if (!parsedAddress.success) {
    for (const issue of parsedAddress.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !Object.hasOwn(errors, field)) {
        errors[field as keyof CheckoutFieldErrors] = issue.message;
      }
    }
    // A root-level issue (address is a string, null, an array) has an empty
    // path, so the loop above records nothing. Never return a failure with no
    // message — the form has nothing to show and the customer sees the button
    // do nothing at all.
    if (Object.keys(errors).length === 0) {
      errors.form =
        "We could not read those delivery details. Please check the form and try again.";
    }
  }

  const parsedCart = checkoutCartSchema.safeParse(cart);
  if (!parsedCart.success) {
    errors.cart = parsedCart.error.issues[0]?.message ?? "Your cart is invalid";
  }

  if (!parsedAddress.success || !parsedCart.success) {
    return { ok: false, errors };
  }

  // Duplicates are rejected rather than summed: a client that sends the same
  // SKU twice is not a client we should be guessing the intent of.
  const seen = new Set<string>();
  for (const line of parsedCart.data) {
    if (seen.has(line.sku)) {
      return {
        ok: false,
        errors: { cart: "That cart contains duplicate items" },
      };
    }
    seen.add(line.sku);
  }

  // Resolve against the real catalogue. Prices come from HERE, never from the
  // request body.
  const lines: OrderLine[] = [];
  let subtotalInPaise = 0;
  let mrpTotalInPaise = 0;

  for (const requested of parsedCart.data) {
    const product = products.find((p) =>
      p.variants.some((v) => v.sku === requested.sku),
    );
    const variant = product?.variants.find((v) => v.sku === requested.sku);
    if (!product || !variant) {
      return {
        ok: false,
        errors: { cart: "An item in your cart is no longer available" },
      };
    }
    if (variant.stock < requested.quantity) {
      return {
        ok: false,
        errors: {
          cart:
            variant.stock === 0
              ? `${product.name} (${variant.label}) is out of stock`
              : `Only ${variant.stock} of ${product.name} (${variant.label}) left`,
        },
      };
    }

    const lineTotalInPaise = variant.priceInPaise * requested.quantity;
    subtotalInPaise += lineTotalInPaise;
    mrpTotalInPaise += variant.mrpInPaise * requested.quantity;

    lines.push({
      sku: variant.sku,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant.label,
      image: product.images[0],
      unitPriceInPaise: variant.priceInPaise,
      mrpInPaise: variant.mrpInPaise,
      quantity: requested.quantity,
      lineTotalInPaise,
    });
  }

  const { shippingInPaise, totalInPaise } = orderTotals(subtotalInPaise);

  // The catalogue is baked into a prerendered page, so a customer can be
  // looking at a total from before the last deploy. Without this check the
  // rider simply asks for a different amount than the button promised — and
  // this is Cash on Delivery, so there is no payment step to catch it.
  if (
    typeof expectedTotalInPaise === "number" &&
    Number.isFinite(expectedTotalInPaise) &&
    expectedTotalInPaise !== totalInPaise
  ) {
    return {
      ok: false,
      errors: {
        cart: `Prices changed since you opened this page. The total is now ${formatPrice(totalInPaise)} — please review it and place the order again.`,
      },
    };
  }

  const key =
    typeof idempotencyKey === "string" &&
    /^[A-Za-z0-9-]{8,64}$/.test(idempotencyKey)
      ? idempotencyKey
      : undefined;

  // Everything that has to see a consistent store — the idempotency replay,
  // the per-phone cap, the order-number uniqueness check and the write — runs
  // inside one lock, so two concurrent submissions cannot each miss the other.
  try {
    return await withLock(async () => {
      const all = await readAll();

      if (key) {
        const existing = all.find((o) => o.idempotencyKey === key);
        if (existing) {
          return {
            ok: true as const,
            token: existing.token,
            orderNumber: existing.orderNumber,
          };
        }
      }

      // Application-level COD backstop. IP rate limiting belongs at the edge
      // (see the note in actions.ts) and does not stop a botnet; capping by
      // phone number is the control that actually bites for Cash on Delivery,
      // because every real order needs a reachable number.
      const since = Date.now() - DAY_MS;
      const fromPhone = all.filter(
        (o) =>
          o.address.phone === parsedAddress.data.phone &&
          Date.parse(o.placedAt) >= since,
      ).length;
      if (fromPhone >= MAX_ORDERS_PER_PHONE_PER_DAY) {
        return {
          ok: false as const,
          errors: {
            form: "We have already taken several orders from this number today. Please call us to place another.",
          },
        };
      }

      // The order number is read back to customers over the phone, so a
      // collision would pull up a stranger's order. Cheap to check here.
      let number = orderNumber();
      for (let i = 0; i < 5 && all.some((o) => o.orderNumber === number); i++) {
        number = orderNumber();
      }

      const order: Order = {
        orderNumber: number,
        token: randomBytes(16).toString("hex"),
        placedAt: new Date().toISOString(),
        status: "pending",
        paymentMethod: "cod",
        address: parsedAddress.data,
        lines,
        subtotalInPaise,
        shippingInPaise,
        totalInPaise,
        savingsInPaise: Math.max(0, mrpTotalInPaise - subtotalInPaise),
        idempotencyKey: key,
      };

      all.push(order);
      await persist(all);
      return {
        ok: true as const,
        token: order.token,
        orderNumber: order.orderNumber,
      };
    });
  } catch {
    // A full or unreadable store must never look like a successful order.
    return {
      ok: false,
      errors: {
        form: "We could not record your order just now. Please try again, or call us to order by phone.",
      },
    };
  }
}

// ---------------------------------------------------------------------------
// The function step 5 swaps for a database call
// ---------------------------------------------------------------------------

/**
 * Look up an order by its URL token.
 *
 * Takes the same lock as the writer: an unlocked read could land between the
 * temp-file write and the rename and see a stale or missing file, showing a
 * real customer "Order not found" for an order that exists.
 *
 * There is deliberately NO getOrderByNumber. The order number is short enough
 * to enumerate (and the endpoint is unmetered), so a lookup keyed on it would
 * hand out strangers' names, phones and addresses. If a "track my order" page
 * is ever added it needs a second factor and rate limiting.
 */
export async function getOrderByToken(token: string): Promise<Order | null> {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  try {
    const all = await withLock(() => readAll());
    return all.find((order) => order.token === token) ?? null;
  } catch {
    return null;
  }
}
