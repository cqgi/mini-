"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  BadgeCheck,
  BookOpen,
  FileText,
  FolderTree,
  Loader2,
  MessageSquare,
  Shield,
  ShieldOff,
  Tag,
  Trash2,
  UserCog,
} from "lucide-react";
import {
  articleApi,
  categoryApi,
  commentApi,
  tagApi,
  userApi,
  type AdminComment,
  type AdminUser,
  type Article,
  type Category,
  type Tag as TagItem,
} from "@/lib/api";
import {
  articleStatusLabel,
  cn,
  formatDate,
  formatRelativeTime,
  getSafeImageUrl,
} from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { TransitionLink } from "@/components/ui/transition-link";
import { AnimatedList } from "@/components/ui/animated-list";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type AdminTab = "articles" | "comments" | "categories" | "tags" | "users";

const adminTabs: Array<{
  id: AdminTab;
  label: string;
  icon: typeof FileText;
  description: string;
}> = [
  {
    id: "articles",
    label: "文章",
    icon: FileText,
    description: "查看全站文章，处理置顶和删除。",
  },
  {
    id: "comments",
    label: "评论",
    icon: MessageSquare,
    description: "巡检评论内容，快速删除不当信息。",
  },
  {
    id: "categories",
    label: "分类",
    icon: FolderTree,
    description: "维护内容栏目，保持结构清晰。",
  },
  {
    id: "tags",
    label: "标签",
    icon: Tag,
    description: "管理标签体系，维持文章检索体验。",
  },
  {
    id: "users",
    label: "用户",
    icon: UserCog,
    description: "查看用户、调整角色、移除异常账号。",
  },
];

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("articles");

  const {
    data: overview,
    error: overviewError,
    isLoading: isOverviewLoading,
  } = useSWR(
    isAuthenticated && user?.role === 1 ? ["admin-overview"] : null,
    async () => {
      const [articleResult, commentResult, categoryResult, tagResult, userResult] =
        await Promise.all([
          articleApi.getAdminList({ current: 1, size: 1 }),
          commentApi.getAdminList({ current: 1, size: 1 }),
          categoryApi.getAdminList(),
          tagApi.getAdminList({ current: 1, size: 1 }),
          userApi.getAdminUsers({ current: 1, size: 1 }),
        ]);

      return {
        articleTotal: articleResult.total,
        commentTotal: commentResult.total,
        categoryTotal: categoryResult.length,
        tagTotal: tagResult.total,
        userTotal: userResult.total,
      };
    },
    {
      revalidateOnFocus: false,
    }
  );

  const activeMeta = useMemo(
    () => adminTabs.find((tab) => tab.id === activeTab) ?? adminTabs[0],
    [activeTab]
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <ShieldOff className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">请先登录</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            请先使用管理员账号登录，再进入后台管理页面。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <TransitionLink
              href="/login"
              transition="slideUp"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              前往登录
            </TransitionLink>
            <TransitionLink
              href="/"
              transition="fade"
              className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              返回首页
            </TransitionLink>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 1) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-6 py-10 text-center">
          <ShieldOff className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">无管理员权限</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            当前账号是普通用户，不能进入后台管理界面。
          </p>
          <div className="mt-6">
            <TransitionLink
              href="/profile"
              transition="slide"
              className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              返回个人中心
            </TransitionLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <ScrollReveal>
          <section className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_34%)]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Shield className="w-3.5 h-3.5" />
                  管理员后台
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                    统一管理站内内容与用户
                  </h1>
                  <p className="max-w-xl text-sm sm:text-base leading-7 text-muted-foreground">
                    集中处理文章、评论、分类、标签和用户信息，适合日常维护与课堂演示。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:min-w-[520px]">
                <MetricCard
                  title="文章"
                  value={overview?.articleTotal}
                  icon={FileText}
                  isLoading={isOverviewLoading}
                />
                <MetricCard
                  title="评论"
                  value={overview?.commentTotal}
                  icon={MessageSquare}
                  isLoading={isOverviewLoading}
                />
                <MetricCard
                  title="分类"
                  value={overview?.categoryTotal}
                  icon={FolderTree}
                  isLoading={isOverviewLoading}
                />
                <MetricCard
                  title="标签"
                  value={overview?.tagTotal}
                  icon={Tag}
                  isLoading={isOverviewLoading}
                />
                <MetricCard
                  title="用户"
                  value={overview?.userTotal}
                  icon={UserCog}
                  isLoading={isOverviewLoading}
                />
              </div>
            </div>

            {overviewError && (
              <div className="relative mt-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {overviewError instanceof Error ? overviewError.message : "后台概览读取失败"}
              </div>
            )}
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
          <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-3 lg:sticky lg:top-24 self-start">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-left transition-all",
                      isActive
                        ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/5"
                        : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl",
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">{tab.label}</div>
                        <p className="mt-1 text-xs leading-6 text-muted-foreground">
                          {tab.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </aside>

            <section className="min-w-0 rounded-[1.5rem] border border-border bg-card p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-2 border-b border-border pb-5">
                <div className="inline-flex items-center gap-2 text-primary">
                  <activeMeta.icon className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-[0.24em]">
                    {activeMeta.label}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {activeMeta.label}管理
                </h2>
                <p className="text-sm text-muted-foreground">{activeMeta.description}</p>
              </div>

              {activeTab === "articles" && <ArticlesAdminTab />}
              {activeTab === "comments" && <CommentsAdminTab />}
              {activeTab === "categories" && <CategoriesAdminTab />}
              {activeTab === "tags" && <TagsAdminTab />}
              {activeTab === "users" && <UsersAdminTab />}
            </section>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value?: number;
  icon: typeof FileText;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {isLoading ? "..." : value ?? 0}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background/55 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
        props.className
      )}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[110px] w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-input px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
        props.className
      )}
    />
  );
}

