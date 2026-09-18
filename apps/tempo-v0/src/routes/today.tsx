import { createFileRoute } from "@/lib/tempo-graft/router";
import { TodayView } from "@tempo-v0/components/tempo/today-view";

export const Route = createFileRoute("/today")({ component: TodayPage });

function TodayPage() {
  return <TodayView />;
}
