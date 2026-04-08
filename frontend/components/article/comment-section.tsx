"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { MessageCircle, Send, Reply, Trash2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { commentApi, type Comment } from "@/lib/api";
import { formatRelativeTime, cn } from "@/lib/utils";

interface CommentSectionProps {
  articleId: number;
}

// Mock comments for demo
const mockComments: Comment[] = [
  {
    commentId: 1,
    articleId: 1,
    userId: 2,
    parentId: 0,
    content: "非常详细的文章！React Server Components 确实是一个很重要的特性，特别是在构建大型应用时，可以显著减少客户端包的大小。",
    createTime: "2024-03-15T11:30:00",
    user: {
      userId: 2,
      username: "lisi",
      nickname: "李四",
      email: "",
      avatar: "",
      bio: "",
      role: 0,
      createTime: "",
    },
  },
  {
    commentId: 2,
    articleId: 1,
    userId: 3,
    parentId: 0,
    content: "请问 Server Components 和 SSR 有什么区别呢？",
    createTime: "2024-03-15T12:00:00",
    user: {
      userId: 3,
      username: "wangwu",
      nickname: "王五",
      email: "",
      avatar: "",
      bio: "",
      role: 0,
      createTime: "",
    },
  },
  {
    commentId: 3,
    articleId: 1,
    userId: 1,
    parentId: 2,
    content: "SSR 是在服务端渲染整个页面的 HTML，而 Server Components 可以更细粒度地控制哪些组件在服务端运行。它们可以配合使用。",
    createTime: "2024-03-15T12:30:00",
    user: {
      userId: 1,
      username: "zhangsan",
      nickname: "张三",
      email: "",
      avatar: "",
      bio: "",
      role: 0,
      createTime: "",
    },
  },
];

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments = mockComments, mutate } = useSWR(
    ["comments", articleId],
    async () => {
      try {
        const result = await commentApi.getTopComments(articleId);
        return result.length > 0 ? result : mockComments;
      } catch {
        return mockComments;
      }
    },
    {
      fallbackData: mockComments,
    }
  );

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await commentApi.post({
        content: newComment,
        userId: user.userId,
        articleId,
      });
      setNewComment("");
      mutate();
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await commentApi.reply(parentId, user.userId, replyContent);
      setReplyTo(null);
      setReplyContent("");
      mutate();
    } catch (error) {
      console.error("Failed to reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;

    try {
      await commentApi.delete(commentId, user.userId);
      mutate();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Build comment tree
  const topLevelComments = comments.filter((c) => c.parentId === 0);
  const replies = comments.filter((c) => c.parentId !== 0);

  return (
    <section className="mt-12 pt-12 border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          评论 ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {isAuthenticated && user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-muted-foreground">
                {(user.nickname || user.username).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                className="w-full h-24 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  发布评论
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-card border border-border rounded-lg text-center">
          <p className="text-muted-foreground mb-4">登录后即可发表评论</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            立即登录
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {topLevelComments.map((comment) => {
          const commentReplies = replies.filter(
            (r) => r.parentId === comment.commentId
          );

          return (
            <div key={comment.commentId} className="group">
              <CommentItem
                comment={comment}
                currentUserId={user?.userId}
                onReply={() => setReplyTo(comment.commentId)}
                onDelete={() => handleDeleteComment(comment.commentId)}
              />

              {/* Replies */}
              {commentReplies.length > 0 && (
                <div className="ml-13 mt-4 space-y-4 pl-6 border-l-2 border-border">
                  {commentReplies.map((reply) => (
                    <CommentItem
                      key={reply.commentId}
                      comment={reply}
                      currentUserId={user?.userId}
                      isReply
                      onReply={() => setReplyTo(reply.commentId)}
                      onDelete={() => handleDeleteComment(reply.commentId)}
                    />
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyTo === comment.commentId && isAuthenticated && (
                <div className="ml-13 mt-4 pl-6">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="写下你的回复..."
                        className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent("");
                          }}
                          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSubmitReply(comment.commentId)}
                          disabled={!replyContent.trim() || isSubmitting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          回复
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {comments.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted-foreground">暂无评论，来发表第一条评论吧</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: number;
  isReply?: boolean;
  onReply: () => void;
  onDelete: () => void;
}

function CommentItem({
  comment,
  currentUserId,
  isReply,
  onReply,
  onDelete,
}: CommentItemProps) {
  const isOwner = currentUserId === comment.userId;

  return (
    <div className={cn("flex gap-3", isReply && "")}>
      <div
        className={cn(
          "bg-muted rounded-full flex items-center justify-center shrink-0",
          isReply ? "w-8 h-8" : "w-10 h-10"
        )}
      >
        <span
          className={cn(
            "font-medium text-muted-foreground",
            isReply ? "text-xs" : "text-sm"
          )}
        >
          {comment.user?.nickname?.charAt(0).toUpperCase() || "?"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "font-medium text-foreground",
              isReply ? "text-sm" : ""
            )}
          >
            {comment.user?.nickname || "匿名用户"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createTime)}
          </span>
        </div>
        <p
          className={cn(
            "text-foreground leading-relaxed",
            isReply ? "text-sm" : ""
          )}
        >
          {comment.content}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={onReply}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Reply className="w-3.5 h-3.5" />
            回复
          </button>
          {isOwner && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
