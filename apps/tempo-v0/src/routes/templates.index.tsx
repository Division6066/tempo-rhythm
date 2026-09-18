import { createFileRoute } from "@/lib/tempo-graft/router";
import { TemplatesView } from "@tempo-v0/components/tempo/templates-view";

export const Route = createFileRoute("/templates/")({ component: TemplatesView });
