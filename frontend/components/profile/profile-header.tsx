"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { Edit2, Loader2, Check, X, Upload } from "lucide-react";
import type { User } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { fileApi, userApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [status, setStatus] = useState("");
  const displayName = (user.nickname || user.username || "User").trim();
  const displayInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : "U";
  const joinedDate = formatDate(user.createTime);
  const joinedDateLabel = joinedDate === "时间未知" ? joinedDate : `${joinedDate} 加入`;
  const [formData, setFormData] = useState({
    nickname: user.nickname || "",
    avatar: user.avatar || "",
    bio: user.bio || "",
  });
  const previewAvatar = (isEditing ? formData.avatar : user.avatar) || "";

  useEffect(() => {
    setFormData({
      nickname: user.nickname || "",
      avatar: user.avatar || "",
      bio: user.bio || "",
    });
  }, [user]);

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setIsUploadingAvatar(true);
    setStatus("");
    try {
      const uploadedFile = await fileApi.uploadImage("avatar", file);
      setFormData((current) => ({
        ...current,
        avatar: uploadedFile.url,
      }));
      setStatus("头像已上传，请保存资料");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "头像上传失败");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setStatus("");
    try {
      const success = await userApi.updateProfile(formData);
      if (success) {
        updateUser(formData);
        setIsEditing(false);
        setStatus("资料已更新");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "更新资料失败");
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
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 sm:-mt-16">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-full border-4 border-card flex items-center justify-center overflow-hidden">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-muted-foreground">
                  {displayInitial}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 py-2">
            {status && (
              <div
                className={`mb-3 rounded-lg px-3 py-2 text-sm ${
                  status.includes("已")
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {status}
              </div>
            )}
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
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  placeholder="头像地址"
                  className="w-full max-w-md h-10 px-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploadingAvatar ? "正在上传头像..." : "上传本地头像"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                  <span className="text-xs text-muted-foreground">
                    支持 JPG、PNG、WEBP、GIF，上传后会自动回填 OSS 地址
                  </span>
                </div>
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
                        avatar: user.avatar || "",
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
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>用户 ID：{user.userId}</p>
                  <p>{user.email}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{joinedDateLabel}</p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
