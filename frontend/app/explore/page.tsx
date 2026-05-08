"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ArticleCard } from "@/components/article-card";
import { Search, TrendingUp, Clock, Flame, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { articleApi, tagApi, type Article } from "@/lib/api";
import { useTransitionRouter } from "@/lib/use-transition-router";
import { AnimatedList } from "@/components/ui/animated-list";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const sortOptions = [
  { id: "trending", name: "热门", icon: Flame },
  { id: "latest", name: "最新", icon: Clock },
  { id: "views", name: "阅读量", icon: TrendingUp },
];

function sortArticles(items: Article[], sortType: string) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sortType === "views") {
      return right.viewCount - left.viewCount;
    }

    if (sortType === "trending") {
      if (right.isTop !== left.isTop) {
        return right.isTop - left.isTop;
      }
      return right.viewCount - left.viewCount;
    }

    return (
      new Date(right.createTime).getTime() - new Date(left.createTime).getTime()
    );
  });

  return sorted;
}

function ExplorePageContent() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword") ?? "";
  const categoryFromUrl = Number(searchParams.get("categoryId") ?? 0) || 0;
  const tagFromUrl = Number(searchParams.get("tagId") ?? 0) || 0;

  const [searchQuery, setSearchQuery] = useState(keywordFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedSort, setSelectedSort] = useState("trending");

  useEffect(() => {
    setSearchQuery(keywordFromUrl);
  }, [keywordFromUrl]);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const { data: activeTag } = useSWR(
    tagFromUrl > 0 ? ["explore-tag", tagFromUrl] : null,
    () => tagApi.getDetail(tagFromUrl),
    {
      revalidateOnFocus: false,
    }
  );

  const { data: metaData } = useSWR(
    ["explore-meta"],
    () => articleApi.getList({ current: 1, size: 60 }),
    {
      revalidateOnFocus: false,
    }
  );

  const categories = useMemo(() => {
    const items = metaData?.items ?? [];
    const unique = new Map<number, string>();

    items.forEach((article) => {
      if (article.categoryId && article.categoryName) {
        unique.set(article.categoryId, article.categoryName);
      }
    });

    return [
      { id: 0, name: "全部" },
      ...Array.from(unique.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((left, right) => left.id - right.id),
    ];
  }, [metaData?.items]);

  const {
    data,
    error,
    isLoading,
  } = useSWR(
    ["explore-articles", keywordFromUrl, categoryFromUrl, tagFromUrl],
    () =>
      articleApi.getList({
        current: 1,
        size: 24,
        keyword: keywordFromUrl || undefined,
        categoryId: categoryFromUrl > 0 ? categoryFromUrl : undefined,
        tagId: tagFromUrl > 0 ? tagFromUrl : undefined,
      }),
    {
      revalidateOnFocus: false,
    }
  );

  const filteredArticles = useMemo(
    () => sortArticles(data?.items ?? [], selectedSort),
    [data?.items, selectedSort]
  );
  const suggestedKeyword =
    data?.suggestion?.trim() && data.suggestion.trim() !== keywordFromUrl.trim()
      ? data.suggestion.trim()
      : "";

  const applyFilters = (nextKeyword: string, nextCategory: number, nextTagId: number) => {
    const params = new URLSearchParams();

    if (nextKeyword.trim()) {
      params.set("keyword", nextKeyword.trim());
    }
    if (nextCategory > 0) {
      params.set("categoryId", String(nextCategory));
    }
    if (nextTagId > 0) {
      params.set("tagId", String(nextTagId));
    }

    const query = params.toString();
    router.push(query ? `/explore?${query}` : "/explore");
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    applyFilters(searchQuery, selectedCategory, tagFromUrl);
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    applyFilters(searchQuery, categoryId, tagFromUrl);
  };

  const clearTagFilter = () => {
    applyFilters(searchQuery, selectedCategory, 0);
  };

  return (
    <>
      <div className="bg-card border-b border-border">
        <ScrollReveal className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              发现
            </h1>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
              按标题关键词、分类和标签浏览当前已经发布的文章，排序在前端按真实列表结果即时切换。
            </p>
            {tagFromUrl > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">当前标签：</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {activeTag?.tagName || `标签 #${tagFromUrl}`}
                  <button
                    type="button"
                    onClick={clearTagFilter}
                    className="rounded-full p-0.5 text-primary/80 hover:bg-primary/15 hover:text-primary transition-colors"
                    aria-label="清除标签筛选"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            )}

            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索文章标题..."
                className="w-full h-12 pl-12 pr-4 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </form>
          </div>
        </ScrollReveal>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedSort(option.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedSort === option.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <option.icon className="w-4 h-4" />
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-5 text-sm text-destructive">
            {error instanceof Error ? error.message : "读取文章列表失败"}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredArticles.length > 0 ? (
          <AnimatedList
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            animationKey={`${keywordFromUrl}-${categoryFromUrl}-${tagFromUrl}-${selectedSort}`}
          >
            {filteredArticles.map((article) => (
              <ArticleCard key={article.articleId} article={article} />
            ))}
          </AnimatedList>
        ) : (
          <div className="py-20">
            {suggestedKeyword && (
              <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 text-sm shadow-sm">
                <p className="text-center text-foreground">
                  <span className="text-muted-foreground">没有找到和 </span>
                  <span className="font-medium">“{keywordFromUrl.trim()}”</span>
                  <span className="text-muted-foreground"> 相关的文章，你要搜索的是不是 </span>
                  <button
                    type="button"
                    onClick={() => applyFilters(suggestedKeyword, selectedCategory, tagFromUrl)}
                    className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary/80"
                  >
                    “{suggestedKeyword}”
                  </button>
                  <span className="text-muted-foreground">？</span>
                </p>
              </div>
            )}
            <div className="text-center">
              <Search className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">没有找到匹配的文章</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}
