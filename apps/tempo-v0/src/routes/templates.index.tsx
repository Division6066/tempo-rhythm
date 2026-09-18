import { createFileRoute } from "@tanstack/react-router";
import { TemplatesView } from "@/components/tempo/templates-view";

export const Route = createFileRoute("/templates/")({ component: TemplatesView });
