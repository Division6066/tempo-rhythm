"use client";

import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type RoutineFormState = {
  name: string;
  habitName: string;
  taskTitle: string;
};

const initialFormState: RoutineFormState = {
  name: "",
  habitName: "",
  taskTitle: "",
};

export function RoutinesPageClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const routines = useQuery(api.routines.list, isAuthenticated ? {} : "skip");
  const createRoutine = useMutation(api.routines.createWithItems);
  const [form, setForm] = useState<RoutineFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = isAuthLoading || (isAuthenticated && routines === undefined);
  const canSubmit =
    form.name.trim().length > 0 &&
    form.habitName.trim().length > 0 &&
    form.taskTitle.trim().length > 0 &&
    !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const routineId: Id<"routines"> = await createRoutine({
        name: form.name,
        habitName: form.habitName,
        taskTitle: form.taskTitle,
      });
      setForm(initialFormState);
      router.push(`/routines/${routineId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't create that routine yet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }

  if (!isAuthenticated || !routines) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
        <SoftCard padding="lg" className="text-center">
          <h1 className="text-h2 font-serif">Sign in to build routines</h1>
          <p className="mt-3 text-body text-muted-foreground">
            Your routine library lives with your tasks and habits, so sign in to keep it together.
          </p>
          <Link
            href="/sign-in?next=/routines"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground"
          >
            Sign in
          </Link>
        </SoftCard>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="orange">Library</Pill>
          <Pill tone="moss">Habits + tasks</Pill>
        </div>
        <div className="space-y-2">
          <h1 className="text-h1 font-serif">Routines</h1>
          <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
            Bundle a small repeating habit with a concrete task, then run both from one calm view.
          </p>
        </div>
      </header>

      <SoftCard as="section" padding="lg" aria-labelledby="create-routine-heading">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-3">
            <h2 id="create-routine-heading" className="text-h2 font-serif">
              Create a starter routine
            </h2>
            <p className="text-small leading-relaxed text-muted-foreground">
              Add one habit and one task. You can complete both from the routine view after it is
              created.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="routine-name" className="text-small font-medium">
                Routine name
              </label>
              <input
                id="routine-name"
                name="routineName"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-body text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Morning reset"
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="routine-habit" className="text-small font-medium">
                  Habit
                </label>
                <input
                  id="routine-habit"
                  name="habitName"
                  value={form.habitName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, habitName: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-body text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Drink water"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="routine-task" className="text-small font-medium">
                  Task
                </label>
                <input
                  id="routine-task"
                  name="taskTitle"
                  value={form.taskTitle}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, taskTitle: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-body text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Pack tomorrow's bag"
                  autoComplete="off"
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-small text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creating routine..." : "Create routine"}
            </Button>
          </form>
        </div>
      </SoftCard>

      <section className="space-y-4" aria-labelledby="routine-library-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="routine-library-heading" className="text-h2 font-serif">
              Routine library
            </h2>
            <p className="text-small text-muted-foreground">
              {routines.length === 0
                ? "No routines yet. One gentle starter is enough."
                : `${routines.length} ${routines.length === 1 ? "routine" : "routines"} ready.`}
            </p>
          </div>
        </div>

        {routines.length === 0 ? (
          <SoftCard tone="sunken" padding="lg" className="text-center">
            <p className="text-body text-foreground">Your first routine can be tiny.</p>
            <p className="mt-2 text-small text-muted-foreground">
              Try pairing one body cue with one task you want to make easier to start.
            </p>
          </SoftCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {routines.map((routine) => (
              <SoftCard key={routine._id} as="article" padding="md" className="flex flex-col gap-4">
                <div className="space-y-2">
                  <h3 className="text-h3 font-serif">{routine.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="moss">{routine.habitCount} habit</Pill>
                    <Pill tone="slate">{routine.taskCount} task</Pill>
                  </div>
                </div>
                <Link
                  href={`/routines/${routine._id}`}
                  className="mt-auto inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-small font-medium transition hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Open routine
                </Link>
              </SoftCard>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
