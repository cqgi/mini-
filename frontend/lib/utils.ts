import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Article } from "./api";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function parseDateInput(date: string | Date | null | undefined) {
  if (!date) {
    return null;
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const raw = date.trim();
  if (!raw || raw === "null" || raw === "undefined") {
    return null;
  }

  if (/^\d+$/.test(raw)) {
    const timestamp = Number(raw);
    if (!Number.isFinite(timestamp)) {
      return null;
    }

    const normalizedTimestamp = raw.length === 10 ? timestamp * 1000 : timestamp;
    const parsedFromTimestamp = new Date(normalizedTimestamp);
    return Number.isNaN(parsedFromTimestamp.getTime()) ? null : parsedFromTimestamp;
  }

  const normalized = raw.includes(" ") ? raw.replace(" ", "T") : raw;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(date: string | Date | null | undefined, pattern = "yyyy年MM月dd日") {
  const parsed = parseDateInput(date);
  if (!parsed) {
    return "时间未知";
  }

  return format(parsed, pattern, { locale: zhCN });
}

export function formatRelativeTime(date: string | Date | null | undefined) {
  const parsed = parseDateInput(date);
  if (!parsed) {
    return "时间未知";
  }

  return formatDistanceToNow(parsed, {
    addSuffix: true,
    locale: zhCN,
  });
}

export function getSafeImageUrl(url: string | null | undefined) {
  const value = url?.trim();
  if (!value || value === "默认头像地址.jpg") {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("blob:") ||
    value.startsWith("data:image/")
  ) {
    return value;
  }

  return "";
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
