"use client";

import { Leaf, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "~/lib/content";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-line sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-8">
        <a href="#" className="flex shrink-0 items-center gap-2">
          <Leaf className="text-leaf size-7" aria-hidden />
          <span className="leading-tight">
            <span className="text-brown block font-serif text-xl">
              MittiMadhur
            </span>
            <span className="text-accent hidden text-[9px] font-medium tracking-wide min-[400px]:block">
              PURE JAGGERY • HEALTHIER LIFE
            </span>
          </span>
        </a>

        <nav className="hidden gap-7 text-sm font-medium lg:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-ink hover:text-brown">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <label className="bg-cream mr-2 hidden items-center gap-2 rounded-full px-4 py-2 md:flex">
            <Search className="text-muted size-4" aria-hidden />
            <input
              type="search"
              placeholder="Search jaggery, powder, blocks..."
              aria-label="Search products"
              className="placeholder:text-muted w-40 bg-transparent text-sm outline-none xl:w-56"
            />
          </label>
          <button
            aria-label="Account"
            className="text-ink hover:text-brown grid size-10 place-items-center"
          >
            <User className="size-5" />
          </button>
          <button
            aria-label="Cart, 1 item"
            className="text-ink hover:text-brown relative grid size-10 place-items-center"
          >
            <ShoppingCart className="size-5" />
            <span className="bg-accent absolute top-1 right-0.5 grid size-4 place-items-center rounded-full text-[10px] font-bold text-white">
              1
            </span>
          </button>
          <button
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
          <label className="bg-cream mt-4 flex items-center gap-2 rounded-full px-4 py-2.5 md:hidden">
            <Search className="text-muted size-4" aria-hidden />
            <input
              type="search"
              placeholder="Search jaggery, powder, blocks..."
              aria-label="Search products"
              className="placeholder:text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <nav className="mt-2 flex flex-col text-base font-medium">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-line/60 text-ink hover:text-brown border-b py-3 last:border-0"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
