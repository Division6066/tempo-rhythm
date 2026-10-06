"use client";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

type Goal = Doc<"goals">;

function formatTargetDate(timestamp?: number): string {
  return timestamp ? new Date(timestamp).toISOString().slice(0, 10) : "";
}

function targetDateLabel(timestamp?: number): string {
  if (!timestamp) return "No target date";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(timestamp);
}

function Progress({ goal, compact = false }: { goal: Goal; compact?: boolean }) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-foreground">Progress</span>
        <span className="tabular-nums text-muted-foreground">{goal.progressPercent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={`${goal.title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={goal.progressPercent}
        className="h-2.5 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${goal.progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export function GoalsScreen({ goalId }: { goalId?: string }) {
  return goalId ? <GoalDetail goalId={goalId} /> : <GoalList />;
}

function GoalList() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const goals = useQuery(api.goals.list, isAuthenticated ? {} : "skip");
  const createGoal = useMutation(api.goals.create);
  const removeGoal = useMutation(api.goals.remove);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const id = await createGoal({ title: "Untitled goal" });
      router.push(`/goals/${id}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (goalIdToDelete: Id<"goals">) => {
    await removeGoal({ goalId: goalIdToDelete });
    setPendingDeleteId(null);
  };

  const visibleGoals = goals ?? [];

  return (
    <main className="container mx-auto max-w-5xl px-6 py-12">
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-7">
          <div className="space-y-2">
            <p className="font-eyebrow text-muted-foreground">Library</p>
            <h1 className="font-heading text-4xl font-semibold text-foreground">Goals</h1>
            <p className="max-w-2xl text-muted-foreground">
              Keep the finish line visible, then move toward it one milestone at a time.
            </p>
          </div>
          <Button type="button" disabled={isCreating} onClick={() => void handleCreate()}>
            {isCreating ? "Creating…" : "New goal"}
          </Button>
        </header>

        {goals === undefined && isAuthenticated ? (
          <p className="text-muted-foreground">Loading your goals.</p>
        ) : visibleGoals.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-border bg-card/70 px-6 py-14 text-center">
            <p className="font-heading text-2xl font-semibold text-foreground">Name what matters next.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Your goals will stay here with their target dates and progress.
            </p>
          </section>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {visibleGoals.map((goal) => (
              <li key={goal._id} className="group rounded-3xl border border-border bg-card p-5 shadow-card">
                <div className="flex min-h-44 flex-col justify-between gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/goals/${goal._id}`} className="min-w-0 flex-1">
                      <p className="font-heading text-xl font-semibold text-foreground group-hover:text-primary">
                        {goal.title || "Untitled goal"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{targetDateLabel(goal.targetDate)}</p>
                    </Link>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground">
                      {goal.status}
                    </span>
                  </div>
                  <Progress goal={goal} compact />
                  <div className="flex items-center justify-between gap-3">
                    <Button asChild variant="outline">
                      <Link href={`/goals/${goal._id}`}>Open goal</Link>
                    </Button>
                    {pendingDeleteId === goal._id ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          aria-label={`Confirm delete ${goal.title || "Untitled goal"}`}
                          onClick={() => void handleDelete(goal._id)}
                        >
                          Confirm delete
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setPendingDeleteId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label={`Delete ${goal.title || "Untitled goal"}`}
                        onClick={() => setPendingDeleteId(goal._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function GoalDetail({ goalId }: { goalId: string }) {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const goal = useQuery(
    api.goals.get,
    isAuthenticated ? { goalId: goalId as Id<"goals"> } : "skip",
  );
  const updateGoal = useMutation(api.goals.update);
  const removeGoal = useMutation(api.goals.remove);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!goal) return;
    setTitle(goal.title);
    setDescription(goal.description ?? "");
    setTargetDate(formatTargetDate(goal.targetDate));
  }, [goal]);

  const handleSave = async () => {
    if (!goal) return;
    setSaveState("saving");
    await updateGoal({
      goalId: goal._id,
      title,
      description: description || null,
      targetDate: targetDate ? Date.parse(`${targetDate}T00:00:00.000Z`) : null,
    });
    setSaveState("saved");
  };

  const handleMilestone = async () => {
    if (!goal) return;
    await updateGoal({
      goalId: goal._id,
      progressPercent: Math.min(100, goal.progressPercent + 10),
      ...(goal.progressPercent >= 90 ? { status: "completed" as const } : {}),
    });
  };

  const handleDelete = async () => {
    if (!goal) return;
    await removeGoal({ goalId: goal._id });
    router.push("/goals");
  };

  if (goal === undefined && isAuthenticated) {
    return <main className="container mx-auto max-w-4xl px-6 py-12 text-muted-foreground">Loading goal.</main>;
  }

  if (goal === null) {
    return (
      <main className="container mx-auto max-w-4xl px-6 py-12">
        <Link href="/goals" className="text-sm font-medium text-primary">← Back to goals</Link>
        <p className="mt-5 font-heading text-2xl font-semibold text-foreground">This goal could not be found.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-6 py-12">
      <div className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/goals" className="text-sm font-medium text-primary">← Back to goals</Link>
          <div className="flex flex-wrap items-center gap-2">
            {confirmingDelete ? (
              <>
                <Button type="button" variant="destructive" onClick={() => void handleDelete()}>Confirm delete</Button>
                <Button type="button" variant="outline" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
              </>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setConfirmingDelete(true)}>Delete</Button>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Goal title</span>
              <input
                aria-label="Goal title"
                value={title}
                onChange={(event) => { setTitle(event.target.value); setSaveState("idle"); }}
                className="w-full border-0 border-b border-border bg-transparent pb-3 font-heading text-3xl font-semibold text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Description</span>
              <textarea
                aria-label="Goal description"
                value={description}
                rows={7}
                placeholder="Why does this goal matter?"
                onChange={(event) => { setDescription(event.target.value); setSaveState("idle"); }}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
            <label className="block max-w-xs space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Target date</span>
              <input
                aria-label="Target date"
                type="date"
                value={targetDate}
                onChange={(event) => { setTargetDate(event.target.value); setSaveState("idle"); }}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
            <div className="flex items-center gap-3">
              <Button type="button" disabled={!title.trim() || saveState === "saving"} onClick={() => void handleSave()}>
                {saveState === "saving" ? "Saving…" : "Save changes"}
              </Button>
              <output className="text-sm text-muted-foreground">
                {saveState === "saved" ? "Saved" : ""}
              </output>
            </div>
          </div>

          <aside className="h-fit space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card">
            <div>
              <p className="font-eyebrow text-muted-foreground">Next step</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Mark a milestone whenever you make meaningful progress.
              </p>
            </div>
            {goal ? <Progress goal={goal} /> : null}
            <Button type="button" className="w-full" disabled={!goal || goal.progressPercent >= 100} onClick={() => void handleMilestone()}>
              {goal?.progressPercent === 100 ? "Goal complete" : "Mark milestone"}
            </Button>
          </aside>
        </section>
      </div>
    </main>
  );
}
