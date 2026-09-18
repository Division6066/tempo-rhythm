import { createFileRoute } from "@/lib/tempo-graft/router";
import { BrainDumpView } from "@tempo-v0/components/tempo/brain-dump-view";

export const Route = createFileRoute("/brain-dump")({ component: BrainDumpPage });

function BrainDumpPage() {
  return <BrainDumpView />;
}
