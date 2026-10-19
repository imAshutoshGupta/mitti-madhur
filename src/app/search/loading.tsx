/** Shown while `searchProducts` resolves. Mirrors the results grid exactly. */
export default function SearchLoading() {
  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="animate-pulse" aria-hidden>
          <div className="bg-line/60 h-3 w-40 rounded-full" />
          <div className="bg-line/60 mt-5 h-10 w-56 rounded-lg" />
          <div className="bg-line/60 mt-6 h-12 max-w-2xl rounded-full" />
          <div className="bg-line/60 mt-8 h-3 w-48 rounded-full" />

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="border-line rounded-xl border bg-white p-3"
              >
                <div className="bg-line/60 aspect-square rounded-lg" />
                <div className="bg-line/60 mt-3 h-3 w-4/5 rounded-full" />
                <div className="bg-line/60 mt-2 h-3 w-2/5 rounded-full" />
                <div className="bg-line/60 mt-3 h-3 w-3/5 rounded-full" />
                <div className="bg-line/60 mt-4 h-8 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only" role="status">
          Loading search results
        </span>
      </div>
    </div>
  );
}
