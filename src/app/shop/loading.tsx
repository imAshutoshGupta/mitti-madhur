/**
 * Skeleton for the shop route. The wrappers mirror `page.tsx` exactly — same
 * max width, padding, sidebar width and grid — so nothing jumps when the real
 * content streams in.
 */
export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/*
        The skeleton is decoration, so it is hidden outright; the status line
        below carries the announcement. `aria-busy` + `aria-label` on a
        role-less div said nothing useful — an accessible name on a generic
        element is widely ignored. Mirrors `src/app/search/loading.tsx`.
      */}
      <div aria-hidden>
        <div className="bg-line/60 h-3 w-40 animate-pulse rounded" />

        <div className="mt-3 max-w-3xl">
          <div className="bg-line/60 h-10 w-72 animate-pulse rounded sm:h-12" />
          <div className="bg-line/60 mt-3 h-4 w-full max-w-xl animate-pulse rounded" />
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="sticky top-24 hidden w-64 shrink-0 self-start lg:block">
            <div className="bg-line/60 h-6 w-24 animate-pulse rounded" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="bg-line/60 h-10 w-full animate-pulse rounded-lg"
                />
              ))}
            </div>
            <div className="border-line mt-5 border-t pt-4">
              <div className="bg-line/60 h-10 w-full animate-pulse rounded-lg" />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="border-line mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="bg-line/60 h-10 w-32 animate-pulse rounded-full" />
              <div className="bg-line/60 h-10 w-44 animate-pulse rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="border-line rounded-xl border bg-white p-3"
                >
                  <div className="bg-line/60 aspect-square w-full animate-pulse rounded-lg" />
                  <div className="bg-line/60 mt-3 h-4 w-3/4 animate-pulse rounded" />
                  <div className="bg-line/60 mt-2 h-3 w-1/2 animate-pulse rounded" />
                  <div className="bg-line/60 mt-2 h-3 w-2/3 animate-pulse rounded" />
                  <div className="bg-line/60 mt-2 h-4 w-1/3 animate-pulse rounded" />
                  <div className="bg-line/60 mt-3 h-8 w-full animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only" role="status">
        Loading products
      </span>
    </div>
  );
}
