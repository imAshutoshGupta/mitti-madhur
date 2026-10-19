"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Newsletter sign-up. This lives in the root layout's footer, so whatever it
 * says is said on every page — including /404 and the error page. Nothing is
 * transmitted yet, so the copy promises only what actually happens: the
 * address is noted, no welcome email is sent.
 */
export function Newsletter() {
  const [done, setDone] = useState(false);
  const confirmationRef = useRef<HTMLParagraphElement>(null);

  // The form unmounts on submit, which would drop focus onto <body> and leave
  // a screen-reader user with no idea anything happened. role="status"
  // announces the confirmation, and moving focus to it keeps the keyboard
  // caret somewhere meaningful.
  useEffect(() => {
    if (done) confirmationRef.current?.focus();
  }, [done]);

  return (
    <section
      id="contact"
      className="bg-gradient-to-r from-[#6b3410] to-[#8a4a1a] text-white"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl">
            Join Our Natural Living Community
          </h2>
          <p className="mt-1 text-sm text-white/80">
            Our newsletter is on its way. Leave your email and we&rsquo;ll let
            you know the moment it launches.
          </p>
        </div>

        {done ? (
          <p
            ref={confirmationRef}
            role="status"
            tabIndex={-1}
            className="rounded-full bg-white/15 px-6 py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Thanks &mdash; we&rsquo;ll be in touch when the newsletter launches.
          </p>
        ) : (
          /* TODO(step 2+): POST to a real mailing-list provider; validate server-side with Zod, rate-limit by IP and address, and use double opt-in. */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="flex w-full max-w-md rounded-full bg-white p-1 md:w-auto md:min-w-96"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              aria-label="Email address"
              className="text-ink min-w-0 flex-1 rounded-full px-4 text-sm outline-none"
            />
            <button className="bg-brown hover:bg-brown-dark flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5">
              Subscribe <ArrowRight className="size-4" aria-hidden />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
