"use client";

import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import useSWR from "swr";
import { Lock, MessageCircle, RefreshCw, Search, Send } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import {
  messageApi,
  type MessageContact,
  type PrivateMessage,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { cn, formatRelativeTime, getSafeImageUrl } from "@/lib/utils";

const CONVERSATION_SIZE = 50;

function getDisplayName(contact: MessageContact) {
  return (contact.nickname || contact.username || `用户 ${contact.userId}`).trim();
}

function Avatar({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const imageUrl = getSafeImageUrl(src);
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("rounded-full object-cover ring-1 ring-border", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/12 font-semibold text-primary ring-1 ring-primary/20",
        className
      )}
    >
      {initial}
    </div>
  );
}

function LoginRequired() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ScrollReveal>
          <div className="rounded-3xl border border-border bg-card/70 p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">登录后查看私信</h1>
            <p className="mt-3 text-muted-foreground">
              私信只对当前账号开放，请先登录再查看会话和发送消息。
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <TransitionLink
                href="/login"
                transition="slideUp"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                去登录
              </TransitionLink>
              <TransitionLink
                href="/register"
                transition="slideUp"
                className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                注册账号
              </TransitionLink>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}

export default function MessagesPage() {
  const { isAuthenticated } = useAuthStore();
  const [contactKeyword, setContactKeyword] = useState("");
  const deferredKeyword = useDeferredValue(contactKeyword);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const {
    data: contacts = [],
    error: contactsError,
    isLoading: isContactsLoading,
    isValidating: isContactsRefreshing,
    mutate: mutateContacts,
  } = useSWR(
    isAuthenticated ? ["messages", "contacts", deferredKeyword.trim()] : null,
    () => messageApi.getContacts(deferredKeyword),
    { keepPreviousData: true }
  );

  const selectedContact =
    contacts.find((contact) => contact.userId === selectedContactId) ?? null;

  const {
    data: conversation,
    error: conversationError,
    isLoading: isConversationLoading,
    isValidating: isConversationRefreshing,
    mutate: mutateConversation,
  } = useSWR(
    isAuthenticated && selectedContactId
      ? ["messages", "conversation", selectedContactId]
      : null,
    () =>
      messageApi.getConversation(selectedContactId as number, {
        pageNum: 1,
        pageSize: CONVERSATION_SIZE,
      }),
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].userId);
    }
  }, [contacts, selectedContactId]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ block: "end" });
  }, [conversation?.items.length, selectedContactId]);

  if (!isAuthenticated) {
    return <LoginRequired />;
  }

  const messages = conversation?.items ?? [];

  const refreshContacts = async () => {
    await mutateContacts();
  };

  const refreshCurrentConversation = async () => {
    await mutateConversation();
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!selectedContactId) {
      setNotice("请先选择联系人");
      return;
    }
    if (!trimmed) {
      setNotice("请输入私信内容");
      return;
    }

    startSending(async () => {
      try {
        await messageApi.send(selectedContactId, trimmed);
        setContent("");
        setNotice(null);
        await Promise.all([mutateContacts(), mutateConversation()]);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "私信发送失败");
      }
    });
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <ScrollReveal>
          <div className="grid overflow-hidden rounded-3xl border border-border bg-card/80 shadow-sm lg:grid-cols-[320px_1fr]">
            <aside className="border-b border-border bg-background/35 lg:border-b-0 lg:border-r">
              <div className="border-b border-border p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">联系人</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      搜索用户并打开独立会话。
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isContactsRefreshing}
                    onClick={refreshContacts}
                    className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="刷新联系人"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", isContactsRefreshing && "animate-spin")}
                    />
                  </button>
                </div>
                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={contactKeyword}
                    onChange={(event) => setContactKeyword(event.target.value)}
                    placeholder="搜索用户名或昵称"
                    className="h-11 w-full rounded-xl border border-border bg-input pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="h-[260px] space-y-2 overflow-y-auto p-3 sm:h-[320px] lg:h-[590px]">
                {contactsError ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    联系人加载失败
                  </div>
                ) : isContactsLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-2xl bg-muted/70"
                    />
                  ))
                ) : contacts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    没有匹配的用户
                  </div>
                ) : (
                  contacts.map((contact) => {
                    const name = getDisplayName(contact);
                    const active = selectedContactId === contact.userId;

                    return (
                      <button
                        type="button"
                        key={contact.userId}
                        onClick={() => {
                          setSelectedContactId(contact.userId);
                          setNotice(null);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                          active
                            ? "border-primary/35 bg-primary/10"
                            : "border-transparent hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <Avatar
                          src={contact.avatar}
                          name={name}
                          className="h-11 w-11 shrink-0 text-sm"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            @{contact.username || contact.userId}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="flex min-h-[620px] flex-col bg-card">
              <div className="flex items-center justify-between gap-4 border-b border-border p-5">
                {selectedContact ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src={selectedContact.avatar}
                      name={getDisplayName(selectedContact)}
                      className="h-11 w-11 shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-foreground">
                        {getDisplayName(selectedContact)}
                      </h2>
                      <p className="truncate text-sm text-muted-foreground">
                        @{selectedContact.username || selectedContact.userId}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">选择一个联系人</h2>
                    <p className="text-sm text-muted-foreground">
                      选择联系人后会显示历史消息。
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  disabled={!selectedContactId || isConversationRefreshing}
                  onClick={refreshCurrentConversation}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConversationRefreshing ? "刷新中" : "刷新"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-background/30 p-4 sm:p-6">
                {!selectedContactId ? (
                  <div className="flex h-full min-h-[360px] items-center justify-center">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <MessageCircle className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        还没有打开会话
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        从左侧选择用户后，这里会展示你们之间的历史消息。
                      </p>
                    </div>
                  </div>
                ) : conversationError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    {conversationError instanceof Error
                      ? conversationError.message
                      : "会话加载失败"}
                  </div>
                ) : isConversationLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "h-16 w-2/3 animate-pulse rounded-2xl bg-muted/70",
                          index % 2 === 1 && "ml-auto"
                        )}
                      />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-[360px] items-center justify-center">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Send className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        暂无历史消息
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        在底部输入内容，发送第一条私信。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: PrivateMessage) => {
                      const mine = Boolean(message.mine);
                      return (
                        <div
                          key={message.id}
                          className={cn("flex", mine ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[78%] rounded-3xl px-4 py-3 shadow-sm",
                              mine
                                ? "rounded-br-lg bg-primary text-primary-foreground"
                                : "rounded-bl-lg border border-border bg-card text-foreground"
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {message.content}
                            </p>
                            <p
                              className={cn(
                                "mt-2 text-xs",
                                mine
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatRelativeTime(message.sendTime)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={conversationEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-card p-4 sm:p-5">
                {notice && (
                  <div className="mb-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {notice}
                  </div>
                )}
                <div className="flex gap-3">
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    maxLength={500}
                    disabled={!selectedContactId}
                    placeholder={
                      selectedContact
                        ? `发给 ${getDisplayName(selectedContact)}，Enter 发送，Shift+Enter 换行`
                        : "先选择联系人"
                    }
                    className="min-h-14 flex-1 resize-none rounded-2xl border border-border bg-input px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    disabled={isSending || !selectedContactId || !content.trim()}
                    onClick={handleSend}
                    className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="发送私信"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>最多 500 字</span>
                  <span>{content.trim().length}/500</span>
                </div>
              </div>
            </section>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
