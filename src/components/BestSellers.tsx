import { getBestSellers } from "~/lib/products.data";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export async function BestSellers() {
  const products = await getBestSellers(5);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <SectionHeading
        eyebrow="Best sellers"
        title="Our Most Loved Products"
        linkLabel="View All"
        href="/shop"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className="h-full">
            <ProductCard product={p} sizes="(min-width:1024px) 20vw, 50vw" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
