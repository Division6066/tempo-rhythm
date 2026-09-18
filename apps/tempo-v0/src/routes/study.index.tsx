import { createFileRoute } from "@tanstack/react-router";
import { StudyView } from "@/components/tempo/study-view";

export const Route = createFileRoute("/study/")({ component: StudyView });
