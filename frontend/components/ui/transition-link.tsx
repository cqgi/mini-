"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { usePageTransition } from "@/components/providers/transition-provider";
import {
  getHrefPathname,
  resolveTransitionType,
  type HrefValue,
  type TransitionType,
} from "@/lib/motion";

type TransitionLinkProps = React.ComponentProps<typeof Link> & {
  transition?: TransitionType;
};

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export function TransitionLink({
  href,
  onClick,
  transition,
  target,
  ...props
}: TransitionLinkProps) {
  const pathname = usePathname();
  const { prepareTransition } = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      isModifiedEvent(event) ||
      target === "_blank"
    ) {
      return;
    }

    const nextPathname = getHrefPathname(href as HrefValue);

    if (!nextPathname || nextPathname === pathname) {
      return;
    }

    flushSync(() => {
      prepareTransition(
        nextPathname,
        transition ?? resolveTransitionType(pathname, nextPathname)
      );
    });
  };

  return (
    <Link href={href} onClick={handleClick} target={target} {...props} />
  );
}
