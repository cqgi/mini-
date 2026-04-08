import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/home/hero-section";
import { ArticleList } from "@/components/home/article-list";
import { Sidebar } from "@/components/home/sidebar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              <ArticleList />
            </div>
            <aside className="lg:w-80 shrink-0">
              <Sidebar />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
