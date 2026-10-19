/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/**
 * Baseline response headers.
 *
 * On the Content-Security-Policy below: `script-src` is deliberately absent.
 * Next emits inline bootstrap scripts (`self.__next_f.push([...])`), so locking
 * script sources down requires a per-request nonce minted in middleware — and
 * that forces every matched route into DYNAMIC rendering, which would destroy
 * the full-page static caching the catalogue depends on. That trade is worth
 * making when the first genuinely dynamic route lands (cart/checkout), with
 * middleware's `matcher` scoped to exclude the static catalogue routes.
 *
 * The four directives that ARE set need no nonce, cost nothing and break
 * nothing, so there is no reason to withhold them in the meantime.
 *
 * Target policy once nonces exist:
 *   default-src 'self';
 *   script-src 'self' 'nonce-{NONCE}' 'strict-dynamic';
 *   style-src 'self' 'unsafe-inline';      // unavoidable with Tailwind/Next
 *   img-src 'self' data: blob:;
 *   font-src 'self';                       // next/font self-hosts at build time
 *   connect-src 'self';
 *   base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none';
 *   upgrade-insecure-requests
 * A payment gateway will need its domains added to script-src/connect-src/frame-src.
 */
const contentSecurityPolicy = [
  // Blocks an injected <base> from repointing every relative URL on the page.
  "base-uri 'self'",
  // Kills <object>/<embed> plugin vectors outright.
  "object-src 'none'",
  // Stops an injected form POSTing customer or card details to another origin.
  "form-action 'self'",
  // Modern replacement for X-Frame-Options, which is kept below for old browsers.
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Stop browsers MIME-sniffing a response into something executable.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking, for browsers predating frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  // Send the origin only on cross-origin requests, never the full path.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /**
   * Force HTTPS for two years, including subdomains.
   *
   * Without this, a customer typing "mittimadhur.in" on café Wi-Fi makes one
   * plaintext request that an on-path attacker can answer and then keep the
   * whole session on HTTP. That is a cloned-checkout risk the moment session
   * cookies and card flows exist.
   *
   * NOTE before going live: every subdomain must already serve HTTPS, or
   * includeSubDomains will break it. Drop `preload` unless you intend to
   * submit to the browser preload list, which is hard to reverse.
   */
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  /**
   * Drop powerful APIs the storefront has no use for.
   *
   * `payment=()` is set deliberately: when a gateway lands, allowing it must be
   * an explicit edit rather than an open default.
   */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  /**
   * Isolate the browsing context from cross-origin popups.
   *
   * WHEN A PAYMENT GATEWAY IS ADDED: popup-based flows (several Razorpay and
   * 3-D Secure paths) post their result back via `window.opener`, which this
   * severs. Relax it to `same-origin-allow-popups` — do NOT delete the header.
   */
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** @type {import("next").NextConfig} */
const config = {
  /**
   * Removes X-Powered-By. Note this does NOT hide the framework: the response
   * still carries x-nextjs-cache, Vary: rsc and /_next/static/ paths, so any
   * scanner fingerprints Next instantly. No version leaks, which is the part
   * that matters; strip the rest at the CDN if fingerprinting is a concern.
   */
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // All imagery is local to /public today. Any future CDN host must be
    // allow-listed here explicitly rather than opened up with a wildcard.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
