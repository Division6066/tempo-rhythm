import { createFileRoute } from "@tanstack/react-router";
import { TodayView } from "@/components/tempo/today-view";

export const Route = createFileRoute("/today")({ component: TodayPage });

function TodayPage() {
  return <TodayView />;
}
