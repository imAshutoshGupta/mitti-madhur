import type { Metadata } from "next";
import { PolicyPage } from "~/components/PolicyPage";
import { siteConfig } from "~/config/site";

/**
 * TODO(before launch): have this reviewed against the DPDP Act 2023 and name a
 * real grievance officer with a real contact address. The description of what
 * is stored must be kept accurate as the site gains features — if a field is
 * added to the cart or the order, it is described here in the same commit.
 */
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What information MittiMadhur collects when you shop with us, why we collect it, and how to have it removed.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      lastUpdated="2026-10-20"
      intro="We ask for the least we can get away with, use it only to get your order to you, and never sell it."
    >
      <h2>What we collect</h2>
      <p>When you place an order we ask for, and store:</p>
      <ul>
        <li>your name;</li>
        <li>your phone number, so we can confirm the order and deliver it;</li>
        <li>your email address, for order correspondence;</li>
        <li>
          your delivery address, including any landmark and delivery note.
        </li>
      </ul>
      <p>
        We do not collect payment card details. All orders are Cash on Delivery,
        so no card or bank information passes through this site at all.
      </p>

      <h2>What is stored in your browser</h2>
      <p>
        Your shopping cart is stored on your own device, in your browser&rsquo;s
        local storage, under the key <code>mm.cart.v2</code>. It holds only
        product codes and quantities — no name, address, email or price. It
        never reaches our servers until you place an order, and it is discarded
        the next time you visit, once it is more than 30 days old.
      </p>
      <p>
        Because it lives on the device, anyone else using the same browser
        profile can see what is in your cart. Clearing the cart, or clearing
        your browser&rsquo;s site data, removes it.
      </p>

      <h2>What we do with it</h2>
      <p>
        We use your details to process, pack, confirm and deliver your order,
        and to contact you if there is a problem with it. We share your name,
        address and phone number with the courier handling your delivery,
        because they cannot deliver without them. That is the only sharing we
        do. We do not sell your data, rent it, or use it for advertising.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Order records are retained for as long as we are required to keep
        business records, and so we can resolve a dispute about a past order.
        You can ask us to delete anything we are not legally obliged to keep.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us what we hold about you, ask us to correct it, or ask us
        to delete it. Email{" "}
        <a href={`mailto:${siteConfig.contact.email}`}>
          {siteConfig.contact.email}
        </a>{" "}
        and we will respond within 30 days.
      </p>

      <h2>Security</h2>
      <p>
        The site is served over HTTPS. Order details are accessible only to the
        people who need them to pack and deliver your order. No system is
        perfectly secure, and we will tell you promptly if we ever become aware
        of a breach affecting your information.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes we will update the date at the top of this page.
        Material changes will be announced on the site.
      </p>

      <h2>Contact</h2>
      <p>
        MittiMadhur, {siteConfig.contact.location} ·{" "}
        <a href={`mailto:${siteConfig.contact.email}`}>
          {siteConfig.contact.email}
        </a>{" "}
        · <a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phone}</a>
      </p>
    </PolicyPage>
  );
}
