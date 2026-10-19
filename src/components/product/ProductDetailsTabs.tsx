"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { type Product } from "~/lib/products";

const TAB_IDS = ["description", "nutrition", "ingredients"] as const;
type TabId = (typeof TAB_IDS)[number];

const TAB_LABELS: Record<TabId, string> = {
  description: "Description",
  nutrition: "Nutrition",
  ingredients: "Ingredients",
};

/**
 * APG tabs: roving tabindex (only the active tab is reachable with Tab),
 * arrow/Home/End move between tabs and activate on move.
 */
export function ProductDetailsTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<TabId>("description");
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const tabId = (id: TabId) => `${base}-tab-${id}`;
  const panelId = (id: TabId) => `${base}-panel-${id}`;

  function focusTab(index: number) {
    const wrapped = (index + TAB_IDS.length) % TAB_IDS.length;
    const next = TAB_IDS[wrapped];
    if (!next) return;
    setActive(next);
    listRef.current?.querySelectorAll("button")[wrapped]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = TAB_IDS.indexOf(active);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(TAB_IDS.length - 1);
    }
  }

  return (
    <div className="border-line rounded-xl border bg-white">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Product details"
        onKeyDown={onKeyDown}
        /*
          `overflow-x-auto` clips BOTH axes (a non-visible overflow on one axis
          forces the other to `auto`), and it clips at the padding box. A
          focused tab's ring reaches 4px past its border box (2px offset + 2px
          ring), so with no bottom padding the lower half of the ring was cut
          off. `pb-2` gives it 8px of room. The active-tab underline is drawn
          by an ::after pinned to `-bottom-2` instead of a border, so it still
          sits flush on the strip's bottom rule rather than floating 8px above
          it — and at exactly the padding edge it is itself not clipped.
        */
        className="border-line flex gap-1 overflow-x-auto border-b px-2 pt-2 pb-2"
      >
        {TAB_IDS.map((id) => {
          const selected = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={tabId(id)}
              aria-selected={selected}
              aria-controls={panelId(id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setActive(id);
              }}
              className={`focus-visible:ring-brown relative min-h-11 shrink-0 rounded-t-lg px-4 text-sm font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                selected
                  ? "text-brown after:bg-brown after:absolute after:inset-x-0 after:-bottom-2 after:h-0.5 after:content-['']"
                  : "text-muted hover:text-ink"
              }`}
            >
              {TAB_LABELS[id]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId("description")}
        aria-labelledby={tabId("description")}
        tabIndex={0}
        hidden={active !== "description"}
        className="focus-visible:ring-brown p-5 focus-visible:ring-2 focus-visible:outline-none sm:p-6"
      >
        <p className="text-ink/85 max-w-prose text-sm leading-relaxed">
          {product.description}
        </p>
      </div>

      <div
        role="tabpanel"
        id={panelId("nutrition")}
        aria-labelledby={tabId("nutrition")}
        tabIndex={0}
        hidden={active !== "nutrition"}
        className="focus-visible:ring-brown p-5 focus-visible:ring-2 focus-visible:outline-none sm:p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full max-w-md text-sm">
            <caption className="text-muted mb-3 text-left text-xs">
              Approximate values per 100 g. Natural variation between batches is
              expected.
            </caption>
            <thead>
              <tr className="border-line border-b">
                <th scope="col" className="py-2 pr-4 text-left font-semibold">
                  Nutrient
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Per 100 g
                </th>
              </tr>
            </thead>
            <tbody>
              {product.nutrition.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-line border-b last:border-0 ${
                    i % 2 === 1 ? "bg-cream" : ""
                  }`}
                >
                  <th
                    scope="row"
                    className="text-ink py-2 pr-4 text-left font-medium"
                  >
                    {row.label}
                  </th>
                  <td className="text-muted py-2 text-right tabular-nums">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        role="tabpanel"
        id={panelId("ingredients")}
        aria-labelledby={tabId("ingredients")}
        tabIndex={0}
        hidden={active !== "ingredients"}
        className="focus-visible:ring-brown p-5 focus-visible:ring-2 focus-visible:outline-none sm:p-6"
      >
        <dl className="max-w-prose space-y-4 text-sm">
          <div>
            <dt className="text-ink font-semibold">Ingredients</dt>
            <dd className="text-ink/85 mt-1 leading-relaxed">
              {product.ingredients}
            </dd>
          </div>
          <div>
            <dt className="text-ink font-semibold">Storage</dt>
            <dd className="text-ink/85 mt-1 leading-relaxed">
              Store in a cool, dry place away from direct sunlight. Keep the
              pack tightly closed and use a dry spoon.
            </dd>
          </div>
          <div>
            <dt className="text-ink font-semibold">FSSAI</dt>
            <dd className="text-muted mt-1 leading-relaxed">
              Packed in an FSSAI-licensed facility. The licence number, batch
              code and best-before date are printed on the pack.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
