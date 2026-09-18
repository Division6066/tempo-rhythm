import { createFileRoute } from "@tanstack/react-router";
import { MemoryView } from "@/components/tempo/memory-view";

export const Route = createFileRoute("/memory")({ component: MemoryPage });

function MemoryPage() {
  return <MemoryView />;
}
