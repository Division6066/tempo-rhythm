import { createFileRoute } from "@/lib/tempo-graft/router";
import { TemplateDetail } from "@tempo-v0/components/tempo/templates-view";

export const Route = createFileRoute("/templates/$id")({ component: TemplatePage });

function TemplatePage() {
  const { id } = Route.useParams();
  return <TemplateDetail id={id} />;
}
