"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { CrisisResourcesCard } from "@/components/coach-crisis/CrisisResourcesCard";
import { useCrisisGuard } from "@/components/coach-crisis/useCrisisGuard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useUserReady } from "@/lib/useUserReady";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export type CoachDelivery = "resources" | "sent";

/** Crisis matches show the resources card and never call the coaching send. */
export async function deliverCoachMessage(
  text: string,
  guard: (text: string) => Promise<{ isCrisis: boolean }>,
  send: (text: string) => Promise<void>,
): Promise<CoachDelivery> {
  const result = await guard(text);
  if (result.isCrisis) return "resources";
  await send(text);
  return "sent";
}

export function CoachCrisisReply() {
  return (
    <div data-testid="coach-crisis-resources">
      <CrisisResourcesCard />
    </div>
  );
}

export function CoachChat() {
  const { isAuthenticated } = useConvexAuth();
  const userReady = useUserReady();
  const conversations = useQuery(api.conversations.list, userReady ? {} : "skip");
  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.coach.sendMessage);
  const { guard } = useCrisisGuard();

  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [crisisHold, setCrisisHold] = useState(false);
  const creatingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated || conversations === undefined || conversationId) return;
    const latest = conversations[0];
    if (latest) {
      setConversationId(latest._id);
      return;
    }
    if (creatingRef.current) return;
    creatingRef.current = true;
    void createConversation({}).then((id) => {
      setConversationId(id);
      creatingRef.current = false;
    });
  }, [isAuthenticated, conversations, conversationId, createConversation]);

  const messages = useQuery(api.messages.list, conversationId ? { conversationId } : "skip");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  });

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversationId || isSending) return;
    setInput("");
    setIsSending(true);
    try {
      const outcome = await deliverCoachMessage(text, guard, async (content) => {
        await sendMessage({ conversationId, content });
      });
      if (outcome === "resources") {
        setCrisisHold(true);
        setSendError(null);
        return;
      }
      setCrisisHold(false);
      setSendError(null);
    } catch {
      setInput(text);
      setSendError("That didn't send. Your message is still here, so try again.");
    } finally {
      setIsSending(false);
    }
  };

  const isLoading =
    isAuthenticated && (conversations === undefined || !conversationId || messages === undefined);

  return (
    <main className="container mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-6 py-12">
      <header>
        <p className="font-eyebrow text-muted-foreground">Flow</p>
        <h1 className="font-heading text-4xl font-semibold text-foreground">Coach</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Talk through what&rsquo;s in front of you. One small step at a time.
        </p>
      </header>

      <div className="mt-8 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-card">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your conversation.</p>
        ) : messages && messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Say what&rsquo;s on your mind — there&rsquo;s no wrong way to start.
          </p>
        ) : (
          messages?.map((message) => (
            <div
              key={message._id}
              data-role={message.role}
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {message.content}
            </div>
          ))
        )}
        {crisisHold ? <CoachCrisisReply /> : null}
        {isSending ? (
          <output
            aria-label="Coach is typing"
            className="w-fit rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground"
          >
            …
          </output>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <label className="flex-1">
          <span className="sr-only">Message</span>
          <input
            aria-label="Message"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (sendError) setSendError(null);
            }}
            placeholder="Help me pick one thing for this afternoon"
            disabled={!conversationId || isSending}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
        <Button type="submit" disabled={!conversationId || isSending || !input.trim()}>
          Send
        </Button>
      </form>
      {sendError ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {sendError}
        </p>
      ) : null}
    </main>
  );
}
