"use client";

import { useEffect, useState } from "react";

/**
 * Screen-reader announcement for the number of matching products.
 *
 * `/shop` is a dynamic route with a sibling `loading.tsx`, so every filter
 * navigation tears the results column down and mounts a fresh subtree. A live
 * region that is already populated at insertion time does not announce —
 * assistive tech only reports *mutations* to a region it was already watching.
 * So this renders empty, then fills itself from an effect: the region is in the
 * accessibility tree first, and the text lands as a mutation a frame later.
 *
 * The visible "17 products" copy in the shop page is `aria-hidden` so the
 * count is not read out twice.
 */
export function ResultCountAnnouncer({ count }: { count: number }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(`${count} ${count === 1 ? "product" : "products"}`);
  }, [count]);

  return (
    <span role="status" aria-live="polite" className="sr-only">
      {message}
    </span>
  );
}
