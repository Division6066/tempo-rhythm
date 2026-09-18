import { createFileRoute } from "@/lib/tempo-graft/router";
import { CoachView } from "@tempo-v0/components/tempo/coach-view";

export const Route = createFileRoute("/coach")({ component: CoachPage });

function CoachPage() {
  return <CoachView />;
}
