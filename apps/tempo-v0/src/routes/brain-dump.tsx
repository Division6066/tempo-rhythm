import { createFileRoute } from "@tanstack/react-router";
import { BrainDumpView } from "@/components/tempo/brain-dump-view";

export const Route = createFileRoute("/brain-dump")({ component: BrainDumpPage });

function BrainDumpPage() {
  return <BrainDumpView />;
}
