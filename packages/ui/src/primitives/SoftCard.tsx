import type { HTMLAttributes } from "react";

/**
 * SoftCard — cream card surface with 1px border and whisper shadow.
 *
 * @source docs/design/claude-export/design-system/components.jsx (SoftCard pattern)
 */
export type SoftCardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article" | "section";
  // Compatibility fix for #26 (concrete scaffold layout shells), which uses
  // `tone="danger"` to flag error-state copy. Reuses the brick palette so we
  // don't introduce a parallel destructive color system.
  tone?: "default" | "sunken" | "inverse" | "danger";
  padding?: "none" | "sm" | "md" | "lg";
};

const toneMap: Record<NonNullable<SoftCardProps["tone"]>, string> = {
  default: "bg-card text-card-foreground border-border",
  sunken: "bg-surface-sunken text-card-foreground border-border-soft",
  inverse: "bg-surface-inverse text-cream border-transparent",
  danger:
    "bg-[color:var(--color-brick)]/10 text-[color:var(--color-brick)] border-[color:var(--color-brick)]/30",
};

const padMap: Record<NonNullable<SoftCardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function SoftCard({
  as: Tag = "div",
  tone = "default",
  padding = "md",
  className = "",
  ...rest
}: SoftCardProps) {
  const classes = ["rounded-xl border shadow-whisper", toneMap[tone], padMap[padding], className]
    .filter(Boolean)
    .join(" ");
  return <Tag className={classes} {...rest} />;
}
