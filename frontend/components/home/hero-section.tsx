"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { HeroParticleField } from "@/components/home/hero-particle-field";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import { usePageTransition } from "@/components/providers/transition-provider";

export function HeroSection() {
  const { isAuthenticated } = useAuthStore();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { shouldReduceMotion } = usePageTransition();

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-card to-background border-b border-border"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <HeroParticleField
          containerRef={sectionRef}
          reducedMotion={shouldReduceMotion}
        />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <ScrollReveal className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              简约博客平台
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance leading-tight">
            记录思考，
            <br />
            <span className="text-primary">分享知识</span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            MiniBlog 是一个简洁、现代的内容创作平台。在这里，你可以专注于写作，
            分享你的技术见解、生活感悟和创意想法。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            {isAuthenticated ? (
              <TransitionLink
                href="/write"
                transition="slideUp"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                开始写作
                <ArrowRight className="w-4 h-4" />
              </TransitionLink>
            ) : (
              <TransitionLink
                href="/register"
                transition="slideUp"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                免费注册
                <ArrowRight className="w-4 h-4" />
              </TransitionLink>
            )}
            <TransitionLink
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
            >
              浏览文章
            </TransitionLink>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
