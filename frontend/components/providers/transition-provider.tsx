"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  applyMotionPreference,
  getStoredMotionPreference,
  persistMotionPreference,
  resolveShouldReduceMotion,
  resolveTransitionType,
  type MotionPreference,
  type NavigationDirection,
  type TransitionType,
} from "@/lib/motion";

type PendingTransition = {
  pathname: string;
  type: TransitionType;
};

type TransitionContextValue = {
  currentPathname: string;
  pendingPathname: string | null;
  direction: NavigationDirection;
  transitionType: TransitionType;
  motionPreference: MotionPreference;
  setMotionPreference: (motionPreference: MotionPreference) => void;
  shouldReduceMotion: boolean;
  registerSnapshotCapture: (capture: (() => void) | null) => void;
  prepareTransition: (pathname: string, transitionType?: TransitionType) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [transitionType, setTransitionType] = useState<TransitionType>("fade");
  const [direction, setDirection] = useState<NavigationDirection>("forward");
  const [pendingPathname, setPendingPathname] = useState<string | null>(null);
  const [motionPreference, setMotionPreferenceState] =
    useState<MotionPreference>("system");
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] =
    useState(false);

  const pathStackRef = useRef<string[]>([pathname]);
  const pathIndexRef = useRef(0);
  const previousPathRef = useRef(pathname);
  const pendingTransitionRef = useRef<PendingTransition | null>(null);
  const snapshotCaptureRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const nextMotionPreference = getStoredMotionPreference();
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setMotionPreferenceState(nextMotionPreference);
    setSystemPrefersReducedMotion(mediaQuery.matches);
    applyMotionPreference(nextMotionPreference);

    const handleChange = () => {
      const prefersReducedMotion = mediaQuery.matches;
      setSystemPrefersReducedMotion(prefersReducedMotion);

      if (getStoredMotionPreference() === "system") {
        applyMotionPreference("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useLayoutEffect(() => {
    const previousPathname = previousPathRef.current;

    if (pathname === previousPathname) {
      return;
    }

    const pathStack = pathStackRef.current;
    const currentIndex = pathIndexRef.current;
    let nextDirection: NavigationDirection = "forward";

    if (currentIndex > 0 && pathStack[currentIndex - 1] === pathname) {
      nextDirection = "backward";
      pathIndexRef.current = currentIndex - 1;
    } else if (
      currentIndex < pathStack.length - 1 &&
      pathStack[currentIndex + 1] === pathname
    ) {
      nextDirection = "forward";
      pathIndexRef.current = currentIndex + 1;
    } else {
      pathStackRef.current = [...pathStack.slice(0, currentIndex + 1), pathname];
      pathIndexRef.current = currentIndex + 1;
      nextDirection = "forward";
    }

    const pendingTransition = pendingTransitionRef.current;
    const nextTransitionType =
      pendingTransition?.pathname === pathname
        ? pendingTransition.type
        : resolveTransitionType(previousPathname, pathname);

    pendingTransitionRef.current = null;
    previousPathRef.current = pathname;
    setDirection(nextDirection);
    setTransitionType(nextTransitionType);
    setPendingPathname(null);
  }, [pathname]);

  const setMotionPreference = useCallback((nextMotionPreference: MotionPreference) => {
    setMotionPreferenceState(nextMotionPreference);
    persistMotionPreference(nextMotionPreference);
  }, []);

  const registerSnapshotCapture = useCallback((capture: (() => void) | null) => {
    snapshotCaptureRef.current = capture;
  }, []);

  const prepareTransition = useCallback(
    (nextPathname: string, nextTransitionType?: TransitionType) => {
      const transitionTypeToUse =
        nextTransitionType ??
        resolveTransitionType(previousPathRef.current, nextPathname);

      snapshotCaptureRef.current?.();
      pendingTransitionRef.current = {
        pathname: nextPathname,
        type: transitionTypeToUse,
      };
      setPendingPathname(nextPathname);
      setTransitionType(transitionTypeToUse);
      setDirection("forward");
    },
    []
  );

  const shouldReduceMotion = resolveShouldReduceMotion(
    motionPreference,
    systemPrefersReducedMotion
  );

  const value = useMemo<TransitionContextValue>(
    () => ({
      currentPathname: pathname,
      pendingPathname,
      direction,
      transitionType,
      motionPreference,
      setMotionPreference,
      shouldReduceMotion,
      registerSnapshotCapture,
      prepareTransition,
    }),
    [
      direction,
      motionPreference,
      pathname,
      pendingPathname,
      prepareTransition,
      registerSnapshotCapture,
      setMotionPreference,
      shouldReduceMotion,
      transitionType,
    ]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(TransitionContext);

  if (!context) {
    throw new Error("usePageTransition must be used within TransitionProvider");
  }

  return context;
}
