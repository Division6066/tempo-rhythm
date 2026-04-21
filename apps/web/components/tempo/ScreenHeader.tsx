import type { ReactNode } from "react";
import { Pill, type PillTone } from "@tempo/ui/primitives";

/**
 * ScreenHeader — standard eyebrow + title + lede block used by every tempo screen.
 *
 * @source docs/design/claude-export/design-system/components.jsx (Topbar + page-header)
 */
export type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  badge?: { label: string; tone?: PillTone };
  right?: ReactNode;
  titleClassName?: string;
};

export function ScreenHeader({ eyebrow, title, lede, badge, right, titleClassName }: ScreenHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-border-soft px-6 pt-8 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex max-w-3xl flex-col gap-2">
        <div className="flex items-center gap-3">
          {eyebrow ? <span className="font-eyebrow">{eyebrow}</span> : null}
          {badge ? (
            <Pill tone={badge.tone ?? "neutral"}>{badge.label}</Pill>
          ) : null}
        </div>
        <h1 className={`font-serif text-h1 leading-tight ${titleClassName ?? ""}`}>
          {title}
        </h1>
        {lede ? (
          <div className="text-body text-muted-foreground">{lede}</div>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-3">{right}</div> : null}
    </header>
  );
}
