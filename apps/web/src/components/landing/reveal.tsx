"use client";

import { motion } from "motion/react";

/** Fades a section up the first time it scrolls into view (or on mount with `immediate`). */
export function Reveal({
  children,
  delay = 0,
  className,
  immediate = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Animate on mount instead of on scroll, for content that starts on screen. */
  immediate?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      {...(immediate
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" } })}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
