import { createFileRoute } from "@tanstack/react-router";
import { PlanView } from "@/components/tempo/plan-view";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  return <PlanView />;
}
