"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
};

type TaskChecklistProps = {
  taskId: Id<"tasks">;
  taskTitle: string;
  checklist: ChecklistItem[];
};

export function TaskChecklist({ taskId, taskTitle, checklist }: TaskChecklistProps) {
  const addChecklistItem = useMutation(api.tasks.addChecklistItem);
  const toggleChecklistItem = useMutation(api.tasks.toggleChecklistItem);
  const [newItemText, setNewItemText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  async function handleToggle(item: ChecklistItem, completed: boolean) {
    setError(null);
    setPendingItemId(item.id);
    try {
      await toggleChecklistItem({ taskId, itemId: item.id, completed });
    } catch {
      setError("That step did not save. Please try again when you are ready.");
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const text = newItemText.trim();
    if (!text) {
      setError("Write a small step first.");
      return;
    }

    setIsAdding(true);
    try {
      await addChecklistItem({ taskId, text });
      setNewItemText("");
    } catch {
      setError("That step did not save. Please try again when you are ready.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      {checklist.length > 0 ? (
        <ul className="space-y-2" aria-label={`Checklist for ${taskTitle}`}>
          {checklist.map((item) => (
            <li key={item.id}>
              <label className="flex min-h-9 items-center gap-2 rounded-xl px-1 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={item.completed}
                  disabled={pendingItemId === item.id}
                  onChange={(event) => {
                    void handleToggle(item, event.currentTarget.checked);
                  }}
                  className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
                <span
                  className={cn(
                    "text-foreground",
                    item.completed && "text-muted-foreground line-through",
                  )}
                >
                  {item.text}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}

      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleAdd}>
        <label className="sr-only" htmlFor={`checklist-input-${taskId}`}>
          Add a checklist step for {taskTitle}
        </label>
        <input
          id={`checklist-input-${taskId}`}
          value={newItemText}
          onChange={(event) => {
            setNewItemText(event.currentTarget.value);
          }}
          placeholder="Add a smaller step"
          className="min-h-10 flex-1 rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button type="submit" size="sm" disabled={isAdding}>
          <Plus className="h-4 w-4" aria-hidden />
          Add step
        </Button>
      </form>

      {error ? (
        <output className="text-sm text-destructive" aria-live="polite">
          {error}
        </output>
      ) : null}
    </div>
  );
}
