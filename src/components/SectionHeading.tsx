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
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">{title}</h2>
      </div>
      {linkLabel && (
        <a
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-brown hover:text-brown-dark"
        >
          {linkLabel} <ArrowRight className="size-4" aria-hidden />
        </a>
      )}
    </div>
  );
}
