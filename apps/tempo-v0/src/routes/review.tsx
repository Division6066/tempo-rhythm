import { createFileRoute } from "@/lib/tempo-graft/router";
import { ReviewView } from "@tempo-v0/components/tempo/review-view";

export const Route = createFileRoute("/review")({ component: ReviewPage });

function ReviewPage() {
  return <ReviewView />;
}
