import { createFileRoute } from "@tanstack/react-router";
import { TemplateDetail } from "@/components/tempo/templates-view";

export const Route = createFileRoute("/templates/$id")({ component: TemplatePage });

function TemplatePage() {
  const { id } = Route.useParams();
  return <TemplateDetail id={id} />;
}
