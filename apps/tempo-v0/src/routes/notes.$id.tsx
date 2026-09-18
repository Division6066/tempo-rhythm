import { createFileRoute } from "@tanstack/react-router";
import { NoteEditor } from "@/components/tempo/note-editor";

export const Route = createFileRoute("/notes/$id")({ component: NotePage });

function NotePage() {
  const { id } = Route.useParams();
  return <NoteEditor id={id} />;
}
