"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, Pin, Eye, Edit3 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const noteId = !isNew ? (params.id as Id<"notes">) : undefined;

  const note = useQuery(api.notes.get, noteId ? { id: noteId } : "skip");
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (note && !isNew) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
    }
  }, [note, isNew]);

  const handleSave = async () => {
    if (!title && !content) return;
    if (isNew) {
      const id = await createNote({ title: title || "Untitled", content, isPinned });
      router.push(`/notes/${id}`);
    } else if (noteId) {
      await updateNote({ id: noteId, title, content, isPinned });
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      router.push("/notes");
      return;
    }
    if (noteId) {
      await deleteNote({ id: noteId });
      router.push("/notes");
    }
  };

  const togglePin = async () => {
    setIsPinned(!isPinned);
    if (!isNew && noteId) {
      await updateNote({ id: noteId, isPinned: !isPinned });
    }
  };

  if (!isNew && !note) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 pb-12 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push("/notes")}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={togglePin} className={isPinned ? "text-primary" : "text-muted-foreground"}>
              <Pin size={20} className={isPinned ? "fill-current" : ""} />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={handleDelete}>
              <Trash2 size={20} />
            </Button>
          </div>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          placeholder="Note Title"
          className="text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0"
        />

        <div className="flex gap-2 border-b border-border pb-2">
          <button onClick={() => setTab("edit")} className={`px-4 py-2 text-sm font-medium cursor-pointer ${tab === "edit" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            <Edit3 size={14} className="inline mr-1" /> Edit
          </button>
          <button onClick={() => setTab("preview")} className={`px-4 py-2 text-sm font-medium cursor-pointer ${tab === "preview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            <Eye size={14} className="inline mr-1" /> Preview
          </button>
        </div>

        {tab === "edit" ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Start typing (Markdown supported)..."
            className="min-h-[400px] h-full bg-card border-border resize-none font-mono text-sm leading-relaxed"
          />
        ) : (
          <div className="bg-card/50 p-6 rounded-xl border border-border min-h-[400px] prose prose-invert max-w-none">
            <ReactMarkdown>{content || "*Nothing to preview*"}</ReactMarkdown>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
