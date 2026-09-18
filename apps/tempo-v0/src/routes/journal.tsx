import { createFileRoute } from "@tanstack/react-router";
import { JournalView } from "@/components/tempo/journal-view";

export const Route = createFileRoute("/journal")({ component: JournalPage });

function JournalPage() {
  return <JournalView />;
}
