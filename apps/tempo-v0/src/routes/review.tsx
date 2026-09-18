import { createFileRoute } from "@tanstack/react-router";
import { ReviewView } from "@/components/tempo/review-view";

export const Route = createFileRoute("/review")({ component: ReviewPage });

function ReviewPage() {
  return <ReviewView />;
}
