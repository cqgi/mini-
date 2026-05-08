"use client";

import { use } from "react";
import useSWR from "swr";
import { ArticleContent } from "@/components/article/article-content";
import { ArticleAuthor } from "@/components/article/article-author";
import { CommentSection } from "@/components/article/comment-section";
import { ArticleTOC } from "@/components/article/article-toc";
import { articleApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TransitionLink } from "@/components/ui/transition-link";

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const articleId = parseInt(id, 10);

  const { data: article, isLoading, error } = useSWR(
    ["article", articleId],
    () => articleApi.getDetail(articleId),
    {
      revalidateOnFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "文章加载失败"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border-b border-border">
        <ScrollReveal className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg">
                {article.categoryName}
              </span>
              {article.tags?.length
                ? article.tags.map((tag) => (
                    <TransitionLink
                      key={tag.tagId}
                      href={`/explore?tagId=${tag.tagId}`}
                      transition="scaleFade"
                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {tag.tagName}
                    </TransitionLink>
                  ))
                : article.tagNames?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance">
              {article.title}
            </h1>

            <ArticleAuthor article={article} />
          </div>
        </ScrollReveal>
      </div>

      {article.cover && (
        <ScrollReveal className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6" delay={0.04}>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={article.cover}
              alt={article.title}
              className="w-full aspect-[2/1] object-cover"
            />
          </div>
        </ScrollReveal>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <ArticleContent content={article.content || ""} />
            <CommentSection articleId={article.articleId} />
          </div>

          <aside className="hidden xl:block w-64 shrink-0">
            <ScrollReveal delay={0.1}>
              <ArticleTOC content={article.content || ""} />
            </ScrollReveal>
          </aside>
        </div>
      </div>
    </>
  );
}
