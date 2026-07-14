"use client";

import { CoachBubble, Pill, SoftCard } from "@tempo/ui/primitives";
import { useConvexAuth, useQuery, useConvex } from "convex/react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  companionNameFromTechnique,
  filterHistoryConversations,
  formatHistoryDate,
  getConversationPreview,
  type HistoryConversation,
  type HistoryMessage,
} from "./history-model";

type MessageGroups = Partial<Record<Id<"conversations">, Doc<"messages">[]>>;

export function HistoryScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const convex = useConvex();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const conversations = useQuery(
    api.conversations.list,
    isAuthenticated && hasConvexUser ? {} : "skip",
  );
  const [query, setQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [messageGroups, setMessageGroups] = useState<MessageGroups>({});
  const [isMessageIndexLoading, setIsMessageIndexLoading] = useState(false);
  const [isSelecting, startSelecting] = useTransition();

  const selectedConversation = useQuery(
    api.conversations.get,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip",
  );
  const selectedMessages = useQuery(
    api.messages.list,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip",
  );

  useEffect(() => {
    if (!conversations || conversations.length === 0) {
      setMessageGroups({});
      setIsMessageIndexLoading(false);
      return;
    }

    let isCancelled = false;
    setIsMessageIndexLoading(true);

    Promise.all(
      conversations.map(async (conversation) => {
        const messages = await convex.query(api.messages.list, {
          conversationId: conversation._id,
        });
        return [conversation._id, messages] as const;
      }),
    )
      .then((entries) => {
        if (isCancelled) {
          return;
        }

        setMessageGroups(Object.fromEntries(entries) as MessageGroups);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsMessageIndexLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [convex, conversations]);

  const historyConversations = useMemo(() => {
    if (!conversations) {
      return [];
    }

    return conversations.map((conversation): HistoryConversation => {
      const messages = messageGroups[conversation._id] ?? [];
      return {
        id: conversation._id,
        title: conversation.title,
        companionName: companionNameFromTechnique(conversation.technique),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: messages.map(toHistoryMessage),
      };
    });
  }, [conversations, messageGroups]);

  const filteredConversations = useMemo(
    () => filterHistoryConversations(historyConversations, query),
    [historyConversations, query],
  );

  const isLoading =
    isAuthLoading ||
    (isAuthenticated && (profile === undefined || (hasConvexUser && conversations === undefined)));

  if (isLoading) {
    return <HistoryLoadingState />;
  }

  if (!isAuthenticated || !profile || !conversations) {
    return <HistorySignInState />;
  }

  if (conversations.length === 0) {
    return <HistoryEmptyState />;
  }

  const locallySelectedConversation = selectedConversationId
    ? conversations.find((conversation) => conversation._id === selectedConversationId)
    : undefined;
  const activeConversation = selectedConversation ?? locallySelectedConversation ?? conversations[0];
  const activeMessages = selectedMessages ?? messageGroups[activeConversation._id] ?? [];
  const activeCompanion = companionNameFromTechnique(activeConversation.technique);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8">
      <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="slate">Conversation history</Pill>
            <Pill tone="orange">{conversations.length} saved threads</Pill>
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="font-heading text-4xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl">
              Pick up a conversation right where it softened.
            </h1>
            <p className="text-balance text-base leading-7 text-muted-foreground">
              Browse past companion chats, search by companion or message text, and reopen the full thread
              without changing anything in your account.
            </p>
          </div>
        </div>

        <label className="flex min-w-full flex-col gap-2 lg:min-w-[22rem]" htmlFor="history-search">
          <span className="font-medium text-sm text-foreground">Search conversations</span>
          <input
            id="history-search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Try a companion name or phrase from a chat"
            className="h-12 rounded-2xl border border-border bg-card px-4 text-base text-foreground shadow-whisper outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="search"
          />
          {isMessageIndexLoading ? (
            <span className="text-caption text-muted-foreground">Indexing message text for search...</span>
          ) : null}
        </label>
      </header>

      <section className="grid min-h-[34rem] gap-5 lg:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.5fr)]">
        <SoftCard as="section" padding="none" className="overflow-hidden">
          <div className="border-border border-b px-5 py-4">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Threads</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              {filteredConversations.length} of {conversations.length} shown
            </p>
          </div>

          {filteredConversations.length > 0 ? (
            <section className="max-h-[40rem] overflow-y-auto p-3" aria-label="Conversation results">
              {filteredConversations.map((conversation) => {
                const isSelected = activeConversation._id === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:border-border hover:bg-surface-sunken",
                    ].join(" ")}
                    onClick={() => {
                      startSelecting(() => {
                        setSelectedConversationId(conversation.id as Id<"conversations">);
                      });
                    }}
                    type="button"
                    aria-pressed={isSelected}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{conversation.title}</span>
                      <span className="shrink-0 text-caption text-muted-foreground">
                        {conversation.messages.length} msgs
                      </span>
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <Pill tone="neutral">{conversation.companionName}</Pill>
                      {conversation.matchingMessageCount > 0 ? (
                        <Pill tone="moss">{conversation.matchingMessageCount} message matches</Pill>
                      ) : null}
                    </span>
                    <span className="mt-3 line-clamp-2 block text-muted-foreground text-sm">
                      {getConversationPreview(conversation.messages)}
                    </span>
                    <span className="mt-3 block text-caption text-muted-foreground">
                      Updated {formatHistoryDate(conversation.updatedAt)}
                    </span>
                  </button>
                );
              })}
            </section>
          ) : (
            <div className="p-5">
              <SoftCard tone="sunken">
                <h3 className="font-heading text-xl font-semibold text-foreground">No matching threads yet</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  Try a companion name, a shorter phrase, or a word you remember using in the chat.
                </p>
              </SoftCard>
            </div>
          )}
        </SoftCard>

        <SoftCard as="section" padding="none" className="overflow-hidden">
          <div className="border-border border-b px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Pill tone="slate">{activeCompanion}</Pill>
                <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground">
                  {activeConversation.title}
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Updated {formatHistoryDate(activeConversation.updatedAt)}
                </p>
              </div>
              {isSelecting ? <Pill tone="amber">Opening thread...</Pill> : null}
            </div>
          </div>

          <div
            className="history-thread-scroll flex max-h-[40rem] flex-col gap-4 overflow-y-auto px-5 py-5"
            role="log"
            aria-label={`Full messages for ${activeConversation.title}`}
          >
            {activeMessages.length > 0 ? (
              activeMessages.map((message) => (
                <CoachBubble
                  key={message._id}
                  role={message.role === "assistant" ? "coach" : message.role}
                  timestamp={formatHistoryDate(message.createdAt)}
                  className="[contain-intrinsic-size:0_76px] [content-visibility:auto]"
                >
                  {message.content}
                </CoachBubble>
              ))
            ) : (
              <SoftCard tone="sunken">
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  This thread is ready when its messages arrive.
                </h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  We found the conversation record. If the transcript is still loading, it will appear here
                  automatically.
                </p>
              </SoftCard>
            )}
          </div>
        </SoftCard>
      </section>
    </main>
  );
}

