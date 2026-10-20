// Business details used across the site.
//
// This is the ONE file to edit when any of these change. Nothing else in the
// codebase hard-codes these values, so a change here reaches every page and
// checkout in one go.
//
// Values marked PLACEHOLDER were invented during development and must be
// replaced with the client's real details before launch.
//
// Everything here is public: it is rendered into pages and shipped to the
// browser. Never put secrets (API keys, database URLs) in this file — those
// belong in .env, validated by src/env.js.

/**
 * PLACEHOLDER — the shop's real customer-service number. Write it as +91 then
 * the 10-digit number; spaces or dashes are fine, e.g. "+91 98765 43210".
 */
const phone = "+91 12345 67890";

export const siteConfig = {
  /** Address of the live site, used for SEO metadata and search-engine data. */
  url: "https://mittimadhur.in",

  contact: {
    /** Unconfirmed — check this mailbox exists before launch. */
    email: "hello@mittimadhur.in",
    phone,
    /** The same number as a tel: link (digits and "+" only), derived so the two can never disagree. */
    phoneHref: `tel:${phone.replace(/[^\d+]/g, "")}`,
    location: "Kolhapur, Maharashtra, India",
  },

  social: {
    /** PLACEHOLDER — points at instagram.com itself, not the shop's profile. */
    instagram: "https://instagram.com",
  },

  legal: {
    /** Courts named in the Terms of Service. Needs the client's legal sign-off. */
    jurisdiction: "Kolhapur, Maharashtra",
  },

  /**
   * PLACEHOLDER delivery pricing — confirm with the client. Money is in paise
   * (₹1 = 100 paise). Checkout charges exactly these and the shipping policy
   * page prints them, so the two can never drift apart.
   */
  shipping: {
    /** Charged on orders below the free-delivery threshold. ₹49 */
    flatRatePaise: 4_900,
    /** Orders at or above this subtotal ship free. ₹499 */
    freeThresholdPaise: 49_900,
  },
};
