import type { Metadata } from "next";
import { PolicyPage } from "~/components/PolicyPage";
import { siteConfig } from "~/config/site";

/** TODO(before launch): confirm windows and refund timelines, and get this reviewed. */
export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "When a MittiMadhur jaggery order can be returned or replaced, and how refunds are processed.",
};

export default function ReturnsPolicyPage() {
  return (
    <PolicyPage
      title="Returns & Refunds"
      lastUpdated="2026-10-20"
      intro="Jaggery is a food product, so there are limits on what we can take back. Here is exactly where we stand."
    >
      <h2>What we will always put right</h2>
      <p>Tell us within 48 hours of delivery if your order arrives:</p>
      <ul>
        <li>damaged, leaking or with broken packaging;</li>
        <li>incorrect — a different product or size from what you ordered;</li>
        <li>incomplete, with an item missing;</li>
        <li>past its best-before date.</li>
      </ul>
      <p>
        Send a photo of the product and the packaging to{" "}
        <a href={`mailto:${siteConfig.contact.email}`}>
          {siteConfig.contact.email}
        </a>{" "}
        with your order number. We will replace the item or refund it in full,
        whichever you prefer. You will not pay return shipping.
      </p>

      <h2>What we cannot accept back</h2>
      <p>
        For food safety reasons we cannot accept returns of opened products, or
        of unopened products simply because you changed your mind. We also
        cannot treat the following as defects:
      </p>
      <ul>
        <li>
          Variation in colour between batches. Unrefined jaggery ranges from
          golden to deep amber depending on the cane and the season.
        </li>
        <li>
          Softening, stickiness or crystallisation caused by heat and humidity
          in transit or storage.
        </li>
        <li>
          Natural sediment in liquid jaggery, which settles and is harmless.
        </li>
      </ul>

      <h2>Cancelling an order</h2>
      <p>
        You can cancel free of charge any time before dispatch. Call or email us
        with your order number. Once an order has been dispatched it cannot be
        cancelled, but you can refuse delivery — with Cash on Delivery nothing
        has been charged, so there is nothing to refund.
      </p>

      <h2>How refunds are processed</h2>
      <p>
        Because all orders are currently Cash on Delivery, a refund only arises
        where you have already paid the delivery partner. In that case we will
        transfer the amount to your bank account or UPI ID within 5–7 business
        days of approving the refund. We will confirm the amount with you before
        processing it.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${siteConfig.contact.email}`}>
          {siteConfig.contact.email}
        </a>{" "}
        · <a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phone}</a>.
        Please quote your order number; it is on your order confirmation page.
      </p>
    </PolicyPage>
  );
}
