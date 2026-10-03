import { NotesScreen } from "@/components/notes/NotesScreen";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return <NotesScreen noteId={id} />;
}
