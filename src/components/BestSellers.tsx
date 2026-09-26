import { Heart, ShoppingCart } from "lucide-react";
import { products } from "~/lib/content";
import { Photo } from "./Photo";
import { SectionHeading } from "./SectionHeading";

export function BestSellers() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <SectionHeading eyebrow="Best sellers" title="Our Most Loved Products" linkLabel="View All" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((p) => (
          <article key={p.name} className="relative rounded-xl border border-line bg-white p-3">
            <button
              aria-label={`Save ${p.name} to wishlist`}
              className="absolute top-3 right-3 z-10 text-ink/70 hover:text-accent"
            >
              <Heart className="size-4" />
            </button>
            <Photo src={p.image} alt={p.name} fit="contain" className="aspect-square rounded-lg !bg-none bg-cream" sizes="(min-width:1024px) 20vw, 50vw" />
            <h3 className="mt-3 text-sm font-semibold">{p.name}</h3>
            <p className="text-xs text-muted">{p.size}</p>
            <p className="mt-1 font-semibold">₹{p.price}</p>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brown py-2 text-xs font-semibold text-white hover:bg-brown-dark">
              <ShoppingCart className="size-3.5" aria-hidden /> Add to Cart
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
