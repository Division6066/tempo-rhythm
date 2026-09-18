import { createFileRoute } from "@/lib/tempo-graft/router";
import { DailyNoteView } from "@tempo-v0/components/tempo/daily-note-view";

type Scope = "day" | "week" | "month" | "year";

export const Route = createFileRoute("/daily-note")({
  validateSearch: (search: Record<string, unknown>): { scope?: Scope } => ({
    scope:
      search.scope === "week" || search.scope === "month" || search.scope === "day" || search.scope === "year"
        ? search.scope
        : undefined,
  }),
  component: DailyNotePage,
});

function DailyNotePage() {
  const { scope } = Route.useSearch();
  return <DailyNoteView initialScope={scope ?? "day"} />;
}
