import type { Transition, Variants } from "framer-motion";
import type { UrlObject } from "url";

export type TransitionType = "fade" | "slide" | "scaleFade" | "slideUp";
export type NavigationDirection = "forward" | "backward";
export type MotionPreference = "system" | "full" | "reduced";
export type HrefValue = string | URL | UrlObject;

export const MOTION_STORAGE_KEY = "miniblog-motion";
export const DEFAULT_MOTION_PREFERENCE: MotionPreference = "system";

const MOTION_EASE = [0.4, 0, 0.2, 1] as const;

export function isMotionPreference(
  value: string | null
): value is MotionPreference {
  return value === "system" || value === "full" || value === "reduced";
}

export function getSystemPrefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function resolveShouldReduceMotion(
  motionPreference: MotionPreference,
  systemPrefersReducedMotion = getSystemPrefersReducedMotion()
) {
  if (motionPreference === "reduced") {
    return true;
  }

  if (motionPreference === "full") {
    return false;
  }

  return systemPrefersReducedMotion;
}

export function getStoredMotionPreference() {
  if (typeof window === "undefined") {
    return DEFAULT_MOTION_PREFERENCE;
  }

  const storedMotionPreference = window.localStorage.getItem(MOTION_STORAGE_KEY);
  return isMotionPreference(storedMotionPreference)
    ? storedMotionPreference
    : DEFAULT_MOTION_PREFERENCE;
}

export function applyMotionPreference(motionPreference: MotionPreference) {
  if (typeof document === "undefined") {
    return;
  }

  const shouldReduceMotion = resolveShouldReduceMotion(motionPreference);

  document.documentElement.dataset.motionPreference = motionPreference;
  document.documentElement.dataset.motionReduced = shouldReduceMotion
    ? "true"
    : "false";
}

export function persistMotionPreference(motionPreference: MotionPreference) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MOTION_STORAGE_KEY, motionPreference);
  }

  applyMotionPreference(motionPreference);
}

export function getMotionInitScript() {
  return `
    (function () {
      try {
        var key = "${MOTION_STORAGE_KEY}";
        var motionPreference = window.localStorage.getItem(key);
        if (motionPreference !== "system" && motionPreference !== "full" && motionPreference !== "reduced") {
          motionPreference = "${DEFAULT_MOTION_PREFERENCE}";
        }
        var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var shouldReduce = motionPreference === "reduced" || (motionPreference === "system" && prefersReduced);
        document.documentElement.dataset.motionPreference = motionPreference;
        document.documentElement.dataset.motionReduced = shouldReduce ? "true" : "false";
      } catch (error) {
        document.documentElement.dataset.motionPreference = "${DEFAULT_MOTION_PREFERENCE}";
        document.documentElement.dataset.motionReduced = "false";
      }
    })();
  `;
}

export function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }

  const normalized = pathname.split("?")[0]?.split("#")[0] ?? "/";
  return normalized === "" ? "/" : normalized;
}

export function getHrefPathname(href: HrefValue) {
  if (typeof href === "string") {
    try {
      return new URL(href, "https://miniblog.local").pathname;
    } catch {
      return normalizePathname(href);
    }
  }

  if (href instanceof URL) {
    return normalizePathname(href.pathname);
  }

  if (typeof href.pathname === "string") {
    return normalizePathname(href.pathname);
  }

  return null;
}

export function isArticlePath(pathname: string) {
  return /^\/article\/[^/]+$/.test(pathname);
}

export function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

export function isSitePath(pathname: string) {
  return !isAuthPath(pathname) && pathname !== "/write";
}

function isProfileListPath(pathname: string) {
  return pathname === "/" || pathname === "/explore" || pathname === "/profile";
}

export function resolveTransitionType(
  fromPathname: string,
  toPathname: string
): TransitionType {
  const from = normalizePathname(fromPathname);
  const to = normalizePathname(toPathname);

  if ((from === "/login" && to === "/profile") || (from === "/write" && to === "/profile")) {
    return "fade";
  }

  if (isAuthPath(from) && isAuthPath(to)) {
    return "fade";
  }

  if (to === "/login" || to === "/register") {
    return "slideUp";
  }

  if (to === "/write") {
    return "slideUp";
  }

  if (to === "/profile") {
    return "slide";
  }

  if (isProfileListPath(from) && isArticlePath(to)) {
    return "scaleFade";
  }

  if (isArticlePath(from) && isProfileListPath(to)) {
    return "scaleFade";
  }

  if (
    (from === "/" && to === "/explore") ||
    (from === "/explore" && to === "/")
  ) {
    return "fade";
  }

  return "fade";
}

export function getPageTransitionDefinition(
  transitionType: TransitionType,
  direction: NavigationDirection,
  shouldReduceMotion: boolean
): {
  variants: Variants;
  transition: Transition;
} {
  if (shouldReduceMotion) {
    return {
      variants: {
        initial: { opacity: 0.01 },
        animate: { opacity: 1 },
        exit: { opacity: 0.01 },
      },
      transition: {
        duration: 0.14,
        ease: "easeOut",
      },
    };
  }

  if (transitionType === "slide") {
    const distance = direction === "backward" ? -26 : 26;

    return {
      variants: {
        initial: { opacity: 0, x: distance },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -distance },
      },
      transition: {
        duration: 0.3,
        ease: MOTION_EASE,
      },
    };
  }

  if (transitionType === "scaleFade") {
    return {
      variants: {
        initial: { opacity: 0, scale: 0.985 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.985 },
      },
      transition: {
        duration: 0.25,
        ease: MOTION_EASE,
      },
    };
  }

  if (transitionType === "slideUp") {
    return {
      variants: {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      },
      transition: {
        duration: 0.35,
        ease: MOTION_EASE,
      },
    };
  }

  return {
    variants: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  };
}
