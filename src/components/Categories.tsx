import { ArrowRight } from "lucide-react";
import { categories } from "~/lib/content";
import { Photo } from "./Photo";
import { SectionHeading } from "./SectionHeading";

export function Categories() {
  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Shop by category" title="Explore Our Jaggery Range" linkLabel="View All" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <a
            key={c.name}
            href="#"
            className="group overflow-hidden rounded-xl border border-line bg-card hover:border-brown/40"
          >
            <Photo src={c.image} alt={c.name} className="aspect-[3/2]" sizes="(min-width:1024px) 20vw, 50vw" />
            <div className="flex items-center justify-between gap-2 p-3">
              <div>
                <h3 className="text-sm font-semibold">{c.name}</h3>
                <p className="text-xs text-muted">{c.note}</p>
              </div>
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-brown/60 text-brown group-hover:bg-brown group-hover:text-white">
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
