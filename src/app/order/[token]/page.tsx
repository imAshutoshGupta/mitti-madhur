import Link from "next/link";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheck, Mail, Phone } from "lucide-react";
import { Breadcrumbs } from "~/components/Breadcrumbs";
import { Photo } from "~/components/Photo";
import { formatIndianDate, formatPrice } from "~/lib/format";
import { getOrderByToken } from "~/lib/orders.data";
import { ORDER_STATUS_LABEL, type Order } from "~/lib/orders";

/**
 * NEVER prerender and NEVER cache this route.
 *
 * The 32-hex token in the URL is the only thing authorising the read, and the
 * page prints the customer's name, phone, email and full delivery address. A
 * copy of it sitting in a shared CDN — or a statically rendered shell served
 * to the next visitor — is a cross-customer data leak, not a stale page. For
 * the same reason there is no generateStaticParams here, and the metadata
 * below is noindex on every branch.
 */
export const dynamic = "force-dynamic";

/** Matches the Get in touch block in src/components/Footer.tsx. */
const SUPPORT_EMAIL = "hello@mittimadhur.in";
const SUPPORT_PHONE = "+91 12345 67890";
const SUPPORT_PHONE_HREF = "tel:+911234567890";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const order = await getOrderByToken(token);

  return {
    title: order ? `Order ${order.orderNumber}` : "Order not found",
    // Unconditional. An indexed order page would hand a stranger's address to
    // anyone running a search, so this must not depend on the lookup.
    robots: { index: false, follow: false },
  };
}

/** 9876543210 -> "+91 98765 43210"; anything unexpected is shown unchanged. */
function formatPhone(phone: string): string {
  return /^\d{10}$/.test(phone)
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    : phone;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  const placedOn = formatIndianDate(order.placedAt);
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: `Order ${order.orderNumber}` },
        ]}
      />

      <header className="border-line bg-card mt-4 rounded-2xl border px-5 py-8 text-center sm:px-8 sm:py-10">
        <span className="bg-leaf/10 text-leaf mx-auto grid size-14 place-items-center rounded-full">
          <CircleCheck className="size-7" aria-hidden />
        </span>

        <h1 className="text-ink mt-5 font-serif text-3xl sm:text-4xl">
          Thank you for your order
        </h1>

        <p className="text-brown mt-4 font-mono text-xl font-semibold break-words sm:text-2xl">
          {order.orderNumber}
        </p>
        <p className="text-muted mt-1 text-xs">Keep this for your records.</p>

        {/*
          Honest, not aspirational. Nothing in this build sends email, reserves
          stock or books a courier, so the only promise made here is the one a
          human can keep: somebody rings you back.
        */}
        <p className="text-ink mx-auto mt-5 max-w-xl text-sm leading-relaxed">
          We have received your order and our team will call you on{" "}
          <span className="font-medium break-words">
            {formatPhone(order.address.phone)}
          </span>{" "}
          to confirm it before anything is dispatched. Payment is Cash on
          Delivery, so you have not been charged.
        </p>
        <p className="text-muted mx-auto mt-2 max-w-xl text-sm leading-relaxed">
          We do not send confirmation emails yet, so please save this page or
          write the order number down — it is how we find your order.
        </p>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="order-details-heading">
            <h2
              id="order-details-heading"
              className="text-ink font-serif text-2xl"
            >
              Order details
            </h2>

            <dl className="border-line mt-4 grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="text-muted text-xs">Placed on</dt>
                <dd className="text-ink mt-1 text-sm font-medium break-words">
                  {placedOn ? (
                    <time dateTime={order.placedAt}>{placedOn}</time>
                  ) : (
                    "Just now"
                  )}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted text-xs">Status</dt>
                <dd className="text-ink mt-1 text-sm font-medium break-words">
                  {ORDER_STATUS_LABEL[order.status]}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted text-xs">Payment</dt>
                <dd className="text-ink mt-1 text-sm font-medium break-words">
                  Cash on Delivery
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="order-items-heading">
            <h2
              id="order-items-heading"
              className="text-ink font-serif text-2xl"
            >
              {itemCount === 1 ? "1 item" : `${itemCount} items`} in this order
            </h2>

            <ul className="mt-4 space-y-3">
              {order.lines.map((line) => (
                <OrderLineRow key={line.sku} line={line} />
              ))}
            </ul>
          </section>
        </div>

        <div className="min-w-0 space-y-8">
          <OrderSummary order={order} />
          <DeliveryAddress order={order} />

          <section aria-labelledby="order-help-heading">
            <h2
              id="order-help-heading"
              className="text-ink font-serif text-2xl"
            >
              Need help?
            </h2>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              Something wrong with this order? Get in touch and quote{" "}
              <span className="text-ink font-medium break-words">
                {order.orderNumber}
              </span>
              .
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <Mail
                  className="text-muted mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-brown hover:text-brown-dark focus-visible:ring-brown rounded break-all underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  className="text-muted mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <a
                  href={SUPPORT_PHONE_HREF}
                  className="text-brown hover:text-brown-dark focus-visible:ring-brown rounded break-words underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {SUPPORT_PHONE}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function OrderLineRow({ line }: { line: Order["lines"][number] }) {
  return (
    <li className="border-line flex gap-3 rounded-xl border bg-white p-3 sm:gap-4">
      <Photo
        src={line.image}
        alt=""
        fit="contain"
        sizes="96px"
        className="bg-cream size-20 shrink-0 rounded-lg !bg-none sm:size-24"
      />

      <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="font-semibold break-words">
            <Link
              href={`/shop/${line.productSlug}`}
              className="hover:text-brown focus-visible:ring-brown rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {line.productName}
            </Link>
          </h3>
          <p className="text-muted text-xs">{line.variantLabel}</p>
          <p className="text-muted mt-2 text-xs">
            Qty {line.quantity} &times; {formatPrice(line.unitPriceInPaise)}
          </p>
        </div>

        <p className="text-ink ml-auto font-semibold tabular-nums">
          {formatPrice(line.lineTotalInPaise)}
        </p>
      </div>
    </li>
  );
}

