import { type Metadata } from "next";
import { Breadcrumbs, type Crumb } from "~/components/Breadcrumbs";
import { CartPageContents } from "~/components/cart/CartPageContents";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review the jaggery in your MittiMadhur cart before you check out.",
  // A cart is per-visitor and renders empty to a crawler, so there is nothing
  // worth indexing. `follow` stays on so link equity still flows to /shop.
  robots: { index: false, follow: true },
};

const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: "Cart" }];

/**
 * The cart route shell.
 *
 * Deliberately a server component: the heading, breadcrumbs and metadata are
 * static, and only the contents depend on localStorage. Keeping the shell on
 * the server means the page has real markup before the cart hydrates.
 */
export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={crumbs} />

      <header className="mt-3">
        <h1 className="text-ink font-serif text-4xl sm:text-5xl">Your Cart</h1>
      </header>

      <CartPageContents />
    </div>
  );
}
