import { createFileRoute } from "@tanstack/react-router";
import { StudySetView } from "@/components/tempo/study-view";

export const Route = createFileRoute("/study/$id")({ component: StudySetPage });

function StudySetPage() {
  const { id } = Route.useParams();
  return <StudySetView id={id} />;
}