function HistoryLoadingState() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
      <div className="space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-full bg-muted" />
        <div className="h-28 max-w-3xl animate-pulse rounded-[2rem] bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.5fr)]">
          <div className="h-[34rem] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[34rem] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    </main>
  );
}

function HistorySignInState() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-5 py-12">
      <SoftCard as="section" className="w-full text-center">
        <Pill tone="slate">Protected history</Pill>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-foreground">Sign in to reopen your chats</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Your conversation history is private to your account. Sign in again and we will bring you back here.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/sign-in?next=/history">Sign in</Link>
        </Button>
      </SoftCard>
    </main>
  );
}

function HistoryEmptyState() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-5 py-12">
      <SoftCard as="section" className="w-full overflow-hidden text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/12 text-3xl">
          *
        </div>
        <Pill tone="orange" className="mt-5">
          Fresh start
        </Pill>
        <h1 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-semibold tracking-[-0.03em] text-foreground">
          No past conversations yet.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
          When you chat with a companion, this page becomes a calm shelf for returning to what you already
          explored. Nothing to catch up on, nothing to tidy first.
        </p>
        <Button className="mt-7" asChild>
          <Link href="/coach">Start a companion chat</Link>
        </Button>
      </SoftCard>
    </main>
  );
}

function toHistoryMessage(message: Doc<"messages">): HistoryMessage {
  return {
    id: message._id,
    conversationId: message.conversationId,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
  };
}
