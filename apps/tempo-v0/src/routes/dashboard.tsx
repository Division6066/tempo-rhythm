import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/components/tempo/dashboard-view";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  return <DashboardView />;
}
