"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

/**
 * The search page's own input, styled to match the one in the navbar.
 *
 * The current query arrives as a prop rather than via `useSearchParams` on
 * purpose: reading search params in a client component opts the whole page
 * out of static analysis, and the server page already has the value.
 */
export function SearchBox({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultQuery);

  // Back/forward navigation swaps `q` without remounting this component, so
  // mirror the prop back into state when it changes.
  useEffect(() => {
    setValue(defaultQuery);
  }, [defaultQuery]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  // Clearing has to clear the RESULTS too, not just the field: on
  // /search?q=powder, emptying the input alone left "6 results for “powder”"
  // and all six cards on screen, and submitting afterwards bailed on the empty
  // query — so the control looked like it had worked when it had not.
  const clear = () => {
    setValue("");
    inputRef.current?.focus();
    router.push("/search");
  };

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="bg-cream border-line focus-within:ring-brown/30 flex w-full items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-4 focus-within:ring-2"
    >
      <Search className="text-muted size-4 shrink-0" aria-hidden />

      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search jaggery, powder, blocks..."
        autoComplete="off"
        className="placeholder:text-muted min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="text-muted hover:text-ink focus-visible:ring-brown grid size-10 shrink-0 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}

      <button
        type="submit"
        className="bg-brown hover:bg-brown-dark focus-visible:ring-brown grid h-10 shrink-0 place-items-center rounded-full px-5 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Search
      </button>
    </form>
  );
}
