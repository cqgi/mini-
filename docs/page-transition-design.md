# MiniBlog 页面转场动画设计文档

## 概述

本文档定义了 MiniBlog 前端项目的页面间丝滑转场动画方案，旨在提升用户体验，使页面切换更加流畅自然。

## 技术选型

### 推荐方案：Framer Motion + Next.js App Router

```
依赖: framer-motion@^11.x
```

**选择理由：**
- 与 React 生态深度集成
- 声明式 API，易于维护
- 支持复杂的动画编排
- 性能优秀，使用 GPU 加速
- 支持 `AnimatePresence` 实现退出动画

---

## 项目页面结构

```
/                    首页 (文章列表)
/explore             发现页 (搜索/分类)
/article/[id]        文章详情页
/login               登录页
/register            注册页
/profile             个人中心
/write               写文章
```

---

## 转场动画设计规范

### 1. 动画时长标准

| 类型 | 时长 | 缓动函数 | 适用场景 |
|------|------|----------|----------|
| 快速 | 150ms | `easeOut` | 小元素、hover 效果 |
| 标准 | 250ms | `easeInOut` | 页面转场、模态框 |
| 舒缓 | 400ms | `[0.4, 0, 0.2, 1]` | 大面积内容、首次加载 |

### 2. 页面转场类型

#### 2.1 淡入淡出 (Fade) - 默认转场

适用于：大多数页面切换

```tsx
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const fadeTransition = {
  duration: 0.25,
  ease: "easeInOut",
};
```

#### 2.2 滑入 (Slide) - 层级导航

适用于：首页 → 文章详情、列表 → 详情

```tsx
const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const slideTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};
```

#### 2.3 缩放淡入 (Scale Fade) - 聚焦内容

适用于：点击卡片进入详情

```tsx
const scaleFadeVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

const scaleFadeTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
};
```

#### 2.4 上滑进入 (Slide Up) - 模态/覆盖层

适用于：登录/注册页面、写文章页面

```tsx
const slideUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
};

const slideUpTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1],
};
```

---

## 实现架构

### 1. 创建动画上下文 Provider

**文件：`/components/providers/transition-provider.tsx`**

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type TransitionType = "fade" | "slide" | "scaleFade" | "slideUp";

interface TransitionContextValue {
  transitionType: TransitionType;
  setTransitionType: (type: TransitionType) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransition must be used within TransitionProvider");
  }
  return context;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scaleFade: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
  },
};

const transitions = {
  fade: { duration: 0.25, ease: "easeInOut" },
  slide: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  scaleFade: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  slideUp: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
};

interface TransitionProviderProps {
  children: ReactNode;
}

