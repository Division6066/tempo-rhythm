/**
 * @screen: note-detail
 * @category: Library
 * @summary: Rich-text note editor — auto-saves on blur / 1s debounce.
 * @queries: notes.get
 * @mutations: notes.update
 * @auth: required
 * @status: live
 */
"use client";

import { useParams } from "next/navigation";
import { NoteEditor } from "@/components/notes/NoteEditor";
import type { Id } from "@/convex/_generated/dataModel";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) {
    return null;
  }
  return <NoteEditor noteId={id as Id<"notes">} />;
}
