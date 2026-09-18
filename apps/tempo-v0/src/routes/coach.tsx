import { createFileRoute } from "@tanstack/react-router";
import { CoachView } from "@/components/tempo/coach-view";

export const Route = createFileRoute("/coach")({ component: CoachPage });

function CoachPage() {
  return <CoachView />;
}
