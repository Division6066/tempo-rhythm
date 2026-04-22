/**
 * @screen: notes
 * @category: Library
 * @summary: Notes list — click into an editor.
 * @queries: notes.list
 * @mutations: notes.create
 * @auth: required
 * @status: live
 */
import { NotesScreen } from "@/components/notes/NotesScreen";

export default function Page() {
  return <NotesScreen />;
}
