"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Image as ImageIcon,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Quote,
  Heading1,
  Heading2,
  Eye,
  Edit3,
  Loader2,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "@/lib/store";
import { articleApi } from "@/lib/api";
import { cn } from "@/lib/utils";

// Mock categories and tags
const categories = [
  { id: 1, name: "前端开发" },
  { id: 2, name: "后端开发" },
  { id: 3, name: "架构设计" },
  { id: 4, name: "DevOps" },
  { id: 5, name: "人工智能" },
];

const availableTags = [
  "React",
  "Vue",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Next.js",
  "CSS",
  "Tailwind",
  "Python",
  "Go",
];

export default function WritePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [article, setArticle] = useState({
    title: "",
    content: "",
    summary: "",
    cover: "",
    categoryId: 1,
    tags: [] as string[],
  });

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            请先登录
          </h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = article.content.slice(start, end);
    const newText =
      article.content.slice(0, start) +
      prefix +
      selectedText +
      suffix +
      article.content.slice(end);

    setArticle({ ...article, content: newText });

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Save draft logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("草稿已保存");
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!article.title.trim()) {
      alert("请输入文章标题");
      return;
    }
    if (!article.content.trim()) {
      alert("请输入文章内容");
      return;
    }

    setIsPublishing(true);
    try {
      await articleApi.create({
        title: article.title,
        summary: article.summary || article.content.slice(0, 200),
        content: article.content,
        cover: article.cover,
        categoryId: article.categoryId,
        tagIds: [],
      });
      router.push("/profile");
    } catch (error) {
      console.error("Failed to publish:", error);
      alert("发布失败，请稍后重试");
    } finally {
      setIsPublishing(false);
    }
  };

  const toolbarItems = [
    { icon: Heading1, action: () => insertMarkdown("# "), title: "一级标题" },
    { icon: Heading2, action: () => insertMarkdown("## "), title: "二级标题" },
    { icon: Bold, action: () => insertMarkdown("**", "**"), title: "粗体" },
    { icon: Italic, action: () => insertMarkdown("*", "*"), title: "斜体" },
    { icon: Code, action: () => insertMarkdown("`", "`"), title: "行内代码" },
    { icon: LinkIcon, action: () => insertMarkdown("[", "](url)"), title: "链接" },
    { icon: List, action: () => insertMarkdown("- "), title: "无序列表" },
    { icon: ListOrdered, action: () => insertMarkdown("1. "), title: "有序列表" },
    { icon: Quote, action: () => insertMarkdown("> "), title: "引用" },
    {
      icon: ImageIcon,
      action: () => insertMarkdown("![alt](", ")"),
      title: "图片",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">返回</span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Preview Toggle */}
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isPreview
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isPreview ? (
                  <>
                    <Edit3 className="w-4 h-4" />
                    编辑
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    预览
                  </>
                )}
              </button>

              {/* Save Draft */}
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">保存草稿</span>
              </button>

              {/* Publish */}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                发布
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Title Input */}
        <input
          type="text"
          value={article.title}
          onChange={(e) => setArticle({ ...article, title: e.target.value })}
          placeholder="输入文章标题..."
          className="w-full text-3xl sm:text-4xl font-bold text-foreground placeholder:text-muted-foreground bg-transparent border-none outline-none mb-6"
        />

        {/* Toolbar */}
        {!isPreview && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-card border border-border rounded-lg mb-4">
            {toolbarItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                title={item.title}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        {isPreview ? (
          <article className="prose max-w-none min-h-[400px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content || "*预览区域 - 开始写作后这里会显示渲染后的内容*"}
            </ReactMarkdown>
          </article>
        ) : (
          <textarea
            id="content"
            value={article.content}
            onChange={(e) =>
              setArticle({ ...article, content: e.target.value })
            }
            placeholder="开始写作...

支持 Markdown 语法：
- 使用 # 创建标题
- 使用 **粗体** 和 *斜体*
- 使用 ``` 创建代码块
- 使用 > 创建引用
- 使用 - 或 1. 创建列表"
            className="w-full min-h-[500px] bg-transparent text-foreground placeholder:text-muted-foreground border-none outline-none resize-none leading-relaxed font-mono text-sm"
          />
        )}
      </main>

      {/* Publish Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                发布设置
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  文章摘要
                </label>
                <textarea
                  value={article.summary}
                  onChange={(e) =>
                    setArticle({ ...article, summary: e.target.value })
                  }
                  placeholder="简要描述你的文章内容（选填，不填将自动截取）"
                  className="w-full h-24 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  封面图片
                </label>
                <input
                  type="text"
                  value={article.cover}
                  onChange={(e) =>
                    setArticle({ ...article, cover: e.target.value })
                  }
                  placeholder="输入图片 URL"
                  className="w-full h-10 px-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  分类
                </label>
                <select
                  value={article.categoryId}
                  onChange={(e) =>
                    setArticle({
                      ...article,
                      categoryId: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-10 px-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (article.tags.includes(tag)) {
                          setArticle({
                            ...article,
                            tags: article.tags.filter((t) => t !== tag),
                          });
                        } else if (article.tags.length < 5) {
                          setArticle({
                            ...article,
                            tags: [...article.tags, tag],
                          });
                        }
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-colors",
                        article.tags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  最多选择 5 个标签
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    发布中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    确认发布
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
