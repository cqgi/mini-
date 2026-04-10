"use client";

import { useState } from "react";
import { FileText, Bookmark, MessageCircle, Loader2 } from "lucide-react";
import useSWR from "swr";
import { ArticleCard } from "@/components/article-card";
import { articleApi, userApi, type Article } from "@/lib/api";
import { cn, makeFallbackArticle } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";
import { AnimatedList } from "@/components/ui/animated-list";
import { usePageTransition } from "@/components/providers/transition-provider";

const { AnimatePresence, motion } =
  require("framer-motion") as typeof import("framer-motion");

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

const articleStatuses = [
  { value: "all", label: "全部" },
  { value: "draft", label: "草稿" },
  { value: "pending", label: "已发布" },
  { value: "failed", label: "失败" },
];

export function ProfileTabs({
  activeTab,
  onTabChange,
  userId,
}: ProfileTabsProps) {
  const { shouldReduceMotion } = usePageTransition();

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
          transition={{
            duration: shouldReduceMotion ? 0.12 : 0.18,
            ease: "easeOut",
          }}
        >
          {activeTab === "articles" && <ArticlesTab userId={userId} />}
          {activeTab === "favorites" && <FavoritesTab userId={userId} />}
          {activeTab === "comments" && <CommentsTab userId={userId} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ArticlesTab({ userId }: { userId: number }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: articles = [],
    error,
    isLoading,
  } = useSWR(["profile-articles", userId, statusFilter], async () => {
    const ids = await userApi.getMyArticles(
      userId,
      statusFilter === "all" ? undefined : statusFilter
    );

    return Promise.all(
      ids.map(async (articleId) => {
        try {
          return await articleApi.getAdminDetail(articleId);
        } catch {
          return makeFallbackArticle(articleId, "我的文章");
        }
      })
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-5 text-sm text-destructive">
        {error instanceof Error ? error.message : "读取我的文章失败"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {articleStatuses.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => setStatusFilter(status.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm transition-colors",
              statusFilter === status.value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {status.label}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">当前筛选下还没有文章</p>
          <TransitionLink
            href="/write"
            transition="slideUp"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            开始写作
          </TransitionLink>
        </div>
      ) : (
        <AnimatedList
          className="grid gap-6 md:grid-cols-2"
          animationKey={`profile-articles-${statusFilter}`}
        >
          {articles.map((article) => (
            <ArticleCard
              key={article.articleId}
              article={article}
              href={
                Number(article.status) === 1
                  ? `/article/${article.articleId}`
                  : `/write?articleId=${article.articleId}`
              }
            />
          ))}
        </AnimatedList>
      )}
    </div>
  );
}

function FavoritesTab({ userId }: { userId: number }) {
  const {
    data: articles = [],
    error,
    isLoading,
  } = useSWR(["profile-favorites", userId], async () => {
    const ids = await userApi.getFavorites(userId);

    return Promise.all(
      ids.map(async (articleId) => {
        try {
          return await articleApi.getAdminDetail(articleId);
        } catch {
          return makeFallbackArticle(articleId, "收藏文章");
        }
      })
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-5 text-sm text-destructive">
        {error instanceof Error ? error.message : "读取收藏列表失败"}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <Bookmark className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">还没有收藏任何文章</p>
        <TransitionLink
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          浏览文章
        </TransitionLink>
      </div>
    );
  }

  return (
    <AnimatedList
      className="grid gap-6 md:grid-cols-2"
      animationKey={`profile-favorites-${userId}`}
    >
      {articles.map((article) => (
        <ArticleCard
          key={article.articleId}
          article={article}
          href={`/article/${article.articleId}`}
        />
      ))}
    </AnimatedList>
  );
}

function CommentsTab({ userId }: { userId: number }) {
  const {
    data: commentIds = [],
    error,
    isLoading,
  } = useSWR(["profile-comments", userId], () => userApi.getMyComments(userId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-5 text-sm text-destructive">
        {error instanceof Error ? error.message : "读取评论列表失败"}
      </div>
    );
  }

  if (commentIds.length === 0) {
    return (
      <div className="text-center py-20">
        <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-muted-foreground">还没有发表过评论</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
        当前后端这里只返回评论 ID，没有评论正文、所属文章标题或楼层信息，所以前端先按真实返回结果展示。
      </div>

      <div className="flex flex-wrap gap-3">
        {commentIds.map((commentId) => (
          <div
            key={commentId}
            className="rounded-lg border border-border bg-card px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">
              评论 #{commentId}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
