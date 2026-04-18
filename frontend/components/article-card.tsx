"use client";

import { useEffect, useState } from "react";
import { Eye, Clock, ArrowUpRight } from "lucide-react";
import type { Article } from "@/lib/api";
import {
  articleStatusLabel,
  formatRelativeTime,
  formatViewCount,
  cn,
} from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  href?: string;
}

export function ArticleCard({
  article,
  featured = false,
  href,
}: ArticleCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const detailHref =
    href ?? (Number(article.status) === 1 ? `/article/${article.articleId}` : undefined);
  const hasCover = Boolean(article.cover?.trim()) && !coverFailed;
  const articleTags = article.tags?.length ? article.tags.slice(0, 2) : [];

  useEffect(() => {
    setCoverFailed(false);
  }, [article.articleId, article.cover]);

  const renderTitle = () => {
    const title = (
      <h2
        className={cn(
          "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-balance",
          featured ? "text-xl md:text-2xl" : "text-lg"
        )}
      >
        {article.title}
      </h2>
    );

    if (!detailHref) {
      return title;
    }

    return <TransitionLink href={detailHref} transition="scaleFade">{title}</TransitionLink>;
  };

  const coverFrameClass = cn(
    "relative block overflow-hidden bg-muted/40",
    featured
      ? "md:w-2/5 shrink-0 min-h-[220px] md:min-h-full"
      : "aspect-[16/9]"
  );

  const coverContent = hasCover ? (
    <img
      src={article.cover!}
      alt={article.title}
      onError={() => setCoverFailed(true)}
      className={cn(
        "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
        featured ? "aspect-[4/3] md:aspect-auto md:h-full" : ""
      )}
    />
  ) : (
    <div className="relative h-full w-full bg-gradient-to-br from-primary/12 via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_30%)]" />
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
        <div className="space-y-2">
          {article.categoryName && (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur-sm">
              {article.categoryName}
            </span>
          )}
          <div className="h-2.5 w-28 rounded-full bg-foreground/10" />
          <div className="h-2.5 w-20 rounded-full bg-foreground/10" />
        </div>
        <div className="h-16 w-16 rounded-full bg-primary/12 blur-2xl" />
      </div>
    </div>
  );

  const renderCover = () => {
    if (detailHref) {
      return (
        <TransitionLink
          href={detailHref}
          transition="scaleFade"
          className={coverFrameClass}
        >
          {coverContent}
        </TransitionLink>
      );
    }

    return <div className={coverFrameClass}>{coverContent}</div>;
  };

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        featured && "md:flex-row"
      )}
    >
      {renderCover()}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Top indicator */}
        {article.isTop === 1 && (
          <span className="inline-flex items-center self-start px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-3">
            置顶
          </span>
        )}

        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {article.categoryName && (
            <span className="text-xs font-medium text-primary">
              {article.categoryName}
            </span>
          )}
          {articleTags.length > 0
            ? articleTags.map((tag) => (
                <TransitionLink
                  key={tag.tagId}
                  href={`/explore?tagId=${tag.tagId}`}
                  transition="scaleFade"
                  className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {tag.tagName}
                </TransitionLink>
              ))
            : article.tagNames?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
        </div>

        {/* Title */}
        {renderTitle()}

        {/* Summary */}
        <p
          className={cn(
            "text-muted-foreground mt-2 line-clamp-2",
            featured ? "text-sm md:text-base" : "text-sm"
          )}
        >
          {article.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            {article.authorAvatar ? (
              <img
                src={article.authorAvatar}
                alt={article.authorNickname}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {article.authorNickname?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {article.authorNickname}
              </span>
              <span className="text-xs text-muted-foreground">
                {articleStatusLabel(article.status)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(article.createTime)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatViewCount(article.viewCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Arrow */}
      {detailHref && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      )}
    </article>
  );
}
