import { ArrowRight, Leaf, Sprout, Truck } from "lucide-react";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

const badges = [
  { icon: Leaf, title: "100% Natural", note: "No chemicals" },
  { icon: Sprout, title: "From Trusted Farmers", note: "Fair sourcing" },
  { icon: Truck, title: "Pan India Delivery", note: "Safe & reliable" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f6ecdc]">
      {/* Mobile: photo as a banner above the text */}
      <Photo
        src="/images/hero.jpg"
        alt=""
        priority
        sizes="100vw"
        className="aspect-[16/10] w-full md:hidden"
      />
      <div className="absolute inset-y-0 right-0 hidden w-[62%] md:block">
        <Reveal inView={false} y={0} className="size-full">
          <Photo
            src="/images/hero.jpg"
            alt="Blocks of jaggery on a wooden plate beside sugarcane and jaggery powder"
            priority
            className="absolute inset-0"
          />
        </Reveal>
      </div>
      {/* Fade the photo into the cream background behind the text */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#f6ecdc] via-[#f6ecdc]/90 via-40% to-transparent to-65% md:block" />

      <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 md:pt-16">
        <div className="max-w-md">
          <Reveal inView={false} delay={0.1}>
            <p className="text-accent text-xs font-semibold tracking-[0.18em] uppercase">
              Natural • Traditional • Nutritious
            </p>
          </Reveal>
          <Reveal inView={false} delay={0.2}>
            <h1 className="text-ink mt-3 font-serif text-5xl leading-[1.05] sm:text-6xl">
              Pure Jaggery for a Healthier Tomorrow
            </h1>
          </Reveal>
          <Reveal inView={false} delay={0.3}>
            <p className="text-ink/80 mt-5">
              Naturally sweet. Rich in minerals. Sourced from trusted farmers,
              delivered to your home.
            </p>
          </Reveal>
          <Reveal inView={false} delay={0.4}>
            <a
              href="#shop"
              className="bg-brown hover:bg-brown-dark focus-visible:ring-brown mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Shop Jaggery <ArrowRight className="size-4" aria-hidden />
            </a>
          </Reveal>
        </div>

        <Reveal inView={false} delay={0.55} className="mt-12 md:mt-16">
          <ul className="inline-flex flex-wrap gap-x-8 gap-y-4 rounded-2xl bg-white/70 px-5 py-4 backdrop-blur">
            {badges.map(({ icon: Icon, title, note }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="text-leaf grid size-9 place-items-center rounded-full bg-white shadow-sm">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-xs leading-tight">
                  <span className="text-ink block font-semibold">{title}</span>
                  <span className="text-muted">{note}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="text-brown absolute top-8 right-8 hidden size-24 rotate-[-8deg] place-items-center rounded-full bg-white/85 text-center font-serif text-sm leading-tight shadow lg:grid">
        Goodness of Nature in Every Bite
      </div>
    </section>
  );
}
