import type { Metadata } from "next";
import { PolicyPage } from "~/components/PolicyPage";
import { siteConfig } from "~/config/site";

/** TODO(before launch): legal review, and confirm the governing jurisdiction. */
export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms you agree to when you order jaggery from MittiMadhur.",
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      lastUpdated="2026-10-20"
      intro="The basis on which we sell to you. Plain language, and short on purpose."
    >
      <h2>Ordering</h2>
      <p>
        Placing an order is an offer to buy. The contract is formed when we
        confirm your order, not when you submit it. We may decline an order —
        for example if an item has sold out, if the delivery address is outside
        the area our couriers serve, or if we suspect fraud. If we decline,
        nothing is charged, because all orders are Cash on Delivery.
      </p>

      <h2>Prices and availability</h2>
      <p>
        Prices are in Indian Rupees and include GST. Delivery is charged
        separately and shown at checkout before you confirm. We try to keep
        prices and stock accurate, but if an item is listed at an obviously
        incorrect price, or turns out to be unavailable after you order, we will
        contact you and you may cancel at no cost.
      </p>

      <h2>Payment</h2>
      <p>
        We currently accept Cash on Delivery only. Payment is made to the
        delivery partner when your order arrives. Please have the exact amount
        ready.
      </p>

      <h2>Delivery, returns and cancellation</h2>
      <p>
        See our <a href="/shipping-policy">Shipping Policy</a> and{" "}
        <a href="/returns-policy">Returns &amp; Refunds Policy</a>. They form
        part of these terms.
      </p>

      <h2>Product information</h2>
      <p>
        Jaggery is an unrefined agricultural product. Colour, texture, aroma and
        sweetness vary between batches and seasons, and photographs are
        illustrative. Nutritional values are typical figures for the product
        type, not a guarantee for every batch.
      </p>
      <p>
        Nothing on this site is medical advice. Statements about the benefits of
        jaggery are general information and are not a claim to prevent, treat or
        cure any condition. If you have diabetes or another condition affected
        by sugar intake, speak to your doctor.
      </p>

      <h2>Using this site</h2>
      <p>
        Please do not attempt to disrupt the site, access other customers&rsquo;
        orders, or scrape it at a volume that affects other people. The text,
        photographs, branding and design on this site belong to MittiMadhur and
        may not be reused commercially without permission.
      </p>

      <h2>Liability</h2>
      <p>
        We are responsible for supplying products that match their description
        and are fit to eat. We are not liable for losses that were not
        reasonably foreseeable, and nothing in these terms limits any right you
        have under Indian consumer law that cannot be limited.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, and the courts at{" "}
        {siteConfig.legal.jurisdiction} have jurisdiction over any dispute.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${siteConfig.contact.email}`}>
          {siteConfig.contact.email}
        </a>{" "}
        · <a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phone}</a>
      </p>
    </PolicyPage>
  );
}
