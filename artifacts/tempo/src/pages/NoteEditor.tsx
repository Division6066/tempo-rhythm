import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { 
  useGetNote, 
  useCreateNote, 
  useUpdateNote, 
  useDeleteNote,
  getListNotesQueryKey,
  getGetNoteQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Pin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NoteEditor() {
  const [, params] = useRoute("/notes/:id");
  const isNew = params?.id === "new";
  const noteId = !isNew ? parseInt(params?.id || "0", 10) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: note, isLoading } = useGetNote(noteId, {
    query: {
      enabled: !isNew && !!noteId,
      queryKey: getGetNoteQueryKey(noteId)
    }
  });

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [tab, setTab] = useState("edit");

  useEffect(() => {
    if (note && !isNew) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
    }
  }, [note, isNew]);

  const handleSave = async () => {
    if (!title && !content) return;
    try {
      if (isNew) {
        const res = await createNote.mutateAsync({
          data: { title: title || "Untitled", content, isPinned }
        });
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        setLocation(`/notes/${res.id}`);
      } else {
        await updateNote.mutateAsync({
          id: noteId,
          data: { title, content, isPinned }
        });
        queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(noteId) });
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      }
      toast({ title: "Saved" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to save note" });
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      setLocation("/notes");
      return;
    }
    try {
      await deleteNote.mutateAsync({ id: noteId });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      toast({ title: "Note deleted" });
      setLocation("/notes");
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete note" });
    }
  };

  const togglePin = async () => {
    setIsPinned(!isPinned);
    if (!isNew) {
      await updateNote.mutateAsync({ id: noteId, data: { isPinned: !isPinned } });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    }
  };

  if (isLoading && !isNew) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
  }

  return (
    <div className="space-y-4 pb-12 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/notes")}>
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
        onChange={e => setTitle(e.target.value)}
        onBlur={handleSave}
        placeholder="Note Title"
        className="text-2xl font-display font-bold border-none bg-transparent px-0 focus-visible:ring-0"
      />

      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
        <TabsList className="bg-card w-full justify-start border-b border-border rounded-none h-auto p-0">
          <TabsTrigger value="edit" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Edit</TabsTrigger>
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="flex-1 mt-4">
          <Textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Start typing (Markdown supported)..."
            className="min-h-[400px] h-full bg-card border-border resize-none font-mono text-sm leading-relaxed"
          />
        </TabsContent>
        <TabsContent value="preview" className="flex-1 mt-4 bg-card/50 p-6 rounded-xl border border-border min-h-[400px]">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{content || "*Nothing to preview*"}</ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}