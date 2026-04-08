"use client";

import { FileText, Bookmark, MessageCircle, Loader2 } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/api";

interface ProfileTabsProps {
  activeTab: "articles" | "favorites" | "comments";
  onTabChange: (tab: "articles" | "favorites" | "comments") => void;
  userId: number;
}

const tabs = [
  { id: "articles" as const, label: "我的文章", icon: FileText },
  { id: "favorites" as const, label: "我的收藏", icon: Bookmark },
  { id: "comments" as const, label: "我的评论", icon: MessageCircle },
];

// Mock data
const mockArticles: Article[] = [
  {
    articleId: 1,
    title: "深入理解 React Server Components",
    summary: "React Server Components 是 React 18 引入的一项重要特性...",
    content: "",
    cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    userId: 1,
    categoryId: 1,
    viewCount: 1234,
    isTop: 0,
    status: 1,
    createTime: "2024-03-15T10:30:00",
    updateTime: "2024-03-15T10:30:00",
    authorNickname: "我",
    authorAvatar: "",
    categoryName: "前端开发",
    tagNames: ["React", "Next.js"],
  },
  {
    articleId: 2,
    title: "TypeScript 5.0 新特性详解",
    summary: "TypeScript 5.0 带来了许多令人兴奋的新特性...",
    content: "",
    cover: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
    userId: 1,
    categoryId: 1,
    viewCount: 856,
    isTop: 0,
    status: 1,
    createTime: "2024-03-14T09:00:00",
    updateTime: "2024-03-14T09:00:00",
    authorNickname: "我",
    authorAvatar: "",
    categoryName: "前端开发",
    tagNames: ["TypeScript"],
  },
];

const mockComments = [
  {
    id: 1,
    content: "非常详细的文章！学到了很多。",
    articleTitle: "深入理解 React Hooks",
    articleId: 3,
    createTime: "2024-03-14T15:30:00",
  },
  {
    id: 2,
    content: "请问这个方案在生产环境中的性能如何？",
    articleTitle: "构建高性能的 Node.js 应用",
    articleId: 4,
    createTime: "2024-03-13T10:20:00",
  },
];

export function ProfileTabs({ activeTab, onTabChange, userId }: ProfileTabsProps) {
  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "articles" && <ArticlesTab userId={userId} />}
      {activeTab === "favorites" && <FavoritesTab userId={userId} />}
      {activeTab === "comments" && <CommentsTab />}
    </div>
  );
}

function ArticlesTab({ userId }: { userId: number }) {
  // Use mock data for now
  const articles = mockArticles;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">还没有发布过文章</p>
        <Link
          href="/write"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          开始写作
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard key={article.articleId} article={article} />
      ))}
    </div>
  );
}

function FavoritesTab({ userId }: { userId: number }) {
  const articles = mockArticles.slice(0, 1);
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <Bookmark className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">还没有收藏任何文章</p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          发现好文章
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard key={article.articleId} article={article} />
      ))}
    </div>
  );
}

function CommentsTab() {
  const comments = mockComments;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-20">
        <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-muted-foreground">还没有发表过评论</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="p-4 bg-card border border-border rounded-lg"
        >
          <Link
            href={`/article/${comment.articleId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {comment.articleTitle}
          </Link>
          <p className="text-foreground mt-2">{comment.content}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(comment.createTime).toLocaleDateString("zh-CN")}
          </p>
        </div>
      ))}
    </div>
  );
}
