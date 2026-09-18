import { createFileRoute } from "@/lib/tempo-graft/router";
import { NoteEditor } from "@tempo-v0/components/tempo/note-editor";

export const Route = createFileRoute("/notes/$id")({ component: NotePage });

function NotePage() {
  const { id } = Route.useParams();
  return <NoteEditor id={id} />;
}
