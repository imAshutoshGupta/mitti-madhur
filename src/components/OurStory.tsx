import { ArrowRight, Ban, HandHeart, Heart, Leaf, Play } from "lucide-react";
import { Photo } from "./Photo";

const points = [
  { icon: Leaf, label: "Traditionally Made", color: "text-leaf" },
  { icon: Ban, label: "No Chemicals or Additives", color: "text-accent" },
  { icon: HandHeart, label: "Supports Farmers", color: "text-brown" },
  { icon: Heart, label: "Better for Your Family", color: "text-red-600" },
];

export function OurStory() {
  return (
    <section id="story" className="grid bg-[#f6ecdc] md:grid-cols-2">
      <div className="relative min-h-72">
        <Photo
          src="/images/farmer.jpg"
          alt="A farmer harvesting sugarcane"
          className="absolute inset-0"
          sizes="50vw"
        />
        <button
          aria-label="Play our story video"
          className="text-brown absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/80 hover:bg-white"
        >
          <Play className="ml-1 size-6 fill-current" />
        </button>
      </div>

      <div className="grid gap-8 px-6 py-12 lg:grid-cols-[1.4fr_1fr] lg:px-12">
        <div>
          <p className="text-accent text-xs font-semibold tracking-[0.18em] uppercase">
            Our story
          </p>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl">
            From Our Farms to Your Home
          </h2>
          <p className="text-ink/80 mt-4 text-sm leading-relaxed">
            We work directly with Indian farmers who follow traditional methods
            to produce pure, chemical-free jaggery. Our mission is to bring back
            natural sweetness to your everyday life, while supporting
            sustainable farming communities.
          </p>
          <a
            href="#"
            className="bg-brown hover:bg-brown-dark mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            Our Story <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
        <ul className="grid grid-cols-2 gap-5 self-center lg:grid-cols-1">
          {points.map(({ icon: Icon, label, color }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-sm font-medium"
            >
              <Icon className={`size-6 shrink-0 ${color}`} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
