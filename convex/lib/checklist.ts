export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
};

const CHECKLIST_TEXT_MAX = 180;

function normalizeChecklistText(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) {
    throw new Error("Checklist text cannot be empty");
  }

  return normalized.length > CHECKLIST_TEXT_MAX
    ? `${normalized.slice(0, CHECKLIST_TEXT_MAX - 3)}...`
    : normalized;
}

export function normalizeChecklistItems(checklist: readonly ChecklistItem[]): ChecklistItem[] {
  const ids = new Set<string>();

  return checklist.map((item) => {
    const id = item.id.trim();
    if (!id) {
      throw new Error("Checklist item id cannot be empty");
    }
    if (ids.has(id)) {
      throw new Error("Checklist item ids must be unique");
    }
    ids.add(id);

    const normalized = {
      id,
      text: normalizeChecklistText(item.text),
      completed: item.completed,
      completedAt: item.completed ? item.completedAt : undefined,
    };

    return normalized.completedAt === undefined
      ? { id: normalized.id, text: normalized.text, completed: normalized.completed }
      : normalized;
  });
}

export function appendChecklistItem(
  checklist: readonly ChecklistItem[],
  text: string,
  id: string,
): ChecklistItem[] {
  const normalizedChecklist = normalizeChecklistItems(checklist);
  const normalizedId = id.trim();
  if (!normalizedId) {
    throw new Error("Checklist item id cannot be empty");
  }
  if (normalizedChecklist.some((item) => item.id === normalizedId)) {
    throw new Error("Checklist item ids must be unique");
  }

  return [
    ...normalizedChecklist,
    {
      id: normalizedId,
      text: normalizeChecklistText(text),
      completed: false,
    },
  ];
}

export function toggleChecklistItemState(
  checklist: readonly ChecklistItem[],
  itemId: string,
  completed: boolean,
  completedAt: number,
): ChecklistItem[] {
  const normalizedChecklist = normalizeChecklistItems(checklist);
  let foundItem = false;

  const updated = normalizedChecklist.map((item) => {
    if (item.id !== itemId) {
      return { ...item };
    }

    foundItem = true;
    if (completed) {
      return { ...item, completed: true, completedAt };
    }

    const { completedAt: _completedAt, ...rest } = item;
    return { ...rest, completed: false };
  });

  if (!foundItem) {
    throw new Error("Checklist item not found");
  }

  return updated;
}
