"use client";

import { useMemo } from "react";
import { List } from "lucide-react";

interface ArticleTOCProps {
  content: string;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function ArticleTOC({ content }: ArticleTOCProps) {
  const toc = useMemo(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/(^-|-$)/g, "");

      items.push({ id, text, level });
    }

    return items;
  }, [content]);

  if (toc.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky top-24 bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">目录</h3>
      </div>
      <ul className="space-y-2">
        {toc.map((item, index) => (
          <li
            key={index}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <button
              onClick={() => scrollToHeading(item.id)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors text-left line-clamp-2"
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
