import { createFileRoute } from "@/lib/tempo-graft/router";
import { StudyView } from "@tempo-v0/components/tempo/study-view";

export const Route = createFileRoute("/study/")({ component: StudyView });
