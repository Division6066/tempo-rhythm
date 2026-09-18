import { createFileRoute } from "@/lib/tempo-graft/router";
import { NotesView } from "@tempo-v0/components/tempo/notes-view";

export const Route = createFileRoute("/notes/")({ component: NotesView });
