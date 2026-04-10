"use client";

import { useEffect, useState } from "react";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { userApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function ProfilePage() {
  const { user, isAuthenticated, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"articles" | "favorites" | "comments">("articles");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!user?.userId) {
      return;
    }

    const currentUserId = user.userId;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const profile = await userApi.getProfile(currentUserId);
        if (!cancelled) {
          login(profile);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "读取个人资料失败"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.userId, login]);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            请先登录
          </h2>
          <TransitionLink
            href="/login"
            transition="slideUp"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            前往登录
          </TransitionLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollReveal>
        <ProfileHeader user={user} />
      </ScrollReveal>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            正在同步后端资料...
          </div>
        )}
        <ScrollReveal delay={0.04}>
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userId={user.userId}
          />
        </ScrollReveal>
      </div>
    </>
  );
}
