"use client";

import { useState } from "react";
import useSWR from "swr";
import { ArticleCard } from "@/components/article-card";
import { articleApi } from "@/lib/api";
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedList } from "@/components/ui/animated-list";

export function ArticleList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, error, isLoading, mutate } = useSWR(
    ["articles", page, pageSize],
    () => articleApi.getList({ current: page, size: pageSize }),
    {
      revalidateOnFocus: false,
    }
  );

  const articles = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / pageSize));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "加载文章列表失败"}
        </p>
        <button
          onClick={() => mutate()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">最新文章</h2>
        <button
          onClick={() => mutate()}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="刷新"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {articles.length > 0 && articles[0].isTop === 1 && (
        <div className="mb-6">
          <ArticleCard article={articles[0]} featured />
        </div>
      )}

      <AnimatedList
        className="grid gap-6 md:grid-cols-2"
        animationKey={`home-page-${page}`}
      >
        {articles
          .slice(articles[0]?.isTop === 1 ? 1 : 0)
          .map((article) => (
            <ArticleCard key={article.articleId} article={article} />
          ))}
      </AnimatedList>

      {articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">暂无文章</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="上一页"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="下一页"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
