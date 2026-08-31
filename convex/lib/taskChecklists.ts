/** Checklist leftover from #206 — stored on landed `tasks`, not a new table. */

export const MAX_CHECKLIST_ITEMS = 20;

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type ChecklistProgress = {
  completed: number;
  total: number;
  percent: number;
};

function slugForChecklistId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export function checklistItemId(text: string, index: number): string {
  const slug = slugForChecklistId(text);
  return `check-${index}-${slug || "item"}`;
}

/** One checklist line per newline. Empty lines drop. Caps at `MAX_CHECKLIST_ITEMS`. */
export function parseChecklistText(text: string): ChecklistItem[] | undefined {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_CHECKLIST_ITEMS);

  if (lines.length === 0) {
    return undefined;
  }

  return lines.map((line, index) => ({
    id: checklistItemId(line, index),
    text: line,
    completed: false,
  }));
}

/** Drop empty text, clamp length, keep only `{id,text,completed}`. */
export function normalizeChecklist(
  items: readonly ChecklistItem[] | undefined,
): ChecklistItem[] | undefined {
  if (items === undefined) {
    return undefined;
  }

  const next: ChecklistItem[] = [];
  for (const item of items) {
    const text = item.text.trim();
    if (!text) {
      continue;
    }
    const id = item.id.trim() || checklistItemId(text, next.length);
    next.push({
      id,
      text,
      completed: item.completed === true,
    });
    if (next.length >= MAX_CHECKLIST_ITEMS) {
      break;
    }
  }

  return next.length === 0 ? undefined : next;
}

export function taskHasChecklist(
  task: { checklist?: readonly ChecklistItem[] | undefined },
): boolean {
  return (task.checklist?.length ?? 0) > 0;
}

export function getChecklistProgress(
  items: readonly ChecklistItem[] | undefined,
): ChecklistProgress {
  const total = items?.length ?? 0;
  if (total === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const completed = items?.filter((item) => item.completed).length ?? 0;
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

export function toggleChecklistItem(
  items: readonly ChecklistItem[],
  itemId: string,
): ChecklistItem[] {
  return items.map((item) =>
    item.id === itemId ? { ...item, completed: !item.completed } : item,
  );
}