function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

function DangerButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

function Notice({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "error";
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        tone === "success"
          ? "border border-primary/20 bg-primary/10 text-primary"
          : "border border-destructive/20 bg-destructive/10 text-destructive"
      )}
    >
      {message}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <Icon className="w-10 h-10 text-muted mx-auto mb-4" />
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ArticlesAdminTab() {
  const [keyword, setKeyword] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["admin-articles-tab", keyword],
    () =>
      articleApi.getAdminList({
        current: 1,
        size: 50,
        keyword: keyword.trim() || undefined,
      }),
    { revalidateOnFocus: false }
  );

  const articles = data?.items ?? [];

  const handleToggleTop = async (article: Article) => {
    setProcessingId(article.articleId);
    try {
      await articleApi.changeAdminTopStatus(article.articleId, article.isTop === 1 ? 0 : 1);
      await mutate();
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (article: Article) => {
    if (!window.confirm(`确认删除文章《${article.title}》吗？`)) {
      return;
    }
    setProcessingId(article.articleId);
    try {
      await articleApi.deleteAdmin(article.articleId);
      await mutate();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <Panel
        title="文章列表"
        description="支持快速检索、置顶和删除，便于统一管理站内文章。"
        action={
          <div className="w-full sm:w-72">
            <TextInput
              placeholder="按标题搜索文章"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        }
      >
        {error ? (
          <Notice
            message={error instanceof Error ? error.message : "读取文章列表失败"}
            tone="error"
          />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="没有符合条件的文章"
            description="可以尝试更换关键词，或者回到前台继续创作内容。"
          />
        ) : (
          <AnimatedList className="grid gap-4">
            {articles.map((article) => {
              const isBusy = processingId === article.articleId;
              const statusLabel = articleStatusLabel(article.status);
              return (
                <article
                  key={article.articleId}
                  className="rounded-2xl border border-border bg-card px-4 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {article.isTop === 1 && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            置顶
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          {statusLabel}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          {article.categoryName || "未分类"}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{article.title}</h4>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {article.summary}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                        <span>作者：{article.authorNickname || "未设置作者昵称"}</span>
                        <span>创建于：{formatDate(article.createTime, "yyyy-MM-dd HH:mm")}</span>
                        <span>最近更新：{formatRelativeTime(article.updateTime || article.createTime)}</span>
                        <span>阅读量：{article.viewCount}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <TransitionLink
                        href={`/write?articleId=${article.articleId}`}
                        transition="slideUp"
                        className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        编辑
                      </TransitionLink>
                      {(article.status === 1 || article.status === 2) && (
                        <TransitionLink
                          href={`/article/${article.articleId}`}
                          transition="scaleFade"
                          className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          查看
                        </TransitionLink>
                      )}
                      <SecondaryButton disabled={isBusy} onClick={() => handleToggleTop(article)}>
                        {isBusy ? "处理中..." : article.isTop === 1 ? "取消置顶" : "设为置顶"}
                      </SecondaryButton>
                      <DangerButton disabled={isBusy} onClick={() => handleDelete(article)}>
                        <Trash2 className="mr-2 w-4 h-4" />
                        删除
                      </DangerButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </AnimatedList>
        )}
      </Panel>
    </div>
  );
}

function CommentsAdminTab() {
  const [keyword, setKeyword] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["admin-comments-tab", keyword],
    () =>
      commentApi.getAdminList({
        current: 1,
        size: 50,
        keyword: keyword.trim() || undefined,
      }),
    { revalidateOnFocus: false }
  );

  const comments = data?.items ?? [];

  const handleDelete = async (comment: AdminComment) => {
    if (!window.confirm("确认删除这条评论吗？")) {
      return;
    }
    setProcessingId(comment.commentId);
    try {
      await commentApi.deleteAdmin(comment.commentId);
      await mutate();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Panel
      title="评论列表"
      description="后台可以直接查看评论内容和所属文章，并删除不合适的评论。"
      action={
        <div className="w-full sm:w-72">
          <TextInput
            placeholder="按评论内容搜索"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
      }
    >
      {error ? (
        <Notice
          message={error instanceof Error ? error.message : "读取评论列表失败"}
          tone="error"
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-14">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="没有找到评论"
          description="当前筛选条件下没有评论数据。"
        />
      ) : (
        <AnimatedList className="grid gap-4">
          {comments.map((comment) => {
            const isBusy = processingId === comment.commentId;
            return (
              <article
                key={comment.commentId}
                className="rounded-2xl border border-border bg-card px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2.5 py-1">评论记录</span>
                      <span className="rounded-full bg-muted px-2.5 py-1">
                        {comment.parentId ? "回复评论" : "一级评论"}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-foreground">{comment.content}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span>用户：{comment.userNickname || "未显示用户信息"}</span>
                      <span>文章：{comment.articleTitle || "未显示文章标题"}</span>
                      <span>发布时间：{formatDate(comment.createTime, "yyyy-MM-dd HH:mm")}</span>
                    </div>
                  </div>

                  <DangerButton disabled={isBusy} onClick={() => handleDelete(comment)}>
                    <Trash2 className="mr-2 w-4 h-4" />
                    {isBusy ? "删除中..." : "删除评论"}
                  </DangerButton>
                </div>
              </article>
            );
          })}
        </AnimatedList>
      )}
    </Panel>
  );
}

function CategoriesAdminTab() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    sort: "0",
  });
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(
    null
  );
  const [processingId, setProcessingId] = useState<number | null>(null);

  const {
    data: categories = [],
    error,
    isLoading,
    mutate,
  } = useSWR(["admin-categories-tab"], () => categoryApi.getAdminList(), {
    revalidateOnFocus: false,
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      categoryName: "",
      description: "",
      sort: "0",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    try {
      const payload = {
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim() || undefined,
        sort: Number(formData.sort),
      };

      if (editingId) {
        await categoryApi.update(editingId, payload);
        setNotice({ tone: "success", message: "分类更新成功" });
      } else {
        await categoryApi.create(payload);
        setNotice({ tone: "success", message: "分类创建成功" });
      }
      resetForm();
      await mutate();
    } catch (submitError) {
      setNotice({
        tone: "error",
        message: submitError instanceof Error ? submitError.message : "分类保存失败",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.categoryId);
    setFormData({
      categoryName: category.categoryName || "",
      description: category.description || "",
      sort: String(category.sort ?? 0),
    });
    setNotice(null);
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`确认删除分类“${category.categoryName}”吗？`)) {
      return;
    }
    setProcessingId(category.categoryId);
    setNotice(null);
    try {
      await categoryApi.delete(category.categoryId);
      if (editingId === category.categoryId) {
        resetForm();
      }
      setNotice({ tone: "success", message: "分类删除成功" });
      await mutate();
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message: deleteError instanceof Error ? deleteError.message : "分类删除失败",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Panel
        title={editingId ? "编辑分类" : "新建分类"}
        description="分类保持简洁稳定，适合用来演示后台栏目管理。"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            placeholder="分类名称"
            value={formData.categoryName}
            onChange={(event) =>
              setFormData((current) => ({ ...current, categoryName: event.target.value }))
            }
          />
          <TextArea
            placeholder="分类描述（可选）"
            value={formData.description}
            onChange={(event) =>
              setFormData((current) => ({ ...current, description: event.target.value }))
            }
          />
          <TextInput
            type="number"
            min="0"
            placeholder="排序值"
            value={formData.sort}
            onChange={(event) =>
              setFormData((current) => ({ ...current, sort: event.target.value }))
            }
          />

          {notice && <Notice message={notice.message} tone={notice.tone} />}

          <div className="flex flex-wrap gap-2">
            <PrimaryButton type="submit">{editingId ? "保存修改" : "创建分类"}</PrimaryButton>
            {editingId && (
              <SecondaryButton type="button" onClick={resetForm}>
                取消编辑
              </SecondaryButton>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="分类列表" description="若分类仍被文章使用，系统会阻止删除。">
        {error ? (
          <Notice
            message={error instanceof Error ? error.message : "读取分类列表失败"}
            tone="error"
          />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="还没有分类"
            description="先在左侧创建一个分类，后台就有可演示的数据了。"
          />
        ) : (
          <AnimatedList className="grid gap-4">
            {categories.map((category) => {
              const isBusy = processingId === category.categoryId;
              return (
                <article
                  key={category.categoryId}
                  className="rounded-2xl border border-border bg-card px-4 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-foreground">
                          {category.categoryName}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          排序 {category.sort ?? 0}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {category.description || "暂无分类描述"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <SecondaryButton type="button" onClick={() => handleEdit(category)}>
                        编辑
                      </SecondaryButton>
                      <DangerButton disabled={isBusy} type="button" onClick={() => handleDelete(category)}>
                        <Trash2 className="mr-2 w-4 h-4" />
                        {isBusy ? "删除中..." : "删除"}
                      </DangerButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </AnimatedList>
        )}
      </Panel>
    </div>
  );
}

function TagsAdminTab() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tagName, setTagName] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(
    null
  );
  const [processingId, setProcessingId] = useState<number | null>(null);

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["admin-tags-tab"],
    () => tagApi.getAdminList({ current: 1, size: 100 }),
    { revalidateOnFocus: false }
  );

  const tags = data?.items ?? [];

  const resetForm = () => {
    setEditingId(null);
    setTagName("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    try {
      const payload = { tagName: tagName.trim() };
      if (editingId) {
        await tagApi.update(editingId, payload);
        setNotice({ tone: "success", message: "标签更新成功" });
      } else {
        await tagApi.create(payload);
        setNotice({ tone: "success", message: "标签创建成功" });
      }
      resetForm();
      await mutate();
    } catch (submitError) {
      setNotice({
        tone: "error",
        message: submitError instanceof Error ? submitError.message : "标签保存失败",
      });
    }
  };

  const handleDelete = async (tag: TagItem) => {
    if (!window.confirm(`确认删除标签“${tag.tagName}”吗？`)) {
      return;
    }
    setProcessingId(tag.tagId);
    setNotice(null);
    try {
      await tagApi.delete(tag.tagId);
      if (editingId === tag.tagId) {
        resetForm();
      }
      setNotice({ tone: "success", message: "标签删除成功" });
      await mutate();
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message: deleteError instanceof Error ? deleteError.message : "标签删除失败",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Panel title={editingId ? "编辑标签" : "新建标签"} description="标签编辑更轻量，适合快速演示增删改。">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            placeholder="标签名称"
            value={tagName}
            onChange={(event) => setTagName(event.target.value)}
          />

          {notice && <Notice message={notice.message} tone={notice.tone} />}

          <div className="flex flex-wrap gap-2">
            <PrimaryButton type="submit">{editingId ? "保存修改" : "创建标签"}</PrimaryButton>
            {editingId && (
              <SecondaryButton type="button" onClick={resetForm}>
                取消编辑
              </SecondaryButton>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="标签列表" description="列表会展示标签使用次数，方便老师理解标签和文章的关系。">
        {error ? (
          <Notice
            message={error instanceof Error ? error.message : "读取标签列表失败"}
            tone="error"
          />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tags.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="还没有标签"
            description="先创建一两个标签，后台演示会更完整。"
          />
        ) : (
          <AnimatedList className="grid gap-3 sm:grid-cols-2">
            {tags.map((tag) => {
              const isBusy = processingId === tag.tagId;
              return (
                <article
                  key={tag.tagId}
                  className="rounded-2xl border border-border bg-card px-4 py-4"
                >
                  <div className="flex h-full flex-col gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-base font-semibold text-foreground">{tag.tagName}</h4>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          {tag.articleCount ?? 0} 篇
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        最近更新：{formatDate(tag.updateTime || tag.createTime || "", "yyyy-MM-dd")}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2">
                      <SecondaryButton
                        type="button"
                        onClick={() => {
                          setEditingId(tag.tagId);
                          setTagName(tag.tagName);
                          setNotice(null);
                        }}
                      >
                        编辑
                      </SecondaryButton>
                      <DangerButton disabled={isBusy} type="button" onClick={() => handleDelete(tag)}>
                        <Trash2 className="mr-2 w-4 h-4" />
                        {isBusy ? "删除中..." : "删除"}
                      </DangerButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </AnimatedList>
        )}
      </Panel>
    </div>
  );
}

function UsersAdminTab() {
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(
    null
  );

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["admin-users-tab", keyword, roleFilter],
    () =>
      userApi.getAdminUsers({
        current: 1,
        size: 50,
        keyword: keyword.trim() || undefined,
        role: roleFilter === "all" ? undefined : Number(roleFilter),
      }),
    { revalidateOnFocus: false }
  );

  const users = data?.items ?? [];

  const handleRoleToggle = async (targetUser: AdminUser) => {
    setProcessingId(targetUser.userId);
    setNotice(null);
    try {
      await userApi.updateAdminUserRole(targetUser.userId, targetUser.role === 1 ? 0 : 1);
      setNotice({
        tone: "success",
        message: targetUser.role === 1 ? "用户已调整为普通用户" : "用户已提升为管理员",
      });
      await mutate();
    } catch (updateError) {
      setNotice({
        tone: "error",
        message:
          updateError instanceof Error ? updateError.message : "用户角色调整失败",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (targetUser: AdminUser) => {
    if (!window.confirm(`确认删除用户“${targetUser.username}”吗？`)) {
      return;
    }
    setProcessingId(targetUser.userId);
    setNotice(null);
    try {
      await userApi.deleteAdminUser(targetUser.userId);
      setNotice({ tone: "success", message: "用户删除成功" });
      await mutate();
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message: deleteError instanceof Error ? deleteError.message : "用户删除失败",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Panel
      title="用户列表"
      description="支持查看用户、调整角色和移除不再使用的账号。"
      action={
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-[220px_160px]">
          <TextInput
            placeholder="用户名 / 昵称 / 邮箱"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">全部角色</option>
            <option value="0">普通用户</option>
            <option value="1">管理员</option>
          </Select>
        </div>
      }
    >
      {notice && (
        <div className="mb-4">
          <Notice message={notice.message} tone={notice.tone} />
        </div>
      )}
      {error ? (
        <Notice
          message={error instanceof Error ? error.message : "读取用户列表失败"}
          tone="error"
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-14">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="没有找到用户"
          description="当前筛选条件下没有用户数据。"
        />
      ) : (
        <AnimatedList className="grid gap-4">
          {users.map((targetUser) => {
            const isBusy = processingId === targetUser.userId;
            const isAdmin = targetUser.role === 1;
            const avatarUrl = getSafeImageUrl(targetUser.avatar);
            return (
              <article
                key={targetUser.userId}
                className="rounded-2xl border border-border bg-card px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={targetUser.nickname || targetUser.username}
                          className="h-11 w-11 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-sm font-semibold text-muted-foreground">
                          {(targetUser.nickname || targetUser.username).charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-semibold text-foreground">
                            {targetUser.nickname || targetUser.username}
                          </h4>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                              isAdmin
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isAdmin ? (
                              <>
                                <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
                                管理员
                              </>
                            ) : (
                              "普通用户"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">@{targetUser.username}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span>{targetUser.email || "未填写邮箱"}</span>
                      <span>注册于：{formatDate(targetUser.createTime, "yyyy-MM-dd")}</span>
                      <span>最近更新：{formatRelativeTime(targetUser.updateTime || targetUser.createTime)}</span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {targetUser.bio || "这个用户还没有填写简介。"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <SecondaryButton disabled={isBusy} onClick={() => handleRoleToggle(targetUser)}>
                      {isBusy
                        ? "处理中..."
                        : isAdmin
                          ? "降为普通用户"
                          : "提升为管理员"}
                    </SecondaryButton>
                    <DangerButton disabled={isBusy} onClick={() => handleDelete(targetUser)}>
                      <Trash2 className="mr-2 w-4 h-4" />
                      删除用户
                    </DangerButton>
                  </div>
                </div>
              </article>
            );
          })}
        </AnimatedList>
      )}
    </Panel>
  );
}
