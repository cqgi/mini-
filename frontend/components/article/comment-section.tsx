"use client";

import { useState } from "react";
import useSWR from "swr";
import { MessageCircle, Send, Reply, Trash2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { commentApi, type Comment } from "@/lib/api";
import { formatRelativeTime, cn } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";
import { AnimatedList } from "@/components/ui/animated-list";

const { AnimatePresence, motion } =
  require("framer-motion") as typeof import("framer-motion");

interface CommentSectionProps {
  articleId: number;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const { data, error, isLoading, mutate } = useSWR(
    ["comments", articleId],
    async () => {
      const [topComments, commentTree] = await Promise.all([
        commentApi.getTopComments(articleId),
        commentApi.getCommentTree(articleId),
      ]);

      return {
        topComments,
        commentTree,
      };
    },
    {
      revalidateOnFocus: false,
    }
  );

  const comments = data?.topComments || [];
  const commentTree = data?.commentTree || {};

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    setActionError("");
    try {
      await commentApi.post({
        content: newComment,
        userId: user.userId,
        articleId,
        parentId: 0,
      });
      setNewComment("");
      mutate();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "发表评论失败"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim() || !user) return;

    setIsSubmitting(true);
    setActionError("");
    try {
      await commentApi.reply(parentId, user.userId, replyContent);
      setReplyTo(null);
      setReplyContent("");
      mutate();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "回复失败"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;

    try {
      await commentApi.delete(commentId, user.userId);
      mutate();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "删除评论失败"
      );
    }
  };

  return (
    <section className="mt-12 pt-12 border-t border-border">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">评论区</h2>
      </div>

      {actionError && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "读取评论失败"}
        </div>
      )}

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
          <TransitionLink
            href="/login"
            transition="slideUp"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            立即登录
          </TransitionLink>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          <AnimatedList
            className="space-y-6"
            animationKey={`comments-${articleId}-${comments.length}`}
          >
            {comments.map((comment) => (
            <CommentThread
              key={comment.commentId}
              comment={comment}
              tree={commentTree}
              currentUserId={user?.userId}
              replyTo={replyTo}
              replyContent={replyContent}
              isAuthenticated={isAuthenticated}
              isSubmitting={isSubmitting}
              onReply={() => setReplyTo(comment.commentId)}
              onCancelReply={() => {
                setReplyTo(null);
                setReplyContent("");
              }}
              onReplyContentChange={setReplyContent}
              onSubmitReply={handleSubmitReply}
              onDelete={handleDeleteComment}
            />
            ))}
          </AnimatedList>
        ) : (
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
          {String(comment.userId).slice(0, 1)}
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
            用户 #{comment.userId}
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

interface CommentThreadProps {
  comment: Comment;
  tree: Record<string, Comment[]>;
  currentUserId?: number;
  replyTo: number | null;
  replyContent: string;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  onReply: () => void;
  onCancelReply: () => void;
  onReplyContentChange: (value: string) => void;
  onSubmitReply: (commentId: number) => void;
  onDelete: (commentId: number) => void;
}

function CommentThread({
  comment,
  tree,
  currentUserId,
  replyTo,
  replyContent,
  isAuthenticated,
  isSubmitting,
  onReply,
  onCancelReply,
  onReplyContentChange,
  onSubmitReply,
  onDelete,
}: CommentThreadProps) {
  const replies = tree[String(comment.commentId)] || [];

  return (
    <div className="group">
      <CommentItem
        comment={comment}
        currentUserId={currentUserId}
        onReply={onReply}
        onDelete={() => onDelete(comment.commentId)}
      />

      <AnimatePresence initial={false}>
        {replyTo === comment.commentId && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="ml-13 mt-4 pl-6"
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  placeholder="写下你的回复..."
                  className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={onCancelReply}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => onSubmitReply(comment.commentId)}
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
          </motion.div>
        )}
      </AnimatePresence>

      {replies.length > 0 && (
        <div className="ml-13 mt-4 space-y-4 pl-6 border-l-2 border-border">
          {replies.map((reply) => (
            <CommentThread
              key={reply.commentId}
              comment={reply}
              tree={tree}
              currentUserId={currentUserId}
              replyTo={replyTo}
              replyContent={replyContent}
              isAuthenticated={isAuthenticated}
              isSubmitting={isSubmitting}
              onReply={() => onReply()}
              onCancelReply={onCancelReply}
              onReplyContentChange={onReplyContentChange}
              onSubmitReply={onSubmitReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