function OrderSummary({ order }: { order: Order }) {
  return (
    <section
      aria-labelledby="order-summary-heading"
      className="border-line rounded-xl border bg-white p-5"
    >
      <h2 id="order-summary-heading" className="text-ink font-serif text-2xl">
        Order summary
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Subtotal</dt>
          <dd className="text-ink font-medium tabular-nums">
            {formatPrice(order.subtotalInPaise)}
          </dd>
        </div>

        {order.savingsInPaise > 0 && (
          <div className="text-leaf flex items-baseline justify-between gap-3">
            <dt>You save</dt>
            <dd className="font-medium tabular-nums">
              {formatPrice(order.savingsInPaise)}
            </dd>
          </div>
        )}

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Shipping</dt>
          {order.shippingInPaise === 0 ? (
            <dd className="text-leaf font-medium">FREE</dd>
          ) : (
            <dd className="text-ink font-medium tabular-nums">
              {formatPrice(order.shippingInPaise)}
            </dd>
          )}
        </div>

        <div className="border-line border-t pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink text-base font-semibold">Total</dt>
            <dd className="text-ink text-base font-semibold tabular-nums">
              {formatPrice(order.totalInPaise)}
            </dd>
          </div>
          <p className="text-muted mt-1 text-xs">
            Payable in cash on delivery.
          </p>
        </div>
      </dl>

      <Link
        href="/shop"
        className="bg-brown hover:bg-brown-dark focus-visible:ring-brown mt-5 flex min-h-11 w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Continue Shopping
      </Link>
    </section>
  );
}

function DeliveryAddress({ order }: { order: Order }) {
  const { address } = order;

  return (
    <section
      aria-labelledby="delivery-address-heading"
      className="border-line rounded-xl border bg-white p-5"
    >
      <h2
        id="delivery-address-heading"
        className="text-ink font-serif text-2xl"
      >
        Delivery address
      </h2>

      <address className="text-ink mt-4 text-sm leading-relaxed not-italic">
        <span className="block font-semibold break-words">
          {address.fullName}
        </span>
        <span className="text-muted mt-1 block break-words">
          {address.line1}
        </span>
        {address.line2 && (
          <span className="text-muted block break-words">{address.line2}</span>
        )}
        {address.landmark && (
          <span className="text-muted block break-words">
            Near {address.landmark}
          </span>
        )}
        <span className="text-muted block break-words">
          {address.city}, {address.state} {address.pincode}
        </span>

        <span className="text-muted mt-3 block break-words">
          {formatPhone(address.phone)}
        </span>
        <span className="text-muted block break-all">{address.email}</span>
      </address>

      {address.notes && (
        <div className="border-line mt-4 border-t pt-4">
          <p className="text-muted text-xs">Delivery notes</p>
          <p className="text-ink mt-1 text-sm break-words">{address.notes}</p>
        </div>
      )}
    </section>
  );
}
