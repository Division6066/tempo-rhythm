import { createFileRoute } from "@/lib/tempo-graft/router";
import { HabitsView } from "@tempo-v0/components/tempo/habits-view";

export const Route = createFileRoute("/habits")({ component: HabitsPage });

function HabitsPage() {
  return <HabitsView />;
}
