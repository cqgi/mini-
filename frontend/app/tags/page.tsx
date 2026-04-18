"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Hash, Loader2, Tag as TagIcon } from "lucide-react";
import { tagApi } from "@/lib/api";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TransitionLink } from "@/components/ui/transition-link";

export default function TagsPage() {
  const { data, error, isLoading } = useSWR(
    ["tags-page"],
    () => tagApi.getList({ current: 1, size: 100 }),
    {
      revalidateOnFocus: false,
    }
  );

  const tags = useMemo(
    () =>
      [...(data?.items ?? [])].sort(
        (left, right) =>
          (right.articleCount ?? 0) - (left.articleCount ?? 0) ||
          left.tagName.localeCompare(right.tagName, "zh-CN")
      ),
    [data?.items]
  );

  return (
    <>
      <div className="bg-card border-b border-border">
        <ScrollReveal className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary">
              <TagIcon className="w-4 h-4" />
              标签导航
            </div>
            <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
              浏览所有标签
            </h1>
            <p className="mt-3 text-muted-foreground">
              标签是比分类更细的内容索引。点击任意标签，会进入对应的文章筛选结果。
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-5 text-sm text-destructive">
            {error instanceof Error ? error.message : "标签加载失败"}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : tags.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tags.map((tag, index) => (
              <ScrollReveal key={tag.tagId} delay={index * 0.03}>
                <TransitionLink
                  href={`/explore?tagId=${tag.tagId}`}
                  transition="scaleFade"
                  className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        <Hash className="w-3.5 h-3.5" />
                        标签
                      </div>
                      <h2 className="mt-4 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {tag.tagName}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tag.articleCount ?? 0} 篇已发布文章
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      查看
                    </span>
                  </div>
                </TransitionLink>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card px-4 py-12 text-center text-muted-foreground">
            暂无标签数据
          </div>
        )}
      </div>
    </>
  );
}
