import Link from "next/link";
import { Eye, Clock, Bookmark, Share2 } from "lucide-react";
import type { Article } from "@/lib/api";
import { formatDate, formatViewCount } from "@/lib/utils";

interface ArticleAuthorProps {
  article: Article;
}

export function ArticleAuthor({ article }: ArticleAuthorProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-border">
      {/* Author Info */}
      <Link
        href={`/user/${article.userId}`}
        className="flex items-center gap-3 group"
      >
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
          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
            {article.authorNickname}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="收藏"
        >
          <Bookmark className="w-4 h-4" />
          收藏
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="分享"
        >
          <Share2 className="w-4 h-4" />
          分享
        </button>
      </div>
    </div>
  );
}
