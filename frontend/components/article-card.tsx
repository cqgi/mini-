import Link from "next/link";
import { Eye, MessageCircle, Clock, ArrowUpRight } from "lucide-react";
import type { Article } from "@/lib/api";
import { formatRelativeTime, formatViewCount, cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group relative bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        featured && "md:flex"
      )}
    >
      {/* Cover Image */}
      {article.cover && (
        <Link
          href={`/article/${article.articleId}`}
          className={cn(
            "block overflow-hidden",
            featured ? "md:w-2/5 shrink-0" : "aspect-[16/9]"
          )}
        >
          <img
            src={article.cover}
            alt={article.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
              featured ? "aspect-[4/3] md:aspect-auto md:h-full" : ""
            )}
          />
        </Link>
      )}

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Top indicator */}
        {article.isTop === 1 && (
          <span className="inline-flex items-center self-start px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-3">
            置顶
          </span>
        )}

        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {article.categoryName && (
            <Link
              href={`/category/${article.categoryId}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              {article.categoryName}
            </Link>
          )}
          {article.tagNames?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <Link href={`/article/${article.articleId}`}>
          <h2
            className={cn(
              "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-balance",
              featured ? "text-xl md:text-2xl" : "text-lg"
            )}
          >
            {article.title}
          </h2>
        </Link>

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
          <Link
            href={`/user/${article.userId}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
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
            <span className="text-sm text-muted-foreground">
              {article.authorNickname}
            </span>
          </Link>

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
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </article>
  );
}
