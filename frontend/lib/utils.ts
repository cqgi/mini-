import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

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
