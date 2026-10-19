"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "~/components/cart/CartProvider";
import { navLinks } from "~/lib/content";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { totals, hydrated } = useCart();

  // Before hydration the stored cart has not been read, so the count is 0 on
  // both sides. Deriving the label from the same gate as the badge keeps the
  // accessible name from differing between the server and client trees.
  const itemCount = hydrated ? totals.itemCount : 0;
  const cartLabel =
    itemCount === 0
      ? "Cart, empty"
      : `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  // Close the mobile menu on navigation, otherwise it stays open over the new
  // page. Deliberately keyed on pathname only: reading useSearchParams here
  // would force every page under this layout into dynamic rendering.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the menu, and focus should not be trapped behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // FormData.get() is `string | File | null`; a File would stringify to
    // "[object Object]", so narrow rather than coerce.
    const raw = data.get("q");
    const q = typeof raw === "string" ? raw.trim() : "";
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const isActive = (href: string) =>
    href.startsWith("/#")
      ? false
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-line sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Leaf className="text-leaf size-7" aria-hidden />
          <span className="leading-tight">
            <span className="text-brown block font-serif text-xl">
              MittiMadhur
            </span>
            <span className="text-accent hidden text-[9px] font-medium tracking-wide min-[400px]:block">
              PURE JAGGERY • HEALTHIER LIFE
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="hidden gap-7 text-sm font-medium lg:flex"
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`hover:text-brown ${
                isActive(l.href) ? "text-brown font-semibold" : "text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <form
            onSubmit={submitSearch}
            role="search"
            className="bg-cream mr-2 hidden items-center gap-2 rounded-full px-4 py-2 md:flex"
          >
            <Search className="text-muted size-4" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Search jaggery, powder, blocks..."
              aria-label="Search products"
              className="placeholder:text-muted w-40 bg-transparent text-sm outline-none xl:w-56"
            />
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>

          {/* TODO(step 4): link to /account once sign-in exists. Disabled
              until then: it announces as unavailable and leaves the tab order,
              rather than reading as a button that is simply broken. The visual
              styling is deliberately unchanged. */}
          <button
            type="button"
            disabled
            aria-label="Account (coming soon)"
            className="text-ink hover:text-brown grid size-10 place-items-center"
          >
            <User className="size-5" />
          </button>

          <Link
            href="/cart"
            aria-label={cartLabel}
            className="text-ink hover:text-brown focus-visible:ring-brown relative grid size-10 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
          >
            <ShoppingCart className="size-5" />
            {/* The count is read from localStorage after mount, so the server
                renders no badge at all. Gating on `hydrated` keeps the two
                trees identical and avoids a flash of "0". */}
            {hydrated && itemCount > 0 && (
              <span
                aria-hidden
                className="bg-accent absolute top-1 right-0.5 grid size-4 place-items-center rounded-full text-[10px] font-bold text-white"
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="text-ink hover:text-brown grid size-10 place-items-center lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-line border-t bg-white px-4 pb-4 sm:px-6 lg:hidden"
        >
          <form
            onSubmit={submitSearch}
            role="search"
            className="bg-cream mt-4 flex items-center gap-2 rounded-full px-4 py-2.5 md:hidden"
          >
            <Search className="text-muted size-4" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Search jaggery, powder, blocks..."
              aria-label="Search products"
              className="placeholder:text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>
          <nav
            aria-label="Mobile"
            className="mt-2 flex flex-col text-base font-medium"
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`border-line/60 hover:text-brown border-b py-3 last:border-0 ${
                  isActive(l.href) ? "text-brown font-semibold" : "text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
