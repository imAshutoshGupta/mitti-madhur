import { Leaf, ShieldCheck, Soup, Zap } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const benefits = [
  { icon: Leaf, title: "Rich in Nutrients", note: "Contains iron, calcium, potassium and more." },
  { icon: ShieldCheck, title: "Boosts Immunity", note: "Helps strengthen your natural defences." },
  { icon: Soup, title: "Aids Digestion", note: "Gentle on stomach, supports gut health." },
  { icon: Zap, title: "Natural Energy", note: "Sustained energy without refined sugar." },
];

export function Benefits() {
  return (
    <section id="benefits" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Why choose jaggery" title="A Natural Choice for a Healthier You" linkLabel="Learn More" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, note }) => (
          <div key={title} className="flex items-center gap-4 rounded-xl border border-line bg-white p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-cream text-leaf">
              <Icon className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-xs text-muted">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
