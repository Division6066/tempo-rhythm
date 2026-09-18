import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-overdue/20 bg-overdue-soft/40 px-6 py-16 text-center">
      <TriangleAlert className="size-8 text-overdue" strokeWidth={1.75} aria-hidden="true" />
      <div className="max-w-md space-y-2">
        <h2 className="font-display text-2xl font-medium tracking-tight text-ink">{title}</h2>
        <p className="text-sm leading-relaxed break-words text-muted">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Restore seeded day
        </Button>
      ) : null}
    </div>
  );
}
