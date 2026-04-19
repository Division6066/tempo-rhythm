import type { ReactNode } from "react";
import { Check } from "../icons";

/**
 * TaskRow — checkbox + title + meta. Uses optimistic check UX.
 * @source docs/design/claude-export/design-system/components.jsx (TaskRow pattern)
 *
 * @action completeTask
 * @mutation tasks.complete({ taskId })
 * @optimistic mark row as done, fade 240ms
 * @auth required
 * @errors toast "couldn't save, retrying"
 */

export type TaskRowProps = {
  id: string;
  title: string;
  done?: boolean;
  meta?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onToggle?: (id: string, next: boolean) => void;
  onOpen?: (id: string) => void;
  className?: string;
};

export function TaskRow({
  id,
  title,
  done = false,
  meta,
  leading,
  trailing,
  onToggle,
  onOpen,
  className = "",
}: TaskRowProps) {
  return (
    <div
      className={[
        "group flex items-center gap-3 rounded-lg px-3 py-2.5",
        "hover:bg-surface-sunken transition-colors",
        className,
      ].join(" ")}
    >
      {/* @action toggleDone @mutation tasks.complete({ taskId }) @optimistic */}
      <button
        type="button"
        aria-label={done ? "Mark task as not done" : "Mark task as done"}
        onClick={() => onToggle?.(id, !done)}
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          done
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border hover:border-primary",
        ].join(" ")}
      >
        {done ? <Check size={14} strokeWidth={2.5} /> : null}
      </button>

      {leading}

      {/* @action openTask @navigate /tasks/{id} */}
      <button
        type="button"
        className="flex flex-1 flex-col items-start text-left"
        onClick={() => onOpen?.(id)}
      >
        <span
          className={[
            "text-body",
            done ? "text-muted-foreground line-through" : "text-foreground",
          ].join(" ")}
        >
          {title}
        </span>
        {meta ? (
          <span className="text-caption text-muted-foreground">{meta}</span>
        ) : null}
      </button>

      {trailing}
    </div>
  );
}
