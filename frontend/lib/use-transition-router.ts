"use client";

import { usePathname, useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { usePageTransition } from "@/components/providers/transition-provider";
import {
  normalizePathname,
  resolveTransitionType,
  type TransitionType,
} from "@/lib/motion";

interface TransitionNavigationOptions {
  scroll?: boolean;
  transition?: TransitionType;
}

export function useTransitionRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const { prepareTransition } = usePageTransition();

  const navigate = (
    method: "push" | "replace",
    href: string,
    options?: TransitionNavigationOptions
  ) => {
    const nextPathname = normalizePathname(href);

    if (nextPathname !== pathname) {
      flushSync(() => {
        prepareTransition(
          nextPathname,
          options?.transition ?? resolveTransitionType(pathname, nextPathname)
        );
      });
    }

    router[method](href, {
      scroll: options?.scroll,
    });
  };

  return {
    push: (href: string, options?: TransitionNavigationOptions) =>
      navigate("push", href, options),
    replace: (href: string, options?: TransitionNavigationOptions) =>
      navigate("replace", href, options),
    prefetch: router.prefetch,
    back: router.back,
  };
}
