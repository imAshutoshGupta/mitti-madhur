import { Search, ShoppingCart, User, Leaf } from "lucide-react";
import { navLinks } from "~/lib/content";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <Leaf className="size-7 text-leaf" aria-hidden />
          <span className="leading-tight">
            <span className="block font-serif text-xl text-brown">MittiMadhur</span>
            <span className="block text-[9px] font-medium tracking-wide text-accent">
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

        <div className="ml-auto flex items-center gap-4">
          <label className="hidden items-center gap-2 rounded-full bg-cream px-4 py-2 md:flex">
            <Search className="size-4 text-muted" aria-hidden />
            <input
              type="search"
              placeholder="Search jaggery, powder, blocks..."
              aria-label="Search products"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </label>
          <button aria-label="Account" className="text-ink hover:text-brown">
            <User className="size-5" />
          </button>
          <button aria-label="Cart, 1 item" className="relative text-ink hover:text-brown">
            <ShoppingCart className="size-5" />
            <span className="absolute -top-2 -right-2 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-white">
              1
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
