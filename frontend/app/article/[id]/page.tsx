"use client";

import { use } from "react";
import useSWR from "swr";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArticleContent } from "@/components/article/article-content";
import { ArticleAuthor } from "@/components/article/article-author";
import { CommentSection } from "@/components/article/comment-section";
import { ArticleTOC } from "@/components/article/article-toc";
import { articleApi, type Article } from "@/lib/api";
import { Loader2 } from "lucide-react";

// Mock article for demo
const mockArticle: Article = {
  articleId: 1,
  title: "深入理解 React Server Components",
  summary: "React Server Components 是 React 18 引入的一项重要特性，它允许我们在服务端渲染组件，从而大幅减少客户端 JavaScript 包的大小。",
  content: `
## 什么是 React Server Components？

React Server Components (RSC) 是 React 团队在 React 18 中引入的一项革命性特性。它允许开发者编写只在服务端运行的 React 组件，这些组件可以直接访问后端资源，而不需要将相关代码发送到客户端。

### 核心优势

1. **减少 JavaScript 包大小** - 服务端组件的代码不会被发送到客户端
2. **直接访问后端资源** - 可以直接查询数据库、读取文件系统等
3. **更好的安全性** - 敏感逻辑保留在服务端
4. **改善首屏加载时间** - 更少的 JavaScript 意味着更快的加载

### 基本用法

\`\`\`tsx
// 这是一个服务端组件
async function ArticleList() {
  // 可以直接在组件中获取数据
  const articles = await db.query('SELECT * FROM articles');
  
  return (
    <ul>
      {articles.map(article => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

### 客户端组件 vs 服务端组件

在 Next.js 13+ 中，所有组件默认都是服务端组件。如果你需要使用客户端特性（如 \`useState\`、\`useEffect\`、事件处理等），需要在文件顶部添加 \`"use client"\` 指令。

\`\`\`tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

## 最佳实践

### 1. 合理划分组件边界

将需要交互的部分封装为客户端组件，保持服务端组件的纯净性。

### 2. 数据获取模式

\`\`\`tsx
// 在服务端组件中获取数据
async function Page() {
  const data = await fetchData();
  
  return <ClientComponent initialData={data} />;
}
\`\`\`

### 3. 流式渲染

结合 Suspense 使用，可以实现渐进式渲染：

\`\`\`tsx
import { Suspense } from "react";

function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent />
      </Suspense>
    </>
  );
}
\`\`\`

## 总结

React Server Components 代表了 React 架构的一次重大演进。通过合理使用服务端组件和客户端组件，我们可以构建出性能更好、用户体验更优的 React 应用。

> 本文基于 React 18 和 Next.js 14 编写，随着框架的更新，部分 API 可能会有所变化。
  `,
  cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop",
  userId: 1,
  categoryId: 1,
  viewCount: 1234,
  isTop: 1,
  status: 1,
  createTime: "2024-03-15T10:30:00",
  updateTime: "2024-03-15T10:30:00",
  authorNickname: "张三",
  authorAvatar: "",
  categoryName: "前端开发",
  tagNames: ["React", "Next.js", "Server Components"],
};

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const articleId = parseInt(id, 10);

  const { data: article, isLoading, error } = useSWR(
    ["article", articleId],
    async () => {
      try {
        const result = await articleApi.getDetail(articleId);
        if (result.success && result.data) {
          return result.data;
        }
        return mockArticle;
      } catch {
        return mockArticle;
      }
    },
    {
      fallbackData: mockArticle,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">文章加载失败</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Article Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg">
                {article.categoryName}
              </span>
              {article.tagNames?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance">
              {article.title}
            </h1>

            {/* Meta */}
            <ArticleAuthor article={article} />
          </div>
        </div>

        {/* Cover Image */}
        {article.cover && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src={article.cover}
                alt={article.title}
                className="w-full aspect-[2/1] object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <ArticleContent content={article.content || ""} />
              <CommentSection articleId={article.articleId} />
            </div>

            {/* TOC Sidebar */}
            <aside className="hidden xl:block w-64 shrink-0">
              <ArticleTOC content={article.content || ""} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
