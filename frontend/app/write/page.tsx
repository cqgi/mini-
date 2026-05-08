"use client";

import { type ChangeEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
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
import { articleApi, categoryApi, fileApi } from "@/lib/api";
import { cn, parseTagIds } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";
import { useTransitionRouter } from "@/lib/use-transition-router";

type SubmitMode = "draft" | "publish" | null;

type ArticleFormState = {
  title: string;
  content: string;
  summary: string;
  cover: string;
  categoryId: string;
  tagIds: string;
};

const initialArticleState: ArticleFormState = {
  title: "",
  content: "",
  summary: "",
  cover: "",
  categoryId: "",
  tagIds: "",
};

function WritePageContent() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [isPreview, setIsPreview] = useState(false);
  const [submitMode, setSubmitMode] = useState<SubmitMode>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "error">("success");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [article, setArticle] = useState<ArticleFormState>(initialArticleState);

  const rawArticleId = searchParams.get("articleId");
  const editingArticleId =
    rawArticleId && Number.isFinite(Number(rawArticleId))
      ? Number(rawArticleId)
      : null;

  const {
    data: editingArticle,
    error: loadingError,
    isLoading: isLoadingArticle,
  } = useSWR(
    editingArticleId ? ["write-article", editingArticleId] : null,
    () => articleApi.getManageDetail(editingArticleId!),
    {
      revalidateOnFocus: false,
    }
  );

  const {
    data: categories = [],
    error: categoryError,
    isLoading: isLoadingCategories,
  } = useSWR(
    ["write-categories"],
    () => categoryApi.getList(),
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (!editingArticle) {
      return;
    }

    setArticle({
      title: editingArticle.title || "",
      content: editingArticle.content || "",
      summary: editingArticle.summary || "",
      cover: editingArticle.cover || "",
      categoryId: editingArticle.categoryId ? String(editingArticle.categoryId) : "1",
      tagIds:
        editingArticle.tags?.map((tag) => String(tag.tagId)).join(", ") || "",
    });
  }, [editingArticle]);

  useEffect(() => {
    if (article.categoryId || categories.length === 0 || editingArticle) {
      return;
    }

    setArticle((current) => ({
      ...current,
      categoryId: String(categories[0].categoryId),
    }));
  }, [article.categoryId, categories, editingArticle]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            请先登录
          </h2>
          <p className="text-muted-foreground mb-6">
            当前后端写文章接口依赖真实 userId，先登录后再继续编辑。
          </p>
          <TransitionLink
            href="/login"
            transition="slideUp"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            前往登录
          </TransitionLink>
        </div>
      </div>
    );
  }

  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement | null;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = article.content.slice(start, end);
    const newText =
      article.content.slice(0, start) +
      prefix +
      selectedText +
      suffix +
      article.content.slice(end);

    setArticle((current) => ({ ...current, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const buildPayload = (status: 0 | 1) => {
    if (!article.title.trim()) {
      throw new Error("请输入文章标题");
    }
    if (!article.content.trim()) {
      throw new Error("请输入文章内容");
    }

    const categoryId = Number(article.categoryId);
    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      throw new Error("请选择分类名称");
    }

    const matchedCategory = categories.find(
      (category) => category.categoryId === categoryId
    );
    if (!matchedCategory) {
      throw new Error("所选分类不存在，请重新选择");
    }

    return {
      title: article.title.trim(),
      summary: article.summary.trim() || article.content.trim().slice(0, 140),
      content: article.content.trim(),
      cover: article.cover.trim() || undefined,
      userId: user.userId,
      categoryId,
      status,
      tagIds: parseTagIds(article.tagIds),
    };
  };

  const persistArticle = async (status: 0 | 1) => {
    const mode: SubmitMode = status === 0 ? "draft" : "publish";
    setSubmitMode(mode);
    setNotice("");

    try {
      const payload = buildPayload(status);
      const result = editingArticleId
        ? await articleApi.update(editingArticleId, payload)
        : await articleApi.create(payload);

      if (!editingArticleId && result.data) {
        router.replace(`/write?articleId=${result.data}`, {
          transition: "slideUp",
        });
      }

      if (status === 1) {
        router.push("/profile", { transition: "fade" });
        return;
      }

      setNotice(editingArticleId ? "草稿已更新" : "草稿已保存");
      setNoticeTone("success");
      setShowSettings(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "保存文章失败");
      setNoticeTone("error");
    } finally {
      setSubmitMode(null);
    }
  };

  const handleSaveDraft = async () => {
    await persistArticle(0);
  };

  const handlePublish = async () => {
    await persistArticle(1);
  };

  const handleCoverFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setIsUploadingCover(true);
    setNotice("");
    try {
      const uploadedFile = await fileApi.uploadImage("cover", file);
      setArticle((current) => ({
        ...current,
        cover: uploadedFile.url,
      }));
      setNotice("封面图片已上传");
      setNoticeTone("success");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "封面图片上传失败");
      setNoticeTone("error");
    } finally {
      setIsUploadingCover(false);
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

  const isSaving = submitMode === "draft";
  const isPublishing = submitMode === "publish";

  if (isLoadingArticle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <TransitionLink
              href="/profile"
              transition="slide"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">返回个人中心</span>
            </TransitionLink>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreview((current) => !current)}
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

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={!!submitMode}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">保存草稿</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSettings(true)}
                disabled={!!submitMode}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                发布
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {loadingError && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-4 text-sm text-destructive">
            {loadingError instanceof Error ? loadingError.message : "文章详情加载失败"}
          </div>
        )}

        {categoryError && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-4 text-sm text-destructive">
            {categoryError instanceof Error ? categoryError.message : "分类列表加载失败"}
          </div>
        )}

        {notice && (
          <div
            className={cn(
              "mb-6 rounded-xl px-4 py-4 text-sm",
              noticeTone === "success"
                ? "border border-primary/20 bg-primary/10 text-primary"
                : "border border-destructive/20 bg-destructive/10 text-destructive"
            )}
          >
            {notice}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1.5">
            {editingArticleId ? `编辑文章 #${editingArticleId}` : "新建文章"}
          </span>
          <span className="rounded-full bg-muted px-3 py-1.5">
            作者 ID：{user.userId}
          </span>
          <span className="rounded-full bg-muted px-3 py-1.5">
            分类名称：
            {categories.find(
              (category) => String(category.categoryId) === article.categoryId
            )?.categoryName || "待选择"}
          </span>
          <span className="rounded-full bg-muted px-3 py-1.5">
            标签：{article.tagIds || "暂无"}
          </span>
        </div>

        <input
          type="text"
          value={article.title}
          onChange={(event) =>
            setArticle((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="输入文章标题..."
          className="w-full text-3xl sm:text-4xl font-bold text-foreground placeholder:text-muted-foreground bg-transparent border-none outline-none mb-6"
        />

        {!isPreview && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-card border border-border rounded-lg mb-4">
            {toolbarItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={item.action}
                title={item.title}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}

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
            onChange={(event) =>
              setArticle((current) => ({ ...current, content: event.target.value }))
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

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  发布设置
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  分类名称来自后端分类表；标签目前仍需手动输入真实 ID。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  文章摘要
                </label>
                <textarea
                  value={article.summary}
                  onChange={(event) =>
                    setArticle((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))
                  }
                  placeholder="简要描述文章内容；不填会自动从正文截取"
                  className="w-full h-24 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  封面图片
                </label>
                <div className="space-y-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                    {isUploadingCover ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {isUploadingCover ? "正在上传封面..." : "上传本地封面"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleCoverFileChange}
                      disabled={isUploadingCover}
                    />
                  </label>
                  {article.cover && (
                    <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                      <img
                        src={article.cover}
                        alt="封面预览"
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <label className="mt-3 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  或手动填写封面 URL
                </label>
                <input
                  type="text"
                  value={article.cover}
                  onChange={(event) =>
                    setArticle((current) => ({
                      ...current,
                      cover: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full h-10 px-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  分类名称
                </label>
                <select
                  value={article.categoryId}
                  onChange={(event) =>
                    setArticle((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                  disabled={isLoadingCategories || categories.length === 0}
                  className="w-full h-10 px-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-60"
                >
                  <option value="" disabled>
                    {isLoadingCategories
                      ? "正在读取分类..."
                      : categories.length === 0
                        ? "暂无可用分类"
                        : "请选择分类名称"}
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={String(category.categoryId)}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  只能从后端已有分类中选择，不能手动新增新的分类 ID。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  标签 ID 列表
                </label>
                <input
                  type="text"
                  value={article.tagIds}
                  onChange={(event) =>
                    setArticle((current) => ({
                      ...current,
                      tagIds: event.target.value,
                    }))
                  }
                  placeholder="例如 1,2,3"
                  className="w-full h-10 px-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  使用英文逗号分隔；不填则不写标签关联。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={!!submitMode}
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

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <WritePageContent />
    </Suspense>
  );
}
