"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: it replaces the root layout entirely, so it has to
 * render its own <html> and <body>. The stylesheet is one of the things that
 * may have failed to load, so every style here is inline. As with error.tsx,
 * the raw message is never shown — only the digest.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#fbf7f1",
          color: "#1f2a1c",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "26rem", textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: 400,
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "#7a7266",
            }}
          >
            MittiMadhur hit an unexpected error and could not finish loading the
            page. Please try again.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              minHeight: "44px",
              padding: "0 24px",
              border: 0,
              borderRadius: "9999px",
              backgroundColor: "#7b3f12",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>

          {error.digest && (
            <p
              style={{
                margin: "24px 0 0",
                fontSize: "0.75rem",
                color: "#7a7266",
              }}
            >
              Reference code: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
