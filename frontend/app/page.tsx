import { HeroSection } from "@/components/home/hero-section";
import { ArticleList } from "@/components/home/article-list";
import { Sidebar } from "@/components/home/sidebar";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <ArticleList />
          </div>
          <aside className="lg:w-80 shrink-0">
            <ScrollReveal delay={0.08}>
              <Sidebar />
            </ScrollReveal>
          </aside>
        </div>
      </div>
    </>
  );
}
