import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif_SC, Fira_Code } from "next/font/google";
import "./globals.css";
import { getThemeInitScript } from "@/lib/theme";
import { getMotionInitScript } from "@/lib/motion";
import { TransitionProvider } from "@/components/providers/transition-provider";
import { AppFrame } from "@/components/layout/app-frame";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: "MiniBlog - 简约博客平台",
  description: "一个简洁、现代的内容创作与分享平台，让写作和阅读变得更加纯粹。",
  keywords: ["博客", "写作", "阅读", "内容创作", "MiniBlog"],
  authors: [{ name: "MiniBlog" }],
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSerifSC.variable} ${firaCode.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
        <script dangerouslySetInnerHTML={{ __html: getMotionInitScript() }} />
        <TransitionProvider>
          <AppFrame>{children}</AppFrame>
        </TransitionProvider>
      </body>
    </html>
  );
}
