import { type Metadata } from "next";
import { Breadcrumbs, type Crumb } from "~/components/Breadcrumbs";
import { CheckoutForm } from "~/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  // The layout template appends "| MittiMadhur", so it is not repeated here.
  title: "Checkout",
  description: "Enter your delivery details and place your MittiMadhur order.",
  // Nothing on this page is public: it renders from a per-visitor cart and
  // collects a name, phone number and address. `follow: false` as well as
  // `index: false`, because unlike /cart there is nowhere useful to crawl on
  // from here and the only outbound link worth equity is /shop, which is
  // already reachable from every other page.
  robots: { index: false, follow: false },
};

const crumbs: Crumb[] = [
  { label: "Home", href: "/" },
  { label: "Cart", href: "/cart" },
  { label: "Checkout" },
];

/**
 * The checkout route shell.
 *
 * A server component for the same reason /cart is one: breadcrumbs, heading
 * and metadata are static, and only the form below depends on what is in
 * localStorage. The page therefore has real markup before the cart hydrates.
 */
export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={crumbs} />

      <header className="mt-3">
        <h1 className="text-ink font-serif text-4xl sm:text-5xl">Checkout</h1>
      </header>

      <CheckoutForm />
    </div>
  );
}
