"use client";

import Image from "next/image";
import { useState } from "react";

// next/image with a warm placeholder, so the layout still looks right
// before you've added the real photos to /public/images.
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
