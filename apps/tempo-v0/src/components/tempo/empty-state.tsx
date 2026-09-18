import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center",
        className,
      )}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <rect x="14" y="18" width="44" height="40" rx="8" stroke="currentColor" className="text-border" strokeWidth="1.5" />
        <path d="M26 32h20M26 40h12" stroke="currentColor" className="text-faint" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="48" cy="48" r="10" fill="currentColor" className="text-accent-soft" />
        <path d="M48 43v10M43 48h10" stroke="currentColor" className="text-accent" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="max-w-sm space-y-2">
        <h2 className="font-display text-2xl font-medium tracking-tight text-ink">{title}</h2>
        <p className="text-sm leading-relaxed text-muted">{body}</p>
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="min-w-44">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
