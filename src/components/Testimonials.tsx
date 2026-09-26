"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { reviews } from "~/lib/content";

const PER_PAGE = 3;

export function Testimonials() {
  const [start, setStart] = useState(0);
  const visible = Array.from(
    { length: Math.min(PER_PAGE, reviews.length) },
    (_, i) => reviews[(start + i) % reviews.length]!,
  );
  const move = (dir: number) =>
    setStart((s) => (s + dir + reviews.length) % reviews.length);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Customer reviews</p>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Loved by Our Customers</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => move(-1)} aria-label="Previous review" className="grid size-8 place-items-center rounded-full bg-white shadow-sm hover:bg-cream">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => move(1)} aria-label="Next review" className="grid size-8 place-items-center rounded-full bg-white shadow-sm hover:bg-cream">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3" aria-live="polite">
        {visible.map((r) => (
          <figure key={r.name} className="rounded-xl border border-line bg-white p-6">
            <div className="flex gap-1 text-amber-400" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" aria-hidden />
              ))}
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-ink/85">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-cream font-semibold text-brown">
                {r.name[0]}
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-semibold">{r.name}</span>
                <span className="text-xs text-muted">{r.city}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
