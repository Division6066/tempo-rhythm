import type { HTMLAttributes, ReactNode } from "react";

/**
 * Pill — compact status chip in the 4 semantic tones + neutral.
 * @source docs/design/claude-export/design-system/components.jsx (Pill pattern)
 */
export type PillTone = "neutral" | "moss" | "brick" | "amber" | "slate" | "orange";

export type PillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: PillTone;
  leading?: ReactNode;
};

const toneMap: Record<PillTone, string> = {
  neutral: "bg-surface-sunken text-muted-foreground",
  moss: "bg-[color:var(--color-moss)]/10 text-[color:var(--color-moss)]",
  brick: "bg-[color:var(--color-brick)]/10 text-[color:var(--color-brick)]",
  amber: "bg-[color:var(--color-amber)]/14 text-[color:var(--color-amber)]",
  slate: "bg-[color:var(--color-slate-blue)]/12 text-[color:var(--color-slate-blue)]",
  orange: "bg-[color:var(--color-tempo-orange)]/12 text-[color:var(--color-tempo-orange)]",
};

export function Pill({ tone = "neutral", leading, className = "", children, ...rest }: PillProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium",
        toneMap[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {leading}
      {children}
    </span>
  );
}
