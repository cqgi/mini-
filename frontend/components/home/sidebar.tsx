"use client";

import useSWR from "swr";
import { TrendingUp, Tag, Folder, Users, Loader2 } from "lucide-react";
import { articleApi } from "@/lib/api";
import { formatViewCount } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";

export function Sidebar() {
  const { data, error, isLoading } = useSWR(
    ["home-sidebar"],
    () => articleApi.getList({ current: 1, size: 30 }),
    {
      revalidateOnFocus: false,
    }
  );

  const articles = data?.items ?? [];

  const trendingArticles = [...articles]
    .sort((left, right) => right.viewCount - left.viewCount)
    .slice(0, 5)
    .map((article) => ({
      id: article.articleId,
      title: article.title,
      views: article.viewCount,
    }));

  const popularTags = Array.from(
    articles.reduce((accumulator, article) => {
      article.tagNames.forEach((tagName) => {
        accumulator.set(tagName, (accumulator.get(tagName) ?? 0) + 1);
      });
      return accumulator;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8);

  const categories = Array.from(
    articles.reduce((accumulator, article) => {
      if (!article.categoryId || !article.categoryName) {
        return accumulator;
      }

      const current = accumulator.get(article.categoryId) ?? {
        name: article.categoryName,
        count: 0,
      };

      current.count += 1;
      accumulator.set(article.categoryId, current);
      return accumulator;
    }, new Map<number, { name: string; count: number }>())
  )
    .map(([id, value]) => ({ id, ...value }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  const topAuthors = Array.from(
    articles.reduce((accumulator, article) => {
      const current = accumulator.get(article.userId) ?? {
        name: article.authorNickname || `用户 #${article.userId}`,
        avatar: article.authorAvatar,
        articles: 0,
      };

      current.articles += 1;
      accumulator.set(article.userId, current);
      return accumulator;
    }, new Map<number, { name: string; avatar: string | null; articles: number }>())
  )
    .map(([id, value]) => ({ id, ...value }))
    .sort((left, right) => right.articles - left.articles)
    .slice(0, 3);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-5 text-sm text-destructive">
        {error instanceof Error ? error.message : "侧栏内容加载失败"}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">热门文章</h3>
        </div>
        <ul className="space-y-3">
          {trendingArticles.length > 0 ? (
            trendingArticles.map((article, index) => (
              <li key={article.id}>
                <TransitionLink
                  href={`/article/${article.id}`}
                  transition="scaleFade"
                  className="flex items-start gap-3 group"
                >
                  <span className="text-sm font-medium text-muted-foreground w-5 shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatViewCount(article.views)} 阅读
                    </span>
                  </div>
                </TransitionLink>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">暂无热门文章</li>
          )}
        </ul>
      </section>

      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">热门标签</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.length > 0 ? (
            popularTags.map(([tagName, count]) => (
              <span
                key={tagName}
                className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-lg"
              >
                {tagName} · {count}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">暂无标签数据</span>
          )}
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">分类</h3>
        </div>
        <ul className="space-y-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id}>
                <TransitionLink
                  href={`/explore?categoryId=${category.id}`}
                  className="flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>{category.name}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {category.count}
                  </span>
                </TransitionLink>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">暂无分类数据</li>
          )}
        </ul>
      </section>

      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">活跃作者</h3>
        </div>
        <ul className="space-y-3">
          {topAuthors.length > 0 ? (
            topAuthors.map((author) => (
              <li key={author.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      {author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {author.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {author.articles} 篇已发布文章
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">暂无作者数据</li>
          )}
        </ul>
      </section>
    </div>
  );
}
