import { createFileRoute } from "@/lib/tempo-graft/router";
import { JournalView } from "@tempo-v0/components/tempo/journal-view";

export const Route = createFileRoute("/journal")({ component: JournalPage });

function JournalPage() {
  return <JournalView />;
}
