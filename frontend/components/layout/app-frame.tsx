"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PageTransitionShell } from "@/components/ui/page-transition-shell";
import { isSitePath } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasSiteChrome = isSitePath(pathname);

  return (
    <div
      className={cn(
        "bg-background",
        hasSiteChrome && "min-h-screen flex flex-col"
      )}
    >
      {hasSiteChrome && <Header />}
      <main className={cn(hasSiteChrome && "flex-1")}>
        <PageTransitionShell>{children}</PageTransitionShell>
      </main>
      {hasSiteChrome && <Footer />}
    </div>
  );
}
