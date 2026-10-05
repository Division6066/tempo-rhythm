"use client";

import { useAction, useConvex, useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useCallback, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  acceptedItems,
  canSubmit,
  groupByUrgency,
  MAX_ACCEPTED,
  toggleItem,
  URGENCY_LABEL,
  type Plan,
  type Urgency,
} from "./brainDumpState";

type ResourcesCard = {
  title: string;
  body: string;
  resources: { label: string; detail: string }[];
};

const urgencyTone: Record<Urgency, string> = {
  now: "border-[#D97757]/30 bg-[#D97757]/10 text-[#9A4C2F]",
  soon: "border-primary/20 bg-primary/10 text-primary",
  later: "border-border bg-muted/60 text-muted-foreground",
};

const FALLBACK_ERROR = "That did not work. Your text is still here, so try again in a moment.";

export function BrainDumpScreen() {
  const textareaId = `${useId()}-brain-dump`;
  const convex = useConvex();
  const prioritize = useAction(api.brain_dump.prioritize);
  const acceptPlan = useMutation(api.brain_dump.acceptPlan);

  const [draft, setDraft] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [accepted, setAccepted] = useState<number[]>([]);
  const [rejected, setRejected] = useState<number[]>([]);
  const [crisisCard, setCrisisCard] = useState<ResourcesCard | null>(null);
  const [error, setError] = useState("");
  const [doneMessage, setDoneMessage] = useState("");
  const [isSorting, setIsSorting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const groups = useMemo(() => (plan ? groupByUrgency(plan) : []), [plan]);
  const toAdd = useMemo(() => (plan ? acceptedItems(plan, accepted) : []), [plan, accepted]);
  const visibleCount = plan ? plan.priorities.length - rejected.length : 0;

  const handleSort = useCallback(async () => {
    if (!canSubmit(draft)) {
      setError("Type or paste whatever is on your mind first. A rough list is enough.");
      return;
    }
    setError("");
    setDoneMessage("");
    setPlan(null);
    setAccepted([]);
    setRejected([]);
    setCrisisCard(null);
    setIsSorting(true);
    try {
      const { isCrisis } = await convex.query(api.crisis.check, { text: draft });
      if (isCrisis) {
        setCrisisCard(await convex.query(api.crisis.resourcesCard, {}));
        return;
      }
      setPlan(await prioritize({ rawText: draft }));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : FALLBACK_ERROR);
    } finally {
      setIsSorting(false);
    }
  }, [convex, draft, prioritize]);

  const handleAccept = useCallback((index: number) => {
    setRejected((prev) => prev.filter((i) => i !== index));
    setAccepted((prev) => (prev.includes(index) ? prev : toggleItem(prev, index)));
  }, []);

  const handleReject = useCallback((index: number) => {
    setAccepted((prev) => prev.filter((i) => i !== index));
    setRejected((prev) => (prev.includes(index) ? prev : [...prev, index]));
  }, []);

  const handleAddAccepted = useCallback(async () => {
    if (toAdd.length === 0) return;
    setError("");
    setIsAdding(true);
    try {
      const result = await acceptPlan({ items: toAdd });
      setDoneMessage(`${result.created} added to your tasks`);
      setDraft("");
      setPlan(null);
      setAccepted([]);
      setRejected([]);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : FALLBACK_ERROR);
    } finally {
      setIsAdding(false);
    }
  }, [acceptPlan, toAdd]);

  if (crisisCard) {
    return (
      <Card role="region" aria-label={crisisCard.title}>
        <CardHeader>
          <CardTitle>{crisisCard.title}</CardTitle>
          <CardDescription>{crisisCard.body}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {crisisCard.resources.map((resource) => (
              <li key={resource.label} className="text-sm">
                <span className="font-medium">{resource.label}</span>
                <span className="text-muted-foreground"> — {resource.detail}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            onClick={() => {
              setCrisisCard(null);
            }}
          >
            Back to my dump
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brain dump</CardTitle>
          <CardDescription>
            Put it all here, in any order. Nothing is saved until you choose it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label htmlFor={textareaId} className="sr-only">
            Your brain dump
          </label>
          <textarea
            id={textareaId}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            rows={8}
            disabled={isSorting || isAdding}
            placeholder="Everything on your mind, messy is fine."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {doneMessage ? (
            <output className="block text-sm text-muted-foreground">{doneMessage}</output>
          ) : null}
          <Button onClick={() => void handleSort()} disabled={isSorting || isAdding || !canSubmit(draft)}>
            {isSorting ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {isSorting ? "Sorting" : "Sort it"}
          </Button>
        </CardContent>
      </Card>

      {plan ? (
        <Card>
          <CardHeader>
            <CardTitle>Your order</CardTitle>
            <CardDescription>{plan.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {plan.priorities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing to sort yet. Try adding a few more words.
              </p>
            ) : visibleCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                You set everything aside. Your dump is still above if you want to sort it again.
              </p>
            ) : null}
            {groups.map((group) => {
              const rows = group.items.filter((entry) => !rejected.includes(entry.index));
              if (rows.length === 0) return null;
              return (
                <section key={group.urgency} aria-label={URGENCY_LABEL[group.urgency]}>
                  <h3
                    className={cn(
                      "mb-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium",
                      urgencyTone[group.urgency],
                    )}
                  >
                    {URGENCY_LABEL[group.urgency]}
                  </h3>
                  <ul className="space-y-2">
                    {rows.map(({ index, item }) => {
                      const isAccepted = accepted.includes(index);
                      return (
                        <li
                          key={index}
                          className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={isAccepted ? "default" : "outline"}
                              aria-pressed={isAccepted}
                              disabled={isAdding || (!isAccepted && accepted.length >= MAX_ACCEPTED)}
                              onClick={() => {
                                handleAccept(index);
                              }}
                            >
                              {isAccepted ? "Accepted" : "Accept"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isAdding}
                              onClick={() => {
                                handleReject(index);
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => void handleAddAccepted()}
                disabled={toAdd.length === 0 || isAdding}
              >
                {isAdding ? <Loader2 className="animate-spin" aria-hidden /> : null}
                Add accepted{toAdd.length > 0 ? ` (${toAdd.length})` : ""}
              </Button>
              <p className="text-xs text-muted-foreground">Up to {MAX_ACCEPTED} at a time.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
