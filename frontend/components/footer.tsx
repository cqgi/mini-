import { Github, Mail } from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <TransitionLink href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-foreground font-semibold text-lg">MiniBlog</span>
            </TransitionLink>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              一个简洁、现代的内容创作与分享平台，让写作和阅读变得更加纯粹。
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com/cqgi/mini-"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@miniblog.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">探索</h3>
            <ul className="space-y-3">
              <li>
                <TransitionLink
                  href="/explore"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  发现内容
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/tags"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  标签
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/categories"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  分类
                </TransitionLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">关于</h3>
            <ul className="space-y-3">
              <li>
                <TransitionLink
                  href="/about"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  关于我们
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  隐私政策
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/terms"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  服务条款
                </TransitionLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <p className="text-muted-foreground text-sm text-center">
            &copy; {new Date().getFullYear()} MiniBlog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
