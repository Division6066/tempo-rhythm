"use client";

import { CoachBubble, Pill } from "@tempo/ui/primitives";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  companionNameFromTechnique,
  filterHistoryConversations,
  formatHistoryDate,
  getConversationPreview,
  isLiveConversation,
  type HistoryConversation,
  type HistoryMessage,
} from "@/lib/conversationHistory";

export function HistoryScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const conversations = useQuery(
    api.conversations.list,
    isAuthenticated && hasConvexUser ? {} : "skip",
  );
  const [query, setQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    Id<"conversations"> | null
  >(null);

  const liveConversations = useMemo(
    () => (conversations ?? []).filter(isLiveConversation),
    [conversations],
  );

  useEffect(() => {
    if (selectedConversationId !== null) {
      return;
    }
    const first = liveConversations[0];
    if (first) {
      setSelectedConversationId(first._id);
    }
  }, [liveConversations, selectedConversationId]);

  const selectedConversation = useQuery(
    api.conversations.get,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip",
  );
  const selectedMessages = useQuery(
    api.messages.list,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip",
  );

  const historyConversations = useMemo((): HistoryConversation[] => {
    return liveConversations.map((conversation) => {
      const isSelected = conversation._id === selectedConversationId;
      const messages: HistoryMessage[] = isSelected
        ? (selectedMessages ?? []).map((message) => ({
            id: message._id,
            conversationId: message.conversationId,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
          }))
        : [];

      return {
        id: conversation._id,
        title: conversation.title,
        companionName: companionNameFromTechnique(conversation.technique),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages,
      };
    });
  }, [liveConversations, selectedConversationId, selectedMessages]);

  const filteredConversations = useMemo(
    () => filterHistoryConversations(historyConversations, query),
    [historyConversations, query],
  );

  const isLoading =
    isAuthLoading ||
    (isAuthenticated &&
      (profile === undefined || (hasConvexUser && conversations === undefined)));

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-6">
          <div className="h-12 w-64 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-6 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.4fr)]">
            <div className="h-[28rem] animate-pulse rounded-2xl bg-muted" />
            <div className="h-[28rem] animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile || !conversations) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Conversation history
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to reopen chats you already had. Nothing here is shared.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in?next=/history">Sign in</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  if (liveConversations.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            No past conversations yet
          </h1>
          <p className="mt-3 text-muted-foreground">
            When you chat with a companion, this page becomes a calm shelf for
            returning to what you already explored.
          </p>
          <Button asChild className="mt-6">
            <Link href="/coach">Start a companion chat</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  const locallySelected = selectedConversationId
    ? liveConversations.find((conversation) => conversation._id === selectedConversationId)
    : undefined;
  const activeConversation =
    (selectedConversation && isLiveConversation(selectedConversation)
      ? selectedConversation
      : undefined) ??
    locallySelected ??
    liveConversations[0];
  const activeId = activeConversation._id;
  const activeMessages =
    selectedConversationId === activeId ? (selectedMessages ?? []) : [];
  const activeCompanion = companionNameFromTechnique(activeConversation.technique);
  const activeHistory = filteredConversations.find((row) => row.id === activeId);

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      <div className="space-y-8">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="slate">Conversation history</Pill>
              <Pill tone="orange">{liveConversations.length} saved threads</Pill>
            </div>
            <h1 className="mt-4 font-heading text-3xl font-semibold text-foreground">
              Pick up a conversation where you left it
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Browse past companion chats and reopen a thread. Nothing here
              changes your account.
            </p>
          </div>
          <label className="flex min-w-full flex-col gap-2 lg:min-w-[20rem]" htmlFor="history-search">
            <span className="text-sm font-medium text-foreground">Search conversations</span>
            <input
              id="history-search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Try a companion name or a thread title"
              className="h-12 rounded-2xl border border-border bg-card px-4 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              type="search"
            />
          </label>
        </header>

        <section className="grid min-h-[28rem] gap-6 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.4fr)]">
          <SoftCard className="p-0">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-heading text-xl font-semibold text-foreground">Threads</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredConversations.length} of {liveConversations.length} shown
              </p>
            </div>
            {filteredConversations.length > 0 ? (
              <section className="max-h-[36rem] space-y-2 overflow-y-auto p-3" aria-label="Conversation results">
                {filteredConversations.map((conversation) => {
                  const isSelected = activeId === conversation.id;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      aria-pressed={isSelected}
                      className={[
                        "w-full rounded-2xl border px-4 py-3 text-left transition",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:border-border hover:bg-muted/40",
                      ].join(" ")}
                      onClick={() => {
                        setSelectedConversationId(conversation.id as Id<"conversations">);
                      }}
                    >
                      <span className="block font-medium text-foreground">{conversation.title}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <Pill tone="neutral">{conversation.companionName}</Pill>
                        {conversation.matchingMessageCount > 0 ? (
                          <Pill tone="moss">{conversation.matchingMessageCount} message matches</Pill>
                        ) : null}
                      </span>
                      <span className="mt-3 line-clamp-2 block text-sm text-muted-foreground">
                        {getConversationPreview(conversation.messages)}
                      </span>
                      <span className="mt-3 block text-xs text-muted-foreground">
                        Updated {formatHistoryDate(conversation.updatedAt)}
                      </span>
                    </button>
                  );
                })}
              </section>
            ) : (
              <div className="p-6">
                <p className="font-heading text-lg font-semibold text-foreground">
                  No matching threads yet
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a companion name or a shorter phrase from the title.
                </p>
              </div>
            )}
          </SoftCard>

          <SoftCard className="p-0">
            <div className="border-b border-border px-6 py-4">
              <Pill tone="slate">{activeCompanion}</Pill>
              <h2 className="mt-3 font-heading text-xl font-semibold text-foreground">
                {activeConversation.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Updated {formatHistoryDate(activeConversation.updatedAt)}
                {activeHistory ? ` · ${activeHistory.messages.length} messages loaded` : null}
              </p>
            </div>
            <div
              className="flex max-h-[36rem] flex-col gap-4 overflow-y-auto px-6 py-5"
              role="log"
              aria-label={`Messages for ${activeConversation.title}`}
            >
              {selectedConversationId !== activeId ? (
                <p className="text-sm text-muted-foreground">
                  Choose a thread to open the full conversation.
                </p>
              ) : selectedMessages === undefined ? (
                <div className="h-32 animate-pulse rounded-2xl bg-muted" />
              ) : activeMessages.length > 0 ? (
                activeMessages.map((message) => (
                  <CoachBubble
                    key={message._id}
                    role={message.role === "assistant" ? "coach" : message.role}
                    timestamp={formatHistoryDate(message.createdAt)}
                  >
                    {message.content}
                  </CoachBubble>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  This thread is ready. Messages will show here when they arrive.
                </p>
              )}
            </div>
          </SoftCard>
        </section>
      </div>
    </div>
  );
}
