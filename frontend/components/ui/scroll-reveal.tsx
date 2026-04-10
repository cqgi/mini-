"use client";

import type { ReactNode } from "react";
import { usePageTransition } from "@/components/providers/transition-provider";
import { cn } from "@/lib/utils";

const { motion } =
  require("framer-motion") as typeof import("framer-motion");

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const { shouldReduceMotion } = usePageTransition();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
