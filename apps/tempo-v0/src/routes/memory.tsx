import { createFileRoute } from "@/lib/tempo-graft/router";
import { MemoryView } from "@tempo-v0/components/tempo/memory-view";

export const Route = createFileRoute("/memory")({ component: MemoryPage });

function MemoryPage() {
  return <MemoryView />;
}
