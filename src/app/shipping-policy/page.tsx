import type { Metadata } from "next";
import { PolicyPage } from "~/components/PolicyPage";
import { siteConfig } from "~/config/site";
import { formatPrice } from "~/lib/format";

/**
 * TODO(before launch): these figures must be confirmed by the business and the
 * whole page reviewed by someone qualified. The rates are IMPORTED from
 * ~/config/site.ts rather than restated, so the published policy cannot drift
 * away from what checkout actually charges.
 */
export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Delivery charges, dispatch times and delivery estimates for MittiMadhur jaggery orders across India.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      lastUpdated="2026-10-20"
      intro="How we pack and deliver your jaggery, what it costs, and how long it takes."
    >
      <h2>Delivery charges</h2>
      <ul>
        <li>
          <strong>{formatPrice(siteConfig.shipping.flatRatePaise)}</strong> flat
          delivery charge on orders under{" "}
          {formatPrice(siteConfig.shipping.freeThresholdPaise)}.
        </li>
        <li>
          <strong>Free delivery</strong> on orders of{" "}
          {formatPrice(siteConfig.shipping.freeThresholdPaise)} and above.
        </li>
        <li>
          Charges are calculated at checkout and shown before you place the
          order. There are no charges added afterwards.
        </li>
      </ul>

      <h2>Where we deliver</h2>
      <p>
        We deliver across India. A small number of remote PIN codes are not
        served by our courier partners; if yours is one of them we will contact
        you after you order and refund in full if we cannot deliver.
      </p>

      <h2>Dispatch and delivery times</h2>
      <ul>
        <li>Orders are packed and dispatched within 1–2 business days.</li>
        <li>Metro cities: typically 3–5 business days from dispatch.</li>
        <li>Other locations: typically 5–8 business days from dispatch.</li>
      </ul>
      <p>
        These are estimates, not guarantees. Festivals, weather and regional
        restrictions can add time, and we will tell you if your order is
        affected.
      </p>

      <h2>Payment</h2>
      <p>
        We currently accept <strong>Cash on Delivery only</strong>. Please keep
        the exact order amount ready for the delivery partner. Online payment
        options are coming soon.
      </p>

      <h2>Packaging</h2>
      <p>
        Jaggery is a natural product and can soften in heat or humidity. We pack
        in food-grade, moisture-resistant material, but some change in texture
        or colour on arrival is normal and is not a defect. If a product arrives
        damaged, leaking or unfit to use, see our{" "}
        <a href="/returns-policy">Returns &amp; Refunds Policy</a>.
      </p>

      <h2>Tracking your order</h2>
      <p>
        Your order confirmation page shows your order number. Until online order
        tracking is available, our team will call you to confirm your order and
        can tell you where it is. Contact us at{" "}
        <a href={`mailto:${siteConfig.contact.email}`}>
          {siteConfig.contact.email}
        </a>{" "}
        or <a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phone}</a>{" "}
        with your order number.
      </p>
    </PolicyPage>
  );
}
