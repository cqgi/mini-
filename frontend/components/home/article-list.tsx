"use client";

import { useState } from "react";
import useSWR from "swr";
import { ArticleCard } from "@/components/article-card";
import { articleApi, type Article } from "@/lib/api";
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

// Mock data for demo
const mockArticles: Article[] = [
  {
    articleId: 1,
    title: "深入理解 React Server Components",
    summary: "React Server Components 是 React 18 引入的一项重要特性，它允许我们在服务端渲染组件，从而大幅减少客户端 JavaScript 包的大小...",
    content: "",
    cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    userId: 1,
    categoryId: 1,
    viewCount: 1234,
    isTop: 1,
    status: 1,
    createTime: "2024-03-15T10:30:00",
    updateTime: "2024-03-15T10:30:00",
    authorNickname: "张三",
    authorAvatar: "",
    categoryName: "前端开发",
    tagNames: ["React", "Next.js"],
  },
  {
    articleId: 2,
    title: "TypeScript 5.0 新特性详解",
    summary: "TypeScript 5.0 带来了许多令人兴奋的新特性，包括装饰器支持、const 类型参数等。本文将详细介绍这些新特性...",
    content: "",
    cover: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
    userId: 2,
    categoryId: 1,
    viewCount: 856,
    isTop: 0,
    status: 1,
    createTime: "2024-03-14T09:00:00",
    updateTime: "2024-03-14T09:00:00",
    authorNickname: "李四",
    authorAvatar: "",
    categoryName: "前端开发",
    tagNames: ["TypeScript", "JavaScript"],
  },
  {
    articleId: 3,
    title: "构建高性能的 Node.js 应用",
    summary: "在这篇文章中，我们将探讨如何构建高性能的 Node.js 应用，包括事件循环优化、内存管理、集群模式等关键技术点...",
    content: "",
    cover: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop",
    userId: 3,
    categoryId: 2,
    viewCount: 567,
    isTop: 0,
    status: 1,
    createTime: "2024-03-13T14:20:00",
    updateTime: "2024-03-13T14:20:00",
    authorNickname: "王五",
    authorAvatar: "",
    categoryName: "后端开发",
    tagNames: ["Node.js", "性能优化"],
  },
  {
    articleId: 4,
    title: "Tailwind CSS 最佳实践指南",
    summary: "Tailwind CSS 已经成为最流行的 CSS 框架之一。本文将分享一些使用 Tailwind CSS 的最佳实践和技巧...",
    content: "",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop",
    userId: 1,
    categoryId: 1,
    viewCount: 423,
    isTop: 0,
    status: 1,
    createTime: "2024-03-12T11:45:00",
    updateTime: "2024-03-12T11:45:00",
    authorNickname: "张三",
    authorAvatar: "",
    categoryName: "前端开发",
    tagNames: ["CSS", "Tailwind"],
  },
  {
    articleId: 5,
    title: "微服务架构设计与实践",
    summary: "微服务架构已经成为现代应用开发的主流架构模式。本文将从实践角度分析微服务架构的设计原则和最佳实践...",
    content: "",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop",
    userId: 4,
    categoryId: 3,
    viewCount: 789,
    isTop: 0,
    status: 1,
    createTime: "2024-03-11T16:30:00",
    updateTime: "2024-03-11T16:30:00",
    authorNickname: "赵六",
    authorAvatar: "",
    categoryName: "架构设计",
    tagNames: ["微服务", "架构"],
  },
];

export function ArticleList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Try to fetch from API, fallback to mock data
  const { data, error, isLoading, mutate } = useSWR(
    ["articles", page],
    async () => {
      try {
        const result = await articleApi.getList({ page, size: pageSize });
        if (result.data?.records?.length > 0) {
          return result.data;
        }
        // Return mock data if no real data
        return {
          records: mockArticles,
          total: mockArticles.length,
          size: pageSize,
          current: 1,
          pages: 1,
        };
      } catch {
        // Return mock data on error
        return {
          records: mockArticles,
          total: mockArticles.length,
          size: pageSize,
          current: 1,
          pages: 1,
        };
      }
    },
    {
      revalidateOnFocus: false,
      fallbackData: {
        records: mockArticles,
        total: mockArticles.length,
        size: pageSize,
        current: 1,
        pages: 1,
      },
    }
  );

  const articles = data?.records || [];
  const totalPages = data?.pages || 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground mb-4">加载文章列表失败</p>
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
      {/* Section Header */}
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

      {/* Featured Article */}
      {articles.length > 0 && articles[0].isTop === 1 && (
        <div className="mb-6">
          <ArticleCard article={articles[0]} featured />
        </div>
      )}

      {/* Article Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {articles.slice(articles[0]?.isTop === 1 ? 1 : 0).map((article) => (
          <ArticleCard key={article.articleId} article={article} />
        ))}
      </div>

      {/* Empty State */}
      {articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">暂无文章</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
