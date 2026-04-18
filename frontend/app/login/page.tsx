"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft, UserRound } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { userApi } from "@/lib/api";
import { TransitionLink } from "@/components/ui/transition-link";
import { useTransitionRouter } from "@/lib/use-transition-router";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();
  const { login, knownAccounts, findKnownAccount } = useAuthStore();
  const [formData, setFormData] = useState({
    username: searchParams.get("username") || "",
    password: "",
    userId: searchParams.get("userId") || "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const rememberedAccount = formData.username
    ? findKnownAccount(formData.username)
    : undefined;

  const applyKnownAccount = (username: string, userId: number) => {
    setFormData((current) => ({
      ...current,
      username,
      userId: String(userId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("请填写所有字段");
      return;
    }

    setIsLoading(true);
    try {
      const loginMessage = await userApi.login(
        formData.username.trim(),
        formData.password
      );

      const resolvedUserId =
        Number(formData.userId) || rememberedAccount?.userId || 0;

      // if (!resolvedUserId) {
      //   setError("当前后端登录接口不会返回 userId，请填写联调用户 ID");
      //   return;
      // }

      const profile = await userApi.getProfile();

      if (profile.username !== formData.username.trim()) {
        setError("填写的 userId 和用户名不匹配，请检查后重试");
        return;
      }

      login(profile, loginMessage);
      router.push("/profile", { transition: "fade" });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "登录失败，请稍后重试"
      );
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
            <h1 className="text-2xl font-bold text-foreground">欢迎回来</h1>
            <p className="text-muted-foreground mt-2">
              登录后会再用你填写的 userId 读取真实资料，确保前端用户态和后端账号一致
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
                htmlFor="loginUserId"
                className="block text-sm font-medium text-foreground mb-2"
              >
                联调用户 ID
              </label>
              <input
                id="loginUserId"
                type="text"
                inputMode="numeric"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className="w-full h-11 px-4 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="例如 1"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                后端登录接口只返回一段字符串，不返回 token 和 userId，所以这里需要你显式绑定账号主键。
              </p>
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

            {knownAccounts.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">本地记住的账号</p>
                <div className="space-y-2">
                  {knownAccounts.slice(0, 3).map((account) => (
                    <button
                      key={`${account.username}-${account.userId}`}
                      type="button"
                      onClick={() =>
                        applyKnownAccount(account.username, account.userId)
                      }
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-card border border-border rounded-lg text-left hover:border-primary/40 transition-colors"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <UserRound className="w-4 h-4 text-primary" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground truncate">
                            {account.nickname || account.username}
                          </span>
                          <span className="block text-xs text-muted-foreground truncate">
                            @{account.username}
                          </span>
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ID {account.userId}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
            <TransitionLink
              href="/register"
              transition="fade"
              className="text-primary hover:underline font-medium"
            >
              立即注册
            </TransitionLink>
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
            这套前端现在会在登录成功后继续读取真实用户资料，而不是再写一个 mock 用户。
            如果你刚注册成功，也可以直接使用系统记住的 userId 快速回填。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
