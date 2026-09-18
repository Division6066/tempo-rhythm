import { createFileRoute } from "@/lib/tempo-graft/router";
import { StudySetView } from "@tempo-v0/components/tempo/study-view";

export const Route = createFileRoute("/study/$id")({ component: StudySetPage });

function StudySetPage() {
  const { id } = Route.useParams();
  return <StudySetView id={id} />;
}
