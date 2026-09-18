import { createFileRoute } from "@/lib/tempo-graft/router";
import { PlanView } from "@tempo-v0/components/tempo/plan-view";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  return <PlanView />;
}
