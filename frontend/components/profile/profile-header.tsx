"use client";

import { useState } from "react";
import { Settings, Edit2, Camera, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { userApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: user.nickname || "",
    bio: user.bio || "",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await userApi.updateProfile(user.userId, formData);
      if (success) {
        updateUser(formData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border-b border-border">
      {/* Cover Image */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-card relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--color-primary)/0.1),transparent)]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 pb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-full border-4 border-card flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.nickname || user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-muted-foreground">
                  {(user.nickname || user.username).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 py-2">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                  placeholder="昵称"
                  className="w-full max-w-xs h-10 px-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="个人简介..."
                  className="w-full max-w-md h-20 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        nickname: user.nickname || "",
                        bio: user.bio || "",
                      });
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {user.nickname || user.username}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-sm text-foreground mt-2 max-w-md">
                    {user.bio}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(user.createTime)} 加入
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2 sm:self-end sm:mb-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                编辑资料
              </button>
              <Link
                href="/settings"
                className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
