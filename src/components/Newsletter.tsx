"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <footer id="contact" className="bg-gradient-to-r from-[#6b3410] to-[#8a4a1a] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl">Join Our Natural Living Community</h2>
          <p className="mt-1 text-sm text-white/80">
            Get updates on new products, recipes and special offers.
          </p>
        </div>

        {done ? (
          <p className="rounded-full bg-white/15 px-6 py-3 text-sm font-medium">
            Subscribed. Check your inbox for a welcome email.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true); // TODO: send the email to your mailing list provider
            }}
            className="flex w-full max-w-md rounded-full bg-white p-1"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-full px-4 text-sm text-ink outline-none"
            />
            <button className="flex items-center gap-2 rounded-full bg-brown px-5 py-2.5 text-sm font-semibold hover:bg-brown-dark">
              Subscribe <ArrowRight className="size-4" aria-hidden />
            </button>
          </form>
        )}
      </div>
    </footer>
  );
}
