// Order types and pricing rules.
//
// Client-safe: no data, no server imports. The repository and the order
// creation logic live in ./orders.data.ts, which is `server-only`.
//
// All money is integer paise. See docs/CHECKOUT-SECURITY.md for the checks the
// server must perform before any of this can take real payments.

import { siteConfig } from "~/config/site";
import { type ShippingAddress } from "./checkout";

// The rates themselves live in src/config/site.ts.
const { flatRatePaise, freeThresholdPaise } = siteConfig.shipping;

export function shippingForSubtotal(subtotalInPaise: number): number {
  if (subtotalInPaise <= 0) return 0;
  return subtotalInPaise >= freeThresholdPaise ? 0 : flatRatePaise;
}

/** How much more is needed to qualify for free delivery, 0 once qualified. */
export function amountToFreeShipping(subtotalInPaise: number): number {
  return Math.max(0, freeThresholdPaise - subtotalInPaise);
}

/**
 * Product prices are GST-inclusive, which is what the product pages already
 * say ("Inclusive of all taxes"), so there is no separate tax line. If that
 * ever changes, it changes HERE and nowhere else.
 */
export function orderTotals(subtotalInPaise: number): {
  shippingInPaise: number;
  totalInPaise: number;
} {
  const shippingInPaise = shippingForSubtotal(subtotalInPaise);
  return { shippingInPaise, totalInPaise: subtotalInPaise + shippingInPaise };
}

export type OrderStatus =
  "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

/** Only Cash on Delivery exists until a gateway is integrated. */
export type PaymentMethod = "cod";

/**
 * A line as it was at the moment the order was placed.
 *
 * Price and name are SNAPSHOTTED here on purpose — the opposite of the cart,
 * which deliberately stores no money. A cart must always reflect today's
 * price; an order must forever reflect the price that was agreed. If the
 * catalogue later changes, this record must not.
 */
export type OrderLine = {
  sku: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  image: string;
  unitPriceInPaise: number;
  mrpInPaise: number;
  quantity: number;
  lineTotalInPaise: number;
};

export type Order = {
  /** Short, human-friendly, printed on the invoice. Shown to the customer. */
  orderNumber: string;
  /**
   * Opaque high-entropy id used in the confirmation URL.
   *
   * The URL is NOT keyed on orderNumber: that is short and semi-guessable, and
   * anyone who guessed one would read a stranger's name, phone and address.
   * Until accounts exist (step 4) this token is the only thing authorising a
   * read, so it must stay unguessable and the page must stay noindex.
   */
  token: string;
  placedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  address: ShippingAddress;
  lines: OrderLine[];
  subtotalInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  savingsInPaise: number;
  /** Set when the client supplied one; replaying it returns this same order. */
  idempotencyKey?: string;
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
