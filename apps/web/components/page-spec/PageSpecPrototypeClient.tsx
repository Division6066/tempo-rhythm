"use client";

import { useMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  PageSpecRenderer,
  createSafeActionDispatcher,
  demoPageSpec,
  type PageSpec,
  type SafeAction,
} from "./PageSpecRenderer";

const storageKey = "tempo:page-spec-renderer-prototype:v1";

type PrototypeState = {
  completedTaskIds: string[];
  actionCount: number;
  lastAction?: string;
};

const initialPrototypeState: PrototypeState = {
  completedTaskIds: [],
  actionCount: 0,
};

const invalidSpec = {
  version: 1,
  title: "Unsafe prototype spec",
  blocks: [
    {
      id: "bad-frame",
      type: "iframe",
      src: "https://example.com/unsafe",
    },
  ],
};

export function PageSpecPrototypeClient() {
  const [prototypeState, setPrototypeState] = useState<PrototypeState>(initialPrototypeState);
  const [specMode, setSpecMode] = useState<"valid" | "invalid">("valid");
  const toggleTask = useMutation(api.tasks.toggleCompletion);
  const createTask = useMutation(api.tasks.createQuick);
  const completeHabit = useMutation(api.habits.completeToday);

  useEffect(() => {
    setPrototypeState(readPrototypeState);
  }, []);

  useEffect(() => {
    writePrototypeState(prototypeState);
  }, [prototypeState]);

  const dispatch = useMemo(
    () =>
      createSafeActionDispatcher({
        "tasks.toggleCompletion": async (args) => {
          const taskId = readStringArg(args, "taskId");
          if (taskId.startsWith("demo-")) {
            setPrototypeState((current) => ({
              completedTaskIds: toggleId(current.completedTaskIds, taskId),
              actionCount: current.actionCount + 1,
              lastAction: "tasks.toggleCompletion",
            }));
            return { ok: true };
          }
          return await toggleTask({ taskId: taskId as Id<"tasks"> });
        },
        "tasks.createQuick": async (args) => {
          const title = readStringArg(args, "title");
          return await createTask({ title });
        },
        "habits.completeToday": async (args) => {
          const habitId = readStringArg(args, "habitId");
          if (habitId.startsWith("demo-")) {
            setPrototypeState((current) => ({
              ...current,
              actionCount: current.actionCount + 1,
              lastAction: "habits.completeToday",
            }));
            return { ok: true };
          }
          return await completeHabit({ habitId: habitId as Id<"habits"> });
        },
      }),
    [completeHabit, createTask, toggleTask],
  );

  const spec = useMemo(() => buildSpec(prototypeState.completedTaskIds), [prototypeState.completedTaskIds]);

  const handleAction = useCallback(
    async (action: SafeAction) => {
      await dispatch(action);
    },
    [dispatch],
  );

  const visibleSpec = specMode === "valid" ? spec : invalidSpec;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/80 px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              TEMPO-123
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              JSON plus Markdown renderer prototype with safe action mapping.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-10 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setSpecMode("invalid")}
            >
              Load invalid spec
            </button>
            <button
              type="button"
              className="min-h-10 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setSpecMode("valid")}
            >
              Reset to valid spec
            </button>
          </div>
        </div>
      </div>

      {prototypeState.lastAction ? (
        <div className="mx-auto mt-4 max-w-5xl px-6">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
            Safe action recorded: {prototypeState.lastAction}
          </div>
        </div>
      ) : null}

      {prototypeState.actionCount > 0 ? (
        <div className="mx-auto mt-3 max-w-5xl px-6">
          <p className="text-sm text-muted-foreground">
            Reload proof: {prototypeState.actionCount} local{" "}
            {prototypeState.actionCount === 1 ? "action" : "actions"} restored.
          </p>
        </div>
      ) : null}

      <PageSpecRenderer spec={visibleSpec} onAction={handleAction} />
    </div>
  );
}

function buildSpec(completedTaskIds: string[]): PageSpec {
  return {
    ...demoPageSpec,
    blocks: demoPageSpec.blocks.map((block) => {
      if (block.type !== "task.view") {
        return block;
      }
      return {
        ...block,
        items: block.items.map((task) => ({
          ...task,
          status: completedTaskIds.includes(task.id) ? "done" : task.status === "done" ? "todo" : task.status,
        })),
      };
    }),
  };
}

function readPrototypeState(): PrototypeState {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return initialPrototypeState;
    }
    const parsed: unknown = JSON.parse(stored);
    if (!isPrototypeState(parsed)) {
      return initialPrototypeState;
    }
    return parsed;
  } catch {
    return initialPrototypeState;
  }
}

function writePrototypeState(state: PrototypeState): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Best-effort demo persistence. The renderer itself still works without storage.
  }
}

function isPrototypeState(value: unknown): value is PrototypeState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.completedTaskIds) &&
    candidate.completedTaskIds.every((item) => typeof item === "string") &&
    typeof candidate.actionCount === "number" &&
    (candidate.lastAction === undefined || typeof candidate.lastAction === "string")
  );
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function readStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing string action arg: ${key}`);
  }
  return value;
}
