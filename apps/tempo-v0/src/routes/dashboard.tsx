import { createFileRoute } from "@/lib/tempo-graft/router";
import { DashboardView } from "@tempo-v0/components/tempo/dashboard-view";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  return <DashboardView />;
}
