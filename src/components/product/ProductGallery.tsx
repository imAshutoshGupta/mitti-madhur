"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Photo } from "~/components/Photo";

/**
 * Product image gallery: one large frame plus a thumbnail strip.
 *
 * Thumbnails are real buttons so they are tabbable and announce themselves;
 * Left/Right additionally move between images the way a composite widget
 * would, and focus follows the selection so the keyboard user sees what they
 * selected. They are toggle buttons (`aria-pressed`), not navigation, and a
 * polite live region announces the image the selection switched to.
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  // `images` is non-empty by contract, but noUncheckedIndexedAccess still
  // widens the lookup, so fall back rather than assert.
  const mainSrc = images[index] ?? images[0] ?? "";

  function select(next: number) {
    const wrapped = (next + total) % total;
    setIndex(wrapped);
    const strip = stripRef.current;
    const button = strip?.querySelectorAll("button")[wrapped];
    button?.focus();
  }

  function onStripKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      select(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      select(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(total - 1);
    }
  }

  return (
    <div>
      <Photo
        key={mainSrc}
        src={mainSrc}
        alt={total > 1 ? `${alt} — image ${index + 1} of ${total}` : alt}
        fit="contain"
        priority
        sizes="(min-width:1024px) 45vw, 100vw"
        className="bg-cream border-line aspect-square w-full rounded-xl border !bg-none"
      />

      {total > 1 && (
        <div
          ref={stripRef}
          onKeyDown={onStripKeyDown}
          className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0"
        >
          {images.map((src, i) => {
            const selected = i === index;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => {
                  setIndex(i);
                }}
                aria-pressed={selected}
                aria-label={`View image ${i + 1} of ${total}`}
                className={`border-line focus-visible:ring-brown relative size-16 shrink-0 overflow-hidden rounded-xl border bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:size-20 ${
                  selected
                    ? "ring-brown ring-2 ring-offset-1"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <Photo
                  src={src}
                  alt=""
                  fit="contain"
                  sizes="80px"
                  className="bg-cream absolute inset-0 !bg-none"
                />
              </button>
            );
          })}
        </div>
      )}

      {/*
        The selected ring is the only visual signal that the main image
        changed; this announces the same change to a screen reader. Polite so
        it never interrupts, and off-screen rather than hidden so it is read.
      */}
      {total > 1 && (
        <p aria-live="polite" className="sr-only">
          Image {index + 1} of {total}
        </p>
      )}
    </div>
  );
}
