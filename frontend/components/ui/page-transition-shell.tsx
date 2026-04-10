"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePageTransition } from "@/components/providers/transition-provider";
import { getPageTransitionDefinition } from "@/lib/motion";
import { cn } from "@/lib/utils";

const { motion } =
  require("framer-motion") as typeof import("framer-motion");

interface PageTransitionShellProps {
  children: ReactNode;
  className?: string;
}

export function PageTransitionShell({
  children,
  className,
}: PageTransitionShellProps) {
  const {
    currentPathname,
    pendingPathname,
    direction,
    registerSnapshotCapture,
    transitionType,
    shouldReduceMotion,
  } = usePageTransition();
  const liveRef = useRef<HTMLDivElement | null>(null);
  const [snapshot, setSnapshot] = useState<{
    html: string;
    height: number;
    pathname: string;
  } | null>(null);
  const [phase, setPhase] = useState<"idle" | "holding" | "entering">("idle");

  const captureSnapshot = useCallback(() => {
    if (shouldReduceMotion) {
      return;
    }

    const node = liveRef.current;

    if (!node) {
      return;
    }

    setSnapshot({
      html: node.innerHTML,
      height: node.offsetHeight,
      pathname: currentPathname,
    });
    setPhase("holding");
  }, [currentPathname, shouldReduceMotion]);

  useLayoutEffect(() => {
    registerSnapshotCapture(captureSnapshot);

    return () => {
      registerSnapshotCapture(null);
    };
  }, [captureSnapshot, registerSnapshotCapture]);

  useLayoutEffect(() => {
    if (shouldReduceMotion) {
      if (snapshot || phase !== "idle") {
        setSnapshot(null);
        setPhase("idle");
      }
      return;
    }

    if (
      pendingPathname &&
      currentPathname !== pendingPathname &&
      phase === "idle"
    ) {
      captureSnapshot();
      return;
    }

    if (phase === "holding" && pendingPathname && currentPathname === pendingPathname) {
      setPhase("entering");
      return;
    }

    if (phase === "holding" && !pendingPathname) {
      setSnapshot(null);
      setPhase("idle");
    }
  }, [
    currentPathname,
    pendingPathname,
    phase,
    captureSnapshot,
    shouldReduceMotion,
    snapshot,
  ]);

  useLayoutEffect(() => {
    if (phase === "idle" && snapshot && snapshot.pathname === currentPathname) {
      setSnapshot(null);
    }
  }, [
    currentPathname,
    phase,
    shouldReduceMotion,
    snapshot,
  ]);

  const definition = getPageTransitionDefinition(
    transitionType,
    direction,
    shouldReduceMotion
  );

  const handleAnimationComplete = () => {
    if (shouldReduceMotion) {
      return;
    }

    if (phase === "entering") {
      setSnapshot(null);
      setPhase("idle");
    }
  };

  const liveVariants = {
    hidden: definition.variants.initial,
    visible: definition.variants.animate,
  };
  const overlayVariants = {
    visible: definition.variants.animate,
    exiting: definition.variants.exit,
  };
  const isHoldingSnapshot = snapshot !== null;
  const liveVisibilityStyle: CSSProperties | undefined =
    isHoldingSnapshot && phase !== "entering"
      ? { visibility: "hidden" }
      : undefined;

  return (
    <div className={cn("relative h-full w-full", className)}>
      {snapshot && (
        <motion.div
          key={`snapshot-${snapshot.pathname}`}
          initial={false}
          animate={phase === "entering" ? "exiting" : "visible"}
          variants={overlayVariants}
          transition={definition.transition}
          className={cn(
            "pointer-events-none absolute inset-0 z-10 overflow-hidden bg-background",
            !shouldReduceMotion && "will-change-transform"
          )}
          style={{ minHeight: snapshot.height }}
          aria-hidden="true"
        >
          <div dangerouslySetInnerHTML={{ __html: snapshot.html }} />
        </motion.div>
      )}

      <motion.div
        key={currentPathname}
        ref={liveRef}
        initial={isHoldingSnapshot ? "hidden" : false}
        animate={isHoldingSnapshot ? (phase === "entering" ? "visible" : "hidden") : "visible"}
        variants={liveVariants}
        transition={definition.transition}
        onAnimationComplete={handleAnimationComplete}
        className={cn("h-full w-full", !shouldReduceMotion && "will-change-transform")}
        style={liveVisibilityStyle}
      >
        {children}
      </motion.div>
    </div>
  );
}
