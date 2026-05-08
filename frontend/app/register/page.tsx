"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft, Check } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { userApi } from "@/lib/api";
import { TransitionLink } from "@/components/ui/transition-link";
import { useTransitionRouter } from "@/lib/use-transition-router";

export default function RegisterPage() {
  const router = useTransitionRouter();
  const { rememberAccount } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRequirements = [
    { label: "6 到 20 个字符", valid: formData.password.length >= 6 && formData.password.length <= 20 },
    {
      label: "包含字母和数字",
      valid: /[a-zA-Z]/.test(formData.password) && /\d/.test(formData.password),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("请填写所有字段");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (!passwordRequirements.every((r) => r.valid)) {
      setError("密码不符合要求");
      return;
    }

    setIsLoading(true);
    try {
      const user = await userApi.register(
        formData.username,
        formData.email,
        formData.password
      );
      if (user?.username) {
        rememberAccount(user);
        router.push(`/login?username=${encodeURIComponent(user.username)}`, {
          transition: "fade",
        });
      } else {
        setError("注册失败，请稍后重试");
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "注册失败，用户名或邮箱可能已被使用"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-card border-r border-border items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            加入创作者社区
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            注册成为 MiniBlog 的一员，开始你的创作之旅。分享你的知识和见解，
            与志同道合的人交流互动。
          </p>
          <ul className="mt-8 space-y-3 text-left">
            {[
              "免费发布无限文章",
              "获得读者关注和评论",
              "收藏喜欢的内容",
              "加入技术社区讨论",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-muted-foreground"
              >
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <TransitionLink
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </TransitionLink>

          {/* Header */}
          <div className="mb-8">
            <TransitionLink href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">M</span>
              </div>
              <span className="text-foreground font-semibold text-xl">
                MiniBlog
              </span>
            </TransitionLink>
            <h1 className="text-2xl font-bold text-foreground">创建账户</h1>
            <p className="text-muted-foreground mt-2">
              注册成功后会跳转到登录页，并自动帮你填好刚注册的用户名
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
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full h-11 px-4 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="请输入邮箱地址"
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
              {formData.password && (
                <ul className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <li
                      key={req.label}
                      className={`flex items-center gap-2 text-xs ${
                        req.valid ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {req.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                确认密码
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full h-11 px-4 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="请再次输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  注册中...
                </>
              ) : (
                "注册"
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              后端当前没有真正的自动登录能力，所以注册完成后会进入登录页继续绑定会话。
            </p>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            已有账户？{" "}
            <TransitionLink
              href="/login"
              transition="fade"
              className="text-primary hover:underline font-medium"
            >
              立即登录
            </TransitionLink>
          </p>
        </div>
      </div>
    </div>
  );
}
