"use client";

import { useState } from "react";
import useSWR from "swr";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { Search, TrendingUp, Clock, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { articleApi, type Article } from "@/lib/api";

const categories = [
  { id: 0, name: "全部" },
  { id: 1, name: "前端开发" },
  { id: 2, name: "后端开发" },
  { id: 3, name: "架构设计" },
  { id: 4, name: "DevOps" },
  { id: 5, name: "人工智能" },
];

const sortOptions = [
  { id: "trending", name: "热门", icon: Flame },
  { id: "latest", name: "最新", icon: Clock },
  { id: "views", name: "阅读量", icon: TrendingUp },
];

// Mock articles
const mockArticles: Article[] = [
  {
    articleId: 1,
    title: "深入理解 React Server Components",
    summary: "React Server Components 是 React 18 引入的一项重要特性，它允许我们在服务端渲染组件...",
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
    summary: "TypeScript 5.0 带来了许多令人兴奋的新特性，包括装饰器支持、const 类型参数等...",
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
    summary: "在这篇文章中，我们将探讨如何构建高性能的 Node.js 应用，包括事件循环优化...",
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
    summary: "Tailwind CSS 已经成为最流行的 CSS 框架之一。本文将分享一些使用 Tailwind CSS 的最佳实践...",
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
    summary: "微服务架构已经成为现代应用开发的主流架构模式。本文将从实践角度分析微服务架构的设计原则...",
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
  {
    articleId: 6,
    title: "Docker 容器化最佳实践",
    summary: "Docker 已经成为现代应用部署的标准工具。本文将介绍 Docker 容器化的最佳实践...",
    content: "",
    cover: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=450&fit=crop",
    userId: 5,
    categoryId: 4,
    viewCount: 654,
    isTop: 0,
    status: 1,
    createTime: "2024-03-10T08:15:00",
    updateTime: "2024-03-10T08:15:00",
    authorNickname: "钱七",
    authorAvatar: "",
    categoryName: "DevOps",
    tagNames: ["Docker", "容器化"],
  },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSort, setSelectedSort] = useState("trending");

  // Fetch articles from API
  const { data, isLoading } = useSWR(
    ["explore-articles", selectedCategory, searchQuery],
    async () => {
      try {
        const params: { current?: number; size?: number; categoryId?: number; keyword?: string } = {
          current: 1,
          size: 50,
        };
        if (selectedCategory !== 0) {
          params.categoryId = selectedCategory;
        }
        if (searchQuery) {
          params.keyword = searchQuery;
        }
        const result = await articleApi.getList(params);
        if (result.success && result.data && Array.isArray(result.data)) {
          return result.data;
        }
        return mockArticles;
      } catch {
        return mockArticles;
      }
    },
    {
      fallbackData: mockArticles,
      revalidateOnFocus: false,
    }
  );

  const filteredArticles = data || mockArticles;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
              发现
            </h1>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章..."
                className="w-full h-12 pl-12 pr-4 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
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

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.articleId} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">没有找到匹配的文章</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
