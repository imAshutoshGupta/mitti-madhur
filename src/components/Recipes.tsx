import { ArrowRight } from "lucide-react";
import { recipes } from "~/lib/content";
import { Photo } from "./Photo";
import { SectionHeading } from "./SectionHeading";

export function Recipes() {
  return (
    <section id="recipes" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <SectionHeading
        eyebrow="Recipes & ideas"
        title="Delicious Ways to Use Jaggery"
        linkLabel="View All Recipes"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {recipes.map((r) => (
          <a
            key={r.name}
            href="#"
            className="group border-line bg-card overflow-hidden rounded-xl border"
          >
            <Photo
              src={r.image}
              alt={r.name}
              className="aspect-[5/2]"
              sizes="(min-width:768px) 33vw, 100vw"
            />
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="text-sm font-semibold">{r.name}</h3>
                <p className="text-muted text-xs">{r.note}</p>
              </div>
              <span className="border-brown/60 text-brown group-hover:bg-brown grid size-7 place-items-center rounded-full border group-hover:text-white">
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