export function TransitionProvider({ children }: TransitionProviderProps) {
  const pathname = usePathname();
  const [transitionType, setTransitionType] = useState<TransitionType>("fade");

  return (
    <TransitionContext.Provider value={{ transitionType, setTransitionType }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants[transitionType]}
          transition={transitions[transitionType]}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
```

### 2. 修改根布局

**文件：`/app/layout.tsx`**

```tsx
import { TransitionProvider } from "@/components/providers/transition-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSerifSC.variable} ${firaCode.variable} antialiased`}>
        <TransitionProvider>
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
```

### 3. 创建转场链接组件

**文件：`/components/ui/transition-link.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "@/components/providers/transition-provider";
import { MouseEvent, ReactNode } from "react";

type TransitionType = "fade" | "slide" | "scaleFade" | "slideUp";

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  transition?: TransitionType;
  className?: string;
  prefetch?: boolean;
}

export function TransitionLink({
  href,
  children,
  transition = "fade",
  className,
  prefetch = true,
}: TransitionLinkProps) {
  const router = useRouter();
  const { setTransitionType } = useTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setTransitionType(transition);
    // 等待状态更新后再导航
    setTimeout(() => {
      router.push(href);
    }, 10);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}
```

---

## 页面转场映射表

| 起始页面 | 目标页面 | 转场类型 | 说明 |
|----------|----------|----------|------|
| 首页 | 文章详情 | `scaleFade` | 卡片展开效果 |
| 首页 | 发现 | `fade` | 平级导航 |
| 首页 | 个人中心 | `slide` | 侧向导航 |
| 首页 | 写文章 | `slideUp` | 模态感觉 |
| 任意 | 登录/注册 | `slideUp` | 覆盖层效果 |
| 文章详情 | 首页 | `scaleFade` | 返回收缩 |
| 登录/注册 | 首页 | `fade` | 完成后淡出 |

---

## 组件内动画

### 1. 列表项交错动画 (Stagger)

**适用于：文章列表、评论列表**

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// 使用示例
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {articles.map((article) => (
    <motion.div key={article.id} variants={itemVariants}>
      <ArticleCard article={article} />
    </motion.div>
  ))}
</motion.div>
```

### 2. 滚动显示动画 (Scroll Reveal)

**适用于：长页面内容、首页 Hero**

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

### 3. 共享元素动画 (Shared Layout)

**适用于：文章卡片 → 文章详情头图**

```tsx
import { motion, LayoutGroup } from "framer-motion";

// 在 ArticleCard 中
<LayoutGroup>
  <motion.img
    layoutId={`article-cover-${article.id}`}
    src={article.cover}
    className="w-full h-48 object-cover"
  />
</LayoutGroup>

// 在 ArticleDetail 中
<LayoutGroup>
  <motion.img
    layoutId={`article-cover-${article.id}`}
    src={article.cover}
    className="w-full h-[400px] object-cover"
  />
</LayoutGroup>
```

---

## 微交互动画

### 1. 按钮点击反馈

```tsx
const buttonVariants = {
  tap: { scale: 0.97 },
  hover: { scale: 1.02 },
};

<motion.button
  variants={buttonVariants}
  whileTap="tap"
  whileHover="hover"
  transition={{ duration: 0.15 }}
>
  发布文章
</motion.button>
```

### 2. 卡片悬浮效果

```tsx
const cardVariants = {
  rest: {
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

<motion.div
  variants={cardVariants}
  initial="rest"
  whileHover="hover"
>
  <ArticleCard />
</motion.div>
```

### 3. 加载骨架屏动画

```tsx
const shimmerVariants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
};

<motion.div
  variants={shimmerVariants}
  initial="initial"
  animate="animate"
  className="h-4 rounded bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]"
/>
```

---

## 性能优化指南

### 1. 使用 `will-change`

对于频繁动画的元素，提前告知浏览器：

```tsx
<motion.div style={{ willChange: "transform, opacity" }}>
  {/* 内容 */}
</motion.div>
```

### 2. 优先使用 Transform 属性

**推荐：** `x`, `y`, `scale`, `rotate`, `opacity`
**避免：** `width`, `height`, `top`, `left`, `margin`, `padding`

### 3. 减少重排触发

```tsx
// 不推荐 - 触发布局重排
animate={{ width: "100%", height: 200 }}

// 推荐 - 仅使用 transform
animate={{ scaleX: 1, scaleY: 1 }}
```

### 4. 使用 `layout` 属性时的注意事项

```tsx
// 为 layout 动画设置合理的 transition
<motion.div
  layout
  transition={{
    layout: { duration: 0.3, ease: "easeInOut" },
  }}
/>
```

### 5. 懒加载动画组件

```tsx
import dynamic from "next/dynamic";

const AnimatedComponent = dynamic(
  () => import("@/components/animated-component"),
  { ssr: false }
);
```

---

## 可访问性 (A11Y)

### 1. 尊重用户偏好

```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      {/* 内容 */}
    </motion.div>
  );
}
```

### 2. 全局动画开关

```tsx
// 在 TransitionProvider 中添加
const [motionEnabled, setMotionEnabled] = useState(true);
const prefersReducedMotion = useReducedMotion();

const effectiveMotion = motionEnabled && !prefersReducedMotion;
```

---

## 文件清单

实现本方案需要创建/修改以下文件：

```
frontend/
├── components/
│   ├── providers/
│   │   └── transition-provider.tsx    # 转场上下文 Provider
│   └── ui/
│       ├── transition-link.tsx        # 转场链接组件
│       ├── scroll-reveal.tsx          # 滚动显示组件
│       └── animated-list.tsx          # 动画列表组件
├── lib/
│   └── motion.ts                      # 动画变体和配置集合
└── app/
    └── layout.tsx                     # 修改根布局
```

---

## 测试检查清单

- [ ] 页面切换无闪烁
- [ ] 返回时动画方向正确
- [ ] 减少动画模式正常工作
- [ ] 移动端性能流畅 (60fps)
- [ ] 动画不阻塞用户交互
- [ ] 长列表不卡顿
- [ ] 快速连续点击无异常

---

## 参考资源

- [Framer Motion 文档](https://www.framer.com/motion/)
- [Next.js App Router 动画](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
- [Web Animations 性能指南](https://web.dev/animations-guide/)
