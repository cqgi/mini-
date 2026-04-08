"use client";

import Link from "next/link";
import { TrendingUp, Tag, Folder, Users } from "lucide-react";

// Mock data
const trendingArticles = [
  { id: 1, title: "深入理解 React Server Components", views: 1234 },
  { id: 2, title: "TypeScript 5.0 新特性详解", views: 856 },
  { id: 3, title: "微服务架构设计与实践", views: 789 },
  { id: 4, title: "构建高性能的 Node.js 应用", views: 567 },
  { id: 5, title: "Tailwind CSS 最佳实践指南", views: 423 },
];

const popularTags = [
  { id: 1, name: "React", count: 128 },
  { id: 2, name: "TypeScript", count: 96 },
  { id: 3, name: "Next.js", count: 84 },
  { id: 4, name: "Node.js", count: 72 },
  { id: 5, name: "CSS", count: 56 },
  { id: 6, name: "架构", count: 48 },
  { id: 7, name: "性能优化", count: 36 },
  { id: 8, name: "数据库", count: 32 },
];

const categories = [
  { id: 1, name: "前端开发", count: 156 },
  { id: 2, name: "后端开发", count: 98 },
  { id: 3, name: "架构设计", count: 64 },
  { id: 4, name: "DevOps", count: 42 },
  { id: 5, name: "人工智能", count: 38 },
];

const topAuthors = [
  { id: 1, name: "张三", avatar: "", articles: 42 },
  { id: 2, name: "李四", avatar: "", articles: 38 },
  { id: 3, name: "王五", avatar: "", articles: 35 },
];

export function Sidebar() {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      {/* Trending */}
      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">热门文章</h3>
        </div>
        <ul className="space-y-3">
          {trendingArticles.map((article, index) => (
            <li key={article.id}>
              <Link
                href={`/article/${article.id}`}
                className="flex items-start gap-3 group"
              >
                <span className="text-sm font-medium text-muted-foreground w-5 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular Tags */}
      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">热门标签</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.id}`}
              className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">分类</h3>
        </div>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.id}`}
                className="flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span>{category.name}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  {category.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Top Authors */}
      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">活跃作者</h3>
        </div>
        <ul className="space-y-3">
          {topAuthors.map((author) => (
            <li key={author.id}>
              <Link
                href={`/user/${author.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {author.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {author.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {author.articles} 篇文章
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
