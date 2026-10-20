"use client";

import Image from "next/image";
import { useState } from "react";

// next/image on a warm gradient. If the image fails to load it is removed and
// the gradient stays, so a missing file never shows a broken-image icon.
export function Photo({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  fit = "cover",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`${className.includes("absolute") ? "" : "relative"} overflow-hidden bg-gradient-to-br from-[#e9c9a0] to-[#b9773f] ${className}`}
    >
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={fit === "cover" ? "object-cover" : "object-contain p-3"}
        />
      )}
    </div>
  );
}
