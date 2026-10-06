import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  linkLabel,
  href = "#",
}: {
  eyebrow: string;
  title: string;
  linkLabel?: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div>
        <p className="text-accent text-xs font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h2 className="text-ink mt-1 font-serif text-3xl sm:text-4xl">
          {title}
        </h2>
      </div>
      {linkLabel && (
        <a
          href={href}
          className="text-brown hover:text-brown-dark flex shrink-0 items-center gap-1 text-sm font-medium"
        >
          {linkLabel} <ArrowRight className="size-4" aria-hidden />
        </a>
      )}
    </div>
  );
}
