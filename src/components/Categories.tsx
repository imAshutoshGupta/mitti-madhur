import { ArrowRight } from "lucide-react";
import { categories } from "~/lib/content";
import { Reveal } from "./Reveal";
import { Photo } from "./Photo";
import { SectionHeading } from "./SectionHeading";

export function Categories() {
  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeading
        eyebrow="Shop by category"
        title="Explore Our Jaggery Range"
        linkLabel="View All"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.08}>
            <a
              href="#"
              className="group border-line bg-card hover:border-brown/40 block overflow-hidden rounded-xl border transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <Photo
                src={c.image}
                alt={c.name}
                className="aspect-[3/2]"
                sizes="(min-width:1024px) 20vw, 50vw"
              />
              <div className="flex items-center justify-between gap-2 p-3">
                <div>
                  <h3 className="text-sm font-semibold">{c.name}</h3>
                  <p className="text-muted text-xs">{c.note}</p>
                </div>
                <span className="border-brown/60 text-brown group-hover:bg-brown grid size-7 shrink-0 place-items-center rounded-full border group-hover:text-white">
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
