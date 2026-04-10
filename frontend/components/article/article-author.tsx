"use client";

import { useState } from "react";
import useSWR from "swr";
import { Eye, Clock, Bookmark, BookmarkCheck, Share2, Loader2 } from "lucide-react";
import type { Article } from "@/lib/api";
import { userApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatViewCount } from "@/lib/utils";
import { useTransitionRouter } from "@/lib/use-transition-router";

interface ArticleAuthorProps {
  article: Article;
}

export function ArticleAuthor({ article }: ArticleAuthorProps) {
  const router = useTransitionRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: favorites = [], mutate } = useSWR(
    user ? ["article-favorites", user.userId] : null,
    () => userApi.getFavorites(user!.userId),
    {
      revalidateOnFocus: false,
    }
  );

  const isCollected = favorites.includes(article.articleId);

  const handleToggleCollect = async () => {
    if (!user || !isAuthenticated) {
      router.push("/login", { transition: "slideUp" });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      if (isCollected) {
        await userApi.cancelCollect(user.userId, article.articleId);
        await mutate(
          favorites.filter((favoriteId) => favoriteId !== article.articleId),
          false
        );
        setStatusMessage("已取消收藏");
      } else {
        await userApi.collectArticle(user.userId, article.articleId);
        await mutate([...favorites, article.articleId], false);
        setStatusMessage("已加入收藏");
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "收藏操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined" ? window.location.href : `/article/${article.articleId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      setStatusMessage("链接已复制，可以直接分享给别人");
    } catch {
      setStatusMessage("分享已取消");
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {article.authorAvatar ? (
            <img
              src={article.authorAvatar}
              alt={article.authorNickname}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-muted-foreground">
                {article.authorNickname?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">
              {article.authorNickname || `用户 #${article.userId}`}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(article.createTime)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatViewCount(article.viewCount)} 阅读
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleCollect}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-60"
            aria-label={isCollected ? "取消收藏" : "收藏"}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCollected ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isCollected ? "已收藏" : "收藏"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="分享"
          >
            <Share2 className="w-4 h-4" />
            分享
          </button>
        </div>
      </div>

      {statusMessage && (
        <p className="text-sm text-muted-foreground">{statusMessage}</p>
      )}
    </div>
  );
}
