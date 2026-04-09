"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { userApi, parseToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("请填写所有字段");
      return;
    }

    setIsLoading(true);
    try {
      const token = await userApi.login(formData.username, formData.password);
      if (token && token !== "false" && token.length > 10) {
        // Parse token to get user ID
        const tokenData = parseToken(token);
        if (tokenData?.userId) {
          // Fetch user profile from backend
          try {
            const userProfile = await userApi.getProfile(tokenData.userId);
            login(userProfile, token);
          } catch {
            // If profile fetch fails, use basic info
            const basicUser = {
              userId: tokenData.userId,
              username: formData.username,
              nickname: formData.username,
              email: "",
              avatar: "",
              bio: "",
              role: 0,
              createTime: new Date().toISOString(),
            };
            login(basicUser, token);
          }
        } else {
          // Token doesn't contain userId, use basic info
          const basicUser = {
            userId: 0,
            username: formData.username,
            nickname: formData.username,
            email: "",
            avatar: "",
            bio: "",
            role: 0,
            createTime: new Date().toISOString(),
          };
          login(basicUser, token);
        }
        router.push("/");
      } else {
        setError("用户名或密码错误");
      }
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">M</span>
              </div>
              <span className="text-foreground font-semibold text-xl">
                MiniBlog
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">欢迎回来</h1>
            <p className="text-muted-foreground mt-2">
              登录你的账户，继续创作之旅
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground mb-2"
              >
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full h-11 px-4 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full h-11 px-4 pr-11 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            还没有账户？{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              立即注册
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-card border-l border-border items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            记录思考，分享知识
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            MiniBlog 是一个简洁、现代的内容创作平台。在这里，你可以专注于写作，
            分享你的技术见解、生活感悟和创意想法。
          </p>
        </div>
      </div>
    </div>
  );
}
