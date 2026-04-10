"use client";

import { Children, type ReactNode } from "react";
import { usePageTransition } from "@/components/providers/transition-provider";
import { cn } from "@/lib/utils";

const { motion } =
  require("framer-motion") as typeof import("framer-motion");

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  stagger?: number;
  animationKey?: string | number;
}

export function AnimatedList({
  children,
  className,
  itemClassName,
  stagger = 0.06,
  animationKey,
}: AnimatedListProps) {
  const { shouldReduceMotion } = usePageTransition();
  const items = Children.toArray(children);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={animationKey}
      className={className}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
    >
      {items.map((child, index) => (
        <motion.div
          key={(child as { key?: string | number | null })?.key ?? index}
          className={cn("h-full", itemClassName)}
          variants={{
            initial: {
              opacity: 0,
              y: 18,
            },
            animate: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.32,
                ease: [0.4, 0, 0.2, 1],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
