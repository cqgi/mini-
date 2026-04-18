"use client";

import { usePathname } from "next/navigation";
import { Search, PenSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { MotionToggle } from "@/components/motion-toggle";
import { TransitionLink } from "@/components/ui/transition-link";
import { useTransitionRouter } from "@/lib/use-transition-router";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/explore", label: "发现" },
];

export function Header() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const displayName = (user?.nickname || user?.username || "User").trim();
  const displayInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : "U";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <TransitionLink href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-foreground font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">
              MiniBlog
            </span>
          </TransitionLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <TransitionLink
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </TransitionLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    placeholder="搜索文章..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                    onBlur={() => {
                      if (!searchQuery) setIsSearchOpen(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="ml-2 p-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="搜索"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {isAuthenticated && user ? (
              <>
                <TransitionLink
                  href="/write"
                  transition="slideUp"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  写文章
                </TransitionLink>
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          {displayInitial}
                        </span>
                      </div>
                    )}
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <TransitionLink
                      href="/profile"
                      transition="slide"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      个人中心
                    </TransitionLink>
                    <TransitionLink
                      href="/explore"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      发现文章
                    </TransitionLink>
                    <hr className="my-2 border-border" />
                    <ThemeToggle />
                    <hr className="my-2 border-border" />
                    <MotionToggle />
                    <hr className="my-2 border-border" />
                    <button
                      onClick={() => {
                        logout();
                        router.push("/", { transition: "fade" });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <TransitionLink
                  href="/login"
                  transition="slideUp"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  登录
                </TransitionLink>
                <TransitionLink
                  href="/register"
                  transition="slideUp"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  注册
                </TransitionLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="菜单"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </form>
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </TransitionLink>
              ))}
              {isAuthenticated && user ? (
                <>
                  <TransitionLink
                    href="/write"
                    transition="slideUp"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-primary text-sm font-medium"
                  >
                    <PenSquare className="w-4 h-4" />
                    写文章
                  </TransitionLink>
                  <TransitionLink
                    href="/profile"
                    transition="slide"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-muted-foreground hover:text-foreground text-sm font-medium"
                  >
                    个人中心
                  </TransitionLink>
                  <div className="px-4 py-2">
                    <ThemeToggle compact />
                  </div>
                  <div className="px-4 py-2">
                    <MotionToggle compact />
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      router.push("/", { transition: "fade" });
                    }}
                    className="block w-full text-left px-4 py-2 text-destructive text-sm font-medium"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4 pt-2">
                  <TransitionLink
                    href="/login"
                    transition="slideUp"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 py-2 text-center text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    登录
                  </TransitionLink>
                  <TransitionLink
                    href="/register"
                    transition="slideUp"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    注册
                  </TransitionLink>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
