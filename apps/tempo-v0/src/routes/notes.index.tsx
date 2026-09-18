import { createFileRoute } from "@tanstack/react-router";
import { NotesView } from "@/components/tempo/notes-view";

export const Route = createFileRoute("/notes/")({ component: NotesView });
