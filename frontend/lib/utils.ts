import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Article } from "./api";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date, pattern = "yyyy年MM月dd日") {
  return format(new Date(date), pattern, { locale: zhCN });
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: zhCN,
  });
}

export function formatViewCount(count: number) {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

export function getInitials(name: string) {
  return name
    .split("")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function parseTagIds(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item) && item > 0)
    )
  );
}

export function makeFallbackArticle(articleId: number, title = "文章"): Article {
  return {
    articleId,
    title: `${title} #${articleId}`,
    summary: "当前接口只返回 ID，详情拉取失败时使用占位内容避免页面空白。",
    content: "",
    cover: null,
    userId: 0,
    categoryId: 0,
    viewCount: 0,
    isTop: 0,
    status: 0,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    authorNickname: "未知作者",
    authorAvatar: null,
    categoryName: "待补充分类",
    tagNames: [],
  };
}

export function articleStatusLabel(status: number) {
  switch (Number(status)) {
    case 0:
      return "草稿";
    case 1:
    case 2:
      return "已发布";
    case 3:
      return "审核失败";
    default:
      return `状态 ${status}`;
  }
}
