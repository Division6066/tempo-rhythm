import { createFileRoute } from "@tanstack/react-router";
import { HabitsView } from "@/components/tempo/habits-view";

export const Route = createFileRoute("/habits")({ component: HabitsPage });

function HabitsPage() {
  return <HabitsView />;
}
