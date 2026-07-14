"use client";

export default function CalendarError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-8">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <p className="font-eyebrow text-muted-foreground">Calendar</p>
        <h1 className="mt-3 text-h2 font-serif">We could not load this calendar view.</h1>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          Your events are still safe. Try again, or come back after a breather.
        </p>
        <button
          className="mt-6 min-h-11 rounded-2xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
