import type { ReactNode } from "react";

/**
 * CoachBubble — conversational bubble for Tempo's AI coach.
 * @source docs/design/claude-export/design-system/components.jsx (CoachBubble pattern)
 *
 * @action reactToSuggestion  (from `actions` prop)
 * @mutation coach.accept|coach.tweak|coach.skip ({ suggestionId })
 */

export type CoachBubbleRole = "coach" | "user" | "system";

export type CoachBubbleProps = {
  /**
   * Logical speaker: coach, user, or system. Named `speaker` (not `role`) so
   * downstream linters don't flag it as an ARIA role attribute.
   */
  speaker?: CoachBubbleRole;
  children: ReactNode;
  actions?: ReactNode;
  timestamp?: string;
  className?: string;
};

const roleMap: Record<CoachBubbleRole, string> = {
  coach: "bg-card border-border-soft text-foreground self-start",
  user:
    "bg-surface-inverse text-cream border-transparent self-end",
  system:
    "bg-surface-sunken text-muted-foreground border-border-soft self-center",
};

export function CoachBubble({
  speaker = "coach",
  children,
  actions,
  timestamp,
  className = "",
}: CoachBubbleProps) {
  return (
    <div
      className={[
        "flex max-w-[85%] flex-col gap-2 rounded-2xl border px-4 py-3 shadow-whisper",
        roleMap[speaker],
        className,
      ].join(" ")}
    >
      <div className="text-body leading-6">{children}</div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div>
      ) : null}
      {timestamp ? (
        <span className="text-caption font-tabular opacity-60">{timestamp}</span>
      ) : null}
    </div>
  );
}
