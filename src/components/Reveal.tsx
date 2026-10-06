"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// Fades + slides content up once it scrolls into view.
export function Reveal({
  children,
  delay = 0,
  y = 24,
  inView = true,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  /** false = animate on mount (for above-the-fold content) */
  inView?: boolean;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  const initial = reduce ? false : { opacity: 0, y };
  const target = { opacity: 1, y: 0 };
  const transition = {
    duration: 0.6,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  return inView ? (
    <Comp
      className={className}
      initial={initial}
      whileInView={target}
      viewport={{ once: true, margin: "-60px" }}
      transition={transition}
    >
      {children}
    </Comp>
  ) : (
    <Comp
      className={className}
      initial={initial}
      animate={target}
      transition={transition}
    >
      {children}
    </Comp>
  );
}
