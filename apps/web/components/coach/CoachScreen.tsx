"use client";

import { useAction, useConvexAuth } from "convex/react";
import { Loader2, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const INTRO: ChatMessage = {
  id: "intro",
  role: "assistant",
  content: "Hey — what's on your mind today?",
};

// Keep the send payload short so we don't blow through tokens on long sessions.
const HISTORY_WINDOW = 10;

export function CoachScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const respond = useAction(api.coachActions.respond);

  const [messages, setMessages] = useState<ChatMessage[]>([INTRO]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLLIElement>(null);

  // Scroll to the newest message whenever messages change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll side effect intentionally keys on message count + typing indicator
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isSending]);

  const visibleMessages = useMemo(
    () => messages.filter((m) => m.role !== "system"),
    [messages],
  );

  if (isAuthLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-12 space-y-6">
        <div className="h-12 w-60 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Sign in required</h1>
          <p className="mt-3 text-muted-foreground">Sign in to chat with the coach.</p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    // Snapshot history BEFORE adding the user message so the action gets the
    // state the assistant already saw.
    const historyForAction = messages
      .slice(-HISTORY_WINDOW)
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const { reply } = await respond({ message: text, history: historyForAction });
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply.trim() || "I heard you. What's one small next step?",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown";
      setError(
        message.includes("OPENROUTER_API_KEY") || message.includes("401")
          ? "The coach is offline right now. The OpenRouter key isn't wired yet — try again once it's set."
          : "Something knocked the coach offline for a moment. Try again in a minute.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col">
      <div className="container mx-auto w-full max-w-3xl px-6 pt-10 pb-4">
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Flow</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Coach
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A calm place to think out loud. One small next step at a time.
          </p>
        </header>
      </div>

      <div className="container mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 pb-4">
        <ul className="flex-1 space-y-3" aria-live="polite">
          {visibleMessages.map((msg) => (
            <li
              key={msg.id}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/80 bg-card text-foreground",
                )}
              >
                {msg.content}
              </div>
            </li>
          ))}

          {isSending && (
            <li className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card px-4 py-3 text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
                <output className="flex items-center gap-1" aria-label="Coach is typing">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "240ms" }}
                  />
                </output>
              </div>
            </li>
          )}

          <li ref={endRef} />
        </ul>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto w-full max-w-3xl px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              disabled={isSending}
              placeholder="Share what's on your mind…"
              rows={2}
              className="min-h-12 flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
            />
            <Button
              type="button"
              onClick={() => void send()}
              disabled={isSending || !input.trim()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Thinking…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  Send
                </>
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Shift+Enter for a new line · Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
